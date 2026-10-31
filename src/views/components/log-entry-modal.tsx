import type { Tracker } from '../../types'
import { getTrackerIcon } from './tracker-card'

interface LogEntryModalProps {
  tracker: Tracker
  modalId?: string
  returnTo?: string
}

function getLocalDatetimeString(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export function LogEntryModal({ tracker, modalId = 'logModal', returnTo }: LogEntryModalProps) {
  const icon = getTrackerIcon(tracker.type)
  const defaultTimestamp = getLocalDatetimeString()

  return (
    <div
      class="modal fade"
      id={modalId}
      tabindex={-1}
      aria-labelledby={`${modalId}Label`}
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom">
            <h5 class="modal-title d-flex align-items-center gap-2" id={`${modalId}Label`}>
              <i class={`bi ${icon} text-primary`}></i>
              <span>Registrar: {tracker.name}</span>
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>

          <form action={`/track/${tracker.id}`} method="post" class="m-0 p-0">
            {returnTo && <input type="hidden" name="return_to" value={returnTo} />}
            <div class="modal-body p-4">
              {/* Value (numeric) */}
              {tracker.type === 'numeric' && (
                <div class="mb-3">
                  <label for={`${modalId}-value`} class="form-label fw-medium">
                    <span>Valor</span>
                    <span class="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    class="form-control"
                    id={`${modalId}-value`}
                    name="value"
                    placeholder="Valor..."
                    required
                  />
                </div>
              )}

              {/* Note */}
              <div class="mb-3">
                <label for={`${modalId}-note`} class="form-label fw-medium">
                  <span>Nota</span>{' '}
                  <span class="text-body-secondary fw-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id={`${modalId}-note`}
                  name="note"
                  placeholder="Nota..."
                />
              </div>

              {/* Timestamp */}
              <div class="mb-2">
                <label for={`${modalId}-timestamp`} class="form-label fw-medium">
                  Fecha y hora
                </label>
                <input
                  type="datetime-local"
                  class="form-control"
                  id={`${modalId}-timestamp`}
                  name="timestamp"
                  value={defaultTimestamp}
                  required
                />
              </div>
            </div>

            <div class="modal-footer border-top bg-body-tertiary p-3">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary d-flex align-items-center gap-1">
                <span>Guardar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
