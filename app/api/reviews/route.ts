import { NextResponse } from 'next/server'
import { GooglePlacesResponse, Review } from '@/lib/types'

export const revalidate = 86400

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  if (!apiKey || !placeId) {
    return NextResponse.json({ reviews: [], rating: 5, total: 86 })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&language=fr&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    )

    if (!response.ok) {
      return NextResponse.json({ reviews: [], rating: 5, total: 86 })
    }

    const data: GooglePlacesResponse = await response.json()
    const { result } = data

    const reviews: Review[] = (result.reviews || []).map((r, i) => ({
      id: `google-${i}`,
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      date: r.relative_time_description,
      source: 'google' as const,
    }))

    return NextResponse.json({
      reviews,
      rating: result.rating,
      total: result.user_ratings_total,
    })
  } catch {
    return NextResponse.json({ reviews: [], rating: 5, total: 86 })
  }
}
