
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Eye, Maximize } from 'lucide-react';
import type { Product } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { vendors } from '@/lib/data';
import { useQuickView } from '@/context/quick-view-context';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const image = PlaceHolderImages.find((p) => p.id === product.imageIds[0]);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { openQuickView } = useQuickView();
  const vendor = vendors.find(v => v.id === product.vendorId);


  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // prevent link navigation
    addToCart({
      ...product,
      quantity: 1,
      size: product.sizes?.[0] || null,
      color: product.colors?.[0] || null,
      vendorName: vendor?.storeName,
    });
    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleQuickView = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    openQuickView(product);
  }

  const averageRating = React.useMemo(() => {
    if (!product.reviews || product.reviews.length === 0) {
      return 0;
    }
    const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / product.reviews.length;
  }, [product.reviews]);


  return (
    <div className="group relative overflow-hidden rounded-3xl text-card-foreground transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-[4/5] w-full">
          {image && (
            <Image
              src={image.imageUrl}
              alt={product.name}
              fill
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              data-ai-hint={image.imageHint}
            />
          )}
           <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 gap-2">
                <Button variant="outline" onClick={handleQuickView} className="gap-2 border-white/20 bg-black/40 backdrop-blur-lg hover:bg-black/50 text-white hover:text-white">
                    <Maximize className="h-4 w-4" />
                    Quick View
                </Button>
            </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/50 backdrop-blur-xl border-t border-white/10 text-white">
          <div className="flex items-start justify-between">
            <Badge variant="secondary" className='bg-white/20 text-white border-none'>{product.category}</Badge>
            <div className="flex items-center gap-1 text-primary">
              <Star className="h-5 w-5 fill-primary" />
              <span className="font-bold text-white">{averageRating.toFixed(1)}</span>
            </div>
          </div>
          <h3 className="mt-2 text-xl font-semibold leading-tight font-headline text-white">
            {product.name}
          </h3>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-2xl font-bold text-white">${product.price.toFixed(2)}</p>
            <Button variant="outline" size="icon" onClick={handleAddToCart} aria-label="Add to cart" className='bg-white/20 border-white/30 hover:bg-white/30 text-white hover:text-white'>
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}
