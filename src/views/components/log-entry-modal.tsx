import type { Tracker } from '../../types'
import { getTrackerIcon } from './tracker-card'

interface LogEntryModalProps {
  tracker: Tracker
}

function getLocalDatetimeString(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export function LogEntryModal({ tracker }: LogEntryModalProps) {
  const icon = getTrackerIcon(tracker.type)
  const defaultTimestamp = getLocalDatetimeString()
  const isText = tracker.type === 'text'

  return (
    <div
      class="modal fade"
      id="logModal"
      tabindex={-1}
      aria-labelledby="logModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom">
            <h5 class="modal-title d-flex align-items-center gap-2" id="logModalLabel">
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
            <div class="modal-body p-4">
              {/* Value (numeric) */}
              {tracker.type === 'numeric' && (
                <div class="mb-3">
                  <label for="logModal-value" class="form-label fw-medium">
                    <span>Valor</span>
                    <span class="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    class="form-control"
                    id="logModal-value"
                    name="value"
                    placeholder="Valor..."
                    required
                  />
                </div>
              )}

              {/* Note */}
              <div class="mb-3">
                <label for="logModal-note" class="form-label fw-medium">
                  <span>Nota</span>
                  {isText ? (
                    <span class="text-danger ms-1">*</span>
                  ) : (
                    <span class="text-body-secondary fw-normal ms-1">(opcional)</span>
                  )}
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="logModal-note"
                  name="note"
                  placeholder="Nota..."
                  required={isText}
                />
              </div>

              {/* Timestamp */}
              <div class="mb-2">
                <label for="logModal-timestamp" class="form-label fw-medium">
                  Fecha y hora
                </label>
                <input
                  type="datetime-local"
                  class="form-control"
                  id="logModal-timestamp"
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
