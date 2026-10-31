const TRACKER_TYPES = [
  { value: 'habit', label: 'Hábito', icon: 'bi-check2-circle' },
  { value: 'numeric', label: 'Numérico', icon: 'bi-123' },
  { value: 'text', label: 'Texto', icon: 'bi-card-text' },
] as const

export function NewTrackerModal() {
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

              <div class="mb-2">
                <label for="tracker-description" class="form-label fw-medium">
                  <span>Descripción</span>{' '}
                  <span class="text-body-secondary fw-normal">(opcional)</span>
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

            <div class="modal-footer border-top bg-body-tertiary">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
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
