import type { Database, OrderStatus as DatabaseOrderStatus } from './database.types'

export type ProductReview = {
  id: string
  rating: number
  comment?: string
  createdAt?: string
}

type ProductRow = Database['public']['Tables']['products']['Row']

export type Product = ProductRow & {
  imageIds?: string[]
  reviews?: ProductReview[]
  reviewCount?: number
  vendorName?: string | null
}

export type CartItem = Product & {
  quantity: number
  size: string | null
  color: string | null
}

export type Category = Database['public']['Tables']['categories']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderStatus = DatabaseOrderStatus
export type User = Database['public']['Tables']['users']['Row']

export type Vendor = {
  id: string
  name: string
  status: 'Pending' | 'Approved' | 'Rejected'
  contactEmail?: string
  phone?: string
}

export type SalesDatum = {
  name: string
  sales: number
}
