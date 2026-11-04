import { describe, expect, it, beforeEach } from 'bun:test'
import { db, createTrack, createEvent, getTrackById } from '../src/db'
import { buildDailySeries, buildMonthlySeries, getTrackSeries } from '../src/series'

describe('Chart series', () => {
  beforeEach(() => {
    db.exec('DELETE FROM tracks')
  })

  it('aggregates daily and monthly series for habit, numeric (SUM), and text tracks', () => {
    createTrack({
      id: 'steps',
      name: 'Pasos',
      type: 'numeric',
      chart_12m: 'bars',
    })
    createTrack({
      id: 'meditate',
      name: 'Meditar',
      type: 'habit',
      chart_12m: 'grid',
    })

    const refNow = new Date('2026-11-04T15:00:00Z')
    createEvent({
      id: 's1',
      track_id: 'steps',
      value: 3000,
      timestamp: '2026-11-04T09:00:00Z',
    })
    createEvent({
      id: 's2',
      track_id: 'steps',
      value: 4500,
      timestamp: '2026-11-04T14:00:00Z',
    })
    createEvent({
      id: 's3',
      track_id: 'steps',
      value: 5000,
      timestamp: '2026-10-15T10:00:00Z',
    })

    const series7d = getTrackSeries(getTrackById('steps')!, '7d', refNow)
    expect(series7d).toHaveLength(7)
    expect(series7d[6]?.key).toBe('2026-11-04')
    expect(series7d[6]?.value).toBe(7500)
    expect(series7d[5]?.value).toBe(0)

    const series30d = getTrackSeries(getTrackById('steps')!, '30d', refNow)
    expect(series30d).toHaveLength(30)

    const series12mBars = getTrackSeries(getTrackById('steps')!, '12m', refNow)
    expect(series12mBars).toHaveLength(12)
    expect(series12mBars[11]?.key).toBe('2026-11')
    expect(series12mBars[11]?.value).toBe(7500)
    expect(series12mBars[10]?.key).toBe('2026-10')
    expect(series12mBars[10]?.value).toBe(5000)

    createEvent({
      id: 'm1',
      track_id: 'meditate',
      timestamp: '2026-11-04T08:00:00Z',
    })
    createEvent({
      id: 'm2',
      track_id: 'meditate',
      timestamp: '2026-11-04T20:00:00Z',
    })
    const series12mGrid = getTrackSeries(getTrackById('meditate')!, '12m', refNow)
    expect(series12mGrid).toHaveLength(364)
    expect(series12mGrid[363]?.key).toBe('2026-11-04')
    expect(series12mGrid[363]?.value).toBe(2)
  })

  it('builds labeled daily and monthly points from totals without touching the database', () => {
    const days = [new Date('2026-11-03T00:00:00Z'), new Date('2026-11-04T00:00:00Z')]
    const daily = buildDailySeries(days, new Map([['2026-11-04', 3]]))
    expect(daily).toEqual([
      { key: '2026-11-03', label: 'Mar 3 nov', shortLabel: '3', value: 0 },
      { key: '2026-11-04', label: 'Mié 4 nov', shortLabel: '4', value: 3 },
    ])

    const months = [new Date('2026-10-01T00:00:00Z'), new Date('2026-11-01T00:00:00Z')]
    const monthly = buildMonthlySeries(months, new Map([['2026-10', 7]]))
    expect(monthly).toEqual([
      { key: '2026-10', label: 'Oct 2026', shortLabel: 'Oct', value: 7 },
      { key: '2026-11', label: 'Nov 2026', shortLabel: 'Nov', value: 0 },
    ])
  })
})
