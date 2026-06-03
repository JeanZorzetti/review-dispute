import { Header } from '@/src/components/landing/Header'
import { Hero } from '@/src/components/landing/Hero'
import { HonestPromise } from '@/src/components/landing/HonestPromise'
import { Problem } from '@/src/components/landing/Problem'
import { HowItWorks } from '@/src/components/landing/HowItWorks'
import { Pricing } from '@/src/components/landing/Pricing'
import { Faq } from '@/src/components/landing/Faq'
import { Footer } from '@/src/components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-bg text-white">
      <Header />
      <Hero />
      <HonestPromise />
      <Problem />
      <HowItWorks />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  )
}
