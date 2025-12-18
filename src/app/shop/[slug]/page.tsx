import { notFound } from 'next/navigation'

import type { Product, ProductReview } from '@/lib/types'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ProductDetailClient } from './product-detail-client'

type ProductWithRatings = Product & { product_reviews?: { rating: number }[] }
const mapRatings = (products: ProductWithRatings[]) =>
  products.map((product) => {
    const ratings = product.product_reviews?.map((r) => r.rating) ?? []
    const reviewCount = ratings.length
    const averageRating = reviewCount ? ratings.reduce((acc, rating) => acc + rating, 0) / reviewCount : 0
    return { ...product, averageRating, reviewCount }
  })

async function getProduct(slug: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', slug)
    .or('is_deleted.is.null,is_deleted.eq.false')
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data as Product | null
}

async function getRelatedProducts(category: string, currentProductId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_reviews(rating)')
    .eq('category', category)
    .not('id', 'eq', currentProductId)
    .limit(4)

  if (error) {
    console.error('Error fetching related products:', error)
    return []
  }

  return mapRatings((data as ProductWithRatings[]) ?? [])
}

async function getProductReviews(productId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching product reviews:', error)
    return []
  }

  return (data as ProductReview[]) || []
}

type ProductPageParams = Promise<{ slug: string }>

export default async function ProductDetailPage({ params }: { params: ProductPageParams }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const [reviews, relatedProducts] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product.category, product.id),
  ])

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0

  const productWithRating: Product = {
    ...product,
    averageRating,
    reviewCount: reviews.length,
  }

  return (
    <ProductDetailClient
      product={productWithRating}
      relatedProducts={relatedProducts}
      initialReviews={reviews}
    />
  )
}
