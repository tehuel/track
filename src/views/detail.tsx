import { getTrackerIcon, type Tracker, type TrackerEvent } from '../types'
import { Layout } from './layout'

interface DetailProps {
  tracker: Tracker
  events: TrackerEvent[]
}

function getLocalDatetimeString(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('es-AR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function LogEntryModal({ tracker }: { tracker: Tracker }) {
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

export function DetailPage({ tracker, events }: DetailProps) {
  const icon = getTrackerIcon(tracker.type)

  return (
    <Layout title={`${tracker.name} - track`}>
      <div>
        {/* Back Link */}
        <div class="mb-3">
          <a
            href="/"
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
          >
            <i class="bi bi-arrow-left"></i>
            <span>Volver</span>
          </a>
        </div>

        {/* Tracker Header */}
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div class="d-flex align-items-center gap-2">
              <i class={`bi ${icon} text-primary fs-3`}></i>
              <h1 class="h3 mb-0 fw-semibold">{tracker.name}</h1>
            </div>
            {tracker.description && (
              <p class="text-body-secondary mt-1 mb-0">{tracker.description}</p>
            )}
          </div>

          <div class="d-flex align-items-center gap-2 flex-wrap">
            {/* Open Modal for detailed log */}
            <button
              type="button"
              class="btn btn-primary d-flex align-items-center gap-1"
              data-bs-toggle="modal"
              data-bs-target="#logModal"
            >
              <i class="bi bi-plus-lg"></i>
              <span>Registrar</span>
            </button>

            {/* Delete Tracker */}
            <button
              type="button"
              class="btn btn-outline-danger d-flex align-items-center gap-1"
              hx-delete={`/track/${tracker.id}`}
              hx-confirm="¿Eliminar track?"
              title="Eliminar track"
            >
              <i class="bi bi-trash3"></i>
              <span>Eliminar track</span>
            </button>
          </div>
        </div>

        {/* History Feed Section */}
        <div class="mb-4">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h2 class="h5 mb-0 fw-semibold">Historial de entradas</h2>
            <span class="badge bg-secondary-subtle text-secondary rounded-pill">
              {events.length === 1 ? '1 entrada' : `${events.length} entradas`}
            </span>
          </div>

          {events.length === 0 ? (
            <div class="text-center text-body-secondary py-5 border rounded-3 bg-body shadow-sm">
              <i class="bi bi-calendar-x fs-1 d-block mb-2 text-body-tertiary"></i>
              <h3 class="h6 fw-semibold mb-0">Sin entradas</h3>
            </div>
          ) : (
            <div class="list-group shadow-sm" id="events-list">
              {events.map((event) => (
                <div class="list-group-item list-group-item-action p-3 d-flex justify-content-between align-items-center gap-3">
                  <div class="d-flex align-items-center gap-3 flex-grow-1 min-w-0 flex-wrap">
                    <span class="text-body-secondary small">{formatDate(event.timestamp)}</span>
                    {event.value !== null && event.value !== undefined && (
                      <span class="fw-semibold badge bg-primary-subtle text-primary">
                        {event.value}
                      </span>
                    )}
                    {event.note && <span class="text-break">{event.note}</span>}
                  </div>

                  <button
                    type="button"
                    class="btn btn-link link-danger p-1 text-decoration-none lh-1 flex-shrink-0"
                    hx-delete={`/track/${tracker.id}/${event.id}`}
                    hx-confirm="¿Eliminar entrada?"
                    title="Eliminar entrada"
                    aria-label="Eliminar entrada"
                  >
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log Entry Modal */}
        <LogEntryModal tracker={tracker} />
      </div>
    </Layout>
  )
}
