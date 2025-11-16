'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const image = PlaceHolderImages.find((p) => p.id === product.imageId);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // prevent link navigation
    addToCart({ 
        ...product, 
        quantity: 1, 
        size: product.sizes?.[0] || null, 
        color: product.colors?.[0] || null 
    });
    toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border bg-card text-card-foreground transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden">
          {image && (
            <Image
              src={image.imageUrl}
              alt={product.name}
              width={600}
              height={600}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              data-ai-hint={image.imageHint}
            />
          )}
           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
           <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10">
                <Button size="sm" variant='secondary' className='shadow-md pointer-events-none'>
                    <Eye className="mr-2 h-4 w-4" /> View
                </Button>
           </div>
        </div>
      </Link>
      <div className="p-6 bg-card">
        <div className="flex items-start justify-between">
            <Badge variant="secondary">{product.category}</Badge>
            <div className="flex items-center gap-1 text-primary">
                <Star className="h-5 w-5 fill-primary" />
                <span className="font-bold">{product.rating.toFixed(1)}</span>
            </div>
        </div>
        <h3 className="mt-2 text-xl font-semibold leading-tight font-headline">
            <Link href={`/shop/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
          <Button variant="outline" size='icon' onClick={handleAddToCart} aria-label='Add to cart'>
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
