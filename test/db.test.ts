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
    createTracker(
      {
        id: 'water-log',
        name: 'Drink Water',
        type: 'habit',
        description: 'Drink 2L daily',
      },
      testDb
    )

    const list = listTrackers(testDb)
    expect(list.length).toBe(1)
    expect(list[0]?.id).toBe('water-log')
    expect(list[0]?.name).toBe('Drink Water')
    expect(list[0]?.type).toBe('habit')
    expect(list[0]?.description).toBe('Drink 2L daily')
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

    deleteTracker('reading', testDb)
    expect(trackerExists('reading', testDb)).toBe(false)
    expect(listEventsByTracker('reading', 50, testDb).length).toBe(0)
  })

  it('creates, lists, and deletes tracker events', () => {
    createTracker({ id: 'weight', name: 'Weight', type: 'numeric' }, testDb)

    createEvent(
      {
        id: 'weight-1',
        tracker_id: 'weight',
        value: 75.5,
        note: 'Morning weigh-in',
        timestamp: '2026-10-31T08:00:00Z',
      },
      testDb
    )

    const events = listEventsByTracker('weight', 50, testDb)
    expect(events.length).toBe(1)
    expect(events[0]?.id).toBe('weight-1')
    expect(events[0]?.value).toBe(75.5)
    expect(events[0]?.note).toBe('Morning weigh-in')

    deleteEvent('weight', 'weight-1', testDb)
    expect(listEventsByTracker('weight', 50, testDb).length).toBe(0)
  })
})
