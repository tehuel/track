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

  it('GET / renders dashboard with tracker cards in Spanish', async () => {
    createTracker({ id: 'guitar', name: 'Tocar Guitarra', type: 'habit' })

    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Tocar Guitarra')
    expect(html).toContain('htmx.org')
    expect(html).toContain('Nuevo track')
  })

  it('GET /search returns filtered HTMX partial', async () => {
    createTracker({ id: 'run', name: 'Correr mañana', type: 'numeric' })
    createTracker({ id: 'meditate', name: 'Meditación', type: 'habit' })

    const res = await app.request('/search?q=correr')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Correr mañana')
    expect(html).not.toContain('Meditación')
  })

  it('POST /trackers creates a tracker via form submit', async () => {
    const formData = new FormData()
    formData.append('name', 'Rutina de Yoga')
    formData.append('type', 'habit')

    const res = await app.request('/trackers', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(302) // Redirects to /
    expect(res.headers.get('location')).toBe('/')
  })

  it('POST /trackers/:id/quick logs quick habit and returns card partial with Spanish confirmation', async () => {
    createTracker({ id: 'pushups', name: 'Flexiones', type: 'habit' })

    const formData = new FormData()
    const res = await app.request('/trackers/pushups/quick', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('tracker-card-pushups')
    expect(html).toContain('btn-success')
    expect(html).toContain('¡Registrado!')
  })

  it('GET /trackers/:id displays detail view with history', async () => {
    createTracker({ id: 'reading', name: 'Lectura', type: 'habit' })
    createEvent({
      id: 'e1',
      tracker_id: 'reading',
      note: 'Terminado capítulo 3',
      timestamp: '2026-10-31T10:00:00Z',
    })

    const res = await app.request('/trackers/reading')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Lectura')
    expect(html).toContain('Terminado capítulo 3')
    expect(html).toContain('Historial de entradas')
  })

  it('GET /trackers/:id/log renders entry form with consistent right-aligned action buttons', async () => {
    createTracker({ id: 'reading', name: 'Lectura', type: 'habit' })

    const res = await app.request('/trackers/reading/log')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Registrar: Lectura')
    expect(html).toContain('justify-content-end align-items-center gap-2')
    expect(html).toContain('Cancelar')
    expect(html).toContain('Guardar')
  })

  it('DELETE /trackers/:id/events/:eventId removes event', async () => {
    createTracker({ id: 'reading', name: 'Lectura', type: 'habit' })
    createEvent({ id: 'e1', tracker_id: 'reading', timestamp: new Date().toISOString() })

    const res = await app.request('/trackers/reading/events/e1', {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
  })

  it('DELETE /trackers/:id deletes tracker and sets HX-Location', async () => {
    createTracker({ id: 'temp', name: 'Temporal', type: 'habit' })

    const res = await app.request('/trackers/temp', {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Location')).toBe('/')
  })
})
