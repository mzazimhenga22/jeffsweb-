export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'on transit'
  | 'delivered'
  | 'cancelled'

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
          vendor_id: string | null
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
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['product_reviews']['Row']>
        Update: Partial<Database['public']['Tables']['product_reviews']['Row']>
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          vendor_id: string | null
          salesperson_id: string | null
          product_id: string | null
          quantity: number
          total: number
          status: OrderStatus
          order_date: string
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
      vendor_profiles: {
        Row: {
          id: string
          user_id: string | null
          store_name: string
          status: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['vendor_profiles']['Row']>
        Update: Partial<Database['public']['Tables']['vendor_profiles']['Row']>
        Relationships: []
      }
      vendors: {
        Row: {
          id: string
          business_name: string
          business_description: string | null
        }
        Insert: {
          id: string
          business_name: string
          business_description?: string | null
        }
        Update: Partial<Database['public']['Tables']['vendors']['Row']>
        Relationships: [
          {
            foreignKeyName: 'vendors_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      salesperson_profiles: {
        Row: {
          id: string
          user_id: string | null
          commission_rate: number | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['salesperson_profiles']['Row']>
        Update: Partial<Database['public']['Tables']['salesperson_profiles']['Row']>
        Relationships: []
      }
      vendor_staff: {
        Row: {
          id: string
          vendor_id: string
          salesperson_id: string
          invited_by: string | null
          role: string
          status: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['vendor_staff']['Row']>
        Update: Partial<Database['public']['Tables']['vendor_staff']['Row']>
        Relationships: []
      }
      banners: {
        Row: {
          id: string
          title: string | null
          subtitle: string | null
          cta_text: string | null
          cta_url: string | null
          image_url: string | null
          active: boolean | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['banners']['Row']>
        Update: Partial<Database['public']['Tables']['banners']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
