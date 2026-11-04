import { describe, expect, it, beforeEach } from 'bun:test'
import { app } from '../src/index'
import { db, createTrack, createEvent, getTrackById, listEventsByTrack } from '../src/db'
import { version } from '../package.json'

describe('Web UI & HTMX endpoints', () => {
  beforeEach(() => {
    db.exec('DELETE FROM tracks')
  })

  it('GET / renders dashboard with tracker cards in Spanish and /track/:id links', async () => {
    createTrack({ id: 'guitar', name: 'Tocar Guitarra', type: 'habit' })
    createTrack({ id: 'pushups', name: 'Flexiones', type: 'numeric' })

    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('hx-boost="true"')
    expect(html).toContain('Tocar Guitarra')
    expect(html).toContain('/vendor/htmx.min.js')
    expect(html).toContain('src="/theme.js"')
    expect(html).not.toContain('cdn.jsdelivr.net')
    expect(html).toContain('Crear track')
    expect(html).toContain('/track/guitar')
    expect(html).toContain('title="Hábito"')
    expect(html).toContain('title="Numérico"')
    expect(html).toContain('bi-hash')
    expect(html).toContain('<svg')
    expect(html).not.toContain('bootstrap-icons')
    expect(html).toContain('hx-indicator="#page-progress, find .spinner-border"')
    expect(html).toContain('htmx-indicator')
  })

  it('serves frontend vendor assets from declared packages', async () => {
    const [css, bootstrap, htmx] = await Promise.all([
      app.request('/vendor/bootstrap.min.css'),
      app.request('/vendor/bootstrap.min.js'),
      app.request('/vendor/htmx.min.js'),
    ])

    expect(css.status).toBe(200)
    expect(css.headers.get('content-type')).toContain('text/css')
    expect(bootstrap.status).toBe(200)
    expect(bootstrap.headers.get('content-type')).toContain('application/javascript')
    expect(htmx.status).toBe(200)
    expect(htmx.headers.get('content-type')).toContain('application/javascript')
  })

  it('serves the theme initializer as a cacheable asset', async () => {
    const res = await app.request('/theme.js')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('application/javascript')
    expect(res.headers.get('cache-control')).toContain('immutable')
  })

  it('GET /?q=... with HX-Target trackers-grid returns filtered HTMX partial and sets HX-Push-Url', async () => {
    createTrack({ id: 'run', name: 'Correr mañana', type: 'numeric' })
    createTrack({ id: 'meditate', name: 'Meditación', type: 'habit' })

    const res = await app.request('/?q=correr', {
      headers: { 'HX-Request': 'true', 'HX-Target': 'trackers-grid' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Push-Url')).toBe('/?q=correr')
    const html = await res.text()
    expect(html).toContain('Correr mañana')
    expect(html).not.toContain('Meditación')
    expect(html).not.toContain('<nav')
  })

  it('GET /?q= with empty query sets HX-Push-Url to / without query param', async () => {
    createTrack({ id: 'run', name: 'Correr mañana', type: 'numeric' })

    const res = await app.request('/?q=', {
      headers: { 'HX-Request': 'true', 'HX-Target': 'trackers-grid' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Push-Url')).toBe('/')
  })

  it('GET /?q=... without HX-Request renders full page with query preserved in input', async () => {
    createTrack({ id: 'run', name: 'Correr mañana', type: 'numeric' })

    const res = await app.request('/?q=correr')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Correr mañana')
    expect(html).toContain('value="correr"')
    expect(html).toContain('<nav')
  })

  it('POST /track creates a tracker with optional color via form submit', async () => {
    const formData = new FormData()
    formData.append('name', 'Rutina de Yoga')
    formData.append('type', 'habit')
    formData.append('color', '#198754')

    const res = await app.request('/track', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(302) // Redirects to /
    expect(res.headers.get('location')).toBe('/')

    const created = getTrackById('rutina-de-yoga')
    expect(created?.color).toBe('#198754')

    const dashRes = await app.request('/')
    const dashHtml = await dashRes.text()
    expect(dashHtml).toContain('color:#198754')
  })

  it('POST /track via HTMX returns HX-Location: /', async () => {
    const formData = new FormData()
    formData.append('name', 'Lectura')
    formData.append('type', 'numeric')

    const res = await app.request('/track', {
      method: 'POST',
      headers: { 'HX-Request': 'true' },
      body: formData,
    })

    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Location')).toBe('/')
    expect(getTrackById('lectura')).toBeDefined()
  })

  it('POST /track/:id/edit updates tracker details and color', async () => {
    createTrack({ id: 'yoga', name: 'Yoga', type: 'habit', color: '#198754' })

    const formData = new FormData()
    formData.append('name', 'Yoga Matutino')
    formData.append('description', '30 minutos')
    formData.append('color', '#6f42c1')

    const res = await app.request('/track/yoga/edit', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('/track/yoga')

    const updated = getTrackById('yoga')
    expect(updated?.name).toBe('Yoga Matutino')
    expect(updated?.description).toBe('30 minutos')
    expect(updated?.color).toBe('#6f42c1')

    const detailRes = await app.request('/track/yoga')
    const detailHtml = await detailRes.text()
    expect(detailHtml).toContain('color:#6f42c1')
    expect(detailHtml).toContain('id="editModal"')
  })

  it('POST /track/:id/edit via HTMX returns HX-Location: /track/:id', async () => {
    createTrack({ id: 'medit', name: 'Meditación', type: 'habit' })

    const formData = new FormData()
    formData.append('name', 'Meditación Zen')

    const res = await app.request('/track/medit/edit', {
      method: 'POST',
      headers: { 'HX-Request': 'true' },
      body: formData,
    })

    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Location')).toBe('/track/medit')
    expect(getTrackById('medit')?.name).toBe('Meditación Zen')
  })

  it('POST /track/:id quick-logs habit via HTMX, returns card partial without green success and triggers toast', async () => {
    createTrack({ id: 'pushups', name: 'Flexiones', type: 'habit' })

    const formData = new FormData()
    const res = await app.request('/track/pushups', {
      method: 'POST',
      headers: { 'HX-Target': 'tracker-card-pushups' },
      body: formData,
    })

    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Trigger')).toContain('showToast')
    const html = await res.text()
    expect(html).toContain('tracker-card-pushups')
    expect(html).not.toContain('btn-success')
    expect(html).toContain('btn-primary')
    expect(html).toContain('Completar')
    expect(html).toContain('spinner-border')
    expect(html).not.toContain('hx-disabled-elt')
  })

  it('POST /track/:id quick-logs numeric tracker via HTMX, returns card partial without green success and triggers toast', async () => {
    createTrack({ id: 'pages', name: 'Páginas leídas', type: 'numeric' })

    const formData = new FormData()
    formData.append('value', '15')
    const res = await app.request('/track/pages', {
      method: 'POST',
      headers: { 'HX-Target': 'tracker-card-pages' },
      body: formData,
    })

    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Trigger')).toContain('showToast')
    const html = await res.text()
    expect(html).toContain('tracker-card-pages')
    expect(html).not.toContain('btn-success')
    expect(html).toContain('btn-primary')
    expect(html).toContain('spinner-border')
    expect(html).not.toContain('hx-disabled-elt')
  })

  it('Layout renders toast container, confirmation modal, and script tags', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('id="app-toast"')
    expect(html).toContain('toast-container')
    expect(html).toContain('id="confirmModal"')
    expect(html).toContain('Confirmar eliminación')
    expect(html).toContain('id="confirmModalBtn"')
    expect(html).toContain('id="theme-toggle"')
    expect(html).toContain('hx-indicator="#page-progress"')
    expect(html).toContain('id="page-progress"')
    expect(html).toContain('htmx-indicator')
    expect(html).toContain('progress-bar-animated')
    expect(html).toContain('src="/app.js?v=')
    expect(html).toContain(`<meta name="version" content="${version}"/>`)
  })

  it('GET /app.js serves JavaScript UI helpers with version-less and versioned URLs', async () => {
    for (const path of ['/app.js', '/app.js?v=anything']) {
      const res = await app.request(path)
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('application/javascript')
      expect(res.headers.get('Cache-Control')).toContain('immutable')
      const js = await res.text()
      expect(js).toContain('htmx:confirm')
      expect(js).toContain('if (!evt.detail.question) return;')
      expect(js).toContain('htmx:afterRequest')
      expect(js).toContain("evt.key === 'Enter'")
      expect(js).toContain("evt.key === 'Escape'")
      expect(js).toContain('confirmPending')
      expect(js).toContain('#theme-toggle')
      expect(js).not.toContain('window.toggleTheme')
    }
  })

  it('POST /track/:id with HX-Target events-section updates only entries list and triggers toast', async () => {
    createTrack({ id: 'running', name: 'Correr', type: 'numeric' })

    const formData = new FormData()
    formData.append('value', '10.5')
    formData.append('note', 'Entrenamiento matutino')

    const res = await app.request('/track/running', {
      method: 'POST',
      headers: { 'HX-Target': 'events-section' },
      body: formData,
    })

    expect(res.status).toBe(200)
    const triggerHeader = res.headers.get('HX-Trigger') || ''
    expect(triggerHeader).toContain('showToast')
    expect(triggerHeader).not.toContain('closeModal') // modal closes client-side on success

    const html = await res.text()
    expect(html).toContain('id="events-section"')
    expect(html).toContain('10.5')
    expect(html).toContain('Entrenamiento matutino')
    expect(html).toContain('1 entrada')
    expect(html).not.toContain('<nav')
  })

  it('POST /track/:id saves detailed event from modal and redirects to /track/:id', async () => {
    createTrack({ id: 'weight', name: 'Peso', type: 'numeric' })

    const formData = new FormData()
    formData.append('value', '72.5')
    formData.append('note', 'En ayunas')
    formData.append('timestamp', '2026-10-31T08:00')

    const res = await app.request('/track/weight', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('/track/weight')
  })

  it('GET /track/:id displays detail view with history and log modal', async () => {
    createTrack({ id: 'reading', name: 'Lectura', type: 'habit' })
    createEvent({
      id: 'e1',
      track_id: 'reading',
      note: 'Terminado capítulo 3',
      timestamp: '2026-10-31T10:00:00Z',
    })

    const res = await app.request('/track/reading')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Lectura')
    expect(html).toContain('Terminado capítulo 3')
    expect(html).toContain('Historial de entradas')
    expect(html).toContain('id="logModal"')
    expect(html).toContain('title="Hábito"')
    expect(html).not.toContain('title="habit"')
  })

  it('DELETE /track/:id/:eventId with HX-Target events-section updates list in-place and triggers toast', async () => {
    createTrack({ id: 'reading', name: 'Lectura', type: 'habit' })
    createEvent({ id: 'e1', track_id: 'reading', note: 'Capítulo 1', timestamp: new Date().toISOString() })
    createEvent({ id: 'e2', track_id: 'reading', note: 'Capítulo 2', timestamp: new Date().toISOString() })

    const res = await app.request('/track/reading/e1', {
      method: 'DELETE',
      headers: { 'HX-Target': 'events-section' },
    })

    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Trigger')).toContain('Entrada eliminada')
    const html = await res.text()
    expect(html).toContain('id="events-section"')
    expect(html).toContain('1 entrada')
    expect(html).toContain('Capítulo 2')
    expect(html).not.toContain('Capítulo 1')
  })

  it('DELETE /track/:id/:eventId via HTMX removes event and sets HX-Location', async () => {
    createTrack({ id: 'reading', name: 'Lectura', type: 'habit' })
    createEvent({ id: 'e1', track_id: 'reading', timestamp: new Date().toISOString() })

    const res = await app.request('/track/reading/e1', {
      method: 'DELETE',
      headers: { 'HX-Request': 'true' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Location')).toBe('/track/reading')
  })

  it('DELETE /track/:id/:eventId without HTMX returns a 302 redirect', async () => {
    createTrack({ id: 'reading', name: 'Lectura', type: 'habit' })
    createEvent({ id: 'e1', track_id: 'reading', timestamp: new Date().toISOString() })

    const res = await app.request('/track/reading/e1', { method: 'DELETE' })
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('/track/reading')
  })

  it('DELETE /track/:id via HTMX deletes tracker and sets HX-Location', async () => {
    createTrack({ id: 'temp', name: 'Temporal', type: 'habit' })

    const res = await app.request('/track/temp', {
      method: 'DELETE',
      headers: { 'HX-Request': 'true' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Location')).toBe('/')
    expect(getTrackById('temp')).toBeNull()
  })

  it('DELETE /track/:id without HTMX returns a 302 redirect to /', async () => {
    createTrack({ id: 'temp', name: 'Temporal', type: 'habit' })

    const res = await app.request('/track/temp', { method: 'DELETE' })
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('/')
  })

  it('POST /track rejects empty name with 400 and sanitizes unknown types', async () => {
    const empty = new FormData()
    empty.append('name', '   ')
    const res = await app.request('/track', { method: 'POST', body: empty })
    expect(res.status).toBe(400)

    const bogus = new FormData()
    bogus.append('name', 'Agua')
    bogus.append('type', 'bogus')
    bogus.append('description', '   ')
    await app.request('/track', { method: 'POST', body: bogus })
    const created = getTrackById('agua')
    expect(created?.type).toBe('habit')
    expect(created?.description).toBeNull()
  })

  it('POST /track/:id/edit rejects empty name with 400 and keeps tracker unchanged', async () => {
    createTrack({ id: 'yoga', name: 'Yoga', type: 'habit' })
    const formData = new FormData()
    formData.append('name', '')
    const res = await app.request('/track/yoga/edit', {
      method: 'POST',
      headers: { 'HX-Request': 'true' },
      body: formData,
    })
    expect(res.status).toBe(400)
    expect(getTrackById('yoga')?.name).toBe('Yoga')
  })

  it('POST /track/:id validates required fields per tracker type', async () => {
    createTrack({ id: 'pages', name: 'Páginas', type: 'numeric' })
    createTrack({ id: 'diary', name: 'Diario', type: 'text' })

    const noValue = new FormData()
    noValue.append('note', 'sin valor')
    const r1 = await app.request('/track/pages', {
      method: 'POST',
      headers: { 'HX-Target': 'tracker-card-pages' },
      body: noValue,
    })
    expect(r1.status).toBe(400)

    const noNote = new FormData()
    noNote.append('note', '  ')
    const r2 = await app.request('/track/diary', {
      method: 'POST',
      headers: { 'HX-Target': 'tracker-card-diary' },
      body: noNote,
    })
    expect(r2.status).toBe(400)
    expect(listEventsByTrack('pages')).toHaveLength(0)
    expect(listEventsByTrack('diary')).toHaveLength(0)
  })
})
