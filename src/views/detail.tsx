import type { Tracker, TrackerEvent } from '../types'
import type { Locale } from '../i18n'
import { t } from '../i18n'
import { Layout } from './layout'
import { getTrackerIcon } from './components/tracker-card'

interface DetailProps {
  tracker: Tracker
  events: TrackerEvent[]
  locale: Locale
}

function formatDate(iso: string, locale: Locale): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(locale === 'es' ? 'es-AR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function DetailPage({ tracker, events, locale }: DetailProps) {
  const icon = getTrackerIcon(tracker.type)

  return (
    <Layout title={`${tracker.name} - track`} locale={locale}>
      <div>
        {/* Back Link */}
        <div class="mb-3">
          <a
            href="/"
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
          >
            <i class="bi bi-arrow-left"></i>
            <span>{t('detail.all_trackers', locale)}</span>
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
            {/* Primary Action Button */}
            {tracker.type === 'habit' ? (
              <form action={`/trackers/${tracker.id}/events`} method="post">
                <button
                  type="submit"
                  class="btn btn-primary d-flex align-items-center gap-1.5"
                >
                  <i class="bi bi-check2"></i>
                  <span>{t('detail.check_in_today', locale)}</span>
                </button>
              </form>
            ) : (
              <a
                href={`/trackers/${tracker.id}/log`}
                class="btn btn-primary d-flex align-items-center gap-1.5"
              >
                <i class="bi bi-plus-lg"></i>
                <span>
                  {tracker.type === 'numeric'
                    ? t('detail.log_value', locale)
                    : t('detail.log_entry', locale)}
                </span>
              </a>
            )}

            {/* Habit custom note / date entry */}
            {tracker.type === 'habit' && (
              <a
                href={`/trackers/${tracker.id}/log`}
                class="btn btn-outline-secondary d-flex align-items-center gap-1"
              >
                <i class="bi bi-pencil-square"></i>
                <span>{t('detail.add_note', locale)}</span>
              </a>
            )}

            {/* Delete Tracker */}
            <button
              type="button"
              class="btn btn-outline-danger d-flex align-items-center gap-1"
              hx-delete={`/trackers/${tracker.id}`}
              hx-confirm={t('prompts.delete_tracker_confirm', locale)}
              title={t('detail.delete_tracker', locale)}
            >
              <i class="bi bi-trash3"></i>
              <span>{t('detail.delete_tracker', locale)}</span>
            </button>
          </div>
        </div>

        {/* History Feed Section */}
        <div class="mb-4">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h2 class="h5 mb-0 fw-semibold">{t('detail.event_history', locale)}</h2>
            <span class="badge bg-secondary-subtle text-secondary rounded-pill">
              {events.length === 1
                ? t('detail.entry_count_singular', locale)
                : t('detail.entries_count', locale, { count: events.length })}
            </span>
          </div>

          {events.length === 0 ? (
            <div class="text-center text-body-secondary py-5 border rounded-3 bg-body shadow-sm">
              <i class="bi bi-calendar-x fs-1 d-block mb-2 text-body-tertiary"></i>
              <h3 class="h6 fw-semibold">{t('detail.no_events_title', locale)}</h3>
              <p class="small text-body-secondary mb-0">{t('detail.no_events_desc', locale)}</p>
            </div>
          ) : (
            <div class="list-group shadow-sm" id="events-list">
              {events.map((event) => (
                <div class="list-group-item list-group-item-action p-3 d-flex justify-content-between align-items-center gap-3">
                  <div class="d-flex align-items-center gap-3 flex-grow-1 min-w-0 flex-wrap">
                    <span class="text-body-secondary small">
                      {formatDate(event.timestamp, locale)}
                    </span>
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
                    hx-delete={`/trackers/${tracker.id}/events/${event.id}`}
                    hx-target="closest .list-group-item"
                    hx-swap="outerHTML"
                    hx-confirm={t('prompts.delete_entry_confirm', locale)}
                    title={t('detail.delete_entry', locale)}
                    aria-label={t('detail.delete_entry', locale)}
                  >
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
