import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Truck, ShieldCheck, Gem, MessageSquareQuote } from 'lucide-react';

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
import { categories, products, testimonials } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const heroImages = PlaceHolderImages.filter((img) =>
    ['hero watch', 'hero shoe', 'hero fashion'].includes(img.imageHint)
  );

  const newArrivals = products.slice(0, 3);
  const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 3);
  const brandStoryImage = PlaceHolderImages.find(p => p.id === 'brand-story');

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

        {/* Value Propositions */}
        <section className="container mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex items-center gap-4">
              <Truck className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Free Shipping</h3>
                <p className="text-muted-foreground">On all orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Easy Returns</h3>
                <p className="text-muted-foreground">30-day money-back guarantee</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Gem className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Premium Quality</h3>
                <p className="text-muted-foreground">Crafted from the finest materials</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories Section */}
        <section className="container mx-auto">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
            Shop by Category
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

        {/* New Arrivals Section */}
        <section className="container mx-auto">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
            New Arrivals
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Brand Story Section */}
        <section className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-secondary/30 rounded-3xl p-12">
            <div className='order-2 lg:order-1'>
              <h2 className="text-4xl font-bold tracking-tight font-headline mb-6">Our Story</h2>
              <p className="text-muted-foreground text-lg mb-4">
                Founded in 2024, Ethereal Commerce began with a simple idea: to bring together the most exquisite and finely crafted goods from around the world into one seamless shopping experience. We believe in quality, craftsmanship, and the stories behind the products we sell.
              </p>
              <p className="text-muted-foreground text-lg">
                Our mission is to provide a platform for discerning customers who appreciate artistry and timeless design. We partner with the best vendors to ensure every item in our collection is something we're proud to offer.
              </p>
              <Button size="lg" asChild className="mt-8 text-lg">
                <Link href="#">Learn More</Link>
              </Button>
            </div>
             <div className="relative h-96 w-full overflow-hidden rounded-2xl order-1 lg:order-2">
                {brandStoryImage && (
                    <Image
                    src={brandStoryImage.imageUrl}
                    alt="Our Story"
                    fill
                    className="object-cover"
                    data-ai-hint={brandStoryImage.imageHint}
                    />
                )}
            </div>
          </div>
        </section>
        
        {/* Best Sellers Section */}
        <section className="container mx-auto">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
            Best Sellers
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => {
              const avatar = PlaceHolderImages.find(p => p.id === testimonial.avatarId);
              return (
              <Card key={testimonial.id} className="bg-secondary/30 border-0">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      {avatar && <AvatarImage src={avatar.imageUrl} alt={testimonial.name} data-ai-hint={avatar.imageHint} />}
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            )})}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
