'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Heart } from 'lucide-react';

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
import { useWishlist } from '@/context/wishlist-context';

export function HeroCarousel({
  products,
  setBackgroundImage,
}: {
  products: Product[];
  setBackgroundImage: (url: string | null) => void;
}) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const { toggleWishlist, isInWishlist } = useWishlist();

  React.useEffect(() => {
    if (!carouselApi || products.length === 0) return;

    const handleSelect = () => {
      const currentSlide = carouselApi.selectedScrollSnap();
      setCurrent(currentSlide);
      const product = products[currentSlide];
      if (product?.image_url) {
        setBackgroundImage(product.image_url);
      }
    };

    handleSelect();
    carouselApi.on('select', handleSelect);
    return () => {
      carouselApi.off('select', handleSelect);
    };
  }, [carouselApi, products, setBackgroundImage]);

  const nextIndex = products.length > 0 ? (current + 1) % products.length : 0;
  const nextProduct = products[nextIndex];

  return (
    <>
      <Carousel
        setApi={setCarouselApi}
        opts={{ loop: true }}
        className="w-full"
      >
        <CarouselContent>
          {products.map((product, index) => (
            <CarouselItem key={product.id}>
              <div className="group relative h-[630px] w-full overflow-hidden will-change-transform">
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="100vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    priority={index === 0}
                  />
                )}

                {/* Darker bottom veil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Accent glows */}
                <div className="pointer-events-none absolute -left-24 top-14 h-40 w-40 rounded-full bg-primary/10 blur-lg" />
                <div className="pointer-events-none absolute right-4 top-8 h-16 w-16 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm" />

                <div className="absolute bottom-12 left-12 right-12 text-white">
                  <div className="max-w-xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md">
                      <span className="rounded-full bg-white/30 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-white/80">
                        Featured
                      </span>
                      <span className="text-white/90">{product.category}</span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/90">
                        {product.stock > 0 ? 'Ready to ship' : 'Back soon'}
                      </span>
                    </div>
                    <h1 className="mb-4 text-5xl font-bold tracking-tight font-headline drop-shadow-2xl">
                      {product.name}
                    </h1>
                    <div className="mb-8 h-14 max-w-xl text-lg text-white/80 drop-shadow-xl">
                      <p>{product.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="lg" asChild className="py-7 text-lg">
                        <Link href={`/shop/${product.id}`}>
                          Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="secondary"
                        asChild
                        className="border border-white/40 bg-white/15 py-7 text-lg text-white backdrop-blur hover:bg-white/25"
                      >
                        <Link href={`/shop/${product.id}`}>See Details</Link>
                      </Button>
                      <Button
                        size="lg"
                        variant={isInWishlist(product.id) ? 'secondary' : 'outline'}
                        className={`border-white/40 bg-white/10 py-7 text-lg text-white hover:bg-white/20 ${
                          isInWishlist(product.id) ? 'bg-white/25' : ''
                        }`}
                        onClick={() => toggleWishlist(product)}
                      >
                        <Heart
                          className={`mr-2 h-5 w-5 ${
                            isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                        {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-12 right-12 hidden md:block">
                  <Card className="w-full max-w-sm border-white/20 bg-white/10 text-white shadow-xl shadow-black/20 backdrop-blur-lg">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-white/70">Price</p>
                          <p className="text-3xl font-bold">Ksh {product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-2 py-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.round(product.averageRating ?? 0)
                                    ? 'fill-white text-white'
                                    : 'text-white/40'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-white/80">{product.reviewCount ?? 0} reviews</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-white/70">Shipping</p>
                          <p className="text-sm font-semibold">Free over Ksh 100,000</p>
                        </div>
                        <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-white/70">Availability</p>
                          <p className="text-sm font-semibold">{product.stock > 0 ? 'In stock' : 'Limited'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 z-10 -translate-y-1/2" />
        <CarouselNext className="absolute right-4 top-1/2 z-10 -translate-y-1/2" />
      </Carousel>

      {products.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => carouselApi?.scrollTo(idx)}
                className={`h-3 w-3 rounded-full border border-white/50 transition ${
                  current === idx ? 'bg-white shadow-md shadow-black/20' : 'bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {products.length > 1 && nextProduct && (
            <div className="hidden md:flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
              {nextProduct.image_url && (
                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/20">
                  <Image src={nextProduct.image_url} alt={nextProduct.name} fill className="object-cover" />
                </div>
              )}
              <div className="min-w-[140px]">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/70">Next up</p>
                <p className="text-sm font-semibold text-white truncate">{nextProduct.name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/15"
                onClick={() => carouselApi?.scrollTo(nextIndex)}
              >
                View
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
