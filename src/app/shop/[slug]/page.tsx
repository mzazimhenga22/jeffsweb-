'use client';

import Image from 'next/image';
import { Star, Check, Minus, Plus, Heart, Facebook, Twitter, Share2 } from 'lucide-react';
import * as React from 'react';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
import { Card } from '@/components/ui/card';
import { useWishlist } from '@/context/wishlist-context';
import type { Product } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


function ProductDetailContent({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [activeImage, setActiveImage] = React.useState<string | null>(null);

  const { addToCart } = useCart();
  const { toast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  React.useEffect(() => {
    if (product) {
      if (product.colors?.length) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes?.length) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.image_url) {
        setActiveImage(product.image_url);
      }
    }
  }, [product]);
  
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
    
    addToCart({ 
      ...product, 
      quantity, 
      size: selectedSize, 
      color: selectedColor,
    });
    
    toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = () => {
      toggleWishlist(product);
  }

  const getStockMessage = () => {
    if (product.stock === 0) return { text: 'Out of Stock', className: 'text-destructive' };
    if (product.stock < 10) return { text: `Only ${product.stock} left!`, className: 'text-amber-600' };
    return { text: 'In Stock', className: 'text-green-600' };
  }

  const mainImage = activeImage;

  return (
    <MainLayout backgroundImage={mainImage || undefined}>
      <div className="container mx-auto max-w-screen-xl py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Image Gallery */}
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

          {/* Product Info */}
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
                            {product.description}
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
                    <Button variant="ghost" size="icon">
                        <svg className="h-5 w-5 text-muted-foreground hover:text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.545 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.905.448 2.91.448 5.523 0 10-4.477 10-10S17.523 2 12 2z" clipRule="evenodd" />
                        </svg>
                    </Button>
                </div>
            </Card>

          </div>
        </div>

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

      </div>
    </MainLayout>
  );
}

import { supabase } from '@/lib/supabase-client';
import { notFound } from 'next/navigation';

async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', slug)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data as Product;
}

async function getRelatedProducts(category: string, currentProductId: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .not('id', 'eq', currentProductId)
        .limit(4);

    if (error) {
        console.error('Error fetching related products:', error);
        return [];
    }
    return data as Product[];
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  
  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category, product.id);

  return <ProductDetailContent product={product} relatedProducts={relatedProducts} />;
}
