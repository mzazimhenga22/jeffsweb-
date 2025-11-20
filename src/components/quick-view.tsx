
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useQuickView } from '@/context/quick-view-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Star, Minus, Plus, Check, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/context/wishlist-context';
import Link from 'next/link';

export function QuickView() {
  const { product, isOpen, closeQuickView } = useQuickView();
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [activeImage, setActiveImage] = React.useState<string | null>(null);

  const { addToCart } = useCart();
  const { toast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0] || null);
      setSelectedSize(product.sizes?.[0] || null);
      setQuantity(1);
      if (product.image_url) {
        setActiveImage(product.image_url);
      } else {
        const mainImage = product.imageIds?.[0] ? PlaceHolderImages.find((p) => p.id === product.imageIds[0]) : null;
        if (mainImage) setActiveImage(mainImage.imageUrl);
      }
    }
  }, [product]);

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
        toast({ variant: "destructive", title: "Please select a size." });
        return;
    }
    addToCart({ ...product, quantity, size: selectedSize, color: selectedColor });
    toast({ title: "Added to cart!", description: `${product.name} has been added.` });
    closeQuickView();
  };

  const averageRating = product.reviews?.length ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length : 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={closeQuickView}>
      <DialogContent className="max-w-4xl p-0">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="p-6 space-y-4">
            <div className="overflow-hidden rounded-xl aspect-square bg-muted">
                {activeImage && (
                    <Image
                    src={activeImage}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover"
                    />
                )}
            </div>
            {product.image_url || (product.imageIds && product.imageIds.length > 0) ? (
              <div className="grid grid-cols-5 gap-2">
                {(product.imageIds && product.imageIds.length > 0 ? product.imageIds : ['__image_url__']).map((imageId) => {
                  const image = imageId === '__image_url__'
                    ? { imageUrl: product.image_url as string }
                    : PlaceHolderImages.find((p) => p.id === imageId)

                  if (!image || !image.imageUrl) return null
                  return (
                    <button
                      key={imageId}
                      onClick={() => setActiveImage(image.imageUrl)}
                      className={cn(
                        'overflow-hidden rounded-md aspect-square border-2 transition',
                        activeImage === image.imageUrl ? 'border-primary' : 'border-transparent'
                      )}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={`${product.name} thumbnail`}
                        width={100}
                        height={100}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
          
          {/* Product Details */}
          <div className="p-8 flex flex-col">
            <Badge variant="secondary" className="w-fit">{product.category}</Badge>
            <h2 className="mt-2 text-3xl font-bold tracking-tight font-headline">{product.name}</h2>
            
            <div className="mt-3 flex items-center gap-2 text-sm">
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(averageRating) ? 'text-primary fill-primary' : 'text-muted-foreground/50'}`} />)}
                </div>
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            <p className="mt-4 text-3xl font-bold">${product.price.toFixed(2)}</p>

            <Separator className="my-6" />

            <div className="space-y-6">
                {product.colors && product.colors.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium">Color: <span className='text-muted-foreground'>{selectedColor}</span></h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {product.colors.map((color) => (
                            <button key={color} type="button" className={cn("h-8 w-8 rounded-full border-2 transition-transform", selectedColor === color && 'ring-2 ring-offset-2 ring-primary scale-110')} style={{ backgroundColor: color }} onClick={() => setSelectedColor(color)} aria-label={`Select color ${color}`} >
                                {selectedColor === color && (<Check className="h-5 w-5 text-white mix-blend-difference" />)}
                            </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {product.sizes && product.sizes.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium">Size</h3>
                        <Select onValueChange={setSelectedSize} defaultValue={selectedSize || undefined}>
                            <SelectTrigger className="w-[180px] mt-2">
                                <SelectValue placeholder="Select a size" />
                            </SelectTrigger>
                            <SelectContent>
                                {product.sizes.map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div>
                    <h3 className="text-sm font-medium">Quantity</h3>
                    <div className="mt-2 flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                        <span className="font-bold text-lg">{quantity}</span>
                        <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
            
            <div className="mt-auto pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                <Button size="lg" onClick={handleAddToCart}>Add to Cart</Button>
                <Button size="lg" variant="outline" onClick={() => toggleWishlist(product)}>
                    <Heart className={cn("h-6 w-6", isInWishlist(product.id) && 'fill-red-500 text-red-500')} />
                </Button>
              </div>
               <Button variant="link" asChild className='w-full'>
                <Link href={`/shop/${product.id}`} onClick={closeQuickView}>View Full Product Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
