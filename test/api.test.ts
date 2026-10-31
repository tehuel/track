import { describe, expect, it, beforeEach } from 'bun:test'
import { Hono } from 'hono'
import { apiRouter } from '../src/api'
import { createDatabase } from '../src/db'

describe('JSON API endpoints (/api)', () => {
  let app: Hono

  beforeEach(() => {
    // Reset test database
    createDatabase(':memory:')
    app = new Hono()
    app.route('/api', apiRouter)
  })

  it('GET /api/trackers returns empty array initially', async () => {
    const res = await app.request('/api/trackers')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(0)
  })

  it('POST /api/trackers creates a tracker and returns 201', async () => {
    const res = await app.request('/api/trackers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Daily Meditation',
        type: 'habit',
        description: '15 mins mindfulness',
      }),
    })

    expect(res.status).toBe(201)
    const tracker = await res.json()
    expect(tracker.id).toBe('daily-meditation')
    expect(tracker.name).toBe('Daily Meditation')
    expect(tracker.type).toBe('habit')

    // Verify it shows up in GET /api/trackers
    const listRes = await app.request('/api/trackers')
    const list = await listRes.json()
    expect(list.length).toBe(1)
  })

  it('GET /api/trackers/:id returns single tracker or 404', async () => {
    await app.request('/api/trackers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'books', name: 'Books Read', type: 'numeric' }),
    })

    const foundRes = await app.request('/api/trackers/books')
    expect(foundRes.status).toBe(200)
    const tracker = await foundRes.json()
    expect(tracker.name).toBe('Books Read')

    const notFoundRes = await app.request('/api/trackers/non-existent')
    expect(notFoundRes.status).toBe(404)
  })

  it('DELETE /api/trackers/:id deletes tracker and its events', async () => {
    await app.request('/api/trackers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'temp-tracker', name: 'Temporary', type: 'habit' }),
    })

    const delRes = await app.request('/api/trackers/temp-tracker', { method: 'DELETE' })
    expect(delRes.status).toBe(200)

    const checkRes = await app.request('/api/trackers/temp-tracker')
    expect(checkRes.status).toBe(404)
  })

  it('POST & GET & DELETE /api/trackers/:id/events manages events', async () => {
    await app.request('/api/trackers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'running', name: 'Running', type: 'numeric' }),
    })

    // Log event
    const logRes = await app.request('/api/trackers/running/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 5.2, note: 'Morning run' }),
    })
    expect(logRes.status).toBe(201)
    const event = await logRes.json()
    expect(event.value).toBe(5.2)
    expect(event.note).toBe('Morning run')

    // List events
    const listRes = await app.request('/api/trackers/running/events')
    expect(listRes.status).toBe(200)
    const events = await listRes.json()
    expect(events.length).toBe(1)

    // Delete event
    const delRes = await app.request(`/api/trackers/running/events/${event.id}`, {
      method: 'DELETE',
    })
    expect(delRes.status).toBe(200)

    const listAfterDel = await app.request('/api/trackers/running/events')
    const eventsAfterDel = await listAfterDel.json()
    expect(eventsAfterDel.length).toBe(0)
  })
})
