import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Segment = { id: string; text: string }
type EvidenceHint = { segmentId: string; quote?: string }

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const cacheDir = path.join(rootDir, '.cache', 'gemini-depth')

/** Model còn quota free trên key hiện tại; 2.0-flash đang 429. */
const GEMINI_MODEL = 'gemini-flash-lite-latest'

function getApiKey(mode: string): string {
  const env = loadEnv(mode, rootDir, '')
  return (env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim()
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function cachePath(lessonId: string, conceptId: string) {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, '_')
  return path.join(cacheDir, `${safe(lessonId)}__${safe(conceptId)}.json`)
}

function readDiskCache(lessonId: string, conceptId: string): unknown | null {
  try {
    const p = cachePath(lessonId, conceptId)
    if (!fs.existsSync(p)) return null
    return JSON.parse(fs.readFileSync(p, 'utf8')) as unknown
  } catch {
    return null
  }
}

function writeDiskCache(
  lessonId: string,
  conceptId: string,
  payload: { narrative: unknown; practiceDepth: unknown },
) {
  try {
    fs.mkdirSync(cacheDir, { recursive: true })
    fs.writeFileSync(
      cachePath(lessonId, conceptId),
      JSON.stringify(
        { ...payload, cachedAt: new Date().toISOString(), model: GEMINI_MODEL },
        null,
        2,
      ),
      'utf8',
    )
  } catch {
    /* ignore disk errors */
  }
}

function buildPrompt(input: {
  conceptName: string
  shortSummary: string
  segments: Segment[]
}): string {
  const transcript = input.segments
    .map((s) => `[${s.id}] ${s.text}`)
    .join('\n')

  return `Bạn là trợ lý ôn tập LectureFocus. Viết nội dung tiếng Việt cho một khái niệm trong bài giảng.

Khái niệm: ${input.conceptName}
Tóm tắt ngắn: ${input.shortSummary}

Transcript (mỗi dòng bắt đầu bằng [segmentId]):
${transcript}

Yêu cầu:
1. Viết narrative: 1–2 đoạn văn liền mạch giải thích khái niệm (cơ chế + ý nghĩa).
2. Trong narrative, các mệnh đề then chốt phải là span có evidence gắn đúng đoạn transcript.
3. evidence.segmentId phải là id có trong transcript ở trên.
4. evidence.quote phải là chuỗi con (substring) thật sự nằm trong text của segment đó — không bịa, không diễn giải lại thành quote mới.
5. practiceDepth: 1–3 span giải thích cách áp dụng / tiêu chí cụ thể ("hợp lý nghĩa là gì", làm gì khi ôn/dùng). Có thể gắn evidence nếu phù hợp.
6. Không dự đoán đề thi. Không thêm khái niệm ngoài transcript.

Trả về ĐÚNG JSON (không markdown) theo schema:
{
  "narrative": [ [ { "text": string, "evidence"?: { "segmentId": string, "quote": string, "keyPhrase"?: string } } ] ],
  "practiceDepth": [ { "text": string, "evidence"?: { "segmentId": string, "quote": string, "keyPhrase"?: string } } ]
}`
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    }),
  })

  const raw = await res.text()
  if (!res.ok) {
    let detail = raw.slice(0, 500)
    try {
      const err = JSON.parse(raw) as { error?: { message?: string; code?: number } }
      if (err.error?.message) detail = err.error.message
    } catch {
      /* keep raw */
    }
    throw new Error(`Gemini ${res.status}: ${detail}`)
  }

  const data = JSON.parse(raw) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ??
    ''
  if (!text.trim()) {
    throw new Error('Gemini trả về rỗng')
  }
  return text
}

function makeHandler(mode: string) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }
    if (req.method !== 'POST') {
      json(res, 405, { error: 'POST only' })
      return
    }

    let body: {
      lessonId?: string
      conceptId?: string
      conceptName?: string
      shortSummary?: string
      segments?: Segment[]
      existingEvidenceHints?: EvidenceHint[]
      refresh?: boolean
    }
    try {
      body = JSON.parse(await readBody(req)) as typeof body
    } catch {
      json(res, 400, { error: 'JSON body không hợp lệ' })
      return
    }

    const lessonId = (body.lessonId ?? '').trim()
    const conceptId = (body.conceptId ?? '').trim()
    const conceptName = (body.conceptName ?? '').trim()
    const shortSummary = (body.shortSummary ?? '').trim()
    const segments = Array.isArray(body.segments) ? body.segments : []
    if (!conceptName || !segments.length) {
      json(res, 400, { error: 'Cần conceptName và segments[]' })
      return
    }

    if (!body.refresh && lessonId && conceptId) {
      const cached = readDiskCache(lessonId, conceptId) as {
        narrative?: unknown
        practiceDepth?: unknown
      } | null
      if (
        cached &&
        Array.isArray(cached.narrative) &&
        Array.isArray(cached.practiceDepth)
      ) {
        json(res, 200, {
          narrative: cached.narrative,
          practiceDepth: cached.practiceDepth,
          source: 'cache',
        })
        return
      }
    }

    const apiKey = getApiKey(mode)
    if (!apiKey) {
      json(res, 503, {
        error:
          'Chưa cấu hình GEMINI_API_KEY. Tạo codebase/web/.env từ .env.example.',
      })
      return
    }

    try {
      const prompt = buildPrompt({ conceptName, shortSummary, segments })
      const text = await callGemini(apiKey, prompt)
      const parsed = JSON.parse(text) as {
        narrative?: unknown
        practiceDepth?: unknown
      }
      if (
        !Array.isArray(parsed.narrative) ||
        !Array.isArray(parsed.practiceDepth)
      ) {
        json(res, 502, { error: 'Gemini JSON thiếu narrative/practiceDepth' })
        return
      }
      if (lessonId && conceptId) {
        writeDiskCache(lessonId, conceptId, {
          narrative: parsed.narrative,
          practiceDepth: parsed.practiceDepth,
        })
      }
      json(res, 200, {
        narrative: parsed.narrative,
        practiceDepth: parsed.practiceDepth,
        source: 'ai',
      })
    } catch (e) {
      json(res, 503, {
        error: e instanceof Error ? e.message : 'Lỗi gọi Gemini',
      })
    }
  }
}

/** Gemini: sinh narrative + practiceDepth; cache đĩa để khỏi gọi lại. */
export function geminiDepthPlugin(): Plugin {
  return {
    name: 'gemini-depth',
    configureServer(server) {
      const handler = makeHandler(server.config.mode)
      server.middlewares.use('/api/generate-depth', (req, res) => {
        void handler(req, res)
      })
    },
    configurePreviewServer(server) {
      const handler = makeHandler(server.config.mode)
      server.middlewares.use('/api/generate-depth', (req, res) => {
        void handler(req, res)
      })
    },
  }
}
