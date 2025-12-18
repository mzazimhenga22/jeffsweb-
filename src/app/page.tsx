'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Truck, ShieldCheck, Gem, Sparkles } from 'lucide-react';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Product, Category, Testimonial } from '@/lib/types';
import { PromoBanners } from '@/components/promo-banners';
import { PromoBannerTriple } from '@/components/promo-banner-triple';
import { PromoBannerSingle } from '@/components/promo-banner-single';
import { HeroCarousel } from '@/components/hero-carousel';
import { supabase } from '@/lib/supabase-client';
import type { Banner } from '@/lib/types';
import type { Database } from '@/lib/database.types';

const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
type ProductWithRatings = Product & { product_reviews?: { rating: number }[] };

const mapProductRatings = (products: ProductWithRatings[]) =>
  products.map((product) => {
    const ratings = product.product_reviews?.map((r) => r.rating).filter((r) => typeof r === 'number') ?? [];
    const reviewCount = ratings.length;
    const averageRating = reviewCount ? ratings.reduce((acc, rating) => acc + rating, 0) / reviewCount : 0;
    return { ...product, averageRating, reviewCount };
  });

async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*, product_reviews(rating)')
    .or('is_deleted.is.null,is_deleted.eq.false')
    .limit(25);
  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  const rows = mapProductRatings((data as ProductWithRatings[]) ?? []);
  // Randomize and take up to 5 products for the hero banner
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  return rows.slice(0, 5);
}

async function getNewArrivals(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*, product_reviews(rating)')
    .or('is_deleted.is.null,is_deleted.eq.false')
    .order('created_at', { ascending: false })
    .limit(4);
  if (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
  return mapProductRatings((data as ProductWithRatings[]) ?? []);
}

async function getBestSellers(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*, product_reviews(rating)')
    .or('is_deleted.is.null,is_deleted.eq.false')
    .limit(4);
  if (error) {
    console.error('Error fetching bestsellers:', error);
    return [];
  }
  return mapProductRatings((data as ProductWithRatings[]) ?? []);
}

async function getStaffPicks(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*, product_reviews(rating)')
    .or('is_deleted.is.null,is_deleted.eq.false')
    .order('created_at', { ascending: true })
    .limit(12);
  if (error) {
    console.error('Error fetching staff picks:', error);
    return [];
  }
  return mapProductRatings((data as ProductWithRatings[]) ?? []);
}

async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase env missing; skipping categories fetch.');
    return [];
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })
    .limit(25);

  if (error) {
    console.error('Error fetching categories:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: (error as any)?.code,
    });
    return [];
  }

  const rows = ((data as Category[]) ?? []).slice();

  // Randomize and take up to 5 categories
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  return rows.slice(0, 5);
}

async function getTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase env missing; skipping testimonials fetch.');
    return [];
  }

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching testimonials:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: (error as any)?.code,
    });
    return [];
  }
  return (data as Testimonial[]) ?? [];
}

export default function HomePage() {
  const [backgroundImage, setBackgroundImage] = React.useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = React.useState<Product[]>([]);
  const [bestSellers, setBestSellers] = React.useState<Product[]>([]);
  const [staffPicks, setStaffPicks] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([]);
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [storyBanner, setStoryBanner] = React.useState<Banner | null>(null);
  const [isLoadingHome, setIsLoadingHome] = React.useState(true);
  const [testimonialName, setTestimonialName] = React.useState('');
  const [testimonialRating, setTestimonialRating] = React.useState<number>(5);
  const [testimonialText, setTestimonialText] = React.useState('');
  const [testimonialAvatar, setTestimonialAvatar] = React.useState('');
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = React.useState(false);
  const [testimonialError, setTestimonialError] = React.useState<string | null>(null);
  const [testimonialSuccess, setTestimonialSuccess] = React.useState<string | null>(null);

  const ProductSkeleton = ({ compact = false }: { compact?: boolean }) => (
    <div className={`animate-pulse rounded-3xl border border-border/40 bg-muted/40 ${compact ? 'h-48' : 'h-80'}`} />
  );

  const ratingOptions = [1, 2, 3, 4, 5] as const;
  const BANNERS_CACHE_KEY = 'homepage_banners_v1';

  React.useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoadingHome(false);
      return;
    }

    const fetchHomepage = async () => {
      try {
        // Try cached banners first
        if (typeof window !== 'undefined') {
          const cached = window.localStorage.getItem(BANNERS_CACHE_KEY);
          if (cached) {
            try {
              const parsed = JSON.parse(cached) as Banner[];
              if (Array.isArray(parsed) && parsed.length > 0) {
                setBanners(parsed);
                const storyCached = parsed.find((b) => (b.title ?? '').toLowerCase() === 'our story');
                if (storyCached) setStoryBanner(storyCached);
              }
            } catch {
              // ignore cache parse errors
            }
          }
        }

        const [featured, arrivals, best, staff, cats, tests] = await Promise.all([
          getFeaturedProducts(),
          getNewArrivals(),
          getBestSellers(),
          getStaffPicks(),
          getCategories(),
          getTestimonials(),
        ]);
        setFeaturedProducts(featured);
        setNewArrivals(arrivals);
        setBestSellers(best);
        setStaffPicks(staff);
        setCategories(cats);
        setTestimonials(tests);

        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(25);

        if (error) {
          console.error('Error fetching banners:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: (error as any)?.code,
          });
        } else {
          const rows = ((data as Banner[]) ?? []).slice();
          // Randomize and take up to 5 banners for display
          for (let i = rows.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rows[i], rows[j]] = [rows[j], rows[i]];
          }
          const selected = rows.slice(0, 5);
          setBanners(selected);
          const story = selected.find((b) => (b.title ?? '').toLowerCase() === 'our story');
          if (story) setStoryBanner(story);

          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem(BANNERS_CACHE_KEY, JSON.stringify(selected));
            } catch {
              // ignore cache write errors
            }
          }

          if (!story) {
            const { data: storyRow, error: storyError } = await supabase
              .from('banners')
              .select('*')
              .eq('title', 'Our Story')
              .maybeSingle();
            if (!storyError && storyRow) {
              setStoryBanner(storyRow as Banner);
            }
          }
        }
      } finally {
        setIsLoadingHome(false);
      }
    };

    fetchHomepage();
  }, []);

  return (
    <MainLayout backgroundImage={backgroundImage}>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          {backgroundImage ? (
            <>
              <div
                className="absolute inset-0 bg-center bg-cover blur-md opacity-50"
                style={{ backgroundImage: `url(${backgroundImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-background to-background" />
          )}
        </div>
        <div className="space-y-24 pb-24">
          {/* Hero Section */}
          <section className="relative w-full -mt-16">
            <HeroCarousel products={featuredProducts} setBackgroundImage={setBackgroundImage} />
          </section>

        {/* Value Propositions */}
        <section className="container mx-auto px-4 md:px-6 text-foreground dark:text-white">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex items-center gap-4">
              <Truck className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Free Shipping</h3>
                <p className="text-muted-foreground">On all orders over ksh 100,000</p>
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
        <section className="container mx-auto px-4 md:px-6 text-foreground dark:text-white">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Curated
              </p>
              <h2 className="text-4xl font-bold tracking-tight font-headline">
                Shop by Category
              </h2>
            </div>
            <Button asChild variant="ghost" size="lg">
              <Link href="/shop" className="flex items-center gap-2">
                Explore all products <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {isLoadingHome ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={`cat-skeleton-${i}`} />
              ))}
            </div>
          ) : !isLoadingHome && categories.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-border/60 bg-muted/40 p-10 text-center">
              <p className="text-lg font-medium text-foreground">New collections are on the way.</p>
              <p className="text-muted-foreground">Check back soon or browse all products.</p>
            </div>
          ) : (
            <Carousel opts={{ align: 'start' }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {categories.map((category) => (
                  <CarouselItem
                    key={category.id}
                    className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                  >
                    <Link href="/shop" className="group block h-full">
                      <div className="relative h-72 w-full overflow-hidden rounded-3xl transition-transform duration-300 group-hover:scale-105">
                        <Image
                          src={category.image_url?.trim() || '/placeholder.svg'}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <h3 className="text-2xl md:text-3xl font-bold text-white font-headline drop-shadow-lg">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          )}
        </section>
        
        {/* New Arrivals Section (carousel) */}
        <section className="container mx-auto px-4 md:px-6 text-foreground dark:text-white">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-4xl font-bold tracking-tight font-headline">
              New Arrivals
            </h2>
            <div className="text-sm text-muted-foreground">Fresh drops from our favorite makers.</div>
          </div>
          {isLoadingHome ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={`new-skeleton-${i}`} />
              ))}
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 bg-muted/40 p-10 text-center">
              <p className="text-lg font-medium text-foreground">No arrivals yet.</p>
              <p className="text-muted-foreground">We&apos;ll update this space as soon as new products land.</p>
            </div>
          ) : (
            <Carousel opts={{ align: 'start' }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {newArrivals.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4 xl:basis-1/5"
                  >
                    <div className="h-full">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          )}
        </section>

        {/* Promotional Banners */}
        <PromoBanners banners={banners.slice(0, 2)} />

        {/* Staff Picks Section (carousel) */}
        <section className="container mx-auto px-4 md:px-6 text-foreground dark:text-white">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-4xl font-bold tracking-tight font-headline">
              Staff Picks
            </h2>
            <p className="text-muted-foreground">Handpicked pieces we&apos;re excited about.</p>
          </div>
          {isLoadingHome ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={`staff-skeleton-${i}`} />
              ))}
            </div>
          ) : staffPicks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 bg-muted/40 p-10 text-center">
              <p className="text-lg font-medium text-foreground">We&apos;re still curating staff picks.</p>
              <p className="text-muted-foreground">Check back soon for our favorites.</p>
            </div>
          ) : (
            <Carousel opts={{ align: 'start' }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {staffPicks.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4 xl:basis-1/5"
                  >
                    <div className="h-full">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          )}
        </section>

        {/* Best Sellers Section (carousel) */}
        <section className="container mx-auto px-4 md:px-6 text-foreground dark:text-white">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-4xl font-bold tracking-tight font-headline">
              Best Sellers
            </h2>
            <p className="text-muted-foreground">Loved by our community right now.</p>
          </div>
          {isLoadingHome ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={`best-skeleton-${i}`} />
              ))}
            </div>
          ) : bestSellers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 bg-muted/40 p-10 text-center">
              <p className="text-lg font-medium text-foreground">We&apos;re curating this list.</p>
              <p className="text-muted-foreground">Check back for community favorites.</p>
            </div>
          ) : (
            <Carousel opts={{ align: 'start' }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {bestSellers.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4 xl:basis-1/5"
                  >
                    <div className="h-full">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          )}
        </section>

        <PromoBannerTriple banners={banners.slice(2, 5)} />
        
        {/* Brand Story Section */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-secondary/30">
            <div className="absolute inset-y-0 left-[-10%] w-1/2 bg-primary/10 blur-3xl opacity-50" />
            <div className="absolute inset-y-4 right-[-5%] w-1/3 bg-muted/20 blur-2xl opacity-40" />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-12 backdrop-blur-md">
              <div className="order-2 lg:order-1 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-foreground backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Crafted with Purpose
                </div>
                <h2 className="text-4xl font-bold tracking-tight font-headline text-foreground">
                  {storyBanner?.title ?? 'Our Story'}
                </h2>
                <p className="text-muted-foreground text-lg whitespace-pre-line">
                  {storyBanner?.subtitle ??
                    'Founded in 2024, Jeff\'s concepts began with a simple idea: to bring together the most exquisite and finely crafted goods from around the world into one seamless shopping experience.'}
                </p>
                {storyBanner?.cta_url && (
                  <Button size="lg" asChild className="mt-2 text-lg w-fit">
                    <Link href={storyBanner.cta_url}>Learn More</Link>
                  </Button>
                )}
              </div>
              <div className="relative h-96 w-full overflow-hidden rounded-2xl order-1 lg:order-2 border border-border/40 bg-card/60 backdrop-blur-lg">
                <Image
                  src={storyBanner?.image_url?.trim() || '/placeholder.svg'}
                  alt="Our Story"
                  fill
                  className="object-cover transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
              </div>
            </div>
          </div>
        </section>
        
        <PromoBannerSingle banner={banners[5]} />

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 md:px-6 text-foreground dark:text-white">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
            What Our Customers Say
          </h2>
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {isLoadingHome &&
                Array.from({ length: 3 }).map((_, i) => <ProductSkeleton compact key={`testimonial-skel-${i}`} />)}
              {!isLoadingHome && testimonials.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-dashed border-border/60 bg-muted/40 p-10 text-center">
                  <p className="text-lg font-medium text-foreground">You could be the first to review us.</p>
                  <p className="text-muted-foreground">Share your experience once you shop with us.</p>
                </div>
              ) : (
                testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="bg-secondary/30 border-0 rounded-3xl">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-4">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={testimonial.avatar_url?.trim() || undefined} alt={testimonial.name} />
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
                ))
              )}
            </div>
            <Card className="border-0 bg-secondary/40 backdrop-blur rounded-3xl">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Share your thoughts</p>
                  <h3 className="text-2xl font-bold font-headline">Leave a Testimonial</h3>
                  <p className="text-muted-foreground text-sm">
                    Help others shop with confidence. Your words appear once approved.
                  </p>
                </div>

                {!isSupabaseConfigured && (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
                    Supabase is not configured. Connect your keys to enable submissions.
                  </div>
                )}

                {testimonialError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {testimonialError}
                  </div>
                )}
                {testimonialSuccess && (
                  <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
                    {testimonialSuccess}
                  </div>
                )}

                <form
                  className="space-y-4"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (!isSupabaseConfigured) return;

                    setTestimonialError(null);
                    setTestimonialSuccess(null);

                    if (!testimonialName.trim() || !testimonialText.trim()) {
                      setTestimonialError('Please add your name and a short note.');
                      return;
                    }

                    try {
                      setIsSubmittingTestimonial(true);
                      const payload: Database['public']['Tables']['testimonials']['Insert'] = {
                        name: testimonialName.trim(),
                        text: testimonialText.trim(),
                        avatar_url: testimonialAvatar.trim() || null,
                        rating: testimonialRating,
                      };
                      const { data, error } = await supabase
                        .from('testimonials')
                        .insert([payload] as Database['public']['Tables']['testimonials']['Insert'][] as any)
                        .select()
                        .single();

                      if (error) {
                        throw error;
                      }

                      if (data) {
                        setTestimonials((prev) => [data as Testimonial, ...prev]);
                        setTestimonialSuccess('Thanks for sharing! Your testimonial has been added.');
                        setTestimonialName('');
                        setTestimonialText('');
                        setTestimonialAvatar('');
                        setTestimonialRating(5);
                      }
                    } catch (submitError) {
                      console.error('Error submitting testimonial:', submitError);
                      setTestimonialError('Could not save your testimonial. Please try again.');
                    } finally {
                      setIsSubmittingTestimonial(false);
                    }
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="testimonial-name">Name</Label>
                    <Input
                      id="testimonial-name"
                      placeholder="Your name"
                      value={testimonialName}
                      onChange={(e) => setTestimonialName(e.target.value)}
                      required
                      disabled={!isSupabaseConfigured || isSubmittingTestimonial}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testimonial-avatar">Avatar URL (optional)</Label>
                    <Input
                      id="testimonial-avatar"
                      placeholder="https://..."
                      value={testimonialAvatar}
                      onChange={(e) => setTestimonialAvatar(e.target.value)}
                      disabled={!isSupabaseConfigured || isSubmittingTestimonial}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex items-center gap-2">
                      {ratingOptions.map((rating) => (
                        <button
                          type="button"
                          key={rating}
                          aria-label={`Rate ${rating}`}
                          onClick={() => setTestimonialRating(rating)}
                          className={`rounded-full border px-3 py-2 transition ${
                            testimonialRating === rating
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border/60 bg-muted/50 text-muted-foreground hover:border-primary/50'
                          }`}
                          disabled={!isSupabaseConfigured || isSubmittingTestimonial}
                        >
                          <div className="flex items-center gap-1">
                            <Star
                              className={`h-4 w-4 ${testimonialRating >= rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
                            />
                            <span className="text-sm font-medium">{rating}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testimonial-text">Testimonial</Label>
                    <Textarea
                      id="testimonial-text"
                      placeholder="Share a short note about your experience..."
                      value={testimonialText}
                      onChange={(e) => setTestimonialText(e.target.value)}
                      rows={4}
                      required
                      disabled={!isSupabaseConfigured || isSubmittingTestimonial}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={!isSupabaseConfigured || isSubmittingTestimonial}>
                    {isSubmittingTestimonial ? 'Submitting...' : 'Submit Testimonial'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
        </div>
      </div>
    </MainLayout>
  );
}
