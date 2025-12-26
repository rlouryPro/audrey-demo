import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Loader2, X, Save } from 'lucide-react'
import {
  adminSkillsService,
  type AdminDomain,
  type AdminSkill,
  type CreateSkillData,
} from '../../services/adminSkills.service'

// Common emoji icons for skills
const EMOJI_OPTIONS = ['💬', '👂', '❓', '⏰', '📅', '🤝', '👍', '💻', '📧', '📦', '🚚', '🗂️', '🔧', '💡', '🧩', '✅', '📝', '🎯', '⭐', '🏆']

type ModalType = 'domain' | 'category' | 'skill' | null

interface ModalState {
  type: ModalType
  mode: 'create' | 'edit'
  data?: {
    id?: string
    domainId?: string
    categoryId?: string
    name?: string
    description?: string
    iconName?: string
  }
}

export default function SkillsAdminPage() {
  const [domains, setDomains] = useState<AdminDomain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<ModalState | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIcon, setFormIcon] = useState('💬')

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const data = await adminSkillsService.getHierarchy()
      setDomains(data)
    } catch {
      setError('Impossible de charger les competences')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev)
      if (next.has(domainId)) {
        next.delete(domainId)
      } else {
        next.add(domainId)
      }
      return next
    })
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const openModal = (type: ModalType, mode: 'create' | 'edit', data?: ModalState['data']) => {
    setFormName(data?.name || '')
    setFormDescription(data?.description || '')
    setFormIcon(data?.iconName || '💬')
    setModal({ type, mode, data })
  }

  const closeModal = () => {
    setModal(null)
    setFormName('')
    setFormDescription('')
    setFormIcon('💬')
  }

  const handleSave = async () => {
    if (!modal) return

    setIsSaving(true)
    try {
      if (modal.type === 'domain') {
        if (modal.mode === 'create') {
          await adminSkillsService.createDomain({
            name: formName,
            description: formDescription || undefined,
          })
        } else if (modal.data?.id) {
          await adminSkillsService.updateDomain(modal.data.id, {
            name: formName,
            description: formDescription || undefined,
          })
        }
      } else if (modal.type === 'category') {
        if (modal.mode === 'create' && modal.data?.domainId) {
          await adminSkillsService.createCategory({
            domainId: modal.data.domainId,
            name: formName,
            description: formDescription || undefined,
          })
        } else if (modal.data?.id) {
          await adminSkillsService.updateCategory(modal.data.id, {
            name: formName,
            description: formDescription || undefined,
          })
        }
      } else if (modal.type === 'skill') {
        if (modal.mode === 'create' && modal.data?.categoryId) {
          const skillData: CreateSkillData = {
            categoryId: modal.data.categoryId,
            name: formName,
            description: formDescription,
            iconName: formIcon,
          }
          await adminSkillsService.createSkill(skillData)
        } else if (modal.data?.id) {
          await adminSkillsService.updateSkill(modal.data.id, {
            name: formName,
            description: formDescription,
            iconName: formIcon,
          })
        }
      }

      await loadData()
      closeModal()
    } catch {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (type: 'domain' | 'category' | 'skill', id: string, name: string) => {
    const typeLabels = { domain: 'domaine', category: 'categorie', skill: 'competence' }
    if (!confirm(`Supprimer ${typeLabels[type]} "${name}" ? Cette action est irreversible.`)) {
      return
    }

    try {
      if (type === 'domain') {
        await adminSkillsService.deleteDomain(id)
      } else if (type === 'category') {
        await adminSkillsService.deleteCategory(id)
      } else {
        await adminSkillsService.deleteSkill(id)
      }
      await loadData()
    } catch {
      setError('Erreur lors de la suppression')
    }
  }

  const toggleSkillActive = async (skill: AdminSkill) => {
    try {
      await adminSkillsService.updateSkill(skill.id, { isActive: !skill.isActive })
      await loadData()
    } catch {
      setError('Erreur lors de la modification')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" aria-hidden />
        <span className="sr-only">Chargement</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Gestion des competences</h2>
        <button
          onClick={() => openModal('domain', 'create')}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" aria-hidden />
          Nouveau domaine
        </button>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline hover:no-underline">
            Fermer
          </button>
        </div>
      )}

      {domains.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-text-muted mb-4">Aucun domaine de competences.</p>
          <button
            onClick={() => openModal('domain', 'create')}
            className="text-primary-600 hover:underline"
          >
            Creer le premier domaine
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <div key={domain.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Domain header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <button
                  onClick={() => toggleDomain(domain.id)}
                  className="flex items-center gap-2 font-semibold text-lg hover:text-primary-600 transition-colors"
                >
                  {expandedDomains.has(domain.id) ? (
                    <ChevronDown className="w-5 h-5" aria-hidden />
                  ) : (
                    <ChevronRight className="w-5 h-5" aria-hidden />
                  )}
                  {domain.name}
                  <span className="text-sm font-normal text-text-muted">
                    ({domain.categories.reduce((sum, c) => sum + c.skills.length, 0)} competences)
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal('category', 'create', { domainId: domain.id })}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Ajouter une categorie"
                  >
                    <Plus className="w-4 h-4" aria-hidden />
                  </button>
                  <button
                    onClick={() => openModal('domain', 'edit', { id: domain.id, name: domain.name, description: domain.description || '' })}
                    className="p-2 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="w-4 h-4" aria-hidden />
                  </button>
                  <button
                    onClick={() => handleDelete('domain', domain.id, domain.name)}
                    className="p-2 text-text-muted hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </div>

              {/* Categories */}
              {expandedDomains.has(domain.id) && (
                <div className="p-4 space-y-3">
                  {domain.categories.length === 0 ? (
                    <p className="text-text-muted text-sm italic">Aucune categorie</p>
                  ) : (
                    domain.categories.map((category) => (
                      <div key={category.id} className="border rounded-lg">
                        {/* Category header */}
                        <div className="flex items-center justify-between p-3 bg-gray-50">
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="flex items-center gap-2 font-medium hover:text-primary-600 transition-colors"
                          >
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="w-4 h-4" aria-hidden />
                            ) : (
                              <ChevronRight className="w-4 h-4" aria-hidden />
                            )}
                            {category.name}
                            <span className="text-sm font-normal text-text-muted">
                              ({category.skills.length})
                            </span>
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openModal('skill', 'create', { categoryId: category.id })}
                              className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title="Ajouter une competence"
                            >
                              <Plus className="w-4 h-4" aria-hidden />
                            </button>
                            <button
                              onClick={() => openModal('category', 'edit', { id: category.id, name: category.name, description: category.description || '' })}
                              className="p-1.5 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title="Modifier"
                            >
                              <Pencil className="w-4 h-4" aria-hidden />
                            </button>
                            <button
                              onClick={() => handleDelete('category', category.id, category.name)}
                              className="p-1.5 text-text-muted hover:text-error-600 hover:bg-error-50 rounded transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden />
                            </button>
                          </div>
                        </div>

                        {/* Skills */}
                        {expandedCategories.has(category.id) && (
                          <div className="p-3 space-y-2">
                            {category.skills.length === 0 ? (
                              <p className="text-text-muted text-sm italic">Aucune competence</p>
                            ) : (
                              category.skills.map((skill) => (
                                <div
                                  key={skill.id}
                                  className={`flex items-center justify-between p-3 rounded-lg border ${
                                    skill.isActive ? 'bg-white' : 'bg-gray-100 opacity-60'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xl">{skill.iconName}</span>
                                    <div>
                                      <div className="font-medium">{skill.name}</div>
                                      <div className="text-sm text-text-muted">{skill.description}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleSkillActive(skill)}
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        skill.isActive
                                          ? 'bg-success-100 text-success-700'
                                          : 'bg-gray-200 text-gray-600'
                                      }`}
                                    >
                                      {skill.isActive ? 'Actif' : 'Inactif'}
                                    </button>
                                    <button
                                      onClick={() => openModal('skill', 'edit', {
                                        id: skill.id,
                                        name: skill.name,
                                        description: skill.description,
                                        iconName: skill.iconName,
                                      })}
                                      className="p-1.5 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                      title="Modifier"
                                    >
                                      <Pencil className="w-4 h-4" aria-hidden />
                                    </button>
                                    <button
                                      onClick={() => handleDelete('skill', skill.id, skill.name)}
                                      className="p-1.5 text-text-muted hover:text-error-600 hover:bg-error-50 rounded transition-colors"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-4 h-4" aria-hidden />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">
                {modal.mode === 'create' ? 'Creer' : 'Modifier'}{' '}
                {modal.type === 'domain' ? 'un domaine' : modal.type === 'category' ? 'une categorie' : 'une competence'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-text-muted hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                  placeholder="Nom..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                  placeholder="Description..."
                />
              </div>

              {modal.type === 'skill' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Icone</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormIcon(emoji)}
                        className={`w-10 h-10 text-xl rounded-lg border-2 transition-colors ${
                          formIcon === emoji
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-text-muted hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!formName.trim() || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="w-4 h-4" aria-hidden />
                )}
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
