import { describe, expect, it } from 'vitest'
import {
  readNavigation,
  readRoles,
  readTimeline,
  readValues,
  safePublicHref,
} from '../lib/domain/profile'
const fallback = [{ label: 'Home', href: '/', visible: true }]
describe('public profile content boundaries', () => {
  it('retains valid biography entries while ignoring malformed entries', () => {
    expect(
      readTimeline(
        JSON.stringify([
          { year: '2024', title: 'A chapter', description: 'Details' },
          null,
          { year: 2025 },
          { title: 'Another chapter' },
        ])
      )
    ).toEqual([
      { year: '2024', title: 'A chapter', description: 'Details' },
      { title: 'Another chapter' },
    ])
    expect(readRoles('{}')).toEqual([])
    expect(readValues('broken json')).toEqual([])
  })
  it('allows normal public paths and web links', () => {
    expect(safePublicHref('/about#timeline')).toBe('/about#timeline')
    expect(safePublicHref('https://example.com/work')).toBe(
      'https://example.com/work'
    )
  })
  it.each([
    'javascript:alert(1)',
    'data:text/html,hello',
    '//example.com',
    '/\\example.com',
    'file:///etc/passwd',
  ])('rejects unsafe navigation %s', (value) => {
    expect(safePublicHref(value)).toBeNull()
  })
  it('falls back when saved navigation is valid JSON with the wrong shape', () => {
    expect(readNavigation('{"href":"/about"}', fallback)).toEqual(fallback)
    expect(readNavigation('[{"label":"About"}]', fallback)).toEqual(fallback)
  })
  it('preserves visibility and custom labels, removes duplicates, and updates legacy default labels', () => {
    const raw = JSON.stringify([
      { label: 'Projects', href: '/projects', visible: true },
      { label: 'Duplicate', href: '/projects', visible: true },
      { label: 'My journal', href: '/blog', visible: false },
      { label: 'Bad', href: 'javascript:alert(1)', visible: true },
    ])
    expect(readNavigation(raw, fallback)).toEqual([
      { label: 'Work', href: '/projects', visible: true },
      { label: 'My journal', href: '/blog', visible: false },
    ])
  })
})
