'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Eye, Maximize, Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useQuickView } from '@/context/quick-view-context';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { openQuickView } = useQuickView();
  const [showAdded, setShowAdded] = React.useState(false);


  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart({
      ...product,
      quantity: 1,
      size: product.sizes?.[0] || null,
      color: product.colors?.[0] || null,
    });
    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
    });
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1500);
  };

  const handleQuickView = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    openQuickView(product);
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl text-card-foreground transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
       <Link href={`/shop/${product.id}`} className="block h-full w-full">
        <div className="relative aspect-square w-full">
            {product.image_url && (
                <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
            )}
            <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/30" />
        </div>
        </Link>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 gap-2">
            <Button variant="outline" size="sm" onClick={handleQuickView} className="gap-1 border-white/20 bg-black/40 backdrop-blur-lg hover:bg-black/50 text-white hover:text-white">
                <Maximize className="h-3 w-3" />
                Quick View
            </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-xl border-t border-white/10 text-white">
          <Link href={`/shop/${product.id}`} className="block">
            <div className="flex items-start justify-between">
                <Badge variant="secondary" className='bg-white/20 text-white border-none text-xs'>{product.category}</Badge>
                <div className="flex items-center gap-1 text-primary">
                </div>
            </div>
            <h3 className="mt-1 text-sm font-semibold leading-tight font-headline text-white truncate">
                {product.name}
            </h3>
            <p className="text-[11px] text-white/80 mt-1">By {product.vendorName || 'Admin'}</p>
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-bold text-white">${product.price.toFixed(2)}</p>
            <Button variant="outline" size="icon" onClick={handleAddToCart} aria-label="Add to cart" className='h-8 w-8 bg-white/20 border-white/30 hover:bg-white/30 text-white hover:text-white relative'>
              <ShoppingCart className={cn("h-4 w-4 transition-opacity", showAdded && 'opacity-0')} />
              <Check className={cn("h-4 w-4 absolute transition-opacity", !showAdded && 'opacity-0')} />
            </Button>
          </div>
        </div>
    </div>
  );
}
