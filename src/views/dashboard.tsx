import { TRACKER_COLORS, TRACKER_TYPES, getTrackerIcon, type Tracker } from '../types'
import { Layout } from './layout'

interface DashboardProps {
  trackers: Tracker[]
  query?: string
}

interface TrackerCardProps {
  tracker: Tracker
  justLogged?: boolean
}

export function TrackerCard({ tracker, justLogged = false }: TrackerCardProps) {
  const icon = getTrackerIcon(tracker.type)

  return (
    <div class="col" id={`tracker-card-${tracker.id}`}>
      <div class="card h-100 border-0 bg-body rounded-3 position-relative">
        <div class="card-body p-3 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex align-items-center justify-content-between gap-2">
              <div class="d-flex align-items-center gap-2 text-truncate flex-grow-1">
                {tracker.color && (
                  <i
                    class="bi bi-circle-fill small flex-shrink-0"
                    style={{ color: tracker.color }}
                  ></i>
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
              <span class="text-body-secondary lh-1 flex-shrink-0" title={tracker.type}>
                <i class={`bi ${icon} fs-5`}></i>
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
                <i class="bi bi-check2"></i>
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
                    <i class="bi bi-check-lg"></i>
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
    <div
      class="modal fade"
      id="newTrackerModal"
      tabindex={-1}
      aria-labelledby="newTrackerModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title d-flex align-items-center gap-2" id="newTrackerModalLabel">
              <i class="bi bi-plus-circle-fill text-primary"></i>
              <span>Crear track</span>
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>

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
                        <i class={`bi ${t.icon}`}></i>
                        <span>{t.label}</span>
                      </label>
                    </>
                  ))}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium d-block">Color</label>
                <div class="btn-group w-100" role="group" aria-label="Color">
                  <input
                    type="radio"
                    class="btn-check"
                    name="color"
                    id="tracker-color-none"
                    value=""
                    autocomplete="off"
                    checked
                  />
                  <label
                    class="btn btn-outline-secondary d-flex align-items-center justify-content-center py-2"
                    for="tracker-color-none"
                    title="Sin color"
                  >
                    <i class="bi bi-slash-circle"></i>
                  </label>
                  {TRACKER_COLORS.map((c) => (
                    <>
                      <input
                        type="radio"
                        class="btn-check"
                        name="color"
                        id={`tracker-color-${c.value.slice(1)}`}
                        value={c.value}
                        autocomplete="off"
                      />
                      <label
                        class="btn btn-outline-secondary d-flex align-items-center justify-content-center py-2"
                        for={`tracker-color-${c.value.slice(1)}`}
                        title={c.label}
                      >
                        <i class="bi bi-circle-fill" style={{ color: c.value }}></i>
                      </label>
                    </>
                  ))}
                </div>
              </div>

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

            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-link text-secondary text-decoration-none" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary d-flex align-items-center gap-1">
                <span>Crear track</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export function TrackersGrid({ trackers }: DashboardProps) {
  if (trackers.length === 0) {
    return (
      <div id="trackers-grid" class="card text-center p-5 border-0 bg-body rounded-3">
        <div class="py-4">
          <i class="bi bi-card-checklist text-body-tertiary fs-1"></i>
          <h3 class="h5 mt-3 mb-3">No hay tracks</h3>
          <button
            type="button"
            class="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#newTrackerModal"
          >
            <i class="bi bi-plus-lg me-1"></i>
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
                oninput="document.getElementById('search-icon').className = this.value ? 'bi bi-x-lg' : 'bi bi-search'"
              />
              <button
                type="button"
                class="input-group-text bg-body border-0 text-body-secondary"
                aria-label="Limpiar búsqueda"
                onclick="const input = document.getElementById('search-input'); if (input.value) { input.value = ''; document.getElementById('search-icon').className = 'bi bi-search'; input.dispatchEvent(new Event('search')); } input.focus();"
              >
                <i id="search-icon" class={`bi ${query ? 'bi-x-lg' : 'bi bi-search'}`}></i>
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
              <i class="bi bi-plus-lg"></i>
              <span>Nuevo track</span>
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
