import { useState, useEffect, useCallback } from 'react'
import { Calendar, Plus, Loader2 } from 'lucide-react'
import Timeline from '../components/timeline/Timeline'
import EventFormModal from '../components/timeline/EventFormModal'
import DeleteConfirmModal from '../components/timeline/DeleteConfirmModal'
import { eventsService, type Event, type CreateEventData, type UpdateEventData } from '../services/events.service'

export default function TimelinePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadEvents = useCallback(async () => {
    try {
      setError(null)
      const data = await eventsService.getAll()
      setEvents(data)
    } catch {
      setError('Impossible de charger les evenements')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleOpenCreate = () => {
    setEditingEvent(null)
    setIsFormOpen(true)
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setIsFormOpen(true)
  }

  const handleDelete = (event: Event) => {
    setDeletingEvent(event)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (data: CreateEventData | UpdateEventData) => {
    if (editingEvent) {
      const updated = await eventsService.update(editingEvent.id, data)
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    } else {
      const created = await eventsService.create(data as CreateEventData)
      setEvents((prev) => [created, ...prev].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ))
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return
    setIsDeleting(true)
    try {
      await eventsService.delete(deletingEvent.id)
      setEvents((prev) => prev.filter((e) => e.id !== deletingEvent.id))
      setIsDeleteOpen(false)
      setDeletingEvent(null)
    } catch {
      setError('Impossible de supprimer l\'evenement')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary-600" aria-hidden />
          <h2 className="text-xl font-bold">Ma frise</h2>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600"
          aria-label="Ajouter un evenement"
        >
          <Plus className="w-5 h-5" aria-hidden />
          <span>Ajouter</span>
        </button>
      </header>

      {error && (
        <div role="alert" className="p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" aria-hidden />
          <span className="sr-only">Chargement des evenements</span>
        </div>
      ) : (
        <Timeline events={events} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <EventFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingEvent(null)
        }}
        onSubmit={handleSubmit}
        event={editingEvent}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setDeletingEvent(null)
        }}
        onConfirm={handleConfirmDelete}
        event={deletingEvent}
        isDeleting={isDeleting}
      />
    </div>
  )
}
