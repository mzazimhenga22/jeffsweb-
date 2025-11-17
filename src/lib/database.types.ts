export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'On Transit'
  | 'Delivered'
  | 'Cancelled'

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          price: number
          category: string
          sizes: string[]
          colors: string[]
          stock: number
          image_url: string | null
          vendorId: string | null
        }
        Insert: Partial<Database['public']['Tables']['products']['Row']>
        Update: Partial<Database['public']['Tables']['products']['Row']>
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          image_url: string | null
        }
        Insert: Partial<Database['public']['Tables']['categories']['Row']>
        Update: Partial<Database['public']['Tables']['categories']['Row']>
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          rating: number
          text: string
        }
        Insert: Partial<Database['public']['Tables']['testimonials']['Row']>
        Update: Partial<Database['public']['Tables']['testimonials']['Row']>
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          userId: string
          vendorId: string | null
          salespersonId: string | null
          productId: string | null
          quantity: number
          total: number
          status: OrderStatus
          orderDate: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['orders']['Row']>
        Update: Partial<Database['public']['Tables']['orders']['Row']>
        Relationships: []
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'customer' | 'vendor' | 'admin' | 'salesperson'
          avatarId: string | null
          avatar_url: string | null
          createdAt: string
          phone: string | null
        }
        Insert: Partial<Database['public']['Tables']['users']['Row']>
        Update: Partial<Database['public']['Tables']['users']['Row']>
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
