
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Truck, ShieldCheck, Gem, Loader } from 'lucide-react';

import { MainLayout } from '@/components/main-layout';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { categories, products, testimonials, vendors } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { generateProductStory } from '@/ai/flows/generate-product-story';


export default function Home() {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [activeImage, setActiveImage] = React.useState<string | null>(null);
  const [heroProducts, setHeroProducts] = React.useState<Product[]>([]);
  const [productStories, setProductStories] = React.useState<Record<string, string>>({});
  const [loadingStories, setLoadingStories] = React.useState<Record<string, boolean>>({});


  React.useEffect(() => {
    // Shuffle products and take a smaller slice for performance
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, 8);
    setHeroProducts(selectedProducts);

    selectedProducts.forEach(product => {
      setLoadingStories(prev => ({ ...prev, [product.id]: true }));
      generateProductStory({ productName: product.name, productCategory: product.category })
        .then(result => {
          setProductStories(prev => ({ ...prev, [product.id]: result.productStory }));
        })
        .finally(() => {
          setLoadingStories(prev => ({ ...prev, [product.id]: false }));
        });
    });

  }, []);

  React.useEffect(() => {
    if (!carouselApi || heroProducts.length === 0) {
      return;
    }

    const handleSelect = () => {
      const currentSlide = carouselApi.selectedScrollSnap();
      const product = heroProducts[currentSlide];
      const image = PlaceHolderImages.find((p) => p.id === product.imageIds[0]);
      if (image) {
        setActiveImage(image.imageUrl);
      }
    };

    handleSelect(); // Set initial image
    carouselApi.on('select', handleSelect);

    return () => {
      carouselApi.off('select', handleSelect);
    };
  }, [carouselApi, heroProducts]);

  const getAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  }

  const newArrivals = products.slice(0, 4);
  const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
  const brandStoryImage = PlaceHolderImages.find(p => p.id === 'brand-story');

  return (
    <MainLayout backgroundImage={activeImage}>
      <div className="space-y-24 pb-24">
        {/* Hero Section */}
        <section className="relative w-full -mt-16">
          <Carousel
            setApi={setCarouselApi}
            opts={{
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {heroProducts.map((product, index) => {
                const image = PlaceHolderImages.find(p => p.id === product.imageIds[0]);
                const vendor = vendors.find(v => v.id === product.vendorId);
                const vendorAvatar = PlaceHolderImages.find(p => p.id === vendor?.avatarId);
                const story = productStories[product.id];
                const isLoading = loadingStories[product.id];
                const rating = getAverageRating(product.reviews);

                return (
                <CarouselItem key={product.id}>
                  <div className="group relative h-[550px] w-full overflow-hidden">
                    {image && (
                        <Image
                        src={image.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        data-ai-hint={image.imageHint}
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
                              {isLoading && <div className='flex items-center gap-2'><Loader className='animate-spin h-5 w-5' /><span>Crafting story...</span></div>}
                              {story && !isLoading && <p>{story}</p>}
                              {!story && !isLoading && <p>{product.description}</p>}
                            </div>
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
                                    <div className="text-right">
                                        <p className="text-sm">Rating</p>
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            <Star className="w-5 h-5 fill-current" />
                                            <span className="font-bold text-xl text-white">{rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                                {vendor && 
                                    <div className="mt-6 pt-4 border-t border-white/20">
                                        <p className="text-sm">Sold by</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            {vendorAvatar &&
                                                <Avatar>
                                                    <AvatarImage src={vendorAvatar.imageUrl} alt={vendor.name} data-ai-hint={vendorAvatar.imageHint} />
                                                    <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            }
                                            <p className="font-semibold">{vendor.storeName}</p>
                                        </div>
                                    </div>
                                }
                           </CardContent>
                       </Card>
                    </div>
                  </div>
                </CarouselItem>
              )})}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Best Sellers Section */}
        <section className="container mx-auto">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
            Best Sellers
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product) => (
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

        {/* Testimonials Section */}
        <section className="container mx-auto">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => {
              const avatar = PlaceHolderImages.find(p => p.id === testimonial.avatarId);
              return (
              <Card key={testimonial.id} className="bg-secondary/30 border-0 rounded-3xl">
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
