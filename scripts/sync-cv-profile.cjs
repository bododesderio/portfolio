/** Public career facts transcribed from the owner's CV. No reference contacts or street address. */
const { PrismaClient } = require('@prisma/client')
const cv = require('../prisma/data/cv-profile.json')
const timeline = [
  {
    year: 'March 2019 – December 2020',
    title: 'Certificate in Electrical Engineering',
    organization: 'FIMAT',
    description: cv.education[0].description,
  },
  {
    year: 'December 2020',
    title: 'Fundraising through fashion',
    organization: 'Derowaa',
    description: cv.volunteering[0].description,
  },
  {
    year: 'August 2021',
    title: 'Diploma in Computer Science',
    organization: 'International University East Africa (IUEA)',
  },
  {
    year: 'December 2021 – October 2023',
    title: 'Volunteer junior developer',
    organization: 'Kakebe Technologies',
    description: cv.volunteering[1].description,
  },
  {
    year: '2023 – Present',
    title: 'Founding and leading Parler Foundation',
    organization: 'Parler Foundation',
    description: cv.roles[2].description,
    featured: true,
  },
  {
    year: '2023 – 2024',
    title: 'President of the Uganda Chapter',
    organization: 'African Youth Congress',
    description: cv.roles[5].description,
  },
  {
    year: 'May 2023 – Present',
    title: 'Board member',
    organization: 'Transform Open Arena',
    description: cv.roles[4].description,
  },
  {
    year: 'August 2023',
    title: 'Bachelor’s in Computer Science',
    organization: 'Kampala International University (KIU)',
    featured: true,
  },
  {
    year: 'November 2023 – Present',
    title: 'Software Engineer & SEO Specialist',
    organization: 'Kakebe Technologies Limited',
    description: cv.roles[1].description,
    featured: true,
  },
  {
    year: 'June 2024 – Present',
    title: 'Social media management',
    organization: 'A Better Life International',
    description: cv.roles[3].description,
  },
  {
    year: 'July 2024',
    title: 'Volunteer data analyst',
    organization: 'Global Education Innovators',
    description: cv.volunteering[2].description,
  },
  {
    year: 'August 2024',
    title: 'Community support and mental health mentoring',
    organization: 'Journey International',
    description: cv.volunteering[3].description,
  },
  {
    year: 'March – December 2025',
    title: 'Advanced SEO Engineering',
    organization: 'Udemy',
    description: cv.education[3].description,
    featured: true,
  },
]
const fields = [
  ['home', 'hero', 'pretitle', 'Software engineer & SEO specialist', 'text'],
  [
    'home',
    'about',
    'paragraph_1',
    'I’m Bodo Desderio, a Ugandan software engineer, SEO specialist and community leader based in Lira City, Uganda.',
    'html',
  ],
  [
    'home',
    'about',
    'paragraph_2',
    'I build software and lead SEO work at <a href="https://kakebe.tech/about.html">Kakebe Technologies Limited</a>. I also founded <a href="https://rooibok.tech">Rooibok Technologies Limited</a> and lead Parler Foundation’s community programmes.',
    'html',
  ],
  [
    'home',
    'about',
    'paragraph_3',
    'My work also spans social media management at A Better Life International, board service with Transform Open Arena, and youth leadership. I served as President of the African Youth Congress, Uganda Chapter, from 2023 to 2024.',
    'html',
  ],
  [
    'home',
    'bio',
    'body',
    '<p>I work across software engineering, search engine optimisation and community development. At <a href="https://kakebe.tech/about.html">Kakebe Technologies Limited</a>, I have worked as a Software Engineer &amp; SEO Specialist since November 2023, following a volunteer junior developer role from December 2021 to October 2023.</p><p>I am the Founder and Executive Director of Parler Foundation, leading community outreach, programme delivery and partnerships since 2023. I am also the founder of <a href="https://rooibok.tech">Rooibok Technologies Limited</a>.</p><p>Since June 2024, I have worked as a Social Media Manager at A Better Life International. I have served on the board of Transform Open Arena since May 2023, and was President of the African Youth Congress, Uganda Chapter, from 2023 to 2024.</p><p>My education includes electrical engineering studies at FIMAT, computer science studies at IUEA and KIU, Advanced SEO Engineering through Udemy, and a Professional Foundations certificate from ALX. My volunteer work includes website development, educational data analysis, mental health mentoring and fundraising.</p>',
    'html',
  ],
  ['home', 'bio', 'roles', JSON.stringify(cv.roles), 'json'],
  [
    'home',
    'community',
    'body',
    'Through Parler Foundation, board service, youth leadership and volunteering, I work on community outreach, education access, mental health awareness and youth empowerment.',
    'text',
  ],
  ['about', 'story', 'items', JSON.stringify(timeline), 'json'],
  ['about', 'education', 'items', JSON.stringify(cv.education), 'json'],
  ['about', 'volunteering', 'items', JSON.stringify(cv.volunteering), 'json'],
  ['about', 'skills', 'items', JSON.stringify(cv.skills), 'json'],
  ['about', 'languages', 'items', JSON.stringify(cv.languages), 'json'],
  [
    'about',
    'interests',
    'body',
    '<p>' + cv.interests.join(' · ') + '.</p>',
    'html',
  ],
]
async function sync(prisma) {
  await prisma.$transaction(async (tx) => {
    for (const [page, section, fieldKey, value, fieldType] of fields)
      await tx.siteContent.upsert({
        where: { page_section_fieldKey: { page, section, fieldKey } },
        update: { value, fieldType },
        create: { page, section, fieldKey, value, fieldType },
      })
    await tx.siteSettings.upsert({
      where: { key: 'site.location' },
      update: { value: cv.location },
      create: { key: 'site.location', value: cv.location },
    })
  })
  return {
    fields: fields.length,
    timelineEntries: timeline.length,
    education: cv.education.length,
    roles: cv.roles.length,
    volunteering: cv.volunteering.length,
  }
}
module.exports = { sync, fields, timeline }
if (require.main === module) {
  if (!process.argv.includes('--apply'))
    console.log(
      JSON.stringify({
        mode: 'preview',
        fields: fields.map(
          ([page, section, field]) => `${page}.${section}.${field}`
        ),
        timelineEntries: timeline.length,
        privateContactsIncluded: false,
      })
    )
  else {
    const prisma = new PrismaClient()
    sync(prisma)
      .then((result) => console.log(JSON.stringify(result)))
      .catch((error) => {
        console.error(error.message)
        process.exitCode = 1
      })
      .finally(() => prisma.$disconnect())
  }
}
