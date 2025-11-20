'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Loader } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/lib/types';

export function HeroCarousel({ products, setBackgroundImage }: { products: Product[], setBackgroundImage: (url: string | null) => void }) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();

  React.useEffect(() => {
    if (!carouselApi || products.length === 0) {
      return;
    }

    const handleSelect = () => {
      const currentSlide = carouselApi.selectedScrollSnap();
      const product = products[currentSlide];
      if (product.image_url) {
        setBackgroundImage(product.image_url);
      }
    };

    handleSelect(); // Set initial image
    carouselApi.on('select', handleSelect);

    return () => {
      carouselApi.off('select', handleSelect);
    };
  }, [carouselApi, products, setBackgroundImage]);

  return (
    <Carousel
      setApi={setCarouselApi}
      opts={{
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {products.map((product, index) => (
          <CarouselItem key={product.id}>
            <div className="group relative h-[550px] w-full overflow-hidden">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                  priority={index === 0}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

              <div className="absolute bottom-12 left-12 right-12 text-white">
                <div className='max-w-xl'>
                  <h1 className="mb-4 text-5xl font-bold tracking-tight font-headline drop-shadow-2xl">
                    {product.name}
                  </h1>
                  <div className="max-w-xl mb-8 text-lg text-white/80 drop-shadow-xl h-14">
                    <p>{product.description}</p>
                  </div>
                  <p className="text-sm text-white/80 mb-4">Sold by {product.vendorName || 'Admin'}</p>
                  <Button size="lg" asChild className="text-lg py-7">
                    <Link href={`/shop/${product.id}`}>
                      Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="absolute bottom-12 right-12 hidden md:block">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white w-full max-w-sm">
                  <CardContent className='p-6'>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm">Price</p>
                        <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
    </Carousel>
  );
}