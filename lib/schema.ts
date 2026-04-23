/**
 * Schema.org JSON-LD builders.
 *
 * Each function returns a plain object suitable for JSON.stringify into a
 * <script type="application/ld+json"> tag. These run server-side; output is
 * static once rendered.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
const PERSON_ID = `${SITE_URL}/#bodo`
const WEBSITE_ID = `${SITE_URL}/#website`

const SOCIAL = [
  'https://www.linkedin.com/in/bododesderio/',
  'https://github.com/bododesderio/',
  'https://x.com/bodo_desderio/',
  'https://www.instagram.com/bodo_desderio/',
  'https://www.facebook.com/bododesderio1/',
]

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Bodo Desderio',
    alternateName: 'Bodo',
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    jobTitle: 'Founder & CEO',
    worksFor: [
      { '@type': 'Organization', name: 'Rooibok Technologies Limited', url: 'https://rooibok.com' },
      { '@type': 'Organization', name: 'Kakebe Technologies Limited', url: 'https://www.kakebe.tech' },
    ],
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Kampala International University' },
    address: { '@type': 'PostalAddress', addressLocality: 'Kampala', addressCountry: 'UG' },
    sameAs: SOCIAL,
    knowsAbout: ['Software Engineering', 'Entrepreneurship', 'SEO', 'Community Building', 'STEM Education'],
    description:
      'Ugandan entrepreneur, software engineer, and community leader. Founder & CEO of Rooibok Technologies. Former President, African Youth Congress Uganda Chapter.',
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: 'Bodo Desderio',
    description: 'Personal brand site of Bodo Desderio — founder, engineer, community leader.',
    inLanguage: 'en-UG',
    publisher: { '@id': PERSON_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function profilePageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${SITE_URL}/about`,
    mainEntity: { '@id': PERSON_ID },
    breadcrumb: breadcrumbList([
      { name: 'Home', url: SITE_URL },
      { name: 'About', url: `${SITE_URL}/about` },
    ]),
    name: 'About Bodo Desderio',
    description: 'The story, values, and milestones behind Bodo Desderio\'s work.',
  }
}

export function servicesSchema(services: Array<{ title: string; description: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/services`,
    url: `${SITE_URL}/services`,
    name: 'Services — Bodo Desderio',
    breadcrumb: breadcrumbList([
      { name: 'Home', url: SITE_URL },
      { name: 'Services', url: `${SITE_URL}/services` },
    ]),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: services.map((s, i) => ({
        '@type': 'Service',
        position: i + 1,
        name: s.title,
        description: s.description,
        provider: { '@id': PERSON_ID },
        areaServed: { '@type': 'Country', name: 'Uganda' },
      })),
    },
  }
}

export function imageGallerySchema(items: Array<{ url: string; caption?: string | null; altText?: string | null }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    '@id': `${SITE_URL}/gallery`,
    url: `${SITE_URL}/gallery`,
    name: 'Gallery — Bodo Desderio',
    breadcrumb: breadcrumbList([
      { name: 'Home', url: SITE_URL },
      { name: 'Gallery', url: `${SITE_URL}/gallery` },
    ]),
    creator: { '@id': PERSON_ID },
    image: items.slice(0, 24).map(i => ({
      '@type': 'ImageObject',
      contentUrl: i.url.startsWith('http') ? i.url : `${SITE_URL}${i.url}`,
      caption: i.caption ?? i.altText ?? undefined,
    })),
  }
}

export function blogIndexSchema(posts: Array<{ slug: string; title: string; excerpt: string; publishedAt: Date | null; category: string | null }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog`,
    url: `${SITE_URL}/blog`,
    name: 'Writing — Bodo Desderio',
    description: 'Essays on tech, business, and building in Africa.',
    breadcrumb: breadcrumbList([
      { name: 'Home', url: SITE_URL },
      { name: 'Blog', url: `${SITE_URL}/blog` },
    ]),
    publisher: { '@id': PERSON_ID },
    blogPost: posts.slice(0, 12).map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.excerpt,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: (p.publishedAt ?? new Date()).toISOString(),
      author: { '@id': PERSON_ID },
      articleSection: p.category ?? undefined,
    })),
  }
}

export function contactPageSchema(email: string, location: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE_URL}/contact`,
    url: `${SITE_URL}/contact`,
    name: 'Contact Bodo Desderio',
    breadcrumb: breadcrumbList([
      { name: 'Home', url: SITE_URL },
      { name: 'Contact', url: `${SITE_URL}/contact` },
    ]),
    mainEntity: {
      ...personSchema(),
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email,
        areaServed: location,
        availableLanguage: ['English'],
      },
    },
  }
}

export function breadcrumbList(items: Array<{ name: string; url: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Render helper: takes any schema object (or array of them) and returns the
 * string for use inside <script type="application/ld+json">.
 */
export function ldJson(schema: unknown | unknown[]): string {
  return JSON.stringify(Array.isArray(schema) ? schema : [schema])
}
