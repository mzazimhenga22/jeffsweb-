import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const image = PlaceHolderImages.find((p) => p.id === product.imageId);

  return (
    <div className="group relative overflow-hidden rounded-3xl border bg-card text-card-foreground transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <Link href={`/shop/${product.id}`}>
        <div className="absolute inset-0 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button size="lg" className='text-lg'>
            View Details
            <ShoppingCart className="ml-2 h-5 w-5" />
          </Button>
        </div>
        <div className="aspect-square w-full overflow-hidden">
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
        </div>
      </Link>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
             <Badge variant="secondary" className="mb-2">{product.category}</Badge>
            <h3 className="text-xl font-semibold leading-tight font-headline">
              <Link href={`/shop/${product.id}`}>{product.name}</Link>
            </h3>
          </div>
          <div className="flex items-center gap-1 text-lg font-bold text-primary">
            <Star className="h-5 w-5 fill-primary" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="mt-4 text-2xl font-bold">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
}
