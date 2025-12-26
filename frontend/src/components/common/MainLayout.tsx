import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { Calendar, Star, FileText, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/frise', icon: Calendar, label: 'Ma frise' },
  { to: '/competences', icon: Star, label: 'Competences' },
  { to: '/document', icon: FileText, label: 'Mon livret' },
]

export default function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header role="banner" className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-700">Livret ESAT</h1>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1 text-sm text-text-muted hover:text-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600 rounded px-2 py-1"
                aria-label="Administration"
              >
                <Settings className="w-4 h-4" aria-hidden />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <div className="flex items-center gap-2 text-text-muted">
              <User className="w-5 h-5" aria-hidden />
              <span className="text-sm">{user?.firstName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-text-muted hover:text-error focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600 rounded px-2 py-1"
              aria-label="Se deconnecter"
            >
              <LogOut className="w-4 h-4" aria-hidden />
              <span className="sr-only sm:not-sr-only">Sortir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" role="main" className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav role="navigation" aria-label="Navigation principale" className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
        <ul className="flex justify-around max-w-4xl mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-3 px-2 transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600',
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-text-muted hover:text-primary-600 hover:bg-gray-50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-6 h-6" aria-hidden />
                    <span className="text-xs font-medium">{label}</span>
                    {isActive && <span className="sr-only">(page courante)</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
