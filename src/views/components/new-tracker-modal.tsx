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
              <span>Crear nuevo track</span>
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>

          <form action="/trackers" method="post" class="mb-0">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label for="tracker-name" class="form-label fw-medium">
                  <span>Nombre del track</span>
                  <span class="text-danger ms-1">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="tracker-name"
                  name="name"
                  placeholder="ej. Meditación diaria, Consumo de agua, Correr"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="tracker-type" class="form-label fw-medium">
                  Tipo de track
                </label>
                <select class="form-select" id="tracker-type" name="type">
                  <option value="habit">Hábito (Completado Sí/No)</option>
                  <option value="numeric">Métrica numérica (Unidades, peso, distancia)</option>
                  <option value="text">General / Registro de notas</option>
                </select>
                <div class="form-text">
                  Elegí el formato que mejor se adapte a lo que vas a registrar.
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
                  placeholder="ej. Registrar vasos de agua al día, Racha de meditación matutina"
                  rows={2}
                  maxlength={500}
                ></textarea>
              </div>

              <div class="mb-2">
                <label for="tracker-id" class="form-label fw-medium">
                  <span>ID / Slug personalizado</span>{' '}
                  <span class="text-body-secondary fw-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  class="form-control font-monospace"
                  id="tracker-id"
                  name="id"
                  placeholder="ej. meditacion-diaria"
                />
                <div class="form-text">
                  Dejá en blanco para generar automáticamente un slug limpio desde el nombre.
                </div>
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
