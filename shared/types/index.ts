export type Status = 'pending' | 'confirmed' | 'processing' | 'secured' | 'completed' | 'cancelled'
export interface Profile {
  id: string
  full_name: string
  phone: string
  role: 'customer' | 'admin'
  created_at: string
}
export interface Category {
  id: string
  concert_id: string
  name: string
  price: number
  service_fee: number
  quota: number
}
export interface Concert {
  id: string
  slug: string
  title: string
  artist: string
  description: string
  venue: string
  city: string
  starts_at: string
  is_active: boolean
  poster_url?: string | null
  layout_url?: string | null
  ticket_categories: Category[]
}
export interface History {
  id: string
  status: Status
  note: string
  created_at: string
}
export interface Order {
  id: string
  order_number: string
  customer_id: string
  concert_id: string
  category_id: string
  quantity: number
  ticket_price: number
  service_fee: number
  total: number
  status: Status
  created_at: string
  concerts: Concert
  ticket_categories: Category
  order_status_history?: History[]
}
export interface GuestOrderLookup {
  order_number: string
  status: Status
  quantity: number
  total: number
  created_at: string
  concert_title: string
  artist: string
  venue: string
  city: string
  starts_at: string
  category_name: string
  status_history: History[]
}
export interface Testimonial {
  id: string
  customer_name: string
  content: string
  rating: number
  is_published: boolean
}
export interface AdminOverview {
  stats: {
    concerts: number
    customers: number
    orders: number
    pending: number
    processing: number
    secured: number
    completed: number
    revenue: number
  }
  urgent_orders: Order[]
  recent_orders: Order[]
}
