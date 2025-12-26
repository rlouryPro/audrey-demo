import { useState, useEffect, useCallback } from 'react'
import { Star, Loader2 } from 'lucide-react'
import Avatar from '../components/skills/Avatar'
import SkillsSummary from '../components/skills/SkillsSummary'
import SkillsHierarchy from '../components/skills/SkillsHierarchy'
import { skillsService, type Domain, type MySkillsResponse } from '../services/skills.service'

export default function SkillsPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [mySkills, setMySkills] = useState<MySkillsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const [hierarchyData, mySkillsData] = await Promise.all([
        skillsService.getHierarchy(),
        skillsService.getMySkills(),
      ])
      setDomains(hierarchyData)
      setMySkills(mySkillsData)
    } catch {
      setError('Impossible de charger les donnees')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStartSkill = async (skillId: string) => {
    try {
      setActionError(null)
      await skillsService.startSkill(skillId)
      // Reload to get updated data
      const mySkillsData = await skillsService.getMySkills()
      setMySkills(mySkillsData)
    } catch {
      setActionError('Impossible de commencer cette competence')
    }
  }

  const handleRequestValidation = async (skillId: string) => {
    try {
      setActionError(null)
      await skillsService.requestValidation(skillId)
      const mySkillsData = await skillsService.getMySkills()
      setMySkills(mySkillsData)
    } catch {
      setActionError('Impossible de demander la validation')
    }
  }

  const handleAbandonSkill = async (skillId: string) => {
    try {
      setActionError(null)
      await skillsService.abandonSkill(skillId)
      const mySkillsData = await skillsService.getMySkills()
      setMySkills(mySkillsData)
    } catch {
      setActionError('Impossible d\'abandonner cette competence')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" aria-hidden />
        <span className="sr-only">Chargement des competences</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <header className="flex items-center gap-2">
          <Star className="w-6 h-6 text-primary-600" aria-hidden />
          <h2 className="text-xl font-bold">Mes competences</h2>
        </header>
        <div role="alert" className="p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-2">
        <Star className="w-6 h-6 text-primary-600" aria-hidden />
        <h2 className="text-xl font-bold">Mes competences</h2>
      </header>

      {actionError && (
        <div role="alert" className="p-4 bg-error-50 text-error-700 rounded-lg">
          {actionError}
          <button
            onClick={() => setActionError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Fermer
          </button>
        </div>
      )}

      {mySkills && (
        <>
          <Avatar level={mySkills.avatarLevel} acquiredCount={mySkills.summary.acquired} />
          <SkillsSummary summary={mySkills.summary} />
        </>
      )}

      <SkillsHierarchy
        domains={domains}
        userSkills={mySkills?.skills || []}
        onStartSkill={handleStartSkill}
        onRequestValidation={handleRequestValidation}
        onAbandonSkill={handleAbandonSkill}
      />
    </div>
  )
}
