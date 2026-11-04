import {
  CHART_MODES,
  getTrackChartMode,
  getTrackIcon,
  getTrackTypeLabel,
  type ChartMode,
  type ChartPeriod,
  type ChartPoint,
  type Track,
  type TrackEvent,
} from '../types'
import { Layout } from './layout'
import { Icon } from './icons'
import { ColorPicker, FormModal } from './modal'
import { TrackChartSection } from './charts'

interface DetailProps {
  track: Track
  events: TrackEvent[]
  period?: ChartPeriod
  chartPoints?: ChartPoint[]
}

function LogEntryModal({ track }: { track: Track }) {
  const isText = track.type === 'text'

  return (
    <FormModal
      id="logModal"
      title="Registrar entrada"
      action={`/track/${track.id}`}
      target="#events-section"
      submitLabel="Registrar entrada"
    >
      {track.type === 'numeric' && (
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
          required
        />
      </div>
    </FormModal>
  )
}

function ChartModeSelector({
  name,
  label,
  selected,
}: {
  name: string
  label: string
  selected: ChartMode
}) {
  return (
    <div class="col-6">
      <label class="form-label small text-body-secondary mb-1 d-block">{label}</label>
      <div class="btn-group btn-group-sm w-100" role="group" aria-label={label}>
        {CHART_MODES.map((m) => (
          <>
            <input
              type="radio"
              class="btn-check"
              name={name}
              id={`edit-${name}-${m.value}`}
              value={m.value}
              autocomplete="off"
              checked={selected === m.value}
            />
            <label class="btn btn-outline-secondary" for={`edit-${name}-${m.value}`}>
              {m.label}
            </label>
          </>
        ))}
      </div>
    </div>
  )
}

function EditTrackModal({ track }: { track: Track }) {
  return (
    <FormModal
      id="editModal"
      title="Editar track"
      action={`/track/${track.id}/edit`}
      submitLabel="Guardar cambios"
    >
      <div class="mb-3">
        <label for="edit-track-name" class="form-label fw-medium">
          <span>Nombre</span>
          <span class="text-danger ms-1">*</span>
        </label>
        <input
          type="text"
          class="form-control"
          id="edit-track-name"
          name="name"
          value={track.name}
          required
          autofocus
        />
      </div>

      <ColorPicker
        selectedColor={track.color}
        idPrefix="edit-track-color"
      />

      <div class="mb-3">
        <label class="form-label fw-medium d-block mb-1">Visualización</label>
        <div class="row g-2">
          <ChartModeSelector
            name="chart_dashboard"
            label="Dashboard"
            selected={getTrackChartMode(track, 'dashboard')}
          />
          <ChartModeSelector
            name="chart_7d"
            label="7 días"
            selected={getTrackChartMode(track, '7d')}
          />
          <ChartModeSelector
            name="chart_30d"
            label="30 días"
            selected={getTrackChartMode(track, '30d')}
          />
          <ChartModeSelector
            name="chart_12m"
            label="12 meses"
            selected={getTrackChartMode(track, '12m')}
          />
        </div>
      </div>

      <div class="mb-2">
        <label for="edit-track-description" class="form-label fw-medium">
          Descripción
        </label>
        <textarea
          class="form-control"
          id="edit-track-description"
          name="description"
          placeholder="Descripción..."
          rows={2}
          maxlength={500}
        >
          {track.description ?? ''}
        </textarea>
      </div>
    </FormModal>
  )
}

export function EventsSection({ track, events }: DetailProps) {
  return (
    <div class="mb-4" id="events-section">
      <div class="row g-2 align-items-center justify-content-between mb-3">
        <div class="col-12 col-sm-auto">
          <div class="d-flex align-items-baseline gap-2">
            <h2 class="h5 mb-0 fw-semibold">Historial de entradas</h2>
            <span class="text-body-secondary small">
              {events.length === 1 ? '1 entrada' : `${events.length} entradas`}
            </span>
          </div>
        </div>

        <div class="col-auto ms-auto">
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
                <time datetime={event.timestamp} class="text-body-secondary small"></time>
                {event.value !== null && event.value !== undefined && (
                  <span class="font-monospace fw-semibold">{event.value}</span>
                )}
                {event.note && <span class="text-break">{event.note}</span>}
              </div>

              <button
                type="button"
                class="btn btn-link link-danger p-1 text-decoration-none lh-1 flex-shrink-0"
                hx-delete={`/track/${track.id}/${event.id}`}
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

export function DetailPage({
  track,
  events,
  period = '7d',
  chartPoints = [],
}: DetailProps) {
  const icon = getTrackIcon(track.type)
  const typeLabel = getTrackTypeLabel(track.type)

  return (
    <Layout title={`${track.name} - track`}>
      <div>
        {/* Track Header */}
        <div class="d-flex justify-content-between align-items-center gap-3 mb-4">
          <div>
            <div class="d-flex align-items-center gap-2">
              {track.color && (
                <span
                  class="rounded-circle flex-shrink-0 d-inline-block"
                  style={{
                    width: '0.875rem',
                    height: '0.875rem',
                    backgroundColor: track.color,
                  }}
                ></span>
              )}
              <h1 class="h3 mb-0 fw-semibold">{track.name}</h1>
            </div>
            {track.description && (
              <p class="text-body-secondary mt-1 mb-0">{track.description}</p>
            )}
          </div>

          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <span class="text-body-secondary lh-1 px-2" title={typeLabel}>
              <Icon name={icon} class="fs-5" />
            </span>

            {/* Edit Track */}
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

            {/* Delete Track */}
            <button
              type="button"
              class="btn btn-outline-danger"
              hx-delete={`/track/${track.id}`}
              hx-confirm="¿Eliminar track?"
              title="Eliminar track"
              aria-label="Eliminar track"
            >
              <Icon name="trash3" />
            </button>
          </div>
        </div>

        {/* Visualization Section */}
        <TrackChartSection track={track} period={period} points={chartPoints} />

        {/* History Feed Section */}
        <EventsSection track={track} events={events} />

        {/* Log Entry Modal */}
        <LogEntryModal track={track} />

        {/* Edit Track Modal */}
        <EditTrackModal track={track} />
      </div>
    </Layout>
  )
}
