'use client'

import * as React from 'react'
import Image from 'next/image'
import { Check, Heart, Minus, Plus, Share2, Facebook, Twitter, Star } from 'lucide-react'

import { MainLayout } from '@/components/main-layout'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ProductCard } from '@/components/product-card'
import { cn } from '@/lib/utils'
import { useCart } from '@/context/cart-context'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { useWishlist } from '@/context/wishlist-context'
import { useAuth } from '@/context/auth-context'
import type { Product, ProductReview } from '@/lib/types'
import { Textarea } from '@/components/ui/textarea'

interface ProductDetailClientProps {
  product: Product
  relatedProducts: Product[]
  initialReviews: ProductReview[]
}

export function ProductDetailClient({
  product,
  relatedProducts,
  initialReviews,
}: ProductDetailClientProps) {
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null)
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null)
  const [quantity, setQuantity] = React.useState(1)
  const [activeImage, setActiveImage] = React.useState<string | null>(null)
  const [reviews, setReviews] = React.useState<ProductReview[]>(initialReviews)
  const [reviewRating, setReviewRating] = React.useState(5)
  const [reviewComment, setReviewComment] = React.useState('')
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false)

  const { addToCart } = useCart()
  const { toast } = useToast()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { supabase, session } = useAuth()

  React.useEffect(() => {
    if (product.colors?.length) {
      setSelectedColor(product.colors[0])
    }
    if (product.sizes?.length) {
      setSelectedSize(product.sizes[0])
    }
    if (product.image_url) {
      setActiveImage(product.image_url)
    }
  }, [product])

  const averageRating = React.useMemo(() => {
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return total / reviews.length
  }, [reviews])

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Please select a size.',
      })
      return
    }

    addToCart({
      ...product,
      quantity,
      size: selectedSize,
      color: selectedColor,
    })

    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleWishlistToggle = () => {
    toggleWishlist(product)
  }

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) {
      toast({
        variant: 'destructive',
        title: 'Login required',
        description: 'Please sign in to leave a review.',
      })
      return
    }

    try {
      setIsSubmittingReview(true)
      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: product.id,
          user_id: session.user.id,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        })
        .select()
        .single()

      if (error || !data) {
        throw error
      }

      setReviews((prev) => [data as ProductReview, ...prev])
      setReviewComment('')
      toast({
        title: 'Thanks for your feedback!',
        description: 'Your review has been recorded.',
      })
    } catch (error) {
      console.error('Error saving review:', error)
      toast({
        variant: 'destructive',
        title: 'Could not save your review',
        description: 'Please try again in a moment.',
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const getStockMessage = () => {
    if (product.stock === 0) return { text: 'Out of Stock', className: 'text-destructive' }
    if (product.stock < 10) return { text: `Only ${product.stock} left!`, className: 'text-amber-600' }
    return { text: 'In Stock', className: 'text-green-600' }
  }

  const mainImage = activeImage
  const reviewCount = reviews.length
  const ratingOptions = [1, 2, 3, 4, 5] as const

  return (
    <MainLayout backgroundImage={mainImage || undefined}>
      <div className="container mx-auto max-w-screen-xl py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl h-full max-h-[600px] aspect-square">
              {mainImage && (
                <Image
                  src={mainImage}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <Card className="p-8 bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl">
              <Badge variant="secondary" className="w-fit">{product.category}</Badge>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground font-headline">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <div className={cn('font-medium', getStockMessage().className)}>{getStockMessage().text}</div>
              </div>

              <p className="mt-6 text-4xl font-bold">${product.price.toFixed(2)}</p>
            </Card>

            <Separator className="my-8" />

            <Card className="p-8 bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl">
              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium">
                    Color: <span className="text-muted-foreground">{selectedColor}</span>
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          'h-8 w-8 rounded-full border-2 transition-transform duration-200 ease-in-out',
                          selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'ring-1 ring-border'
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select color ${color}`}
                      >
                        {selectedColor === color && (
                          <Check className="h-5 w-5 text-white mix-blend-difference" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium">Size</h3>
                  <Select onValueChange={setSelectedSize} defaultValue={selectedSize || undefined}>
                    <SelectTrigger className="w-[180px] mt-2">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-sm font-medium">Quantity</h3>
                <div className="mt-2 flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <div className="mt-auto grid grid-cols-1 gap-4 pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                <Button size="lg" className="text-lg py-7" onClick={handleAddToCart} disabled={product.stock === 0}>
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button size="lg" variant="outline" className="text-lg py-7 h-auto" onClick={handleWishlistToggle}>
                  <Heart className={cn('h-6 w-6', isInWishlist(product.id) && 'fill-red-500 text-red-500')} />
                </Button>
              </div>
              <Button size="lg" variant="secondary" className="text-lg py-7" disabled={product.stock === 0}>
                Buy Now
              </Button>
            </div>

            <div className="mt-8 rounded-3xl border bg-card/60 backdrop-blur-xl p-6 border-border/20">
              <Accordion type="single" collapsible defaultValue="description">
                <AccordionItem value="description">
                  <AccordionTrigger className="text-lg font-medium">Description</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground min-h-[4rem]">
                    {product.description}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping" className="border-b-0">
                  <AccordionTrigger className="text-lg font-medium">Shipping &amp; Returns</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    Free shipping on orders over $50. Easy returns within 30 days.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <Card className="mt-8 p-6 bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-4xl font-bold">
                      {reviewCount === 0 ? '0.0' : averageRating.toFixed(1)}
                    </span>
                    <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reviewCount === 0
                      ? 'No reviews yet'
                      : `${reviewCount} review${reviewCount === 1 ? '' : 's'}`}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-8 lg:grid-cols-2">
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Your Rating</p>
                    <div className="flex items-center gap-2">
                      {ratingOptions.map((rating) => (
                        <button
                          type="button"
                          key={rating}
                          aria-label={`Rate ${rating} star${rating === 1 ? '' : 's'}`}
                          onClick={() => setReviewRating(rating)}
                          className="p-2 rounded-full border border-border/40 hover:bg-muted transition-colors"
                        >
                          <Star
                            className={cn(
                              'h-6 w-6',
                              rating <= reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                            )}
                            fill={rating <= reviewRating ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder="Share your thoughts about this product..."
                    rows={4}
                  />
                  {!session && (
                    <p className="text-xs text-muted-foreground">
                      You need to be logged in to submit a review.
                    </p>
                  )}
                  <Button type="submit" disabled={isSubmittingReview || !session}>
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>

                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Be the first to leave a review for this product.
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-border/30 p-4 bg-background/50 backdrop-blur"
                      >
                        <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-primary">
                          {ratingOptions.map((star) => (
                            <Star
                              key={`${review.id}-${star}`}
                              className={cn(
                                'h-4 w-4',
                                star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                              )}
                              fill={star <= review.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-foreground">
                          {review.comment || 'No comment provided.'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            <Card className="mt-8 p-6 bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl">
              <div className="flex items-center gap-4">
                <Share2 className="text-muted-foreground" />
                <Button variant="ghost" size="icon">
                  <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
                <Button variant="ghost" size="icon">
                  <svg className="h-5 w-5 text-muted-foreground hover:text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.545 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 0 1 .069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.905.448 2.91.448 5.523 0 10-4.477 10-10S17.523 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-24">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
