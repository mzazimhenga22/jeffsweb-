
'use client';

import Image from 'next/image';
import { Star, Check, Minus, Plus, Loader, Heart, Facebook, Twitter, Pinterest, Share2 } from 'lucide-react';
import * as React from 'react';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { products, vendors } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { notFound } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ProductCard } from '@/components/product-card';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateProductStory } from '@/ai/flows/generate-product-story';
import { getStyleSuggestions, type GetStyleSuggestionsOutput } from '@/ai/flows/get-style-suggestions';
import { Card } from '@/components/ui/card';
import { useWishlist } from '@/context/wishlist-context';
import type { Product } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [productStory, setProductStory] = React.useState<string | null>(null);
  const [loadingStory, setLoadingStory] = React.useState(true);
  const [styleSuggestions, setStyleSuggestions] = React.useState<GetStyleSuggestionsOutput['suggestions']>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(true);

  const { addToCart } = useCart();
  const { toast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const product = products.find((p) => p.id === slug);

  React.useEffect(() => {
    if (product) {
      if (product.colors?.length) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes?.length) {
        setSelectedSize(product.sizes[0]);
      }
      setLoadingStory(true);
      generateProductStory({ productName: product.name, productCategory: product.category })
        .then(result => {
          setProductStory(result.productStory);
        })
        .finally(() => {
          setLoadingStory(false);
        });

      setLoadingSuggestions(true);
      getStyleSuggestions({ productName: product.name, productCategory: product.category, currentProductId: product.id })
        .then(result => {
          setStyleSuggestions(result.suggestions);
        })
        .finally(() => {
          setLoadingSuggestions(false);
        });

    }
  }, [product]);

  if (!product) {
    notFound();
  }
  
  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Please select a size.",
        });
        return;
    }
    addToCart({ ...product, quantity, size: selectedSize, color: selectedColor });
    toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = () => {
      toggleWishlist(product);
  }

  const vendor = vendors.find((v) => v.id === product.vendorId);
  const image = PlaceHolderImages.find((p) => p.id === product.imageId);
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const getStockMessage = () => {
    if (product.stock === 0) return { text: 'Out of Stock', className: 'text-destructive' };
    if (product.stock < 10) return { text: `Only ${product.stock} left!`, className: 'text-amber-600' };
    return { text: 'In Stock', className: 'text-green-600' };
  }

  return (
    <MainLayout backgroundImage={image?.imageUrl}>
      <div className="container mx-auto max-w-screen-xl py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Image Gallery */}
          <div className="overflow-hidden rounded-3xl h-full max-h-[800px]">
            {image && (
              <Image
                src={image.imageUrl}
                alt={product.name}
                width={800}
                height={800}
                className="h-full w-full object-cover"
                data-ai-hint={image.imageHint}
              />
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <Card className="p-8 bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl">
              <Badge variant="secondary" className="w-fit">{product.category}</Badge>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground font-headline">
                {product.name}
              </h1>
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(product.rating)
                          ? 'text-primary fill-primary'
                          : 'text-muted-foreground/50'
                      }`}
                    />
                  ))}
                   <a href="#reviews" className="ml-2 text-muted-foreground hover:underline">({product.reviewCount} reviews)</a>
                </div>
                 <Separator orientation='vertical' className='h-4' />
                 <div className={cn('font-medium', getStockMessage().className)}>{getStockMessage().text}</div>
              </div>
              
              <p className="mt-6 text-4xl font-bold">${product.price.toFixed(2)}</p>
            </Card>

            <Separator className="my-8" />

            <Card className="p-8 bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl">
              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className='mb-8'>
                  <h3 className="text-sm font-medium">Color: <span className='text-muted-foreground'>{selectedColor}</span></h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-transform duration-200 ease-in-out",
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
              
              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                  <div className='mb-8'>
                      <h3 className="text-sm font-medium">Size</h3>
                      <Select onValueChange={setSelectedSize} defaultValue={selectedSize || undefined}>
                          <SelectTrigger className="w-[180px] mt-2">
                              <SelectValue placeholder="Select a size" />
                          </SelectTrigger>
                          <SelectContent>
                              {product.sizes.map((size) => (
                                  <SelectItem key={size} value={size}>{size}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
              )}

              {/* Quantity Selector */}
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

            {/* Actions */}
            <div className="mt-auto grid grid-cols-1 gap-4 pt-8">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                    <Button size="lg" className="text-lg py-7" onClick={handleAddToCart} disabled={product.stock === 0}>
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg py-7 h-auto" onClick={handleWishlistToggle}>
                        <Heart className={cn("h-6 w-6", isInWishlist(product.id) && 'fill-red-500 text-red-500')} />
                    </Button>
                </div>
              <Button size="lg" variant="secondary" className="text-lg py-7" disabled={product.stock === 0}>Buy Now</Button>
            </div>
            
             <div className="mt-8 rounded-3xl border bg-card/60 backdrop-blur-xl p-6 border-border/20">
                <Accordion type="single" collapsible defaultValue="description">
                    <AccordionItem value="description">
                        <AccordionTrigger className='text-lg font-medium'>Description</AccordionTrigger>
                        <AccordionContent className='text-base text-muted-foreground min-h-[4rem]'>
                          {loadingStory ? (
                            <div className="flex items-center gap-2">
                              <Loader className="h-4 w-4 animate-spin" />
                              <span>Crafting a story for you...</span>
                            </div>
                          ) : (
                            productStory || product.description
                          )}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="vendor">
                        <AccordionTrigger className='text-lg font-medium'>Vendor Information</AccordionTrigger>
                        <AccordionContent className='text-base text-muted-foreground'>
                        Sold by <span className='text-foreground font-semibold'>{vendor?.storeName || 'Unknown'}</span>. A trusted partner on Ethereal Commerce.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="shipping" className='border-b-0'>
                        <AccordionTrigger className='text-lg font-medium'>Shipping & Returns</AccordionTrigger>
                        <AccordionContent className='text-base text-muted-foreground'>
                        Free shipping on orders over $50. Easy returns within 30 days.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <Card className="mt-8 p-6 bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl">
                <div className="flex items-center gap-4">
                    <Share2 className='text-muted-foreground' />
                    <Button variant="ghost" size="icon"><Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" /></Button>
                    <Button variant="ghost" size="icon"><Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" /></Button>
                    <Button variant="ghost" size="icon"><Pinterest className="h-5 w-5 text-muted-foreground hover:text-primary" /></Button>
                </div>
            </Card>

          </div>
        </div>

        {/* Style Suggestions */}
        {styleSuggestions.length > 0 && (
          <div className="mt-24">
            <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
              Style It With
            </h2>
            {loadingSuggestions ? (
                <div className="flex justify-center"><Loader className="h-8 w-8 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {styleSuggestions.map((suggestion) => {
                    const suggestedProduct = products.find(p => p.id === suggestion.productId);
                    if (!suggestedProduct) return null;
                    return (
                        <div key={suggestion.productId}>
                            <ProductCard product={suggestedProduct} />
                            <p className="mt-4 text-center text-sm text-muted-foreground italic">"{suggestion.reason}"</p>
                        </div>
                    )
                })}
              </div>
            )}
          </div>
        )}

        {/* Related Products */}
        <div className="mt-24">
            <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
                You Might Also Like
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>

         {/* Customer Reviews */}
        {product.reviews.length > 0 && (
            <div id="reviews" className="mt-24">
                <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
                    Customer Reviews
                </h2>
                <div className="space-y-8">
                    {product.reviews.map(review => {
                        const avatar = PlaceHolderImages.find(p => p.id === review.avatarId);
                        return (
                        <Card key={review.id} className="p-6 bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl">
                           <div className='flex items-start'>
                                <Avatar className="h-12 w-12 mr-4">
                                  {avatar && <AvatarImage src={avatar.imageUrl} alt={review.author} data-ai-hint={avatar.imageHint} />}
                                  <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-lg">{review.author}</h4>
                                            <p className="text-sm text-muted-foreground">{review.date}</p>
                                        </div>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <h5 className="font-semibold mt-4">{review.title}</h5>
                                    <p className="text-muted-foreground mt-1">{review.text}</p>
                                </div>
                           </div>
                        </Card>
                    )})}
                </div>
            </div>
        )}
      </div>
    </MainLayout>
  );
}
