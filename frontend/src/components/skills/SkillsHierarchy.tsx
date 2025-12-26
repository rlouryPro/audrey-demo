import DomainAccordion from './DomainAccordion'
import type { Domain, UserSkill } from '../../services/skills.service'

interface SkillsHierarchyProps {
  domains: Domain[]
  userSkills: UserSkill[]
  onStartSkill: (skillId: string) => void
  onRequestValidation: (skillId: string) => void
  onAbandonSkill: (skillId: string) => void
}

export default function SkillsHierarchy({
  domains,
  userSkills,
  onStartSkill,
  onRequestValidation,
  onAbandonSkill,
}: SkillsHierarchyProps) {
  if (domains.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-medium mb-4">Referentiel</h3>
        <p className="text-center text-text-muted py-4">
          Aucune competence disponible pour le moment.
        </p>
      </div>
    )
  }

  // Filter out domains where all categories have no skills
  const nonEmptyDomains = domains.filter((domain) =>
    domain.categories.some((category) => category.skills.length > 0)
  )

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Referentiel des competences</h3>
      {nonEmptyDomains.map((domain) => (
        <DomainAccordion
          key={domain.id}
          domain={domain}
          userSkills={userSkills}
          onStartSkill={onStartSkill}
          onRequestValidation={onRequestValidation}
          onAbandonSkill={onAbandonSkill}
        />
      ))}
    </div>
  )
}
