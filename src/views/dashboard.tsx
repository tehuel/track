import {
  TRACK_TYPES,
  getTrackChartMode,
  getTrackIcon,
  getTrackTypeLabel,
  type ChartPoint,
  type Track,
  type TrackEvent,
} from '../types'
import { Layout } from './layout'
import { Icon } from './icons'
import { ColorPicker, FormModal, SubmitButton } from './modal'
import { Chart } from './charts'

export interface TrackSummary {
  points: ChartPoint[]
  latestEvent: TrackEvent | null
}

interface DashboardProps {
  tracks: Track[]
  summaries?: Record<string, TrackSummary>
  query?: string
}

interface TrackCardProps {
  track: Track
  summary?: TrackSummary
}

export function TrackCard({ track, summary }: TrackCardProps) {
  const icon = getTrackIcon(track.type)
  const typeLabel = getTrackTypeLabel(track.type)

  return (
    <div class="col" id={`track-card-${track.id}`}>
      <div class="card h-100 border-0 bg-body rounded-3 position-relative">
        <div class="card-body p-3 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex align-items-center justify-content-between gap-2">
              <div class="d-flex align-items-center gap-2 text-truncate flex-grow-1">
                {track.color && (
                  <span
                    class="rounded-circle flex-shrink-0 d-inline-block"
                    style={{
                      width: '0.625rem',
                      height: '0.625rem',
                      backgroundColor: track.color,
                    }}
                  ></span>
                )}
                <h2 class="h6 card-title mb-0 fw-semibold text-truncate">
                  <a
                    href={`/track/${track.id}`}
                    class="stretched-link text-reset text-decoration-none d-inline-flex align-items-center"
                    title={track.name}
                    hx-indicator="#page-progress, find .spinner-border"
                  >
                    <span class="text-truncate">{track.name}</span>
                    <span
                      class="spinner-border spinner-border-sm text-body-secondary ms-2 flex-shrink-0 htmx-indicator"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  </a>
                </h2>
              </div>
              <span
                class="text-body-secondary lh-1 flex-shrink-0 position-relative z-2"
                title={typeLabel}
              >
                <Icon name={icon} class="fs-5" />
              </span>
            </div>

            {track.description && (
              <p class="card-text text-body-secondary small mb-0 mt-1 text-truncate">
                {track.description}
              </p>
            )}

            {summary && (() => {
              const mode = getTrackChartMode(track, 'dashboard')
              return (
                <div class="d-flex align-items-center justify-content-between gap-2 mt-3 position-relative z-2">
                  <div class="d-flex align-items-center flex-shrink-0" data-chart-mode={mode}>
                    <Chart mode={mode} track={track} points={summary.points} mini />
                  </div>
                  <div class="text-body-secondary small text-truncate">
                    {summary.latestEvent ? (
                      <time datetime={summary.latestEvent.timestamp}></time>
                    ) : (
                      <span class="text-body-tertiary">Sin entradas</span>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>

          <div class="pt-3 position-relative z-2">
            {track.type === 'habit' ? (
              <SubmitButton
                type="button"
                label="Completar"
                hx-post={`/track/${track.id}`}
                hx-target={`#track-card-${track.id}`}
                hx-swap="outerHTML"
                class="btn btn-sm btn-primary w-100 d-flex align-items-center justify-content-center gap-1"
              />
            ) : (
              <form
                class="m-0 p-0 d-flex"
                hx-post={`/track/${track.id}`}
                hx-target={`#track-card-${track.id}`}
                hx-swap="outerHTML"
              >
                <div class="input-group input-group-sm">
                  {track.type === 'numeric' ? (
                    <input
                      type="number"
                      step="any"
                      name="value"
                      class="form-control"
                      placeholder="Valor..."
                      required
                      aria-label="Valor"
                    />
                  ) : (
                    <input
                      type="text"
                      name="note"
                      class="form-control"
                      placeholder="Añadir nota..."
                      required
                      aria-label="Nota"
                    />
                  )}
                  <SubmitButton label="Registrar" />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NewTrackModal() {
  return (
    <FormModal id="newTrackModal" title="Crear track" action="/track" submitLabel="Crear track">
      <div class="mb-3">
        <label for="track-name" class="form-label fw-medium">
          <span>Nombre</span>
          <span class="text-danger ms-1">*</span>
        </label>
        <input
          type="text"
          class="form-control"
          id="track-name"
          name="name"
          placeholder="ej. Meditación"
          required
          autofocus
        />
      </div>

      <div class="mb-3">
        <label class="form-label fw-medium d-block">Tipo</label>
        <div class="btn-group w-100" role="group" aria-label="Tipo">
          {TRACK_TYPES.map((t, idx) => (
            <>
              <input
                type="radio"
                class="btn-check"
                name="type"
                id={`track-type-${t.value}`}
                value={t.value}
                autocomplete="off"
                checked={idx === 0}
              />
              <label
                class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                for={`track-type-${t.value}`}
              >
                <Icon name={t.icon} />
                <span>{t.label}</span>
              </label>
            </>
          ))}
        </div>
      </div>

      <ColorPicker idPrefix="track-color" />

      <div class="mb-2">
        <label for="track-description" class="form-label fw-medium">
          Descripción
        </label>
        <textarea
          class="form-control"
          id="track-description"
          name="description"
          placeholder="Descripción..."
          rows={2}
          maxlength={500}
        ></textarea>
      </div>
    </FormModal>
  )
}

export function TracksGrid({ tracks, summaries }: DashboardProps) {
  if (tracks.length === 0) {
    return (
      <div id="tracks-grid" class="card text-center p-5 border-0 bg-body rounded-3">
        <div class="py-4 d-flex flex-column align-items-center">
          <Icon name="activity" class="text-body-tertiary fs-1 mb-3 d-block mx-auto" />
          <h3 class="h5 mb-3">No hay tracks</h3>
          <button
            type="button"
            class="btn btn-primary d-inline-flex align-items-center gap-1"
            data-bs-toggle="modal"
            data-bs-target="#newTrackModal"
          >
            <Icon name="plus-lg" />
            <span>Crear track</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div id="tracks-grid">
      <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
        {tracks.map((track) => (
          <TrackCard track={track} summary={summaries?.[track.id]} />
        ))}
      </div>
    </div>
  )
}

export function DashboardPage({ tracks, summaries, query = '' }: DashboardProps) {
  return (
    <Layout>
      <div>
        {/* Toolbar */}
        <div class="row g-2 align-items-center justify-content-between mb-4">
          {/* Live Search Filter */}
          <div class="col-12 col-sm-6 col-md-4">
            <div class="input-group">
              <input
                type="text"
                id="search-input"
                name="q"
                value={query}
                class="form-control border-0 bg-body"
                placeholder="Buscar..."
                aria-label="Buscar tracks"
                hx-get="/"
                hx-trigger="keyup changed delay:200ms, search"
                hx-target="#tracks-grid"
                hx-swap="outerHTML"
              />
              <button
                type="button"
                id="search-clear-btn"
                class="input-group-text bg-body border-0 text-body-secondary"
                aria-label="Limpiar búsqueda"
              >
                <span id="search-icon-search" class={query ? 'd-none' : ''}>
                  <Icon name="search" />
                </span>
                <span id="search-icon-clear" class={query ? '' : 'd-none'}>
                  <Icon name="x-lg" />
                </span>
              </button>
            </div>
          </div>

          <div class="col-auto ms-auto">
            <button
              type="button"
              class="btn btn-primary d-flex align-items-center gap-2"
              data-bs-toggle="modal"
              data-bs-target="#newTrackModal"
            >
              <Icon name="plus-lg" />
              <span>Crear track</span>
            </button>
          </div>
        </div>

        {/* Tracks Grid */}
        <TracksGrid tracks={tracks} summaries={summaries} />

        {/* Create Modal */}
        <NewTrackModal />
      </div>
    </Layout>
  )
}
