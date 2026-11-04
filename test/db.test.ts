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
  getAllDataForExport,
  getEventTotals,
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

  it('exports all tracks and events in a nested structure including tracks with no events', () => {
    createTrack({
      id: 'running',
      name: 'Running',
      type: 'numeric',
      description: 'Morning run',
      color: '#198754',
    })
    createTrack({
      id: 'no-events',
      name: 'Empty Track',
      type: 'habit',
    })

    createEvent({
      id: 'run-1',
      track_id: 'running',
      value: 5.2,
      note: '5k park run',
      timestamp: '2026-11-01T10:00:00Z',
    })
    createEvent({
      id: 'run-2',
      track_id: 'running',
      value: 10.0,
      note: '10k weekend',
      timestamp: '2026-11-02T10:00:00Z',
    })

    const tracks = getAllDataForExport()
    expect(tracks.length).toBe(2)

    const running = tracks.find((t) => t.id === 'running')
    expect(running).toBeDefined()
    expect(running?.name).toBe('Running')
    expect(running?.color).toBe('#198754')
    expect(running?.events.length).toBe(2)
    expect(running?.events[0]?.id).toBe('run-2')
    expect(running?.events[0]?.value).toBe(10.0)
    expect(running?.events[1]?.id).toBe('run-1')
    expect(running?.events[1]?.value).toBe(5.2)

    const empty = tracks.find((t) => t.id === 'no-events')
    expect(empty).toBeDefined()
    expect(empty?.name).toBe('Empty Track')
    expect(empty?.events).toEqual([])
  })

  it('assigns default chart modes per track type and updates each view mode independently', () => {
    createTrack({ id: 'habit-track', name: 'Meditación', type: 'habit' })
    createTrack({ id: 'num-track', name: 'Agua', type: 'numeric' })
    createTrack({ id: 'text-track', name: 'Diario', type: 'text' })

    const habit = getTrackById('habit-track')
    expect(habit?.chart_dashboard).toBe('grid')
    expect(habit?.chart_7d).toBe('grid')
    expect(habit?.chart_30d).toBe('grid')
    expect(habit?.chart_12m).toBe('grid')

    const num = getTrackById('num-track')
    expect(num?.chart_dashboard).toBe('bars')
    expect(num?.chart_7d).toBe('bars')
    expect(num?.chart_30d).toBe('bars')
    expect(num?.chart_12m).toBe('bars')

    const txt = getTrackById('text-track')
    expect(txt?.chart_dashboard).toBe('bars')

    updateTrack('num-track', {
      name: 'Agua (L)',
      chart_dashboard: 'line',
      chart_7d: 'bars',
      chart_30d: 'line',
      chart_12m: 'grid',
    })

    const updated = getTrackById('num-track')
    expect(updated?.chart_dashboard).toBe('line')
    expect(updated?.chart_7d).toBe('bars')
    expect(updated?.chart_30d).toBe('line')
    expect(updated?.chart_12m).toBe('grid')

    // Omitting chart modes in updateTrack preserves existing chart modes
    updateTrack('num-track', { name: 'Agua Diaria' })
    const preserved = getTrackById('num-track')
    expect(preserved?.chart_dashboard).toBe('line')
    expect(preserved?.chart_12m).toBe('grid')
  })

  it('accumulates event totals per day and month (SUM for numeric, COUNT otherwise)', () => {
    createTrack({ id: 'water', name: 'Agua', type: 'numeric' })
    createTrack({ id: 'run', name: 'Correr', type: 'habit' })
    const water = getTrackById('water')!
    const run = getTrackById('run')!

    createEvent({ id: 'w1', track_id: 'water', value: 2, timestamp: '2026-11-04T09:00:00Z' })
    createEvent({ id: 'w2', track_id: 'water', value: 3, timestamp: '2026-11-04T18:00:00Z' })
    createEvent({ id: 'w3', track_id: 'water', value: null, timestamp: '2026-11-03T10:00:00Z' })
    createEvent({ id: 'w4', track_id: 'water', value: 7, timestamp: '2026-10-01T10:00:00Z' })
    createEvent({ id: 'r1', track_id: 'run', timestamp: '2026-11-04T07:00:00Z' })
    createEvent({ id: 'r2', track_id: 'run', timestamp: '2026-11-04T19:00:00Z' })

    const daily = getEventTotals(water, 'day', '2026-11-03')
    expect(Object.fromEntries(daily)).toEqual({ '2026-11-03': 0, '2026-11-04': 5 })

    const monthly = getEventTotals(water, 'month', '2026-10')
    expect(Object.fromEntries(monthly)).toEqual({ '2026-10': 7, '2026-11': 5 })

    expect(getEventTotals(run, 'day', '2026-11-01').get('2026-11-04')).toBe(2)
  })
})
