import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Users, ClipboardCheck, Settings, LogOut, ArrowLeft, Star } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { to: '/admin/validations', label: 'Validations', icon: ClipboardCheck },
    { to: '/admin/competences', label: 'Competences', icon: Star },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/frise')}
                className="flex items-center gap-2 text-text-muted hover:text-primary-600 transition-colors"
                aria-label="Retour a l'application"
              >
                <ArrowLeft className="w-5 h-5" aria-hidden />
                <span className="hidden sm:inline">Retour</span>
              </button>
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary-600" aria-hidden />
                <h1 className="text-lg font-bold">Administration</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-text-muted hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-text-muted hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                aria-label="Deconnexion"
              >
                <LogOut className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Navigation tabs */}
        <nav className="mb-6" aria-label="Navigation administration">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-text-muted hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <main id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
