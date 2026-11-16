import Image from 'next/image'
import Link from 'next/link'
type Fact = { label: string; value: string; href?: string }
export function ProfileCard({
  name,
  photo,
  location,
  resumeUrl,
  facts = [],
}: {
  name: string
  photo: string
  location: string
  resumeUrl?: string
  facts?: Fact[]
}) {
  return (
    <aside className="personal-profile-card" aria-label="At a glance">
      <figure>
        <div className="personal-portrait">
          <Image
            src={photo}
            alt={name}
            fill
            priority
            sizes="(max-width: 700px) 78vw, 280px"
            className="object-contain object-bottom"
          />
        </div>
        <figcaption>
          {name}
          <span>{location}</span>
        </figcaption>
      </figure>
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
