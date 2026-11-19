// Owner-approved content cleanup on 2026-11-19. Idempotent; dry run unless --apply.
//  - Deletes the six sample articles the original seed published.
//  - Removes em dashes from press items, fixes the mission statement, replaces
//    the generic login subtitle, and clears file names used as photo alt text.
//  - Replaces the "Founder. Leader. Builder." tagline and adds the YouTube channel.
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

const SAMPLE_POST_SLUGS = [
  'sustainable-web-development-reducing-digital-carbon-footprints',
  'responsible-ai-development-balancing-innovation-and-ethics',
  'closing-gender-gap-computer-science-education',
  'quantum-computing-breakthroughs-practical-applications',
  'innovative-approaches-tech-recycling-circular-economy',
  'how-data-centers-transitioning-100-renewable-energy',
]
const OLD_MISSION = 'Technology is the means, not the mission, the mission is people.'
const NEW_MISSION = 'Technology is the means. People are the mission.'
const OLD_LOGIN_SUBTITLE =
  'Building companies, communities, and technology that move people forward.'
const NEW_LOGIN_SUBTITLE =
  'Biography, work, writing and photographs, edited from one place.'

const OLD_TAGLINE = 'Founder. Leader. Builder.'
const NEW_TAGLINE = 'Software engineer and SEO specialist in Lira City, Uganda'
const YOUTUBE_URL = 'https://www.youtube.com/@BodoDesderio'

const titleWithoutDash = (text) =>
  text.replace(/Congress — Ugandan/g, 'Congress, Ugandan').replace(/ — /g, ': ')
const proseWithoutDash = (text) => text.replace(/ — /g, ', ').replace(/—/g, ', ')

async function plan(tx) {
  const posts = await tx.blogPost.findMany({
    where: { slug: { in: SAMPLE_POST_SLUGS } },
    select: { id: true, slug: true },
  })
  const press = (await tx.pressItem.findMany()).flatMap((item) => {
    const data = {}
    if (item.title.includes('—')) data.title = titleWithoutDash(item.title)
    if (item.description.includes('—'))
      data.description = proseWithoutDash(item.description)
    if (item.imageAlt && item.imageAlt.includes('—'))
      data.imageAlt = titleWithoutDash(item.imageAlt)
    return Object.keys(data).length ? [{ id: item.id, data }] : []
  })
  const mission = await tx.siteContent.findFirst({
    where: { page: 'about', section: 'mission', fieldKey: 'statement', value: OLD_MISSION },
  })
  const loginSubtitle = await tx.siteSettings.findFirst({
    where: { key: 'login_overlay_subtitle', value: OLD_LOGIN_SUBTITLE },
  })
  const fileNameAlts = await tx.media.count({
    where: { altText: { startsWith: 'Gallery image:' } },
  })
  const tagline = await tx.siteSettings.findFirst({ where: { key: 'site.tagline', value: OLD_TAGLINE } })
  const youtube = await tx.siteSettings.findUnique({ where: { key: 'social.youtube' } })
  return { posts, press, mission, loginSubtitle, fileNameAlts, tagline, youtubeMissing: !youtube?.value }
}

async function main(apply) {
  await p.$transaction(async (tx) => {
    const found = await plan(tx)
    console.log(
      JSON.stringify(
        {
          samplePosts: found.posts.map((post) => post.slug),
          pressItems: found.press.map((item) => ({ id: item.id, fields: Object.keys(item.data) })),
          missionStatement: Boolean(found.mission),
          loginSubtitle: Boolean(found.loginSubtitle),
          fileNameAltTexts: found.fileNameAlts,
          tagline: Boolean(found.tagline),
          youtubeMissing: found.youtubeMissing,
          apply,
        },
        null,
        2
      )
    )
    if (!apply) return
    await tx.blogPost.deleteMany({ where: { id: { in: found.posts.map((post) => post.id) } } })
    for (const item of found.press)
      await tx.pressItem.update({ where: { id: item.id }, data: item.data })
    if (found.mission)
      await tx.siteContent.update({ where: { id: found.mission.id }, data: { value: NEW_MISSION } })
    if (found.loginSubtitle)
      await tx.siteSettings.update({
        where: { key: 'login_overlay_subtitle' },
        data: { value: NEW_LOGIN_SUBTITLE },
      })
    if (found.tagline)
      await tx.siteSettings.update({ where: { key: 'site.tagline' }, data: { value: NEW_TAGLINE } })
    if (found.youtubeMissing)
      await tx.siteSettings.upsert({
        where: { key: 'social.youtube' },
        update: { value: YOUTUBE_URL },
        create: { key: 'social.youtube', value: YOUTUBE_URL },
      })
    await tx.media.updateMany({
      where: { altText: { startsWith: 'Gallery image:' } },
      data: { altText: null },
    })
  })
}

main(process.argv.includes('--apply'))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => p.$disconnect())
