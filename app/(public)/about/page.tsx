import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/data/db'
import { getPersonalProfile } from '@/lib/data/profile'
import { getField } from '@/lib/data/content'
import { ldJson, profilePageSchema } from '@/lib/schema'
import {
  EntryHeading,
  EntryLayout,
  EntrySection,
} from '@/components/personal/EntryLayout'
import { ProfileCard } from '@/components/personal/ProfileCard'
import {
  PersonalTimeline,
  PressList,
  RichText,
} from '@/components/personal/ProfileContent'
import { PhotoCollection } from '@/components/personal/PhotoCollection'
export const dynamic = 'force-dynamic'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
export const metadata: Metadata = {
  title: 'About',
  description:
    'The biography of Bodo Desderio: personal history, education, career, community, interests, and the chapters along the way.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: { title: 'About Bodo Desderio', type: 'profile', url: '/about' },
}
export default async function AboutPage() {
  const [profile, press, photos] = await Promise.all([
    getPersonalProfile(),
    prisma.pressItem.findMany({
      where: { visible: true },
      orderBy: { order: 'asc' },
    }),
    prisma.galleryItem.findMany({
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
      take: 3,
      include: { media: { select: { url: true, altText: true } } },
    }),
  ])
  const contents = [
    { id: 'biography', label: 'Biography' },
    { id: 'timeline', label: 'Life & history' },
    { id: 'experience', label: 'Work & experience' },
    { id: 'community', label: 'Community' },
    { id: 'values', label: 'What matters to me' },
    ...(profile.interests
      ? [{ id: 'interests', label: 'Interests & curiosities' }]
      : []),
    ...(photos.length ? [{ id: 'photographs', label: 'Photographs' }] : []),
    ...(press.length
      ? [{ id: 'mentions', label: 'Mentions & contributions' }]
      : []),
  ]
  return (
    <EntryLayout contents={contents}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(profilePageSchema()) }}
      />
      <EntryHeading
        eyebrow="The person behind the name"
        title="About me"
        description="My story, so far."
      />
      <div className="personal-overview">
        <div className="personal-introduction">
          <p className="personal-welcome">I’m {profile.name}.</p>
          {profile.introduction.slice(0, 2).map((paragraph, index) => (
            <RichText key={index} html={paragraph} />
          ))}
          <p>
            This page brings the different parts of my life together: where I’ve
            been, what I do, and the things that keep me curious.
          </p>
          <div className="personal-intro-links">
            <Link href="/projects">Explore my work ↗</Link>
            <Link href="/contact">Get in touch ↗</Link>
          </div>
        </div>
        <ProfileCard
          name={profile.name}
          photo={profile.photo}
          location={profile.location}
          resumeUrl={profile.resumeUrl}
          facts={[
            { label: 'Home', value: profile.location },
            { label: 'Education', value: 'Kampala International University' },
            {
              label: 'Interests',
              value: 'Technology, people & the world around us',
            },
          ]}
        />
      </div>
      <EntrySection id="biography" title="Biography">
        {profile.biography ? (
          <RichText html={profile.biography} />
        ) : (
          profile.introduction.map((paragraph, index) => (
            <RichText key={index} html={paragraph} />
          ))
        )}
      </EntrySection>
      <EntrySection id="timeline" title="Life & history">
        <p className="personal-section-intro">
          A chronological account of the chapters that shaped me.
        </p>
        <PersonalTimeline items={profile.timeline} />
      </EntrySection>
      <EntrySection
        id="experience"
        title="Work & experience"
        href="/projects"
        linkLabel="The work itself"
      >
        <div className="personal-experience-list">
          {profile.roles.map((role, index) => (
            <div key={index}>
              <p className="personal-meta">{role.period}</p>
              <h3>{role.title}</h3>
              <p>{role.org}</p>
            </div>
          ))}
        </div>
      </EntrySection>
      <EntrySection id="community" title="Community & public life">
        {profile.introduction[2] && <RichText html={profile.introduction[2]} />}
        <p>{getField(profile.home, 'community.body')}</p>
        <p>
          Photographs, reflections, and contributions from this part of my life
          are collected throughout this archive.
        </p>
        <Link href="/gallery" className="personal-inline-link">
          Browse the photographs ↗
        </Link>
      </EntrySection>
      <EntrySection id="values" title="What matters to me">
        {getField(profile.about, 'mission.statement') && (
          <blockquote className="personal-pullquote">
            {getField(profile.about, 'mission.statement')}
          </blockquote>
        )}
        <div className="personal-values">
          {profile.values.map((value) => (
            <div key={value.title}>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </EntrySection>
      {profile.interests && (
        <EntrySection id="interests" title="Interests & curiosities">
          <RichText html={profile.interests} />
        </EntrySection>
      )}
      {photos.length > 0 && (
        <EntrySection
          id="photographs"
          title="Some moments along the way"
          href="/gallery"
          linkLabel="The full gallery"
        >
          <PhotoCollection items={photos} />
        </EntrySection>
      )}
      {press.length > 0 && (
        <EntrySection id="mentions" title="Mentions & contributions">
          <PressList items={press} />
        </EntrySection>
      )}
    </EntryLayout>
  )
}
