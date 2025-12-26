import { CheckCircle, Clock, Hourglass, XCircle } from 'lucide-react'
import type { SkillsSummary as Summary } from '../../services/skills.service'

interface SkillsSummaryProps {
  summary: Summary
}

export default function SkillsSummary({ summary }: SkillsSummaryProps) {
  const items = [
    {
      label: 'Acquises',
      count: summary.acquired,
      icon: CheckCircle,
      bgColor: 'bg-success-50',
      textColor: 'text-success-600',
    },
    {
      label: 'En cours',
      count: summary.inProgress,
      icon: Clock,
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-600',
    },
    {
      label: 'En attente',
      count: summary.pendingValidation,
      icon: Hourglass,
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
    },
    {
      label: 'Refusees',
      count: summary.rejected,
      icon: XCircle,
      bgColor: 'bg-error-50',
      textColor: 'text-error-600',
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-medium mb-4">Recapitulatif</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`${item.bgColor} ${item.textColor} rounded-lg p-3 text-center`}
          >
            <item.icon className="w-5 h-5 mx-auto mb-1" aria-hidden />
            <p className="text-2xl font-bold">{item.count}</p>
            <p className="text-xs">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
