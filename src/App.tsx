import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { LinkedInHeader, hasMobileChrome } from './components/LinkedInHeader'
import { Footer } from './components/Footer'
import { Onboarding } from './components/Onboarding'
import { FeedbackForm } from './components/FeedbackForm'
import { FeedbackNudge } from './components/FeedbackNudge'
import { TourSpotlight } from './components/TourSpotlight'
import { ResumePrompt } from './components/ResumePrompt'
import { HomePage } from './pages/HomePage'
import { MessagingPage } from './pages/MessagingPage'
import { JobTrackerPage } from './pages/JobTrackerPage'
import { ComposePage } from './pages/ComposePage'
import { StatusPage } from './pages/StatusPage'
import { MyJobsPage } from './pages/MyJobsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { FeedbackResponsesPage } from './pages/FeedbackResponsesPage'

// Compose and My Jobs are requester-only places (PRD §4). If the referrer role
// lands on them (e.g. via the switcher), redirect back to the shared messaging.
function RequesterOnly({ children }: { children: React.ReactNode }) {
  const { role } = useApp()
  return role === 'requester' ? <>{children}</> : <Navigate to="/messaging" replace />
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className={`flex min-h-full flex-col md:pb-0 ${hasMobileChrome(pathname) ? 'pb-16' : ''}`}>
      <LinkedInHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/messaging" element={<MessagingPage />} />
          <Route
            path="/jobs"
            element={
              <RequesterOnly>
                <JobTrackerPage />
              </RequesterOnly>
            }
          />
          {/* Back-compat: the referral thread used to live at /thread */}
          <Route path="/thread" element={<Navigate to="/messaging" replace />} />
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
          <Route path="/notifications" element={<NotificationsPage />} />
          {/* Not linked in product UI: the facilitator's view of responses */}
          <Route path="/feedback" element={<FeedbackResponsesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Onboarding />
      <FeedbackNudge />
      <FeedbackForm />
      <TourSpotlight />
      <ResumePrompt />
    </div>
  )
}
