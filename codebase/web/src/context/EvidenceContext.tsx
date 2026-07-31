import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { EvidenceItem } from '@/types/lecture'

interface EvidenceState {
  open: boolean
  lessonId: string | null
  evidenceList: EvidenceItem[]
  index: number
}

interface EvidenceContextValue extends EvidenceState {
  openEvidence: (args: {
    lessonId: string
    evidenceList: EvidenceItem[]
    index?: number
  }) => void
  openTranscript: (lessonId: string) => void
  closeEvidence: () => void
  setIndex: (index: number) => void
  next: () => void
  prev: () => void
}

const EvidenceContext = createContext<EvidenceContextValue | null>(null)

const initial: EvidenceState = {
  open: false,
  lessonId: null,
  evidenceList: [],
  index: 0,
}

export function EvidenceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EvidenceState>(initial)

  const openEvidence = useCallback(
    ({
      lessonId,
      evidenceList,
      index = 0,
    }: {
      lessonId: string
      evidenceList: EvidenceItem[]
      index?: number
    }) => {
      setState({
        open: true,
        lessonId,
        evidenceList,
        index: Math.max(0, Math.min(index, Math.max(evidenceList.length - 1, 0))),
      })
    },
    [],
  )

  const openTranscript = useCallback((lessonId: string) => {
    setState({
      open: true,
      lessonId,
      evidenceList: [],
      index: 0,
    })
  }, [])

  const closeEvidence = useCallback(() => {
    setState((s) => ({ ...s, open: false }))
  }, [])

  const setIndex = useCallback((index: number) => {
    setState((s) => ({ ...s, index }))
  }, [])

  const next = useCallback(() => {
    setState((s) => {
      if (!s.evidenceList.length) return s
      return { ...s, index: (s.index + 1) % s.evidenceList.length }
    })
  }, [])

  const prev = useCallback(() => {
    setState((s) => {
      if (!s.evidenceList.length) return s
      return {
        ...s,
        index: (s.index - 1 + s.evidenceList.length) % s.evidenceList.length,
      }
    })
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      openEvidence,
      openTranscript,
      closeEvidence,
      setIndex,
      next,
      prev,
    }),
    [state, openEvidence, openTranscript, closeEvidence, setIndex, next, prev],
  )

  return (
    <EvidenceContext.Provider value={value}>{children}</EvidenceContext.Provider>
  )
}

export function useEvidence() {
  const ctx = useContext(EvidenceContext)
  if (!ctx) throw new Error('useEvidence must be used within EvidenceProvider')
  return ctx
}
