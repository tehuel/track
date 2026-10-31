import { describe, expect, it, beforeEach } from 'bun:test'
import { Hono } from 'hono'
import { webRouter } from '../src/web'
import { createDatabase, setDb, createTracker, createEvent } from '../src/db'

describe('Web UI & HTMX endpoints', () => {
  let app: Hono

  beforeEach(() => {
    setDb(createDatabase(':memory:'))
    app = new Hono()
    app.route('/', webRouter)
  })

  it('GET / renders dashboard with tracker cards in Spanish and /track/:id links', async () => {
    createTracker({ id: 'guitar', name: 'Tocar Guitarra', type: 'habit' })

    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Tocar Guitarra')
    expect(html).toContain('htmx.org')
    expect(html).toContain('Nuevo track')
    expect(html).toContain('/track/guitar')
  })

  it('GET /?q=... with HX-Request returns filtered HTMX partial and sets HX-Push-Url', async () => {
    createTracker({ id: 'run', name: 'Correr mañana', type: 'numeric' })
    createTracker({ id: 'meditate', name: 'Meditación', type: 'habit' })

    const res = await app.request('/?q=correr', {
      headers: { 'HX-Request': 'true' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Push-Url')).toBe('/?q=correr')
    const html = await res.text()
    expect(html).toContain('Correr mañana')
    expect(html).not.toContain('Meditación')
    expect(html).not.toContain('<nav')
  })

  it('GET /?q= with empty query sets HX-Push-Url to / without query param', async () => {
    createTracker({ id: 'run', name: 'Correr mañana', type: 'numeric' })

    const res = await app.request('/?q=', {
      headers: { 'HX-Request': 'true' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Push-Url')).toBe('/')
  })

  it('GET /?q=... without HX-Request renders full page with query preserved in input', async () => {
    createTracker({ id: 'run', name: 'Correr mañana', type: 'numeric' })

    const res = await app.request('/?q=correr')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Correr mañana')
    expect(html).toContain('value="correr"')
    expect(html).toContain('<nav')
  })

  it('POST /track creates a tracker via form submit', async () => {
    const formData = new FormData()
    formData.append('name', 'Rutina de Yoga')
    formData.append('type', 'habit')

    const res = await app.request('/track', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(302) // Redirects to /
    expect(res.headers.get('location')).toBe('/')
  })

  it('POST /track/:id quick-logs habit via HTMX and returns card partial', async () => {
    createTracker({ id: 'pushups', name: 'Flexiones', type: 'habit' })

    const formData = new FormData()
    const res = await app.request('/track/pushups', {
      method: 'POST',
      headers: { 'HX-Target': 'tracker-card-pushups' },
      body: formData,
    })

    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('tracker-card-pushups')
    expect(html).toContain('btn-success')
    expect(html).toContain('¡Registrado!')
  })

  it('POST /track/:id saves detailed event from modal and redirects to /track/:id', async () => {
    createTracker({ id: 'weight', name: 'Peso', type: 'numeric' })

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
    createTracker({ id: 'reading', name: 'Lectura', type: 'habit' })
    createEvent({
      id: 'e1',
      tracker_id: 'reading',
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
  })

  it('DELETE /track/:id/:eventId removes event', async () => {
    createTracker({ id: 'reading', name: 'Lectura', type: 'habit' })
    createEvent({ id: 'e1', tracker_id: 'reading', timestamp: new Date().toISOString() })

    const res = await app.request('/track/reading/e1', {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
  })

  it('DELETE /track/:id deletes tracker and sets HX-Location', async () => {
    createTracker({ id: 'temp', name: 'Temporal', type: 'habit' })

    const res = await app.request('/track/temp', {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Location')).toBe('/')
  })
})
