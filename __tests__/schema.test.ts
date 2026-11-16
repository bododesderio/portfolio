import { describe, expect, it, vi, afterEach } from 'vitest'
import { ldJson, personSchema, profilePageSchema, websiteSchema } from '../lib/schema'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('Google profile structured data', () => {
  it('identifies a named Person without resolving another script', () => {
    const [profile] = JSON.parse(ldJson(profilePageSchema()))
    expect(profile['@type']).toBe('ProfilePage')
    expect(profile.mainEntity['@type']).toBe('Person')
    expect(profile.mainEntity.name).toBe('Bodo Desderio')
    expect(profile.mainEntity['@id']).toBe(personSchema()['@id'])
    expect(profile.mainEntity.url).toMatch(/^https?:\/\//)
  })

  it('connects the website publisher to the same named person', () => {
    const [person, website] = JSON.parse(ldJson([personSchema(), websiteSchema()]))
    expect(website.publisher['@id']).toBe(person['@id'])
    expect(person.name).toBeTruthy()
    // The social sharing card is a wordmark, not a profile photograph.
    expect(person.image).toBeUndefined()
    // Blog search is client-side and does not implement a ?q= search URL.
    expect(website.potentialAction).toBeUndefined()
  })

  it('uses the same canonical entity ID when the site URL has trailing slashes', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com///')
    const schema = await import('../lib/schema')
    expect(schema.profilePageSchema().url).toBe('https://example.com/about')
    expect(schema.profilePageSchema().mainEntity['@id']).toBe('https://example.com/#bodo')
    expect(schema.websiteSchema().publisher['@id']).toBe('https://example.com/#bodo')
  })

  it('round-trips hostile content without allowing a script element to end', () => {
    const data = { name: '</script><script>alert("xss")</script>', text: '<!-- & >' }
    const serialized = ldJson(data)
    expect(serialized).not.toContain('<')
    expect(JSON.parse(serialized)).toEqual([data])
  })
})
