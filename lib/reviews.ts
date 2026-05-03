import { treatwellReviews } from './treatwell-reviews'

const TREATWELL_COUNT = treatwellReviews.length

export async function fetchTotalReviews(): Promise<number> {
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
