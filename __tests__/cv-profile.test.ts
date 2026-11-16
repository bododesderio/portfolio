import { describe, it, expect } from 'vitest'
import cv from '../prisma/data/cv-profile.json'
import { readAppearance } from '../lib/domain/appearance'
import { readDatedEntries, readTimeline } from '../lib/domain/profile'
describe('owner-supplied CV facts', () => {
  it('keeps the school dates given in the CV without the invented 2018 university entry', () => {
    expect(
      cv.education.find((item) => item.organization.includes('FIMAT'))?.period
    ).toBe('March 2019 – December 2020')
    expect(
      cv.education.find((item) => item.organization.includes('IUEA'))?.period
    ).toBe('August 2021')
    expect(
      cv.education.find((item) => item.organization.includes('KIU'))?.period
    ).toBe('August 2023')
    expect(
      cv.education.find((item) => item.organization === 'ALX')?.period
    ).toBeUndefined()
  })
  it('distinguishes the volunteer developer role from the later professional role', () => {
    expect(
      cv.volunteering.find((item) => item.title === 'Junior Developer')?.period
    ).toBe('December 2021 – October 2023')
    expect(cv.roles.find((item) => item.org.includes('Kakebe'))?.period).toBe(
      'November 2023 – Present'
    )
    expect(
      cv.roles.find((item) => item.org === 'Parler Foundation')
    ).toBeDefined()
  })
  it('keeps private reference contacts and street address out of the public transcription', () => {
    const text = JSON.stringify(cv)
    for (const value of [
      'sedricksedu2@',
      'deniseayebare@',
      'opiodickensagona@',
      'Obote Avenue',
      'Renzo Building',
    ])
      expect(text).not.toContain(value)
  })
  it('preserves optional dates and responsibilities through CMS parsing', () => {
    expect(readDatedEntries(JSON.stringify(cv.education))).toHaveLength(5)
    expect(
      readTimeline(
        JSON.stringify([{ title: 'A chapter', featured: 'true' }])
      )[0].featured
    ).toBe(true)
  })
})
describe('universal appearance preference boundaries', () => {
  it.each([null, 'broken', 'null', '[]', '{"size":"giant","width":"all"}'])(
    'uses the compact default for malformed preferences %s',
    (raw) => {
      expect(readAppearance(raw)).toEqual({
        size: 'standard',
        width: 'standard',
      })
    }
  )
  it('preserves the same valid settings for both route groups', () => {
    expect(readAppearance('{"size":"small","width":"wide"}')).toEqual({
      size: 'small',
      width: 'wide',
    })
  })
})
