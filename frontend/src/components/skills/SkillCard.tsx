import { Play, Send, CheckCircle, XCircle, Clock, Hourglass, Trash2 } from 'lucide-react'
import type { Skill, UserSkill, SkillStatus } from '../../services/skills.service'

interface SkillCardProps {
  skill: Skill
  userSkill?: UserSkill
  onStart: (skillId: string) => void
  onRequestValidation: (skillId: string) => void
  onAbandon: (skillId: string) => void
}

const STATUS_CONFIG: Record<SkillStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  IN_PROGRESS: { label: 'En cours', icon: Clock, color: 'text-warning-600 bg-warning-50' },
  PENDING_VALIDATION: { label: 'En attente', icon: Hourglass, color: 'text-primary-600 bg-primary-50' },
  ACQUIRED: { label: 'Acquise', icon: CheckCircle, color: 'text-success-600 bg-success-50' },
  REJECTED: { label: 'Refusee', icon: XCircle, color: 'text-error-600 bg-error-50' },
}

export default function SkillCard({
  skill,
  userSkill,
  onStart,
  onRequestValidation,
  onAbandon,
}: SkillCardProps) {
  const status = userSkill?.status
  const statusConfig = status ? STATUS_CONFIG[status] : null
  const StatusIcon = statusConfig?.icon

  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        status === 'ACQUIRED'
          ? 'border-success-300 bg-success-50/30'
          : status
          ? 'border-gray-200 bg-gray-50'
          : 'border-gray-200 bg-white hover:border-primary-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl" aria-hidden>{skill.iconName}</span>
            <h4 className="font-medium text-text-primary">{skill.name}</h4>
          </div>
          <p className="text-sm text-text-muted line-clamp-2">{skill.description}</p>

          {userSkill?.rejectedReason && (
            <p className="text-xs text-error-600 mt-2 bg-error-50 p-2 rounded">
              Motif : {userSkill.rejectedReason}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {statusConfig && StatusIcon && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
            >
              <StatusIcon className="w-3 h-3" aria-hidden />
              {statusConfig.label}
            </span>
          )}

          {!status && (
            <button
              onClick={() => onStart(skill.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600"
              aria-label={`Commencer la competence ${skill.name}`}
            >
              <Play className="w-4 h-4" aria-hidden />
              Commencer
            </button>
          )}

          {status === 'IN_PROGRESS' && userSkill && (
            <div className="flex gap-2">
              <button
                onClick={() => onRequestValidation(skill.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600"
                aria-label={`Demander la validation pour ${skill.name}`}
              >
                <Send className="w-4 h-4" aria-hidden />
                Valider
              </button>
              <button
                onClick={() => onAbandon(skill.id)}
                className="p-1.5 text-text-muted hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-error-600"
                aria-label={`Abandonner la competence ${skill.name}`}
              >
                <Trash2 className="w-4 h-4" aria-hidden />
              </button>
            </div>
          )}

          {status === 'REJECTED' && userSkill && (
            <button
              onClick={() => onStart(skill.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600"
              aria-label={`Recommencer la competence ${skill.name}`}
            >
              <Play className="w-4 h-4" aria-hidden />
              Reessayer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
