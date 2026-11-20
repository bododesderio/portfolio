import { pageMetadata } from '@/lib/seo/page-metadata'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/data/db'
import { getPersonalProfile } from '@/lib/data/profile'
import { getField } from '@/lib/data/content'
import { EntryLayout, EntrySection } from '@/components/personal/EntryLayout'
import { ProfileCard } from '@/components/personal/ProfileCard'
import { HomeHero } from '@/components/personal/HomeHero'
import { PersonalIcon } from '@/components/personal/PersonalIcon'
import { PhotoCollection } from '@/components/personal/PhotoCollection'
import { Zoomable } from '@/components/personal/Lightbox'
import { isCutout } from '@/lib/domain/image-alpha'
import {
  PersonalTimeline,
  PressList,
  RichText,
  WorkRows,
  WritingRows,
} from '@/components/personal/ProfileContent'
export const dynamic = 'force-dynamic'
export function generateMetadata() {
  return pageMetadata({
    page: 'home',
    title: "Bodo Desderio · Software engineer & SEO specialist in Uganda",
    description:
      "Bodo Desderio is a Ugandan software engineer and SEO specialist and the founder of Rooibok Technologies. His biography, work, writing and photographs.",
    path: '/',
  })
}
export default async function HomePage() {
  const [profile, projects, posts, photos, press, services, heroImages] = await Promise.all(
    [
      getPersonalProfile(),
      prisma.project.findMany({
        where: { visible: true },
        orderBy: [{ featured: 'desc' }, { order: 'asc' }],
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          status: true,
        },
      }),
      prisma.blogPost.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          publishedAt: true,
        },
      }),
      prisma.galleryItem.findMany({
        orderBy: [{ featured: 'desc' }, { order: 'asc' }],
        take: 6,
        include: { media: { select: { url: true, altText: true } } },
      }),
      prisma.pressItem.findMany({
        where: { visible: true },
        orderBy: { order: 'asc' },
        take: 2,
      }),
      prisma.service.findMany({
        where: { visible: true },
        orderBy: { order: 'asc' },
        take: 6,
        select: { id: true, title: true },
      }),
      prisma.heroImage.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
        select: { media: { select: { url: true } } },
      }),
    ]
  )
  const heroField = (key: string) => getField(profile.home, `hero.${key}`)
  const heroSlides = await Promise.all(
    heroImages.map(async ({ media }) => ({
      src: media.url,
      kind: (await isCutout(media.url)) ? ('portrait' as const) : ('photo' as const),
    })),
  )
  // The first three gallery photos fill the Photographs section; the next three
  // sit beside the profile card, so the two never repeat each other.
  const featuredPhotos = photos.slice(0, 3)
  const introPhotos = photos.slice(3, 6)
  const contents = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'story', label: 'My story' },
    ...(projects.length ? [{ id: 'work', label: 'Work & ventures' }] : []),
    { id: 'community', label: 'Community' },
    ...(profile.interests
      ? [{ id: 'interests', label: 'Interests & curiosities' }]
      : []),
    ...(posts.length ? [{ id: 'writing', label: 'Writing' }] : []),
    ...(photos.length ? [{ id: 'photographs', label: 'Photographs' }] : []),
    ...(press.length ? [{ id: 'mentions', label: 'In the world' }] : []),
    { id: 'elsewhere', label: 'Elsewhere' },
  ]
  return (
    <>
    <HomeHero
      name={profile.name}
      role={profile.role}
      tagline={profile.tagline}
      photo={profile.photo}
      backdrops={heroSlides}
      primary={{
        label: heroField('cta_primary_label') || 'Get in touch',
        href: heroField('cta_primary_url') || '/contact',
      }}
      secondary={{
        label: heroField('cta_secondary_label') || 'See my work',
        href: heroField('cta_secondary_url') || '/projects',
      }}
    />
    <EntryLayout contents={contents}>
      <div className="personal-overview" id="introduction">
        <div className="personal-introduction">
          {profile.introduction[0] ? (
            <RichText html={profile.introduction[0]} />
          ) : (
            <p>
              I’m a software engineer, entrepreneur, and community builder based
              in {profile.location}.
            </p>
          )}
          <p>
            This site keeps my biography, the companies and software I work
            on, what I write about, and photographs from tech camps, outreach
            days and time with friends.
          </p>
          <div className="personal-intro-links">
            <Link href="/about">
              More about me <span aria-hidden="true">→</span>
            </Link>
            <Link href="/contact">
              Say hello <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="personal-interests-note">
            <PersonalIcon name="interests" />
            <p>
              {getField(profile.home, 'bio.pullquote') ||
                'Technology, people, and a curiosity about the world.'}
            </p>
          </div>
          {introPhotos.length > 0 && (
            <ul className="personal-intro-photos" aria-label="Recent photographs">
              {introPhotos.map((photo) => (
                <li key={photo.id}>
                  <Zoomable
                    group="home-photos"
                    src={photo.media.url}
                    alt={
                      photo.caption ||
                    (photo.media.altText && !/\.(jpe?g|png|webp|gif|avif)$/i.test(photo.media.altText)
                      ? photo.media.altText
                      : 'Photograph from the gallery')
                    }
                  >
                    <Image
                      src={photo.media.url}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 30vw, 200px"
                      className="object-cover"
                    />
                  </Zoomable>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ProfileCard
          name={profile.name}
          photo={getField(profile.home, 'profile.photo') || undefined}
          caption={profile.role}
          location={profile.location}
          resumeUrl={profile.resumeUrl}
          facts={[
            { label: 'Based in', value: profile.location },
            {
              label: 'Known for',
              value: 'Engineering, entrepreneurship & community',
            },
            {
              label: 'Currently',
              value: profile.roles[0]?.org || 'Rooibok Technologies',
              href: profile.roles[0]?.url || '/projects',
            },
          ]}
        />
      </div>
      <EntrySection
        id="story"
        title={getField(profile.home, 'story.heading') || 'A little of my story'}
        href="/about"
        linkLabel="Read the full biography"
      >
        {getField(profile.home, 'story.body') ? (
          <RichText html={getField(profile.home, 'story.body')} />
        ) : (
          <PersonalTimeline
            compact
            items={(profile.timeline.some((item) => item.featured)
              ? profile.timeline.filter((item) => item.featured)
              : profile.timeline
            ).slice(-4)}
          />
        )}
      </EntrySection>
      {projects.length > 0 && (
        <EntrySection
          id="work"
          title="Work & ventures"
          href="/projects"
          linkLabel="All my work"
        >
          <WorkRows items={projects} />
          {services.length > 0 && (
            <div className="personal-topics">
              <span>Areas I work in</span>
              {services.map((service) => (
                <Link href="/services" key={service.id}>
                  {service.title}
                </Link>
              ))}
            </div>
          )}
        </EntrySection>
      )}
      <EntrySection
        id="community"
        title="Beyond the work"
        href="/about#community"
        linkLabel="Community & public life"
      >
        <div className="personal-community-snippet">
          <span className="personal-section-symbol">
            <PersonalIcon name="community" />
          </span>
          <div>
            {profile.introduction[2] ? (
              <RichText html={profile.introduction[2]} />
            ) : (
              <p>{getField(profile.home, 'community.body')}</p>
            )}
          </div>
        </div>
      </EntrySection>
      {profile.interests && (
        <EntrySection
          id="interests"
          title="The things that keep me curious"
          href="/about#interests"
          linkLabel="Beyond the biography"
        >
          <p className="personal-section-intro">
            {profile.interests
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()}
          </p>
        </EntrySection>
      )}
      {posts.length > 0 && (
        <EntrySection
          id="writing"
          title="From my notebook"
          href="/blog"
          linkLabel="All writing"
        >
          <WritingRows items={posts} />
          {profile.socials.find((item) => item.label === 'Medium') && (
            <p className="personal-footnote">
              I also write on{' '}
              <a
                href={
                  profile.socials.find((item) => item.label === 'Medium')!.href
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Medium ↗
              </a>
              .
            </p>
          )}
        </EntrySection>
      )}
      {photos.length > 0 && (
        <EntrySection
          id="photographs"
          title="Life in pictures"
          href="/gallery"
          linkLabel="Open the gallery"
        >
          <p className="personal-section-intro">
            Tech camps, outreach days, team work and time with friends.
          </p>
          <PhotoCollection items={featuredPhotos} />
        </EntrySection>
      )}
      {press.length > 0 && (
        <EntrySection
          id="mentions"
          title="Out in the world"
          href="/about#mentions"
          linkLabel="More mentions & contributions"
        >
          <PressList items={press} />
        </EntrySection>
      )}
      <EntrySection id="elsewhere" title="Elsewhere on the internet">
        <p className="personal-section-intro">
          Other places to find my work, follow my thoughts, or get in touch.
        </p>
        <div className="personal-elsewhere">
          {profile.socials.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
          <Link href="/contact">
            Contact <span aria-hidden="true">→</span>
          </Link>
        </div>
      </EntrySection>
    </EntryLayout>
    </>
  )
}
