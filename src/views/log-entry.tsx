import type { Tracker } from '../types'
import type { Locale } from '../i18n'
import { t } from '../i18n'
import { Layout } from './layout'
import { getTrackerIcon } from './components/tracker-card'

interface LogEntryProps {
  tracker: Tracker
  locale: Locale
}

function getLocalDatetimeString(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export function LogEntryPage({ tracker, locale }: LogEntryProps) {
  const icon = getTrackerIcon(tracker.type)
  const defaultTimestamp = getLocalDatetimeString()

  return (
    <Layout
      title={`${t('log_view.log_entry_title', locale, { name: tracker.name })} - track`}
      locale={locale}
    >
      <div>
        {/* Back Link */}
        <div class="mb-3">
          <a
            href={`/trackers/${tracker.id}`}
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
          >
            <i class="bi bi-arrow-left"></i>
            <span>{t('log_view.back_to_tracker', locale, { name: tracker.name })}</span>
          </a>
        </div>

        {/* Card Form */}
        <div class="row justify-content-center">
          <div class="col-12 col-md-8 col-lg-6">
            <div class="card shadow-sm border bg-body rounded-3">
              <div class="card-header bg-body p-3 border-bottom d-flex align-items-center gap-2">
                <i class={`bi ${icon} text-primary fs-5`}></i>
                <h1 class="h5 mb-0 fw-semibold">
                  {t('log_view.log_entry_title', locale, { name: tracker.name })}
                </h1>
              </div>

              <form action={`/trackers/${tracker.id}/events`} method="post">
                <div class="card-body p-4">
                  {/* Value Input (numeric tracker) */}
                  {tracker.type === 'numeric' && (
                    <div class="mb-3">
                      <label for="event-value" class="form-label fw-medium">
                        <span>{t('log_view.value_label', locale)}</span>
                        <span class="text-danger ms-1">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        class="form-control"
                        id="event-value"
                        name="value"
                        placeholder={t('log_view.value_placeholder', locale)}
                        autofocus
                        required
                      />
                    </div>
                  )}

                  {/* Note Input */}
                  <div class="mb-3">
                    <label for="event-note" class="form-label fw-medium">
                      <span>{t('log_view.note_label', locale)}</span>{' '}
                      <span class="text-body-secondary fw-normal">
                        {t('log_view.optional', locale)}
                      </span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="event-note"
                      name="note"
                      placeholder={t('log_view.note_placeholder', locale)}
                      autofocus={tracker.type !== 'numeric'}
                    />
                  </div>

                  {/* Timestamp Input */}
                  <div class="mb-2">
                    <label for="event-timestamp" class="form-label fw-medium">
                      {t('log_view.date_time_label', locale)}
                    </label>
                    <input
                      type="datetime-local"
                      class="form-control"
                      id="event-timestamp"
                      name="timestamp"
                      value={defaultTimestamp}
                      required
                    />
                  </div>
                </div>

                <div class="card-footer border-top bg-body-tertiary d-flex justify-content-between align-items-center p-3">
                  <a href={`/trackers/${tracker.id}`} class="btn btn-secondary">
                    {t('log_view.cancel', locale)}
                  </a>
                  <button
                    type="submit"
                    class="btn btn-primary d-flex align-items-center gap-1"
                  >
                    <span>{t('log_view.save_entry', locale)}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
