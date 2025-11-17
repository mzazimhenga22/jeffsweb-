'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Truck, ShieldCheck, Gem } from 'lucide-react';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { Product, Category, Testimonial } from '@/lib/types';
import { PromoBanners } from '@/components/promo-banners';
import { PromoBannerTriple } from '@/components/promo-banner-triple';
import { PromoBannerSingle } from '@/components/promo-banner-single';
import { HeroCarousel } from '@/components/hero-carousel';
import { supabase } from '@/lib/supabase-client';

async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(8);
  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  return data as Product[];
}

async function getNewArrivals(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);
  if (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
  return data as Product[];
}

async function getBestSellers(): Promise<Product[]> {
    // Bestsellers are hardcoded for now
    const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(4);
  if (error) {
    console.error('Error fetching bestsellers:', error);
    return [];
  }
  return data as Product[];
}

async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*').limit(4);
    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data as Category[];
}

async function getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase.from('testimonials').select('*').limit(3);
    if (error) {
        console.error('Error fetching testimonials:', error);
        return [];
    }
    return data as Testimonial[];
}

export default function HomePage() {
  const [backgroundImage, setBackgroundImage] = React.useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = React.useState<Product[]>([]);
  const [bestSellers, setBestSellers] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([]);

  React.useEffect(() => {
    getFeaturedProducts().then(setFeaturedProducts);
    getNewArrivals().then(setNewArrivals);
    getBestSellers().then(setBestSellers);
    getCategories().then(setCategories);
    getTestimonials().then(setTestimonials);
  }, []);

  return (
    <MainLayout backgroundImage={backgroundImage}>
      <div className="space-y-24 pb-24">
        {/* Hero Section */}
        <section className="relative w-full -mt-16">
          <HeroCarousel products={featuredProducts} setBackgroundImage={setBackgroundImage} />
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
            {categories.map((category) => (
              <Link href="/shop" key={category.id} className="group">
                <div className="relative h-96 w-full overflow-hidden rounded-3xl transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white font-headline">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
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

        {/* Promotional Banners */}
        <PromoBanners />

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

        <PromoBannerTriple />
        
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
                <Image
                    src="/placeholder.svg"
                    alt="Our Story"
                    fill
                    className="object-cover"
                    />
            </div>
          </div>
        </section>
        
        <PromoBannerSingle />

        {/* Testimonials Section */}
        <section className="container mx-auto">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-secondary/30 border-0 rounded-3xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={testimonial.avatar_url} alt={testimonial.name} />
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
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
