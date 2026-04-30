import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Gallery from '@/components/Gallery'
import Services from '@/components/Services'
import Booking from '@/components/Booking'
import Reviews from '@/components/Reviews'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Services />
        <Booking />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
