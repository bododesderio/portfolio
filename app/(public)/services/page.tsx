import { pageMetadata } from '@/lib/seo/page-metadata'
import Link from 'next/link'
import { prisma } from '@/lib/data/db'
import {
  EntryHeading,
  EntryLayout,
  EntrySection,
} from '@/components/personal/EntryLayout'
import { PersonalIcon } from '@/components/personal/PersonalIcon'
import { ldJson, servicesSchema } from '@/lib/schema'
export const dynamic = 'force-dynamic'
export function generateMetadata() {
  return pageMetadata({
    page: 'services',
    title: "Areas of work · Bodo Desderio",
    description:
      "Software engineering, SEO, digital marketing, technical consulting, company building and community programmes by Bodo Desderio, a Ugandan engineer.",
    path: '/services',
  })
}
export default async function CapabilitiesPage() {
  const services = await prisma.service.findMany({
    where: { visible: true },
    orderBy: { order: 'asc' },
  })
  return (
    <EntryLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(servicesSchema(services)) }}
      />
      <EntryHeading
        eyebrow="Skills & disciplines"
        title="Areas of work"
        description="The different threads that run through what I do."
      />
      <div className="personal-capabilities">
        {services.map((service) => (
          <EntrySection id={service.id} title={service.title} key={service.id}>
            <div className="personal-community-snippet">
              <span className="personal-section-symbol">
                <PersonalIcon name="work" />
              </span>
              <p>{service.description}</p>
            </div>
          </EntrySection>
        ))}
      </div>
      <div className="personal-intro-links">
        <Link href="/projects">See the work →</Link>
        <Link href="/contact">Get in touch →</Link>
      </div>
    </EntryLayout>
  )
}
