'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface Client {
  id: string
  name: string
  logo: { url: string; altText?: string | null } | null
  website?: string | null
}

export function ClientsSection({ clients }: { clients: Client[] }) {
  const withLogos = clients.filter(c => c.logo?.url)
  const displayClients = withLogos.length >= 4 ? withLogos : clients
  const marquee = [...displayClients, ...displayClients]

  return (
    <Section className="relative bg-ink-50 dark:bg-ink-800/40 border-y border-hairline overflow-hidden">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <Eyebrow className="mb-4">Partners & clients</Eyebrow>
          <h2 className="font-serif text-h2 text-ink-900 dark:text-white mb-4">
            Organisations I&apos;ve built with and for.
          </h2>
          <p className="text-ink-500 dark:text-ink-300">
            From youth-led startups to established universities — every partnership has shaped how I think about technology.
          </p>
        </motion.div>
      </Container>

      <div className="relative mask-fade-x">
        <div className="flex gap-20 animate-marquee whitespace-nowrap will-change-transform">
          {marquee.map((client, idx) => (
            <div
              key={`${client.id}-${idx}`}
              className="flex-shrink-0 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition duration-300"
              title={client.name}
            >
              {client.logo?.url ? (
                <div className="relative h-12 w-36">
                  <Image
                    src={client.logo.url}
                    alt={client.logo.altText || client.name}
                    fill
                    className="object-contain"
                    sizes="144px"
                  />
                </div>
              ) : (
                <span className="font-serif text-2xl text-ink-400 dark:text-ink-300">{client.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
