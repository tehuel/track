import { describe, expect, it, beforeEach } from 'bun:test'
import {
  createDatabase,
  createTracker,
  getTrackerById,
  listTrackers,
  deleteTracker,
  trackerExists,
  generateUniqueSlug,
  createEvent,
  listEventsByTracker,
  deleteEvent,
} from '../src/db'
import type { Database } from 'bun:sqlite'

describe('Database layer (bun:sqlite)', () => {
  let testDb: Database

  beforeEach(() => {
    testDb = createDatabase(':memory:')
  })

  it('creates and lists trackers', () => {
    const created = createTracker(
      {
        id: 'water-log',
        name: 'Drink Water',
        type: 'habit',
        description: 'Drink 2L daily',
      },
      testDb
    )

    expect(created.id).toBe('water-log')
    expect(created.name).toBe('Drink Water')
    expect(created.type).toBe('habit')
    expect(created.description).toBe('Drink 2L daily')

    const list = listTrackers(testDb)
    expect(list.length).toBe(1)
    expect(list[0]?.id).toBe('water-log')
  })

  it('finds tracker by ID and checks existence', () => {
    createTracker({ id: 'pushups', name: 'Pushups', type: 'numeric' }, testDb)

    expect(trackerExists('pushups', testDb)).toBe(true)
    expect(trackerExists('non-existent', testDb)).toBe(false)

    const found = getTrackerById('pushups', testDb)
    expect(found).not.toBeNull()
    expect(found?.name).toBe('Pushups')
  })

  it('generates unique slugs when collisions occur', () => {
    createTracker({ id: 'workout', name: 'Workout', type: 'habit' }, testDb)

    const uniqueSlug = generateUniqueSlug('Workout', testDb)
    expect(uniqueSlug.startsWith('workout-')).toBe(true)
    expect(uniqueSlug).not.toBe('workout')
  })

  it('deletes tracker and cascades deletion to associated events', () => {
    createTracker({ id: 'reading', name: 'Reading', type: 'habit' }, testDb)
    createEvent(
      {
        id: 'event-1',
        tracker_id: 'reading',
        timestamp: new Date().toISOString(),
      },
      testDb
    )

    expect(listEventsByTracker('reading', 50, testDb).length).toBe(1)

    const deleted = deleteTracker('reading', testDb)
    expect(deleted).toBe(true)
    expect(trackerExists('reading', testDb)).toBe(false)
    expect(listEventsByTracker('reading', 50, testDb).length).toBe(0)
  })

  it('creates, lists, and deletes tracker events', () => {
    createTracker({ id: 'weight', name: 'Weight', type: 'numeric' }, testDb)

    const event = createEvent(
      {
        id: 'weight-1',
        tracker_id: 'weight',
        value: 75.5,
        note: 'Morning weigh-in',
        timestamp: '2026-10-31T08:00:00Z',
      },
      testDb
    )

    expect(event.id).toBe('weight-1')
    expect(event.value).toBe(75.5)
    expect(event.note).toBe('Morning weigh-in')

    const events = listEventsByTracker('weight', 50, testDb)
    expect(events.length).toBe(1)
    expect(events[0]?.id).toBe('weight-1')

    const deleted = deleteEvent('weight', 'weight-1', testDb)
    expect(deleted).toBe(true)
    expect(listEventsByTracker('weight', 50, testDb).length).toBe(0)
  })
})
