import { describe, expect, it, beforeEach } from 'bun:test'
import {
  db,
  createTracker,
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

  it('creates and lists trackers', () => {
    createTracker({
      id: 'water-log',
      name: 'Drink Water',
      type: 'habit',
      description: 'Drink 2L daily',
    })

    const list = listTrackers()
    expect(list.length).toBe(1)
    expect(list[0]?.id).toBe('water-log')
    expect(list[0]?.name).toBe('Drink Water')
    expect(list[0]?.type).toBe('habit')
    expect(list[0]?.description).toBe('Drink 2L daily')
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
