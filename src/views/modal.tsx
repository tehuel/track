import type { Child } from 'hono/jsx'
import { Icon } from './icons'
import { TRACKER_COLORS } from '../types'

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
