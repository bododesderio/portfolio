import Image from 'next/image'
import { Zoomable } from '@/components/personal/Lightbox'
import Link from 'next/link'
type Fact = { label: string; value: string; href?: string }
export function ProfileCard({
  name,
  photo,
  location,
  caption,
  resumeUrl,
  facts = [],
}: {
  name: string
  /** Omitted where the page already shows the portrait, such as under the home hero. */
  photo?: string
  location: string
  /** Line under the name in the photo caption; defaults to the location. */
  caption?: string
  resumeUrl?: string
  facts?: Fact[]
}) {
  return (
    <aside className="personal-profile-card" aria-label="At a glance">
      {photo && (
        <figure className="personal-profile-figure">
          <div className="personal-portrait">
            <Zoomable group="profile" src={photo} alt={name}>
              <Image
                src={photo}
                alt={name}
                fill
                priority
                sizes="(max-width: 700px) 78vw, 320px"
                className="object-cover object-top"
              />
            </Zoomable>
          </div>
          <figcaption>
            {name}
            <span>{caption ?? location}</span>
          </figcaption>
        </figure>
      )}
      <div className="personal-facts">
        <p className="personal-eyebrow">At a glance</p>
        <dl>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>
                {fact.href ? (
                  <Link href={fact.href}>{fact.value}</Link>
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          ))}
        </dl>
        {resumeUrl && (
          <a
            className="personal-small-link"
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read my résumé <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </aside>
  )
}
