import TimelineEvent from './TimelineEvent'
import type { Event } from '../../services/events.service'

interface TimelineProps {
  events: Event[]
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
}

export default function Timeline({ events, onEdit, onDelete }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div
        role="list"
        aria-label="Evenements de ma frise"
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-text-muted">
            Votre frise est vide pour le moment.
            <br />
            <span className="text-primary-600 font-medium">Ajoutez votre premier evenement !</span>
          </p>
        </div>
      </div>
    )
  }

  // Group events by year
  const eventsByYear = events.reduce((acc, event) => {
    const year = new Date(event.date).getFullYear()
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(event)
    return acc
  }, {} as Record<number, Event[]>)

  const sortedYears = Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div role="list" aria-label="Evenements de ma frise" className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-400 via-primary-300 to-primary-200" aria-hidden />

      <div className="space-y-8">
        {sortedYears.map((year) => (
          <div key={year} className="relative">
            {/* Year marker */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-lg z-10">
                {year}
              </div>
              <div className="h-0.5 flex-1 bg-primary-200" aria-hidden />
            </div>

            {/* Events for this year */}
            <div className="space-y-4 ml-6">
              {eventsByYear[year].map((event, index) => (
                <TimelineEvent
                  key={event.id}
                  event={event}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isFirst={index === 0}
                  isLast={index === eventsByYear[year].length - 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline end marker */}
      <div className="flex items-center gap-4 mt-8">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center z-10">
          <div className="w-4 h-4 rounded-full bg-gray-400" />
        </div>
        <span className="text-sm text-text-muted">Debut de votre parcours</span>
      </div>
    </div>
  )
}
