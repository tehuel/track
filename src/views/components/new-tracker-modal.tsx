import type { Locale } from '../../i18n'
import { t } from '../../i18n'

interface NewTrackerModalProps {
  locale: Locale
}

export function NewTrackerModal({ locale }: NewTrackerModalProps) {
  return (
    <div
      class="modal fade"
      id="newTrackerModal"
      tabindex={-1}
      aria-labelledby="newTrackerModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom">
            <h5 class="modal-title d-flex align-items-center gap-2" id="newTrackerModalLabel">
              <i class="bi bi-plus-circle-fill text-primary"></i>
              <span>{t('modal.create_title', locale)}</span>
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <form action="/trackers" method="post">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label for="tracker-name" class="form-label fw-medium">
                  <span>{t('modal.name_label', locale)}</span>
                  <span class="text-danger ms-1">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="tracker-name"
                  name="name"
                  placeholder={t('modal.name_placeholder', locale)}
                  required
                />
              </div>

              <div class="mb-3">
                <label for="tracker-type" class="form-label fw-medium">
                  {t('modal.type_label', locale)}
                </label>
                <select class="form-select" id="tracker-type" name="type">
                  <option value="habit">{t('modal.type_habit', locale)}</option>
                  <option value="numeric">{t('modal.type_numeric', locale)}</option>
                  <option value="text">{t('modal.type_text', locale)}</option>
                </select>
                <div class="form-text">{t('modal.type_hint', locale)}</div>
              </div>

              <div class="mb-3">
                <label for="tracker-description" class="form-label fw-medium">
                  <span>{t('modal.desc_label', locale)}</span>{' '}
                  <span class="text-body-secondary fw-normal">
                    {t('log_view.optional', locale)}
                  </span>
                </label>
                <textarea
                  class="form-control"
                  id="tracker-description"
                  name="description"
                  placeholder={t('modal.desc_placeholder', locale)}
                  rows={2}
                  maxlength={500}
                ></textarea>
              </div>

              <div class="mb-2">
                <label for="tracker-id" class="form-label fw-medium">
                  <span>{t('modal.id_label', locale)}</span>{' '}
                  <span class="text-body-secondary fw-normal">
                    {t('log_view.optional', locale)}
                  </span>
                </label>
                <input
                  type="text"
                  class="form-control font-monospace"
                  id="tracker-id"
                  name="id"
                  placeholder={t('modal.id_placeholder', locale)}
                />
                <div class="form-text">{t('modal.id_hint', locale)}</div>
              </div>
            </div>

            <div class="modal-footer border-top bg-body-tertiary">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                {t('modal.cancel', locale)}
              </button>
              <button type="submit" class="btn btn-primary d-flex align-items-center gap-1">
                <span>{t('modal.create_btn', locale)}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
