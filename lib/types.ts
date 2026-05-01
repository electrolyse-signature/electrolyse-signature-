export interface Review {
  id: string
  author: string
  rating: number
  text: string
  date: string
  source: 'google' | 'treatwell'
}

export interface Service {
  name: string
  duration: string
  price: string
  note?: string
  calLink?: string
  calNamespace?: string
}

export interface GooglePlacesResponse {
  result: {
    rating: number
    user_ratings_total: number
    reviews: Array<{
      author_name: string
      rating: number
      text: string
      relative_time_description: string
    }>
  }
}
