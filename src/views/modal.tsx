import type { Child } from 'hono/jsx'
import { Icon } from './icons'
import { TRACKER_COLORS } from '../types'

interface ModalProps {
  id: string
  title: string
  children: Child
}

export function Modal({ id, title, children }: ModalProps) {
  return (
    <div
      class="modal fade"
      id={id}
      tabindex={-1}
      aria-labelledby={`${id}Label`}
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title" id={`${id}Label`}>
              {title}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export function ModalFooter({ children }: { children: Child }) {
  return (
    <div class="modal-footer border-0 pt-0">
      <button
        type="button"
        class="btn btn-link text-secondary text-decoration-none"
        data-bs-dismiss="modal"
      >
        Cancelar
      </button>
      {children}
    </div>
  )
}

interface SubmitButtonProps {
  label: string
  type?: 'submit' | 'button'
  class?: string
  title?: string
  [hxAttr: `hx-${string}`]: string | undefined
}

/**
 * Primary button with a hidden spinner. `public/app.js` toggles the spinner and
 * disables the button while its HTMX request is in flight.
 */
export function SubmitButton({
  label,
  type = 'submit',
  class: className = 'btn btn-primary d-flex align-items-center gap-1',
  ...rest
}: SubmitButtonProps) {
  return (
    <button type={type} class={className} {...rest}>
      <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
      <span>{label}</span>
    </button>
  )
}

interface FormModalProps extends ModalProps {
  /** Endpoint receiving the HTMX POST. */
  action: string
  submitLabel: string
  /** Optional partial swap target (e.g. `#events-section`). */
  target?: string
}

/**
 * Modal wrapping a single HTMX form. On a successful response `public/app.js`
 * closes the modal and resets the form; on error (4xx/5xx) it stays open.
 * Without `target` the server answers with `HX-Location`, so `hx-swap="none"`
 * keeps stray responses from replacing the form's own markup.
 */
export function FormModal({ id, title, action, submitLabel, target, children }: FormModalProps) {
  return (
    <Modal id={id} title={title}>
      <form
        hx-post={action}
        hx-target={target}
        hx-swap={target ? 'outerHTML' : 'none'}
        class="m-0 p-0"
      >
        <div class="modal-body p-4">{children}</div>
        <ModalFooter>
          <SubmitButton label={submitLabel} />
        </ModalFooter>
      </form>
    </Modal>
  )
}

interface ColorPickerProps {
  selectedColor?: string | null
  idPrefix?: string
}

export function ColorPicker({ selectedColor = null, idPrefix = 'tracker-color' }: ColorPickerProps) {
  return (
    <div class="mb-3">
      <label class="form-label fw-medium d-block">Color</label>
      <div class="btn-group w-100" role="group" aria-label="Color">
        <input
          type="radio"
          class="btn-check"
          name="color"
          id={`${idPrefix}-none`}
          value=""
          autocomplete="off"
          checked={!selectedColor}
        />
        <label
          class="btn btn-outline-secondary d-flex align-items-center justify-content-center py-2"
          for={`${idPrefix}-none`}
          title="Sin color"
        >
          <Icon name="slash-circle" />
        </label>
        {TRACKER_COLORS.map((c) => (
          <>
            <input
              type="radio"
              class="btn-check"
              name="color"
              id={`${idPrefix}-${c.value.slice(1)}`}
              value={c.value}
              autocomplete="off"
              checked={selectedColor === c.value}
            />
            <label
              class="btn btn-outline-secondary d-flex align-items-center justify-content-center py-2"
              for={`${idPrefix}-${c.value.slice(1)}`}
              title={c.label}
            >
              <span
                class="rounded-circle d-inline-block"
                style={{
                  width: '1rem',
                  height: '1rem',
                  backgroundColor: c.value,
                }}
              ></span>
            </label>
          </>
        ))}
      </div>
    </div>
  )
}
