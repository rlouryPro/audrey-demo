import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import SkillCard from './SkillCard'
import type { Domain, UserSkill } from '../../services/skills.service'

interface DomainAccordionProps {
  domain: Domain
  userSkills: UserSkill[]
  onStartSkill: (skillId: string) => void
  onRequestValidation: (skillId: string) => void
  onAbandonSkill: (skillId: string) => void
}

export default function DomainAccordion({
  domain,
  userSkills,
  onStartSkill,
  onRequestValidation,
  onAbandonSkill,
}: DomainAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )

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

  const getUserSkillForSkill = (skillId: string) => {
    return userSkills.find((us) => us.skillId === skillId)
  }

  // Count acquired skills in this domain
  const acquiredInDomain = userSkills.filter(
    (us) =>
      us.status === 'ACQUIRED' &&
      domain.categories.some((c) => c.skills.some((s) => s.id === us.skillId))
  ).length
  const totalInDomain = domain.categories.reduce((sum, c) => sum + c.skills.length, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600"
        aria-expanded={isOpen}
        aria-controls={`domain-${domain.id}`}
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-text-muted" aria-hidden />
          ) : (
            <ChevronRight className="w-5 h-5 text-text-muted" aria-hidden />
          )}
          <h3 className="font-semibold text-lg">{domain.name}</h3>
        </div>
        <span className="text-sm text-text-muted">
          {acquiredInDomain}/{totalInDomain} acquises
        </span>
      </button>

      {isOpen && (
        <div id={`domain-${domain.id}`} className="px-4 pb-4 space-y-4">
          {domain.categories.map((category) => (
            <div key={category.id} className="border-l-2 border-primary-200 pl-4">
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex items-center gap-2 py-2 text-left w-full hover:text-primary-600 transition-colors focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
                aria-expanded={expandedCategories.has(category.id)}
                aria-controls={`category-${category.id}`}
              >
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" aria-hidden />
                ) : (
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" aria-hidden />
                )}
                <span className="font-medium">{category.name}</span>
                <span className="text-xs text-text-muted">({category.skills.length})</span>
              </button>

              {expandedCategories.has(category.id) && (
                <div id={`category-${category.id}`} className="space-y-2 mt-2">
                  {category.skills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      userSkill={getUserSkillForSkill(skill.id)}
                      onStart={onStartSkill}
                      onRequestValidation={onRequestValidation}
                      onAbandon={onAbandonSkill}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
