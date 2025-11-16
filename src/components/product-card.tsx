
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';

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
      color: product.colors?.[0] || null,
    });
    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl text-card-foreground transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {image && (
            <Image
              src={image.imageUrl}
              alt={product.name}
              fill
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              data-ai-hint={image.imageHint}
            />
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-background/30 backdrop-blur-xl border-t border-white/10">
          <div className="flex items-start justify-between">
            <Badge variant="secondary">{product.category}</Badge>
            <div className="flex items-center gap-1 text-primary">
              <Star className="h-5 w-5 fill-primary" />
              <span className="font-bold">{product.rating.toFixed(1)}</span>
            </div>
          </div>
          <h3 className="mt-2 text-xl font-semibold leading-tight font-headline text-foreground">
            {product.name}
          </h3>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-2xl font-bold text-foreground">${product.price.toFixed(2)}</p>
            <Button variant="outline" size="icon" onClick={handleAddToCart} aria-label="Add to cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}
