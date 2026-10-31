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

  it('GET / renders dashboard with tracker cards', async () => {
    createTracker({ id: 'guitar', name: 'Practice Guitar', type: 'habit' })

    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Practice Guitar')
    expect(html).toContain('htmx.org')
  })

  it('GET /?lang=es sets cookie and switches language', async () => {
    const res = await app.request('/?lang=es')
    expect(res.status).toBe(200)
    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toContain('track_lang=es')
    const html = await res.text()
    expect(html).toContain('Nuevo track')
  })

  it('GET /search returns filtered HTMX partial', async () => {
    createTracker({ id: 'run', name: 'Morning Run', type: 'numeric' })
    createTracker({ id: 'meditate', name: 'Meditation', type: 'habit' })

    const res = await app.request('/search?q=run')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Morning Run')
    expect(html).not.toContain('Meditation')
  })

  it('POST /trackers creates a tracker via form submit', async () => {
    const formData = new FormData()
    formData.append('name', 'Yoga Routine')
    formData.append('type', 'habit')

    const res = await app.request('/trackers', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(302) // Redirects to /
    expect(res.headers.get('location')).toBe('/')
  })

  it('POST /trackers/:id/quick logs quick habit and returns card partial', async () => {
    createTracker({ id: 'pushups', name: 'Pushups', type: 'habit' })

    const formData = new FormData()
    const res = await app.request('/trackers/pushups/quick', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('tracker-card-pushups')
    expect(html).toContain('btn-success')
  })

  it('GET /trackers/:id displays detail view with history', async () => {
    createTracker({ id: 'reading', name: 'Reading', type: 'habit' })
    createEvent({
      id: 'e1',
      tracker_id: 'reading',
      note: 'Finished chapter 3',
      timestamp: '2026-10-31T10:00:00Z',
    })

    const res = await app.request('/trackers/reading')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Reading')
    expect(html).toContain('Finished chapter 3')
  })

  it('DELETE /trackers/:id/events/:eventId removes event', async () => {
    createTracker({ id: 'reading', name: 'Reading', type: 'habit' })
    createEvent({ id: 'e1', tracker_id: 'reading', timestamp: new Date().toISOString() })

    const res = await app.request('/trackers/reading/events/e1', {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
  })

  it('DELETE /trackers/:id deletes tracker and sets HX-Location', async () => {
    createTracker({ id: 'temp', name: 'Temporary', type: 'habit' })

    const res = await app.request('/trackers/temp', {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Location')).toBe('/')
  })
})
