
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const banners = [
    {
        id: 'promo-banner-4',
        title: 'Luxe Accessories',
        href: '/shop',
    },
    {
        id: 'promo-banner-5',
        title: 'Statement Shoes',
        href: '/shop',
    },
    {
        id: 'promo-banner-6',
        title: 'The Gift Guide',
        href: '/shop',
    }
]

export function PromoBannerTriple() {
  return (
    <section className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {banners.map(bannerInfo => {
            const bannerImage = PlaceHolderImages.find(p => p.id === bannerInfo.id);
            if (!bannerImage) return null;

            return (
                <Link key={bannerInfo.id} href={bannerInfo.href} className="group">
                    <Card className="overflow-hidden rounded-3xl h-96 border-none">
                        <CardContent className='p-0 h-full'>
                            <div className="relative h-full w-full">
                                <Image
                                    src={bannerImage.imageUrl}
                                    alt={bannerInfo.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    data-ai-hint={bannerImage.imageHint}
                                />
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between text-white p-6">
                                    <h3 className="text-2xl font-bold font-headline">{bannerInfo.title}</h3>
                                    <div className='h-10 w-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1'>
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            )
        })}
      </div>
    </section>
  );
}

    
