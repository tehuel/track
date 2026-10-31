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

          <form action="/trackers" method="post" class="m-0 p-0">
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
                <label class="form-label fw-medium d-block">
                  Tipo
                </label>
                <div class="btn-group w-100" role="group" aria-label="Tipo">
                  <input
                    type="radio"
                    class="btn-check"
                    name="type"
                    id="tracker-type-habit"
                    value="habit"
                    autocomplete="off"
                    checked
                  />
                  <label
                    class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                    for="tracker-type-habit"
                  >
                    <i class="bi bi-check2-circle"></i>
                    <span>Hábito</span>
                  </label>

                  <input
                    type="radio"
                    class="btn-check"
                    name="type"
                    id="tracker-type-numeric"
                    value="numeric"
                    autocomplete="off"
                  />
                  <label
                    class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                    for="tracker-type-numeric"
                  >
                    <i class="bi bi-123"></i>
                    <span>Numérico</span>
                  </label>

                  <input
                    type="radio"
                    class="btn-check"
                    name="type"
                    id="tracker-type-text"
                    value="text"
                    autocomplete="off"
                  />
                  <label
                    class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                    for="tracker-type-text"
                  >
                    <i class="bi bi-card-text"></i>
                    <span>Texto</span>
                  </label>
                </div>
              </div>

              <div class="mb-3">
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

              <div class="mb-2">
                <label for="tracker-id" class="form-label fw-medium">
                  <span>ID</span>{' '}
                  <span class="text-body-secondary fw-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  class="form-control font-monospace"
                  id="tracker-id"
                  name="id"
                  placeholder="ej. meditacion"
                />
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
