import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { OverviewPage } from './sections/overview/OverviewPage'
import { FinancialDetailPage } from './sections/financial-detail/FinancialDetailPage'
import { AudienceViewsPage } from './sections/audience-views/AudienceViewsPage'
import { EventsGovernancePage } from './sections/events-governance/EventsGovernancePage'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { LoginPage } from './auth/LoginPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="financial-detail" element={<FinancialDetailPage />} />
            <Route path="audience-views" element={<AudienceViewsPage />} />
            <Route path="events" element={<EventsGovernancePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
