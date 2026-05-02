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

export interface Cancellation {
  id: string
  email: string
  name: string
  booking_id: string
  cancelled_at: string
  reason: string | null
}

export interface BlockedClient {
  id: string
  email: string
  blocked_at: string
  notes: string | null
}

export interface ClientSummary {
  email: string
  name: string
  cancellation_count: number
  last_cancelled_at: string
  is_blocked: boolean
  note: string | null
}

export interface ClientHistory {
  phone: string | null
  totalBookings: number
  presentCount: number
  absentCount: number
  services: Array<{ name: string; count: number }>
  firstBookingDate: string | null
  lastBookingDate: string | null
}
