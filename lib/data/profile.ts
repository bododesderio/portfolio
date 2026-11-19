import { getField, getPageContent, getSiteSettings } from '@/lib/data/content'
import {
  readRoles,
  readTimeline,
  readValues,
  safePublicHref,
  readDatedEntries,
  readStringList,
  profileLinks,
} from '@/lib/domain/profile'
export async function getPersonalProfile() {
  const [home, about, settings] = await Promise.all([
    getPageContent('home'),
    getPageContent('about'),
    getSiteSettings(),
  ])
  const fullBiography = getField(home, 'bio.body')
  const interests =
    getField(about, 'interests.body') ||
    (fullBiography.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || []).find((paragraph) =>
      /away from the keyboard|away from work|outside of work|outside work/i.test(
        paragraph
      )
    ) ||
    ''
  return {
    home,
    about,
    settings,
    name: getField(home, 'hero.headline') || 'Bodo Desderio',
    role:
      getField(home, 'hero.pretitle') ||
      'Software engineer, entrepreneur & community builder',
    tagline: getField(home, 'hero.tagline'),
    photo: getField(home, 'hero.photo') || '/images/hero/portrait-home.png',
    location: settings['site.location'] || 'Lira City, Uganda',
    biography:
      interests && fullBiography.includes(interests)
        ? fullBiography.replace(interests, '')
        : fullBiography,
    interests,
    introduction: [1, 2, 3]
      .map((index) => getField(home, `about.paragraph_${index}`))
      .filter(Boolean),
    roles: readRoles(getField(home, 'bio.roles')).map((role) => ({
      ...role,
      url: role.url ? safePublicHref(role.url) || undefined : undefined,
    })),
    timeline: readTimeline(getField(about, 'story.items')),
    education: readDatedEntries(getField(about, 'education.items')),
    volunteering: readDatedEntries(getField(about, 'volunteering.items')),
    skills: readStringList(getField(about, 'skills.items')),
    languages: readValues(getField(about, 'languages.items')),
    values: readValues(getField(about, 'values.items')),
    resumeUrl: safePublicHref(settings['site.resume_url'] || '') || undefined,
    socials: profileLinks(settings),
  }
}
