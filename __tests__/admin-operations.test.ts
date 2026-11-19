import { describe, expect, it } from 'vitest'
import { clientIp, diffRows, redactRow, rowLabel, summarize } from '../lib/domain/audit'
import { parseRange, percentChange, referrerHost, sectionForPath } from '../lib/domain/analytics-range'
import { fingerprintError, isNoise } from '../lib/domain/error-reports'
import { isMaintainedPath } from '../lib/domain/maintenance'
import { csvCell } from '../lib/util/csv'
import { readHeaderBehavior } from '../lib/domain/header-behavior'
import { profileLinks } from '../lib/domain/profile'

describe('audit trail rows', () => {
  it('hides secret fields and secret settings but keeps ordinary values', () => {
    expect(redactRow('AdminUser', { email: 'a@b.c', passwordHash: 'x' })).toEqual({ email: 'a@b.c', passwordHash: '[hidden]' })
    expect(redactRow('SiteSettings', { key: 'smtp.password', value: 'pw' })?.value).toBe('[hidden]')
    expect(redactRow('SiteSettings', { key: 'site.name', value: 'Bodo' })?.value).toBe('Bodo')
    expect(redactRow('AppConfig', { key: 'SMTP_HOST', value: 'mail' })?.value).toBe('[hidden]')
  })
  it('shortens long text', () => {
    const row = redactRow('BlogPost', { body: 'x'.repeat(1000) })
    expect(String(row?.body)).toContain('(1000 characters)')
  })
  it('records only fields that changed, ignoring timestamps', () => {
    expect(diffRows({ title: 'A', updatedAt: 1, slug: 's' }, { title: 'B', updatedAt: 2, slug: 's' })).toEqual({
      title: { from: 'A', to: 'B' },
    })
  })
  it('labels and summarises rows for people', () => {
    expect(rowLabel({ title: 'Hello' })).toBe('Hello')
    expect(rowLabel({ page: 'about', section: 'story', fieldKey: 'items' })).toBe('about › story › items')
    expect(summarize('update', 'BlogPost', 'Hello')).toBe('Updated blog post “Hello”')
    expect(summarize('bulk_delete', 'Message', null, 3)).toBe('Deleted 3 message records')
  })
  it('takes the client address from the trusted end of the forwarded chain', () => {
    expect(clientIp('1.1.1.1, 10.0.0.2', null)).toBe('10.0.0.2')
    expect(clientIp(null, '9.9.9.9')).toBe('9.9.9.9')
    expect(clientIp(null, null)).toBeNull()
  })
})

describe('analytics ranges', () => {
  const now = new Date('2026-11-19T12:00:00Z')
  it('defaults to the last 30 days and compares with the 30 before', () => {
    const range = parseRange({}, now)
    expect(range.preset).toBe('30d')
    expect(range.previousTo.getTime()).toBe(range.from.getTime())
    expect(range.granularity).toBe('day')
  })
  it('groups long ranges by month', () => {
    expect(parseRange({ range: '12m' }, now).granularity).toBe('month')
    expect(parseRange({ range: '90d' }, now).granularity).toBe('week')
  })
  it('accepts a custom range in Kampala days and rejects bad ones', () => {
    const custom = parseRange({ range: 'custom', from: '2026-11-01', to: '2026-11-07' }, now)
    expect(custom.preset).toBe('custom')
    expect(custom.days).toBe(7)
    expect(custom.from.toISOString()).toBe('2026-10-31T21:00:00.000Z')
    expect(parseRange({ range: 'custom', from: '2026-11-07', to: '2026-11-01' }, now).preset).toBe('30d')
    expect(parseRange({ range: 'custom', from: 'nonsense', to: '2026-11-01' }, now).preset).toBe('30d')
  })
  it('reports change against the previous period', () => {
    expect(percentChange(150, 100)).toBe(50)
    expect(percentChange(0, 0)).toBe(0)
    expect(percentChange(5, 0)).toBeNull()
  })
  it('maps paths to sections and referrers to sites', () => {
    expect(sectionForPath('/')).toBe('Home')
    expect(sectionForPath('/blog/a-post')).toBe('Writing')
    expect(sectionForPath('/unknown')).toBe('Other pages')
    expect(referrerHost('https://www.google.com/search?q=x')).toBe('google.com')
    expect(referrerHost('not a url')).toBeNull()
  })
})

describe('error reports', () => {
  it('groups repeats that differ only in numbers or ids', () => {
    const a = fingerprintError('public', 'Failed to load item 123', 'Error\n    at render (app.js:10:5)')
    const b = fingerprintError('public', 'Failed to load item 456', 'Error\n    at render (app.js:10:9)')
    expect(a).toBe(b)
    expect(fingerprintError('server', 'Failed to load item 123')).not.toBe(a)
  })
  it('drops browser noise nothing here can fix', () => {
    expect(isNoise('ResizeObserver loop completed with undelivered notifications.')).toBe(true)
    expect(isNoise('Script error.')).toBe(true)
    expect(isNoise('x', 'at chrome-extension://abc/content.js:1:1')).toBe(true)
    expect(isNoise('TypeError: x is undefined')).toBe(false)
  })
})

describe('maintenance gate', () => {
  it('covers visitor pages and leaves the admin, APIs and assets reachable', () => {
    for (const path of ['/', '/about', '/blog/post', '/contact']) expect(isMaintainedPath(path)).toBe(true)
    for (const path of ['/admin', '/admin/login', '/api/auth/session', '/api/errors', '/maintenance', '/_next/static/x.js', '/robots.txt'])
      expect(isMaintainedPath(path)).toBe(false)
    expect(isMaintainedPath('/administrator')).toBe(true)
  })
})

describe('small helpers', () => {
  it('quotes CSV cells and defuses spreadsheet formulas', () => {
    expect(csvCell('a "b"')).toBe('"a ""b"""')
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"')
    expect(csvCell(42)).toBe('"42"')
  })
  it('defaults the header to hiding on scroll', () => {
    expect(readHeaderBehavior(undefined)).toBe('hide')
    expect(readHeaderBehavior('sticky')).toBe('sticky')
    expect(readHeaderBehavior('bogus')).toBe('hide')
  })
  it('lists only valid web profile links, in display order', () => {
    const links = profileLinks({
      'social.github': 'https://github.com/x',
      'social.facebook': 'https://facebook.com/x',
      'social.youtube': 'javascript:alert(1)',
      'social.medium': '/relative',
    })
    expect(links.map((link) => link.label)).toEqual(['Facebook', 'GitHub'])
    expect(links[1].kind).toBe('writing')
  })
})
