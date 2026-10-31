import type { Tracker } from '../../types'
import type { Locale } from '../../i18n'
import { t } from '../../i18n'

interface TrackerCardProps {
  tracker: Tracker
  locale: Locale
  justLogged?: boolean
}

export function getTrackerIcon(type: Tracker['type']) {
  switch (type) {
    case 'habit':
      return 'bi-check2-circle'
    case 'numeric':
      return 'bi-123'
    case 'text':
      return 'bi-card-text'
    default:
      return 'bi-activity'
  }
}

export function TrackerCard({ tracker, locale, justLogged = false }: TrackerCardProps) {
  const icon = getTrackerIcon(tracker.type)

  return (
    <div class="col" id={`tracker-card-${tracker.id}`}>
      <div class="card h-100 border bg-body rounded-3 shadow-sm position-relative">
        <div class="card-body p-3 d-flex flex-column justify-content-between">
          {/* Header */}
          <div>
            <div class="d-flex align-items-center justify-content-between gap-2">
              <div class="d-flex align-items-center gap-2 text-truncate flex-grow-1">
                <span class="text-body-secondary lh-1 flex-shrink-0" title={tracker.type}>
                  <i class={`bi ${icon} fs-5`}></i>
                </span>
                <h2 class="h6 card-title mb-0 fw-semibold text-truncate">
                  <a
                    href={`/trackers/${tracker.id}`}
                    class="stretched-link text-reset text-decoration-none"
                    title={tracker.name}
                  >
                    {tracker.name}
                  </a>
                </h2>
              </div>
              <i class="bi bi-chevron-right text-body-tertiary small flex-shrink-0"></i>
            </div>

            {tracker.description && (
              <p class="card-text text-body-secondary small mb-0 mt-1 text-truncate">
                {tracker.description}
              </p>
            )}
          </div>

          {/* Quick Action Footer */}
          <div class="pt-3 position-relative z-2">
            <div class="d-flex align-items-center gap-2">
              {/* Habit Quick Check-in */}
              {tracker.type === 'habit' && (
                <button
                  type="button"
                  hx-post={`/trackers/${tracker.id}/quick`}
                  hx-target={`#tracker-card-${tracker.id}`}
                  hx-swap="outerHTML"
                  class={`btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 ${
                    justLogged ? 'btn-success' : 'btn-primary'
                  }`}
                >
                  <i class={`bi ${justLogged ? 'bi-check-all' : 'bi-check2'}`}></i>
                  <span>
                    {justLogged ? t('cards.checked_in', locale) : t('cards.check_in', locale)}
                  </span>
                </button>
              )}

              {/* Numeric Inline Input */}
              {tracker.type === 'numeric' && (
                <form
                  class="flex-grow-1"
                  hx-post={`/trackers/${tracker.id}/quick`}
                  hx-target={`#tracker-card-${tracker.id}`}
                  hx-swap="outerHTML"
                >
                  <div class="input-group input-group-sm">
                    <input
                      type="number"
                      step="any"
                      name="value"
                      class="form-control"
                      placeholder={t('cards.value_placeholder', locale)}
                      required
                      aria-label="Value"
                    />
                    <button
                      type="submit"
                      class={`btn d-flex align-items-center gap-1 ${
                        justLogged ? 'btn-success' : 'btn-primary'
                      }`}
                      title={t('cards.log', locale)}
                    >
                      <i class="bi bi-check-lg"></i>
                      <span>{t('cards.log', locale)}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Text Inline Note */}
              {tracker.type === 'text' && (
                <form
                  class="flex-grow-1"
                  hx-post={`/trackers/${tracker.id}/quick`}
                  hx-target={`#tracker-card-${tracker.id}`}
                  hx-swap="outerHTML"
                >
                  <div class="input-group input-group-sm">
                    <input
                      type="text"
                      name="note"
                      class="form-control"
                      placeholder={t('cards.note_placeholder', locale)}
                      required
                      aria-label="Note"
                    />
                    <button
                      type="submit"
                      class={`btn d-flex align-items-center gap-1 ${
                        justLogged ? 'btn-success' : 'btn-primary'
                      }`}
                      title={t('cards.log', locale)}
                    >
                      <i class="bi bi-check-lg"></i>
                      <span>{t('cards.log', locale)}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Pencil icon for detailed entry */}
              <a
                href={`/trackers/${tracker.id}/log`}
                class="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center flex-shrink-0"
                title={t('cards.log_entry_tooltip', locale)}
                aria-label={t('cards.log_entry_tooltip', locale)}
              >
                <i class="bi bi-pencil-square"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
