import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { loadWorkspace, type Workspace } from '@/data/loadWorkspace'

const WorkspaceContext = createContext<Workspace | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)

  useEffect(() => {
    void loadWorkspace().then(setWorkspace)
  }, [])

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted">
        Đang tải không gian ôn tập…
      </div>
    )
  }

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
