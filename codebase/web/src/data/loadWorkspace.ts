import type { ConceptsFile, Lesson, TranscriptsFile } from '@/types/lecture'
import conceptsFile from './concepts.json'

const concepts = conceptsFile as ConceptsFile

async function loadTranscripts(): Promise<TranscriptsFile> {
  try {
    const res = await fetch('/data/transcripts.local.json')
    if (!res.ok) return {}
    return (await res.json()) as TranscriptsFile
  } catch {
    return {}
  }
}

let cached: {
  lessonOrder: string[]
  lessons: Record<string, Lesson>
  transcriptsLoaded: boolean
} | null = null

export async function loadWorkspace() {
  if (cached) return cached
  const transcripts = await loadTranscripts()
  const lessons: Record<string, Lesson> = {}

  for (const [id, lesson] of Object.entries(concepts.lessons)) {
    const segments = transcripts[id]?.segments ?? []
    lessons[id] = {
      ...lesson,
      segments,
      hasFullTranscript: segments.length > 0,
    }
  }

  cached = {
    lessonOrder: concepts.lessonOrder,
    lessons,
    transcriptsLoaded: Object.keys(transcripts).length > 0,
  }
  return cached
}

export type Workspace = Awaited<ReturnType<typeof loadWorkspace>>
