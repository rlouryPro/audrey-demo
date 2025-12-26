import { useState, useRef, useEffect } from 'react'
import { X, Upload, Calendar } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import type { Event, CreateEventData, UpdateEventData } from '../../services/events.service'

interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateEventData | UpdateEventData) => Promise<void>
  event?: Event | null
}

export default function EventFormModal({ isOpen, onClose, onSubmit, event }: EventFormModalProps) {
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!event

  useEffect(() => {
    if (event) {
      setDate(event.date.slice(0, 10))
      setTitle(event.title)
      setDescription(event.description || '')
      setPhotoPreview(event.thumbnailUrl || null)
    } else {
      setDate('')
      setTitle('')
      setDescription('')
      setPhoto(null)
      setPhotoPreview(null)
    }
    setError(null)
  }, [event, isOpen])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La photo ne doit pas depasser 5 Mo')
        return
      }
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const data: CreateEventData | UpdateEventData = {
        date,
        title,
        description: description || undefined,
        photo: photo || undefined,
      }
      await onSubmit(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
          aria-describedby="modal-description"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-bold">
              {isEditing ? 'Modifier l\'evenement' : 'Nouvel evenement'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary-600"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </Dialog.Close>
          </div>

          <p id="modal-description" className="sr-only">
            {isEditing
              ? 'Formulaire pour modifier un evenement existant'
              : 'Formulaire pour ajouter un nouvel evenement a votre frise'}
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-error-50 text-error-700 rounded-lg text-sm"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="event-date" className="block text-sm font-medium mb-1">
                Date <span className="text-error-600">*</span>
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                  aria-hidden
                />
                <input
                  id="event-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="event-title" className="block text-sm font-medium mb-1">
                Titre <span className="text-error-600">*</span>
              </label>
              <input
                id="event-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                placeholder="Ex: Mon premier jour"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="event-description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Decrivez cet evenement..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Photo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
                id="event-photo"
              />

              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Apercu de la photo"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null)
                      setPhotoPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                    aria-label="Supprimer la photo"
                  >
                    <X className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors flex flex-col items-center gap-2 text-text-muted"
                >
                  <Upload className="w-8 h-8" aria-hidden />
                  <span>Ajouter une photo</span>
                  <span className="text-xs">(Max 5 Mo)</span>
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600"
              >
                {isSubmitting ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
