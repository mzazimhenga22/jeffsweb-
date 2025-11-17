import { notFound } from 'next/navigation'

import type { Product } from '@/lib/types'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ProductDetailClient } from './product-detail-client'

async function getProduct(slug: string) {
  const supabase = createSupabaseServerClient()
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

async function getRelatedProducts(category: string, currentProductId: string) {
  const supabase = createSupabaseServerClient()
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
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category, product.id)

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />
}
