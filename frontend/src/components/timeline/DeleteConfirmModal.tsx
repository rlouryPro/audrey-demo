import { AlertTriangle } from 'lucide-react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import type { Event } from '../../services/events.service'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  event: Event | null
  isDeleting: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  event,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!event) return null

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-error-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-error-600" aria-hidden />
            </div>
            <AlertDialog.Title className="text-xl font-bold">
              Supprimer l'evenement ?
            </AlertDialog.Title>
          </div>

          <AlertDialog.Description className="text-text-muted mb-6">
            Voulez-vous vraiment supprimer l'evenement "{event.title}" ? Cette action est
            irreversible.
          </AlertDialog.Description>

          <div className="flex gap-3">
            <AlertDialog.Cancel asChild>
              <button
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-600"
                disabled={isDeleting}
              >
                Annuler
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error-600"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
