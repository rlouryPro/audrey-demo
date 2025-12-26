import { useState } from 'react'
import { Calendar, ChevronDown, ChevronRight, Pencil, Trash2, ImageIcon } from 'lucide-react'
import type { Event } from '../../services/events.service'

interface TimelineEventProps {
  event: Event
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
  isFirst?: boolean
  isLast?: boolean
}

export default function TimelineEvent({ event, onEdit, onDelete }: TimelineEventProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const formattedDate = new Date(event.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  })

  // Use thumbnailUrl for display, fallback to photoUrl
  const imageUrl = event.thumbnailUrl || event.photoUrl
  const hasImage = imageUrl && !imageError

  return (
    <article
      role="listitem"
      className="relative flex gap-4"
    >
      {/* Timeline node */}
      <div className="flex flex-col items-center">
        {/* Connector line top */}
        <div className="w-0.5 h-4 bg-primary-200" aria-hidden />

        {/* Node circle - show thumbnail if available */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative rounded-full hover:scale-110 transition-all focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 z-10 flex items-center justify-center overflow-hidden ${
            hasImage
              ? 'w-12 h-12 border-4 border-primary-400 hover:border-primary-600'
              : 'w-8 h-8 bg-white border-4 border-primary-400 hover:border-primary-600'
          }`}
          aria-expanded={isExpanded}
          aria-controls={`event-${event.id}-details`}
          aria-label={isExpanded ? "Reduire l'evenement" : "Developper l'evenement"}
        >
          {hasImage ? (
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : isExpanded ? (
            <ChevronDown className="w-4 h-4 text-primary-600" aria-hidden />
          ) : (
            <ChevronRight className="w-4 h-4 text-primary-600" aria-hidden />
          )}
        </button>

        {/* Connector line bottom */}
        <div className="w-0.5 flex-1 bg-primary-200" aria-hidden />
      </div>

      {/* Event content card */}
      <div className="flex-1 pb-6">
        <div
          className={`bg-white rounded-xl shadow-sm border-2 transition-all overflow-hidden ${
            isExpanded ? 'border-primary-300 shadow-md' : 'border-gray-100 hover:border-primary-200'
          }`}
        >
          {/* Header - always visible */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Date badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium mb-2">
                  <Calendar className="w-3 h-3" aria-hidden />
                  <time dateTime={event.date}>{formattedDate}</time>
                  {hasImage && (
                    <ImageIcon className="w-3 h-3 ml-1" aria-label="Contient une photo" />
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-text-primary text-lg leading-tight">
                  {event.title}
                </h3>
              </div>

              {/* Action buttons */}
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                  className="p-2 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary-600"
                  aria-label={`Modifier l'evenement ${event.title}`}
                >
                  <Pencil className="w-4 h-4" aria-hidden />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(event); }}
                  className="p-2 text-text-muted hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-error-600"
                  aria-label={`Supprimer l'evenement ${event.title}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div
              id={`event-${event.id}-details`}
              className="border-t border-gray-100 bg-gray-50/50"
            >
              {hasImage && (
                <div className="p-4 pb-0">
                  <img
                    src={imageUrl}
                    alt={`Photo de ${event.title}`}
                    className="w-full max-h-64 object-contain rounded-lg shadow-sm bg-gray-100"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              {event.description && (
                <div className="p-4">
                  <p className="text-text-muted leading-relaxed">{event.description}</p>
                </div>
              )}
              {!hasImage && !event.description && (
                <div className="p-4 text-center text-text-muted text-sm">
                  Aucun detail supplementaire pour cet evenement.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
