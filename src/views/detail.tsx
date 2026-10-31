import type { Tracker, TrackerEvent } from '../types'
import { Layout } from './layout'
import { getTrackerIcon } from './components/tracker-card'
import { LogEntryModal } from './components/log-entry-modal'

interface DetailProps {
  tracker: Tracker
  events: TrackerEvent[]
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
            {/* Habit Quick check-in */}
            {tracker.type === 'habit' && (
              <form action={`/track/${tracker.id}`} method="post" class="m-0 p-0 d-inline-flex">
                <button
                  type="submit"
                  class="btn btn-primary d-flex align-items-center gap-1"
                >
                  <i class="bi bi-check2"></i>
                  <span>Completar</span>
                </button>
              </form>
            )}

            {/* Open Modal for detailed log (or non-habit log) */}
            <button
              type="button"
              class={`btn d-flex align-items-center gap-1 ${
                tracker.type === 'habit' ? 'btn-outline-secondary' : 'btn-primary'
              }`}
              data-bs-toggle="modal"
              data-bs-target="#logModal"
            >
              <i class={`bi ${tracker.type === 'habit' ? 'bi-pencil-square' : 'bi-plus-lg'}`}></i>
              <span>{tracker.type === 'habit' ? '+ Nota' : 'Registrar'}</span>
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
