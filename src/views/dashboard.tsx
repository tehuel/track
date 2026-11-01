import {
  TRACKER_TYPES,
  getTrackerIcon,
  getTrackerTypeLabel,
  type Tracker,
} from '../types'
import { Layout } from './layout'
import { Icon } from './icons'
import { ColorPicker, Modal, ModalFooter } from './modal'

interface DashboardProps {
  trackers: Tracker[]
  query?: string
}

interface TrackerCardProps {
  tracker: Tracker
}

export function TrackerCard({ tracker }: TrackerCardProps) {
  const icon = getTrackerIcon(tracker.type)
  const typeLabel = getTrackerTypeLabel(tracker.type)

  return (
    <div class="col" id={`tracker-card-${tracker.id}`}>
      <div class="card h-100 border-0 bg-body rounded-3 position-relative">
        <div class="card-body p-3 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex align-items-center justify-content-between gap-2">
              <div class="d-flex align-items-center gap-2 text-truncate flex-grow-1">
                {tracker.color && (
                  <span
                    class="rounded-circle flex-shrink-0 d-inline-block"
                    style={{
                      width: '0.625rem',
                      height: '0.625rem',
                      backgroundColor: tracker.color,
                    }}
                  ></span>
                )}
                <h2 class="h6 card-title mb-0 fw-semibold text-truncate">
                  <a
                    href={`/track/${tracker.id}`}
                    class="stretched-link text-reset text-decoration-none"
                    title={tracker.name}
                  >
                    {tracker.name}
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

            {tracker.description && (
              <p class="card-text text-body-secondary small mb-0 mt-1 text-truncate">
                {tracker.description}
              </p>
            )}
          </div>

          <div class="pt-3 position-relative z-2">
            {tracker.type === 'habit' ? (
              <button
                type="button"
                hx-post={`/track/${tracker.id}`}
                hx-target={`#tracker-card-${tracker.id}`}
                hx-swap="outerHTML"
                hx-disabled-elt="this"
                class="btn btn-sm btn-primary w-100 d-flex align-items-center justify-content-center gap-1"
              >
                <span
                  class="spinner-border spinner-border-sm d-none"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Completar</span>
              </button>
            ) : (
              <form
                class="m-0 p-0 d-flex"
                hx-post={`/track/${tracker.id}`}
                hx-target={`#tracker-card-${tracker.id}`}
                hx-swap="outerHTML"
                hx-disabled-elt="find button"
              >
                <div class="input-group input-group-sm">
                  {tracker.type === 'numeric' ? (
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
                  <button
                    type="submit"
                    class="btn btn-primary d-flex align-items-center gap-1"
                    title="Registrar"
                  >
                    <span
                      class="spinner-border spinner-border-sm d-none"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span>Registrar</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NewTrackerModal() {
  return (
    <Modal id="newTrackerModal" title="Crear track">
      <form action="/track" method="post" class="m-0 p-0">
        <div class="modal-body p-4">
          <div class="mb-3">
            <label for="tracker-name" class="form-label fw-medium">
              <span>Nombre</span>
              <span class="text-danger ms-1">*</span>
            </label>
            <input
              type="text"
              class="form-control"
              id="tracker-name"
              name="name"
              placeholder="ej. Meditación"
              required
              autofocus
            />
          </div>

          <div class="mb-3">
            <label class="form-label fw-medium d-block">Tipo</label>
            <div class="btn-group w-100" role="group" aria-label="Tipo">
              {TRACKER_TYPES.map((t, idx) => (
                <>
                  <input
                    type="radio"
                    class="btn-check"
                    name="type"
                    id={`tracker-type-${t.value}`}
                    value={t.value}
                    autocomplete="off"
                    checked={idx === 0}
                  />
                  <label
                    class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                    for={`tracker-type-${t.value}`}
                  >
                    <Icon name={t.icon} />
                    <span>{t.label}</span>
                  </label>
                </>
              ))}
            </div>
          </div>

          <ColorPicker idPrefix="tracker-color" />

          <div class="mb-2">
            <label for="tracker-description" class="form-label fw-medium">
              Descripción
            </label>
            <textarea
              class="form-control"
              id="tracker-description"
              name="description"
              placeholder="Descripción..."
              rows={2}
              maxlength={500}
            ></textarea>
          </div>
        </div>

        <ModalFooter>
          <button type="submit" class="btn btn-primary d-flex align-items-center gap-1">
            <span>Crear track</span>
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export function TrackersGrid({ trackers }: DashboardProps) {
  if (trackers.length === 0) {
    return (
      <div id="trackers-grid" class="card text-center p-5 border-0 bg-body rounded-3">
        <div class="py-4 d-flex flex-column align-items-center">
          <Icon name="activity" class="text-body-tertiary fs-1 mb-3 d-block mx-auto" />
          <h3 class="h5 mb-3">No hay tracks</h3>
          <button
            type="button"
            class="btn btn-primary d-inline-flex align-items-center gap-1"
            data-bs-toggle="modal"
            data-bs-target="#newTrackerModal"
          >
            <Icon name="plus-lg" />
            <span>Crear track</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div id="trackers-grid">
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
        {trackers.map((tracker) => (
          <TrackerCard tracker={tracker} />
        ))}
      </div>
    </div>
  )
}

export function DashboardPage({ trackers, query = '' }: DashboardProps) {
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
                hx-target="#trackers-grid"
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
              data-bs-target="#newTrackerModal"
            >
              <Icon name="plus-lg" />
              <span>Crear track</span>
            </button>
          </div>
        </div>

        {/* Trackers Grid */}
        <TrackersGrid trackers={trackers} />

        {/* Create Modal */}
        <NewTrackerModal />
      </div>
    </Layout>
  )
}
