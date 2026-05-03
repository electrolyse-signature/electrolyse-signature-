'use client'

import { useEffect, useState, useRef } from 'react'
import { Review } from '@/lib/types'
import { treatwellReviews } from '@/lib/treatwell-reviews'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'text-amber-400' : 'text-gray-200'}>★</span>
      ))}
    </div>
  )
}

function Badge({ source }: { source: 'google' | 'treatwell' }) {
  return source === 'google'
    ? <span className="text-xs font-sans bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">Google</span>
    : <span className="text-xs font-sans bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full border border-rose-100">Treatwell</span>
}

export default function Reviews({ totalReviews = 86 }: { totalReviews?: number }) {
  const [allReviews, setAllReviews] = useState<Review[]>(treatwellReviews)
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then(({ reviews }) => {
        if (reviews?.length) {
          const combined: Review[] = []
          const max = Math.max(reviews.length, treatwellReviews.length)
          for (let i = 0; i < max; i++) {
            if (reviews[i]) combined.push(reviews[i])
            if (treatwellReviews[i]) combined.push(treatwellReviews[i])
          }
          setAllReviews(combined)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % allReviews.length)
    }, 4000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [paused, allReviews.length])

  const visible = [0, 1, 2].map((offset) => allReviews[(activeIndex + offset) % allReviews.length]).filter(Boolean)

  return (
    <section id="avis" className="section-padding bg-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">Témoignages</p>
          <h2 className="section-title">Ce que disent nos clientes</h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-amber-400 text-2xl">★★★★★</span>
            <span className="font-serif text-3xl text-text-primary">5/5</span>
            <span className="font-sans text-text-secondary">· {totalReviews}+ avis vérifiés</span>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {visible.map((review, i) => (
            <div key={`${review.id}-${i}`} className="bg-white rounded-2xl p-6 border border-beige shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <Stars rating={review.rating} />
                <Badge source={review.source} />
              </div>
              <p className="font-sans text-text-secondary text-sm leading-relaxed mb-6 line-clamp-4">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex justify-between items-center">
                <span className="font-sans text-text-primary text-sm">{review.author}</span>
                <span className="font-sans text-text-secondary text-xs">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {allReviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all ${i === activeIndex ? 'bg-blush w-4' : 'bg-beige w-2'}`}
              aria-label={`Avis ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex justify-center gap-8 mt-8 opacity-50">
          <span className="font-sans text-xs text-text-secondary">✓ Avis vérifiés Google</span>
          <span className="font-sans text-xs text-text-secondary">✓ Avis vérifiés Treatwell</span>
        </div>
      </div>
    </section>
  )
}
