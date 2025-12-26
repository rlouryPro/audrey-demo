import { useState, useEffect, useCallback } from 'react'
import { ClipboardCheck, Loader2, CheckCircle, XCircle } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { validationsService, type PendingValidation } from '../../services/users.service'

export default function ValidationsPage() {
  const [validations, setValidations] = useState<PendingValidation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [rejectingValidation, setRejectingValidation] = useState<PendingValidation | null>(null)

  const loadValidations = useCallback(async () => {
    try {
      setError(null)
      const data = await validationsService.getPending()
      setValidations(data)
    } catch {
      setError('Impossible de charger les validations')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadValidations()
  }, [loadValidations])

  const handleApprove = async (validation: PendingValidation) => {
    try {
      setActionError(null)
      await validationsService.approve(validation.id)
      loadValidations()
    } catch {
      setActionError('Impossible de valider cette competence')
    }
  }

  const handleReject = async (reason: string) => {
    if (!rejectingValidation) return
    try {
      setActionError(null)
      await validationsService.reject(rejectingValidation.id, reason)
      setRejectingValidation(null)
      loadValidations()
    } catch {
      setActionError('Impossible de refuser cette competence')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-2">
        <ClipboardCheck className="w-6 h-6 text-primary-600" aria-hidden />
        <h2 className="text-xl font-bold">Validations en attente</h2>
        {validations.length > 0 && (
          <span className="ml-2 px-2 py-1 bg-warning-100 text-warning-700 text-sm rounded-full">
            {validations.length}
          </span>
        )}
      </header>

      {error && (
        <div role="alert" className="p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
        </div>
      )}

      {actionError && (
        <div role="alert" className="p-4 bg-error-50 text-error-700 rounded-lg">
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-2 underline">
            Fermer
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" aria-hidden />
        </div>
      ) : validations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <ClipboardCheck className="w-12 h-12 text-success-600 mx-auto mb-3" aria-hidden />
          <p className="text-text-muted">Aucune validation en attente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {validations.map((validation) => (
            <div
              key={validation.id}
              className="bg-white rounded-xl shadow-sm p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-primary-600">
                    {validation.user.firstName} {validation.user.lastName}
                  </span>
                  <span className="text-text-muted">demande la validation de</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{validation.skill.name}</p>
                  <p className="text-sm text-text-muted mt-1">{validation.skill.description}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {validation.skill.category.domain.name} &gt; {validation.skill.category.name}
                  </p>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Demande le {new Date(validation.requestedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(validation)}
                  className="flex items-center gap-1 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-600"
                  aria-label={`Valider la competence ${validation.skill.name} pour ${validation.user.firstName}`}
                >
                  <CheckCircle className="w-4 h-4" aria-hidden />
                  Valider
                </button>
                <button
                  onClick={() => setRejectingValidation(validation)}
                  className="flex items-center gap-1 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error-600"
                  aria-label={`Refuser la competence ${validation.skill.name} pour ${validation.user.firstName}`}
                >
                  <XCircle className="w-4 h-4" aria-hidden />
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RejectModal
        isOpen={!!rejectingValidation}
        onClose={() => setRejectingValidation(null)}
        onConfirm={handleReject}
        validation={rejectingValidation}
      />
    </div>
  )
}

interface RejectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  validation: PendingValidation | null
}

function RejectModal({ isOpen, onClose, onConfirm, validation }: RejectModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setReason('')
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onConfirm(reason)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!validation) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <Dialog.Title className="text-xl font-bold mb-4">Refuser la competence</Dialog.Title>

          <p className="text-text-muted mb-4">
            Vous etes sur le point de refuser la competence "{validation.skill.name}" pour{' '}
            {validation.user.firstName} {validation.user.lastName}.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-1">
                Motif du refus <span className="text-error-600">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                minLength={1}
                maxLength={500}
                rows={3}
                placeholder="Expliquez pourquoi cette competence n'est pas validee..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason.trim()}
                className="flex-1 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi...' : 'Refuser'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
