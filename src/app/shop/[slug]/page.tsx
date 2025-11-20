import { notFound } from 'next/navigation'

import type { Product, User } from '@/lib/types'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ProductDetailClient } from './product-detail-client'

type SupabaseClient = ReturnType<typeof createSupabaseServerClient>

async function getVendorNameMap(supabase: SupabaseClient, vendorIds: string[]) {
  if (vendorIds.length === 0) return new Map<string, string>()

  const { data, error } = await supabase
    .from('users')
    .select('id, name')
    .in('id', vendorIds)

  if (error) {
    console.error('Error fetching vendors:', error)
    return new Map<string, string>()
  }

  const vendorMap = new Map<string, string>()
  ;(data as User[] | null)?.forEach((vendor) => {
    vendorMap.set(vendor.id, vendor.name)
  })

  return vendorMap
}

async function addVendorNames(supabase: SupabaseClient, products: Product[]) {
  const vendorIds = Array.from(
    new Set(
      products
        .map((product) => product.vendorId)
        .filter((id): id is string => Boolean(id))
    )
  )

  const vendorMap = await getVendorNameMap(supabase, vendorIds)

  return products.map((product) => ({
    ...product,
    vendorName: vendorMap.get(product.vendorId ?? '') ?? (product.vendorId ? 'Unknown vendor' : 'Admin'),
  }))
}

async function getProduct(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', slug)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data as Product | null
}

async function getRelatedProducts(supabase: SupabaseClient, category: string, currentProductId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .not('id', 'eq', currentProductId)
    .limit(4)

  if (error) {
    console.error('Error fetching related products:', error)
    return []
  }

  return (data as Product[]) || []
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient()
  const product = await getProduct(supabase, params.slug)

  if (!product) {
    notFound()
  }

  const [productWithVendor] = await addVendorNames(supabase, [product])
  const relatedProducts = await getRelatedProducts(supabase, product.category, product.id)
  const relatedWithVendors = await addVendorNames(supabase, relatedProducts)

  return <ProductDetailClient product={productWithVendor} relatedProducts={relatedWithVendors} />
}
