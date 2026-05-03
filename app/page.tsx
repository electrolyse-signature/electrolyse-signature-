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
import { supabaseAdmin } from '@/lib/supabase'
import { DEFAULT_PRICES } from '@/lib/prices'
import { treatwellReviews } from '@/lib/treatwell-reviews'

const TREATWELL_COUNT = treatwellReviews.length

async function fetchTotalReviews(): Promise<number> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID
  if (!apiKey || !placeId) return 86
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=user_ratings_total&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    )
    const json = await res.json()
    const google = json.result?.user_ratings_total ?? 0
    return google + TREATWELL_COUNT
  } catch {
    return 86
  }
}

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
        <About />
        <Gallery />
        <Services prices={prices} />
        <Booking />
        <Reviews />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
