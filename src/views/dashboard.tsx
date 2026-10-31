import type { Tracker } from '../types'
import { Layout } from './layout'
import { TrackerCard } from './components/tracker-card'
import { NewTrackerModal } from './components/new-tracker-modal'

interface DashboardProps {
  trackers: Tracker[]
}

export function TrackersGrid({ trackers }: DashboardProps) {
  if (trackers.length === 0) {
    return (
      <div id="trackers-grid" class="card text-center p-5 border-dashed bg-body shadow-sm">
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
    <div id="trackers-grid" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
      {trackers.map((tracker) => (
        <TrackerCard tracker={tracker} />
      ))}
    </div>
  )
}

export function DashboardPage({ trackers }: DashboardProps) {
  return (
    <Layout>
      <div>
        {/* Toolbar */}
        <div class="row g-2 align-items-center justify-content-between mb-4">
          {/* Live Search Filter */}
          <div class="col-12 col-sm-6 col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-body">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="search"
                name="q"
                class="form-control"
                placeholder="Buscar..."
                aria-label="Buscar tracks"
                hx-get="/search"
                hx-trigger="keyup changed delay:200ms, search"
                hx-target="#trackers-grid"
                hx-swap="outerHTML"
              />
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
