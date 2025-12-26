import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../utils/cn'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(username, password)
      navigate('/frise')
    } catch {
      setError('Identifiant ou mot de passe incorrect')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-700">Livret ESAT</h1>
          <p className="text-text-muted mt-2">Connectez-vous pour acceder a votre livret</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 bg-red-50 text-error rounded-lg"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-lg font-medium mb-2">
              Identifiant
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                aria-hidden
              />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className={cn(
                  'w-full pl-10 pr-4 py-3 border-2 rounded-lg text-lg',
                  'focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary-600 focus-visible:border-primary-600',
                  'border-gray-300'
                )}
                placeholder="Votre identifiant"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-lg font-medium mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                aria-hidden
              />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={cn(
                  'w-full pl-10 pr-4 py-3 border-2 rounded-lg text-lg',
                  'focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary-600 focus-visible:border-primary-600',
                  'border-gray-300'
                )}
                placeholder="Votre mot de passe"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full py-3 px-4 rounded-lg text-lg font-medium text-white',
              'bg-primary-600 hover:bg-primary-700',
              'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
