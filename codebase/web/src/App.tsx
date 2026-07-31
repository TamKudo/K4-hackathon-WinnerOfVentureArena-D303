import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { TranscriptSheet } from '@/components/evidence/TranscriptSheet'
import { EvidenceProvider } from '@/context/EvidenceContext'
import { WorkspaceProvider } from '@/context/WorkspaceContext'
import { LandingPage } from '@/pages/LandingPage'
import { StudyHubPage } from '@/pages/StudyHubPage'
import { ConceptDetailPage } from '@/pages/ConceptDetailPage'

function RedirectToHub() {
  const { lessonId } = useParams()
  const q = lessonId ? `?lesson=${encodeURIComponent(lessonId)}` : ''
  return <Navigate to={`/tong-quan${q}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <WorkspaceProvider>
        <EvidenceProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/tong-quan" element={<StudyHubPage />} />
              <Route path="/bai/:lessonId" element={<RedirectToHub />} />
              <Route path="/bai/:lessonId/ban-do" element={<RedirectToHub />} />
              <Route
                path="/bai/:lessonId/khai-niem/:conceptId"
                element={<ConceptDetailPage />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
          <TranscriptSheet />
          <Toaster position="bottom-center" richColors closeButton />
        </EvidenceProvider>
      </WorkspaceProvider>
    </BrowserRouter>
  )
}
