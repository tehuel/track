import { describe, expect, it, beforeEach } from 'bun:test'
import {
  db,
  createTracker,
  updateTracker,
  getTrackerById,
  listTrackers,
  deleteTracker,
  generateUniqueSlug,
  createEvent,
  listEventsByTracker,
  deleteEvent,
} from '../src/db'

describe('Database layer (bun:sqlite)', () => {
  beforeEach(() => {
    db.exec('DELETE FROM trackers')
  })

  it('creates and lists trackers with optional color', () => {
    createTracker({
      id: 'water-log',
      name: 'Drink Water',
      type: 'habit',
      description: 'Drink 2L daily',
      color: '#0dcaf0',
    })

    createTracker({
      id: 'stretching',
      name: 'Stretching',
      type: 'habit',
    })

    const list = listTrackers()
    expect(list.length).toBe(2)
    expect(list[0]?.id).toBe('water-log')
    expect(list[0]?.name).toBe('Drink Water')
    expect(list[0]?.type).toBe('habit')
    expect(list[0]?.description).toBe('Drink 2L daily')
    expect(list[0]?.color).toBe('#0dcaf0')
    expect(list[1]?.id).toBe('stretching')
    expect(list[1]?.color).toBeNull()
  })

  it('updates tracker name, description, and color', () => {
    createTracker({ id: 'sleep', name: 'Sleep', type: 'numeric' })
    expect(getTrackerById('sleep')?.color).toBeNull()

    updateTracker('sleep', {
      name: 'Sleep Hours',
      description: 'Nightly rest',
      color: '#6f42c1',
    })

    const updated = getTrackerById('sleep')
    expect(updated?.name).toBe('Sleep Hours')
    expect(updated?.description).toBe('Nightly rest')
    expect(updated?.color).toBe('#6f42c1')
  })

  it('finds tracker by ID', () => {
    createTracker({ id: 'pushups', name: 'Pushups', type: 'numeric' })

    expect(getTrackerById('non-existent')).toBeNull()

    const found = getTrackerById('pushups')
    expect(found).not.toBeNull()
    expect(found?.name).toBe('Pushups')
  })

  it('generates unique slugs when collisions occur', () => {
    createTracker({ id: 'workout', name: 'Workout', type: 'habit' })

    const uniqueSlug = generateUniqueSlug('Workout')
    expect(uniqueSlug.startsWith('workout-')).toBe(true)
    expect(uniqueSlug).not.toBe('workout')
  })

  it('deletes tracker and cascades deletion to associated events', () => {
    createTracker({ id: 'reading', name: 'Reading', type: 'habit' })
    createEvent({
      id: 'event-1',
      tracker_id: 'reading',
      timestamp: new Date().toISOString(),
    })

    expect(listEventsByTracker('reading').length).toBe(1)

    deleteTracker('reading')
    expect(getTrackerById('reading')).toBeNull()
    expect(listEventsByTracker('reading').length).toBe(0)
  })

  it('creates, lists, and deletes tracker events', () => {
    createTracker({ id: 'weight', name: 'Weight', type: 'numeric' })

    createEvent({
      id: 'weight-1',
      tracker_id: 'weight',
      value: 75.5,
      note: 'Morning weigh-in',
      timestamp: '2026-10-31T08:00:00Z',
    })

    const events = listEventsByTracker('weight')
    expect(events.length).toBe(1)
    expect(events[0]?.id).toBe('weight-1')
    expect(events[0]?.value).toBe(75.5)
    expect(events[0]?.note).toBe('Morning weigh-in')

    deleteEvent('weight', 'weight-1')
    expect(listEventsByTracker('weight').length).toBe(0)
  })
})
