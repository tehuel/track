import { describe, expect, it, beforeEach } from 'bun:test'
import {
  db,
  createTrack,
  updateTrack,
  getTrackById,
  listTracks,
  deleteTrack,
  generateUniqueSlug,
  createEvent,
  listEventsByTrack,
  deleteEvent,
} from '../src/db'

describe('Database layer (bun:sqlite)', () => {
  beforeEach(() => {
    db.exec('DELETE FROM tracks')
  })

  it('creates and lists tracks with optional color', () => {
    createTrack({
      id: 'water-log',
      name: 'Drink Water',
      type: 'habit',
      description: 'Drink 2L daily',
      color: '#0dcaf0',
    })

    createTrack({
      id: 'stretching',
      name: 'Stretching',
      type: 'habit',
    })

    const list = listTracks()
    expect(list.length).toBe(2)
    expect(list[0]?.id).toBe('water-log')
    expect(list[0]?.name).toBe('Drink Water')
    expect(list[0]?.type).toBe('habit')
    expect(list[0]?.description).toBe('Drink 2L daily')
    expect(list[0]?.color).toBe('#0dcaf0')
    expect(list[1]?.id).toBe('stretching')
    expect(list[1]?.color).toBeNull()
  })

  it('updates track name, description, and color', () => {
    createTrack({ id: 'sleep', name: 'Sleep', type: 'numeric' })
    expect(getTrackById('sleep')?.color).toBeNull()

    updateTrack('sleep', {
      name: 'Sleep Hours',
      description: 'Nightly rest',
      color: '#6f42c1',
    })

    const updated = getTrackById('sleep')
    expect(updated?.name).toBe('Sleep Hours')
    expect(updated?.description).toBe('Nightly rest')
    expect(updated?.color).toBe('#6f42c1')
  })

  it('finds track by ID', () => {
    createTrack({ id: 'pushups', name: 'Pushups', type: 'numeric' })

    expect(getTrackById('non-existent')).toBeNull()

    const found = getTrackById('pushups')
    expect(found).not.toBeNull()
    expect(found?.name).toBe('Pushups')
  })

  it('generates unique slugs when collisions occur', () => {
    createTrack({ id: 'workout', name: 'Workout', type: 'habit' })

    const uniqueSlug = generateUniqueSlug('Workout')
    expect(uniqueSlug.startsWith('workout-')).toBe(true)
    expect(uniqueSlug).not.toBe('workout')
  })

  it('deletes track and cascades deletion to associated events', () => {
    createTrack({ id: 'reading', name: 'Reading', type: 'habit' })
    createEvent({
      id: 'event-1',
      track_id: 'reading',
      timestamp: new Date().toISOString(),
    })

    expect(listEventsByTrack('reading').length).toBe(1)

    deleteTrack('reading')
    expect(getTrackById('reading')).toBeNull()
    expect(listEventsByTrack('reading').length).toBe(0)
  })

  it('creates, lists, and deletes track events', () => {
    createTrack({ id: 'weight', name: 'Weight', type: 'numeric' })

    createEvent({
      id: 'weight-1',
      track_id: 'weight',
      value: 75.5,
      note: 'Morning weigh-in',
      timestamp: '2026-10-31T08:00:00Z',
    })

    const events = listEventsByTrack('weight')
    expect(events.length).toBe(1)
    expect(events[0]?.id).toBe('weight-1')
    expect(events[0]?.value).toBe(75.5)
    expect(events[0]?.note).toBe('Morning weigh-in')

    deleteEvent('weight', 'weight-1')
    expect(listEventsByTrack('weight').length).toBe(0)
  })
})
