import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { TopBar } from './components/TopBar'
import { Footer } from './components/Footer'
import { StatusNotification } from './components/StatusNotification'
import { ThreadPage } from './pages/ThreadPage'
import { ComposePage } from './pages/ComposePage'
import { StatusPage } from './pages/StatusPage'
import { MyJobsPage } from './pages/MyJobsPage'

// Compose and My Jobs are requester-only places (PRD §4). If the referrer role
// lands on them (e.g. via the switcher), redirect back to the shared thread.
function RequesterOnly({ children }: { children: React.ReactNode }) {
  const { role } = useApp()
  return role === 'requester' ? <>{children}</> : <Navigate to="/thread" replace />
}

export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/thread" replace />} />
          <Route path="/thread" element={<ThreadPage />} />
          <Route
            path="/compose"
            element={
              <RequesterOnly>
                <ComposePage />
              </RequesterOnly>
            }
          />
          <Route path="/status/:id" element={<StatusPage />} />
          <Route
            path="/my-jobs"
            element={
              <RequesterOnly>
                <MyJobsPage />
              </RequesterOnly>
            }
          />
          <Route path="*" element={<Navigate to="/thread" replace />} />
        </Routes>
      </main>
      <Footer />
      <StatusNotification />
    </div>
  )
}
