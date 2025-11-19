import type { Database, OrderStatus as DatabaseOrderStatus } from './database.types'

type ProductRow = Database['public']['Tables']['products']['Row']
type ProductReviewRow = Database['public']['Tables']['product_reviews']['Row']

export type Product = ProductRow & {
  imageIds?: string[]
  reviews?: ProductReview[]
  reviewCount?: number
  averageRating?: number
}

export type CartItem = Product & {
  quantity: number
  size: string | null
  color: string | null
}

export type ProductReview = ProductReviewRow
export type Category = Database['public']['Tables']['categories']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderStatus = DatabaseOrderStatus
export type User = Database['public']['Tables']['users']['Row']

export type VendorProfile = Database['public']['Tables']['vendor_profiles']['Row']
export type SalespersonProfile = Database['public']['Tables']['salesperson_profiles']['Row']
export type VendorStaff = Database['public']['Tables']['vendor_staff']['Row']

export type SalesDatum = {
  name: string
  sales: number
}
