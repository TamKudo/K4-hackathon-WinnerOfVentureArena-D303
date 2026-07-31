let speakingLabel = ''
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null
let currentAudio: HTMLAudioElement | null = null
let currentObjectUrl: string | null = null

export function getSpeakingLabel() {
  return speakingLabel
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = null
  }
  speakingLabel = ''
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return Promise.resolve([])
  }
  if (voicesReady) return voicesReady

  voicesReady = new Promise((resolve) => {
    const synth = window.speechSynthesis
    const current = synth.getVoices()
    if (current.length) {
      resolve(current)
      return
    }
    const onChange = () => {
      const list = synth.getVoices()
      if (!list.length) return
      synth.removeEventListener('voiceschanged', onChange)
      resolve(list)
    }
    synth.addEventListener('voiceschanged', onChange)
    window.setTimeout(() => {
      const list = synth.getVoices()
      if (list.length) {
        synth.removeEventListener('voiceschanged', onChange)
        resolve(list)
      }
    }, 250)
    window.setTimeout(() => {
      synth.removeEventListener('voiceschanged', onChange)
      resolve(synth.getVoices())
    }, 1500)
  })

  return voicesReady
}

export function pickVietnameseVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  const byLang = voices.find((v) => v.lang?.toLowerCase().startsWith('vi'))
  if (byLang) return byLang
  return voices.find((v) =>
    /vietnam|vietnamese|tiếng việt/i.test(`${v.name} ${v.lang}`),
  )
}

export async function getVietnameseVoice(): Promise<SpeechSynthesisVoice | null> {
  const voices = await loadVoices()
  return pickVietnameseVoice(voices) ?? null
}

function speakWithBrowser(
  text: string,
  label: string,
  voice: SpeechSynthesisVoice,
): Promise<string> {
  return new Promise((resolve, reject) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'vi-VN'
    utterance.voice = voice
    utterance.rate = 0.95
    speakingLabel = label
    utterance.onend = () => {
      speakingLabel = ''
      resolve(voice.name)
    }
    utterance.onerror = () => {
      speakingLabel = ''
      reject(new Error('Không đọc được đoạn này.'))
    }
    window.speechSynthesis.speak(utterance)
  })
}

/** Fallback: Vite middleware /api/tts → espeak-ng tiếng Việt */
async function speakWithEspeak(text: string, label: string): Promise<string> {
  stopSpeech()
  speakingLabel = label
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    speakingLabel = ''
    let msg = 'Không đọc được bằng espeak-ng.'
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) msg = data.error
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  currentObjectUrl = url
  const audio = new Audio(url)
  currentAudio = audio

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      speakingLabel = ''
      if (currentObjectUrl === url) {
        URL.revokeObjectURL(url)
        currentObjectUrl = null
      }
      currentAudio = null
      resolve('espeak-ng (vi)')
    }
    audio.onerror = () => {
      speakingLabel = ''
      currentAudio = null
      reject(new Error('Không phát được file âm thanh.'))
    }
    void audio.play().catch((e: Error) => {
      speakingLabel = ''
      reject(e)
    })
  })
}

/** Ưu tiên giọng trình duyệt vi-*; không có thì dùng espeak-ng qua /api/tts. */
export async function speakText(text: string, label: string): Promise<string> {
  if (!text.trim()) {
    throw new Error('Không có nội dung để đọc.')
  }

  const voices = await loadVoices()
  const vi = pickVietnameseVoice(voices)
  if (vi) {
    return speakWithBrowser(text, label, vi)
  }
  return speakWithEspeak(text, label)
}
