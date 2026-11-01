import {
  TRACKER_COLORS,
  getTrackerIcon,
  getTrackerTypeLabel,
  type Tracker,
  type TrackerEvent,
} from '../types'
import { Layout } from './layout'
import { Icon } from './icons'

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
        <div class="modal-content border-0">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title" id="logModalLabel">
              Registrar entrada
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>

          <form
            action={`/track/${tracker.id}`}
            method="post"
            hx-post={`/track/${tracker.id}`}
            hx-target="#events-section"
            hx-swap="outerHTML"
            hx-disabled-elt="find button"
            class="m-0 p-0"
          >
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
                  {isText && <span class="text-danger ms-1">*</span>}
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

            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-link text-secondary text-decoration-none" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary d-flex align-items-center gap-1">
                <span
                  class="spinner-border spinner-border-sm d-none"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Registrar entrada</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function EditTrackerModal({ tracker }: { tracker: Tracker }) {
  return (
    <div
      class="modal fade"
      id="editModal"
      tabindex={-1}
      aria-labelledby="editModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title" id="editModalLabel">
              Editar track
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>

          <form action={`/track/${tracker.id}/edit`} method="post" class="m-0 p-0">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label for="edit-tracker-name" class="form-label fw-medium">
                  <span>Nombre</span>
                  <span class="text-danger ms-1">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="edit-tracker-name"
                  name="name"
                  value={tracker.name}
                  required
                  autofocus
                />
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium d-block">Color</label>
                <div class="btn-group w-100" role="group" aria-label="Color">
                  <input
                    type="radio"
                    class="btn-check"
                    name="color"
                    id="edit-tracker-color-none"
                    value=""
                    autocomplete="off"
                    checked={!tracker.color}
                  />
                  <label
                    class="btn btn-outline-secondary d-flex align-items-center justify-content-center py-2"
                    for="edit-tracker-color-none"
                    title="Sin color"
                  >
                    <Icon name="slash-circle" />
                  </label>
                  {TRACKER_COLORS.map((c) => (
                    <>
                      <input
                        type="radio"
                        class="btn-check"
                        name="color"
                        id={`edit-tracker-color-${c.value.slice(1)}`}
                        value={c.value}
                        autocomplete="off"
                        checked={tracker.color === c.value}
                      />
                      <label
                        class="btn btn-outline-secondary d-flex align-items-center justify-content-center py-2"
                        for={`edit-tracker-color-${c.value.slice(1)}`}
                        title={c.label}
                      >
                        <span
                          class="rounded-circle d-inline-block"
                          style={{
                            width: '1rem',
                            height: '1rem',
                            backgroundColor: c.value,
                          }}
                        ></span>
                      </label>
                    </>
                  ))}
                </div>
              </div>

              <div class="mb-2">
                <label for="edit-tracker-description" class="form-label fw-medium">
                  Descripción
                </label>
                <textarea
                  class="form-control"
                  id="edit-tracker-description"
                  name="description"
                  placeholder="Descripción..."
                  rows={2}
                  maxlength={500}
                >
                  {tracker.description ?? ''}
                </textarea>
              </div>
            </div>

            <div class="modal-footer border-0 pt-0">
              <button
                type="button"
                class="btn btn-link text-secondary text-decoration-none"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary d-flex align-items-center gap-1">
                <span>Guardar cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export function EventsSection({ tracker, events }: DetailProps) {
  return (
    <div class="mb-4" id="events-section">
      <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
        <div class="d-flex align-items-baseline gap-2">
          <h2 class="h5 mb-0 fw-semibold">Historial de entradas</h2>
          <span class="text-body-secondary small">
            {events.length === 1 ? '1 entrada' : `${events.length} entradas`}
          </span>
        </div>

        {/* Open Modal for detailed log */}
        <button
          type="button"
          class="btn btn-primary d-flex align-items-center gap-1"
          data-bs-toggle="modal"
          data-bs-target="#logModal"
        >
          <Icon name="plus-lg" />
          <span>Registrar entrada</span>
        </button>
      </div>

      {events.length === 0 ? (
        <div class="card text-center text-body-secondary py-5 border-0 rounded-3 bg-body">
          <div class="d-flex flex-column align-items-center">
            <Icon name="activity" class="fs-1 d-block mb-2 text-body-tertiary mx-auto" />
            <h3 class="h6 fw-semibold mb-0">Sin entradas</h3>
          </div>
        </div>
      ) : (
        <div class="list-group list-group-flush rounded-3 overflow-hidden" id="events-list">
          {events.map((event) => (
            <div class="list-group-item border-0 p-3 d-flex justify-content-between align-items-center gap-3">
              <div class="d-flex align-items-center gap-3 flex-grow-1 min-w-0 flex-wrap">
                <span class="text-body-secondary small">{formatDate(event.timestamp)}</span>
                {event.value !== null && event.value !== undefined && (
                  <span class="font-monospace fw-semibold">{event.value}</span>
                )}
                {event.note && <span class="text-break">{event.note}</span>}
              </div>

              <button
                type="button"
                class="btn btn-link link-danger p-1 text-decoration-none lh-1 flex-shrink-0"
                hx-delete={`/track/${tracker.id}/${event.id}`}
                hx-target="#events-section"
                hx-swap="outerHTML"
                hx-confirm="¿Eliminar entrada?"
                title="Eliminar entrada"
                aria-label="Eliminar entrada"
              >
                <Icon name="trash3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function DetailPage({ tracker, events }: DetailProps) {
  const icon = getTrackerIcon(tracker.type)
  const typeLabel = getTrackerTypeLabel(tracker.type)

  return (
    <Layout title={`${tracker.name} - track`}>
      <div>
        {/* Tracker Header */}
        <div class="d-flex justify-content-between align-items-center gap-3 mb-4">
          <div>
            <div class="d-flex align-items-center gap-2">
              {tracker.color && (
                <span
                  class="rounded-circle flex-shrink-0 d-inline-block"
                  style={{
                    width: '0.875rem',
                    height: '0.875rem',
                    backgroundColor: tracker.color,
                  }}
                ></span>
              )}
              <h1 class="h3 mb-0 fw-semibold">{tracker.name}</h1>
            </div>
            {tracker.description && (
              <p class="text-body-secondary mt-1 mb-0">{tracker.description}</p>
            )}
          </div>

          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <span class="text-body-secondary lh-1 px-2" title={typeLabel}>
              <Icon name={icon} class="fs-5" />
            </span>

            {/* Edit Tracker */}
            <button
              type="button"
              class="btn btn-outline-secondary"
              data-bs-toggle="modal"
              data-bs-target="#editModal"
              title="Editar track"
              aria-label="Editar track"
            >
              <Icon name="pencil" />
            </button>

            {/* Delete Tracker */}
            <button
              type="button"
              class="btn btn-outline-danger"
              hx-delete={`/track/${tracker.id}`}
              hx-confirm="¿Eliminar track?"
              title="Eliminar track"
              aria-label="Eliminar track"
            >
              <Icon name="trash3" />
            </button>
          </div>
        </div>

        {/* History Feed Section */}
        <EventsSection tracker={tracker} events={events} />

        {/* Log Entry Modal */}
        <LogEntryModal tracker={tracker} />

        {/* Edit Tracker Modal */}
        <EditTrackerModal tracker={tracker} />
      </div>
    </Layout>
  )
}
