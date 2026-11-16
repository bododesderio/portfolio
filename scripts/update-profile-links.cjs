// Targeted, idempotent content correction requested on 2026-11-16.
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
async function main() {
  await p.$transaction(async (tx) => {
    await tx.project.update({
      where: { slug: 'rooibok-technologies' },
      data: { liveUrl: 'https://rooibok.tech' },
    })
    const rows = await tx.siteContent.findMany({
      where: { page: 'home', section: { in: ['bio', 'about'] } },
    })
    for (const row of rows) {
      let value = row.value
      if (row.fieldKey === 'body')
        value = value
          .replace(
            /<strong>Rooibok Technologies Limited<\/strong>/g,
            '<strong><a href="https://rooibok.tech">Rooibok Technologies Limited</a></strong>'
          )
          .replace(
            /<strong>Kakebe Technologies Limited<\/strong>/g,
            '<strong><a href="https://kakebe.tech/about.html">Kakebe Technologies Limited</a></strong>'
          )
      if (row.section === 'about' && row.fieldKey === 'paragraph_2')
        value = value
          .replace(
            /(?<!>)Rooibok Technologies Limited(?!<)/g,
            '<a href="https://rooibok.tech">Rooibok Technologies Limited</a>'
          )
          .replace(
            /(?<!>)Kakebe Technologies Limited(?!<)/g,
            '<a href="https://kakebe.tech/about.html">Kakebe Technologies Limited</a>'
          )
      if (row.fieldKey === 'roles') {
        const roles = JSON.parse(value)
        for (const role of roles) {
          if (/rooibok/i.test(role.org)) role.url = 'https://rooibok.tech'
          if (/kakebe/i.test(role.org))
            role.url = 'https://kakebe.tech/about.html'
        }
        value = JSON.stringify(roles)
      }
      if (value !== row.value)
        await tx.siteContent.update({ where: { id: row.id }, data: { value } })
    }
    const externalUrl = 'https://kakebe.tech/about.html'
    const existing = await tx.pressItem.findFirst({ where: { externalUrl } })
    if (!existing)
      await tx.pressItem.create({
        data: {
          title: 'My profile at Kakebe Technologies',
          description:
            'My team profile on Kakebe Technologies’ official website.',
          source: 'Kakebe Technologies',
          externalUrl,
          sourceUrl: externalUrl,
          visible: true,
          order: -1,
          type: 'article',
        },
      })
  })
  console.log(
    JSON.stringify({
      rooibok: 'https://rooibok.tech',
      kakebe: 'https://kakebe.tech/about.html',
      updated: true,
    })
  )
}
if (process.argv.includes('--apply'))
  main()
    .catch((e) => {
      console.error(e.message)
      process.exitCode = 1
    })
    .finally(() => p.$disconnect())
else {
  console.log(
    'Use --apply to correct the Rooibok project URL, link biography organizations, and add the Kakebe team listing. No records were changed.'
  )
  p.$disconnect()
}
