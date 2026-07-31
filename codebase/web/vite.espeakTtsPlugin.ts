import type { Plugin } from 'vite'
import { spawn } from 'node:child_process'
import type { IncomingMessage, ServerResponse } from 'node:http'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

async function handleTts(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'POST only' }))
    return
  }

  let text = ''
  try {
    const raw = await readBody(req)
    const body = JSON.parse(raw) as { text?: string }
    text = (body.text ?? '').trim()
  } catch {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'JSON body { text } required' }))
    return
  }

  if (!text) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'text rỗng' }))
    return
  }
  if (text.length > 4000) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'text quá dài' }))
    return
  }

  const child = spawn(
    'espeak-ng',
    ['-v', 'vi', '-s', '145', '-a', '140', '--stdout', text],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  )

  const chunks: Buffer[] = []
  let err = ''
  child.stdout.on('data', (c: Buffer) => chunks.push(c))
  child.stderr.on('data', (c: Buffer) => {
    err += c.toString()
  })

  child.on('error', (e) => {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: `Không chạy được espeak-ng: ${e.message}. Cài: sudo apt install espeak-ng`,
      }),
    )
  })

  child.on('close', (code) => {
    if (code !== 0 || !chunks.length) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: err.trim() || `espeak-ng thoát mã ${code}`,
        }),
      )
      return
    }
    const wav = Buffer.concat(chunks)
    res.statusCode = 200
    res.setHeader('Content-Type', 'audio/wav')
    res.setHeader('Cache-Control', 'no-store')
    res.end(wav)
  })
}

/** Local Vietnamese TTS via espeak-ng — fallback when browser has no vi voice. */
export function espeakTtsPlugin(): Plugin {
  return {
    name: 'espeak-tts',
    configureServer(server) {
      server.middlewares.use('/api/tts', (req, res) => {
        void handleTts(req, res)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/tts', (req, res) => {
        void handleTts(req, res)
      })
    },
  }
}
