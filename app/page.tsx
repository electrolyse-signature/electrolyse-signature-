import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Gallery from '@/components/Gallery'
import Services from '@/components/Services'
import Booking from '@/components/Booking'
import Reviews from '@/components/Reviews'
import FAQ from '@/components/FAQ'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import InstagramButton from '@/components/InstagramButton'
import { supabaseAdmin } from '@/lib/supabase'
import { DEFAULT_PRICES } from '@/lib/prices'
import { fetchTotalReviews } from '@/lib/reviews'

export default async function Home() {
  const [{ data }, totalReviews] = await Promise.all([
    supabaseAdmin.from('service_prices').select('duration_minutes, price'),
    fetchTotalReviews(),
  ])

  const prices: Record<number, number> =
    data && data.length > 0
      ? Object.fromEntries(data.map(r => [r.duration_minutes, r.price]))
      : DEFAULT_PRICES

  return (
    <>
      <Navigation />
      <main>
        <Hero totalReviews={totalReviews} />
        <About totalReviews={totalReviews} />
        <Gallery />
        <Services prices={prices} />
        <Booking />
        <Reviews totalReviews={totalReviews} />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <InstagramButton />
      <WhatsAppButton />
    </>
  )
}
