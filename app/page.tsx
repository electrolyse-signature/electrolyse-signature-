export const dynamic = 'force-dynamic'

import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Gallery from '@/components/Gallery'
import Services from '@/components/Services'
import Booking from '@/components/Booking'
import Reviews from '@/components/Reviews'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { supabaseAdmin } from '@/lib/supabase'
import { DEFAULT_PRICES } from '@/lib/prices'

export default async function Home() {
  const { data } = await supabaseAdmin.from('service_prices').select('duration_minutes, price')
  const prices: Record<number, number> =
    data && data.length > 0
      ? Object.fromEntries(data.map(r => [r.duration_minutes, r.price]))
      : DEFAULT_PRICES

  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Services prices={prices} />
        <Booking />
        <Reviews />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
