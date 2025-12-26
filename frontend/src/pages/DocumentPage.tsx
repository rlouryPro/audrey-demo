import { useState, useEffect, useCallback } from 'react'
import { FileText, Download, Loader2, User, Briefcase, GraduationCap, Award, Calendar, Mail, Phone, MapPin } from 'lucide-react'
import { documentService, type DocumentPreview } from '../services/document.service'

export default function DocumentPage() {
  const [preview, setPreview] = useState<DocumentPreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPreview = useCallback(async () => {
    try {
      setError(null)
      const data = await documentService.getPreview()
      setPreview(data)
    } catch {
      setError('Impossible de charger l\'apercu')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPreview()
  }, [loadPreview])

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await documentService.downloadHtml()
    } catch {
      setError('Impossible de telecharger le document')
    } finally {
      setIsDownloading(false)
    }
  }

  const hasContent = preview && (preview.events.length > 0 || preview.acquiredSkills.length > 0)

  // Group skills by domain
  const skillsByDomain = preview?.acquiredSkills.reduce((acc, skill) => {
    if (!acc[skill.domainName]) {
      acc[skill.domainName] = []
    }
    acc[skill.domainName].push(skill)
    return acc
  }, {} as Record<string, typeof preview.acquiredSkills>) || {}

  // Calculate experience years
  const startYear = preview?.user.createdAt
    ? new Date(preview.user.createdAt).getFullYear()
    : new Date().getFullYear()
  const currentYear = new Date().getFullYear()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" aria-hidden />
        <span className="sr-only">Chargement de l'apercu</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with download button */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-600" aria-hidden />
          <h2 className="text-xl font-bold">Mon CV</h2>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading || !hasContent}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600 transition-colors"
          aria-label="Telecharger le CV"
        >
          {isDownloading ? (
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
          ) : (
            <Download className="w-5 h-5" aria-hidden />
          )}
          <span className="hidden sm:inline">{isDownloading ? 'Telechargement...' : 'Telecharger'}</span>
        </button>
      </header>

      {error && (
        <div role="alert" className="p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline hover:no-underline">
            Fermer
          </button>
        </div>
      )}

      {!hasContent ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" aria-hidden />
            <p className="text-text-muted">
              Ajoutez des evenements et des competences pour generer votre CV professionnel.
            </p>
          </div>
        </div>
      ) : preview && (
        /* Professional CV Layout */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* CV Header - Blue banner */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
            <div className="flex items-center gap-6">
              {/* Avatar placeholder */}
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border-4 border-white/30">
                <User className="w-12 h-12 text-white/80" aria-hidden />
              </div>

              {/* Name and title */}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {preview.user.firstName} {preview.user.lastName}
                </h1>
                <p className="text-primary-100 text-lg mt-1">Travailleur ESAT</p>

                {/* Level badge */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-full ${
                          level <= preview.user.avatarLevel
                            ? 'bg-yellow-400'
                            : 'bg-white/30'
                        }`}
                        aria-hidden
                      />
                    ))}
                  </div>
                  <span className="text-sm text-primary-100">
                    Niveau {preview.user.avatarLevel}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Contact info (placeholder) */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/20 text-sm text-primary-100">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" aria-hidden />
                <span>contact@esat.fr</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" aria-hidden />
                <span>01 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" aria-hidden />
                <span>France</span>
              </div>
            </div>
          </div>

          {/* CV Content - Two columns on desktop */}
          <div className="grid md:grid-cols-3 gap-0">
            {/* Sidebar - Skills */}
            <div className="bg-gray-50 p-6 md:border-r border-gray-200">
              {/* Skills Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-primary-600" aria-hidden />
                  <h2 className="font-bold text-lg text-gray-800">Competences</h2>
                </div>

                {Object.keys(skillsByDomain).length === 0 ? (
                  <p className="text-text-muted text-sm italic">
                    En cours d'acquisition...
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(skillsByDomain).map(([domain, skills]) => (
                      <div key={domain}>
                        <h3 className="text-sm font-semibold text-primary-700 mb-2">
                          {domain}
                        </h3>
                        <ul className="space-y-1.5">
                          {skills.map((skill) => (
                            <li key={skill.id} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-success-500 mt-1.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{skill.skillName}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Summary stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-primary-600">
                      {preview.acquiredSkills.length}
                    </div>
                    <div className="text-xs text-text-muted">Competences</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-primary-600">
                      {preview.events.length}
                    </div>
                    <div className="text-xs text-text-muted">Evenements</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content - Experience */}
            <div className="md:col-span-2 p-6">
              {/* Experience Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-primary-600" aria-hidden />
                  <h2 className="font-bold text-lg text-gray-800">Parcours Professionnel</h2>
                </div>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" aria-hidden />

                  <div className="space-y-4">
                    {preview.events.length === 0 ? (
                      <p className="text-text-muted text-sm italic ml-8">
                        Aucun evenement enregistre.
                      </p>
                    ) : (
                      preview.events.map((event, index) => (
                        <div key={event.id} className="relative pl-8">
                          {/* Timeline dot */}
                          <div
                            className={`absolute left-1.5 top-1.5 w-4 h-4 rounded-full border-2 ${
                              index === 0
                                ? 'bg-primary-600 border-primary-600'
                                : 'bg-white border-gray-300'
                            }`}
                            aria-hidden
                          />

                          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-2 text-sm text-primary-600 font-medium mb-1">
                              <Calendar className="w-4 h-4" aria-hidden />
                              <time dateTime={event.date}>
                                {new Date(event.date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </time>
                            </div>
                            <h3 className="font-semibold text-gray-800">{event.title}</h3>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              {/* Formation Section */}
              <section className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-primary-600" aria-hidden />
                  <h2 className="font-bold text-lg text-gray-800">Formation</h2>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">Formation ESAT</h3>
                      <p className="text-sm text-text-muted">Etablissement et Service d'Aide par le Travail</p>
                    </div>
                    <span className="text-sm text-primary-600 font-medium">
                      {startYear} - {currentYear}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* CV Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center text-xs text-text-muted border-t">
            <p>Document genere le {new Date().toLocaleDateString('fr-FR')} - Livret ESAT</p>
          </div>
        </div>
      )}
    </div>
  )
}
