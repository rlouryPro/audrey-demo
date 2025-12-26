import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import MainLayout from './components/common/MainLayout'
import AdminLayout from './components/common/AdminLayout'
import AdminRoute from './components/common/AdminRoute'
import LoginPage from './pages/LoginPage'
import TimelinePage from './pages/TimelinePage'
import SkillsPage from './pages/SkillsPage'
import DocumentPage from './pages/DocumentPage'
import UsersPage from './pages/admin/UsersPage'
import ValidationsPage from './pages/admin/ValidationsPage'
import SkillsAdminPage from './pages/admin/SkillsAdminPage'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-text-muted">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* User routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/frise" replace />} />
            <Route path="/frise" element={<TimelinePage />} />
            <Route path="/competences" element={<SkillsPage />} />
            <Route path="/document" element={<DocumentPage />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/utilisateurs" replace />} />
            <Route path="/admin/utilisateurs" element={<UsersPage />} />
            <Route path="/admin/validations" element={<ValidationsPage />} />
            <Route path="/admin/competences" element={<SkillsAdminPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
