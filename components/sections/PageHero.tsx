'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface PageHeroProps {
  title: string
  subtitle?: string
  image: string
  portrait?: string
}

export function PageHero({ title, subtitle, image, portrait: _portrait }: PageHeroProps) {
  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image src={image} alt="" fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 flex flex-col items-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-serif text-5xl md:text-7xl text-white mb-4 text-center"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  )
}
