'use client'

import { motion } from 'framer-motion'
import { CONNECT_URL, HERO } from './site-config'

export function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-20 text-center md:py-28">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-4xl font-black uppercase leading-[1.05] tracking-tight md:text-6xl"
      >
        {HERO.h1}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        className="mx-auto mt-5 max-w-2xl text-base text-muted md:text-lg"
      >
        {HERO.sub}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        className="mt-9"
      >
        <a
          href={CONNECT_URL}
          className="inline-block rounded-md bg-accent px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-105"
        >
          {HERO.cta}
        </a>
      </motion.div>
    </section>
  )
}
