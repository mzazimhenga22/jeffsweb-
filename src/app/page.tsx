import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

import { MainLayout } from '@/components/main-layout';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { categories, products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroProducts = products.slice(0, 3);
  const trendingProducts = products.slice(3, 9);
  const heroImages = PlaceHolderImages.filter((img) =>
    ['hero watch', 'hero shoe', 'hero fashion'].includes(img.imageHint)
  );

  return (
    <MainLayout>
      <div className="space-y-24 pb-24">
        {/* Hero Section */}
        <section className="container mx-auto pt-16">
          <Carousel
            opts={{
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {heroImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[60vh] w-full overflow-hidden rounded-3xl">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-12 text-white">
                      <h1 className="mb-4 text-5xl font-bold tracking-tight font-headline">
                        {index === 0 && "Timeless Elegance"}
                        {index === 1 && "Step Into Style"}
                        {index === 2 && "Wear Your Story"}
                      </h1>
                      <p className="max-w-xl mb-8 text-lg text-white/80">
                        {index === 0 && "Discover our exclusive collection of luxury watches, crafted for perfection."}
                        {index === 1 && "Find your perfect pair from our latest arrivals in designer footwear."}
                        {index === 2 && "Explore curated fashion that defines your unique personality."}
                      </p>
                      <Button size="lg" asChild className="text-lg">
                        <Link href="/shop">
                          Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </section>

        {/* Featured Categories Section */}
        <section className="container mx-auto">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
            Featured Categories
          </h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {categories.map((category) => {
              const image = PlaceHolderImages.find(p => p.id === category.imageId);
              return (
              <Link href="/shop" key={category.id} className="group">
                <div className="relative h-96 w-full overflow-hidden rounded-3xl transition-transform duration-300 group-hover:scale-105">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white font-headline">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        </section>

        {/* Trending Products Section */}
        <section className="container mx-auto">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
            Trending Now
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
