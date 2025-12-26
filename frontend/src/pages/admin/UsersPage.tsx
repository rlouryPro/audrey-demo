import { useState, useEffect, useCallback } from 'react'
import { Users, Plus, Loader2, Pencil, UserCheck, UserX } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { usersService, type User, type CreateUserData, type UpdateUserData, type Role } from '../../services/users.service'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [activeFilter, setActiveFilter] = useState<string>('')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setError(null)
      const filters: { role?: Role; isActive?: boolean } = {}
      if (roleFilter) filters.role = roleFilter
      if (activeFilter === 'true') filters.isActive = true
      if (activeFilter === 'false') filters.isActive = false

      const data = await usersService.getAll(filters)
      setUsers(data)
    } catch {
      setError('Impossible de charger les utilisateurs')
    } finally {
      setIsLoading(false)
    }
  }, [roleFilter, activeFilter])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleOpenCreate = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleToggleActive = async (user: User) => {
    try {
      await usersService.update(user.id, { isActive: !user.isActive })
      loadUsers()
    } catch {
      setError('Impossible de modifier l\'utilisateur')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-600" aria-hidden />
          <h2 className="text-xl font-bold">Gestion des utilisateurs</h2>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600"
        >
          <Plus className="w-5 h-5" aria-hidden />
          <span>Nouvel utilisateur</span>
        </button>
      </header>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | '')}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
          aria-label="Filtrer par role"
        >
          <option value="">Tous les roles</option>
          <option value="USER">Utilisateurs</option>
          <option value="ADMIN">Administrateurs</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" aria-hidden />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-text-muted">Aucun utilisateur trouve.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Identifiant</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Niveau</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Statut</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={!user.isActive ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-3 font-medium">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-muted">{user.username}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {user.role === 'ADMIN' ? 'Admin' : 'Utilisateur'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.avatarLevel}/5</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        user.isActive ? 'bg-success-100 text-success-700' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Modifier ${user.firstName}`}
                      >
                        <Pencil className="w-4 h-4" aria-hidden />
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive
                            ? 'hover:bg-error-50 text-error-600'
                            : 'hover:bg-success-50 text-success-600'
                        }`}
                        aria-label={user.isActive ? `Desactiver ${user.firstName}` : `Activer ${user.firstName}`}
                      >
                        {user.isActive ? (
                          <UserX className="w-4 h-4" aria-hidden />
                        ) : (
                          <UserCheck className="w-4 h-4" aria-hidden />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingUser(null)
        }}
        user={editingUser}
        onSuccess={loadUsers}
      />
    </div>
  )
}

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSuccess: () => void
}

function UserFormModal({ isOpen, onClose, user, onSuccess }: UserFormModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<Role>('USER')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!user

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setRole(user.role)
      setPassword('')
    } else {
      setUsername('')
      setPassword('')
      setFirstName('')
      setLastName('')
      setRole('USER')
    }
    setError(null)
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (isEditing) {
        const data: UpdateUserData = { firstName, lastName, role }
        if (password) data.password = password
        await usersService.update(user.id, data)
      } else {
        const data: CreateUserData = { username, password, firstName, lastName, role }
        await usersService.create(data)
      }
      onSuccess()
      onClose()
    } catch {
      setError(isEditing ? 'Impossible de modifier l\'utilisateur' : 'Impossible de creer l\'utilisateur')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <Dialog.Title className="text-xl font-bold mb-4">
            {isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </Dialog.Title>

          {error && (
            <div role="alert" className="mb-4 p-3 bg-error-50 text-error-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isEditing && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Identifiant <span className="text-error-600">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Mot de passe {!isEditing && <span className="text-error-600">*</span>}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEditing}
                minLength={6}
                placeholder={isEditing ? 'Laisser vide pour ne pas modifier' : ''}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  Prenom <span className="text-error-600">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Nom <span className="text-error-600">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1">
                Role <span className="text-error-600">*</span>
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
              >
                <option value="USER">Utilisateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Creer'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
