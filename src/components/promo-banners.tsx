
'use client';

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { Banner } from '@/lib/types'

type Props = {
  banners: Banner[]
}

export function PromoBanners({ banners }: Props) {
  const renderBanners = banners.slice(0, 2)
  if (renderBanners.length === 0) return null

  return (
    <section className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderBanners.map((banner) => (
          <Link key={banner.id} href={banner.cta_url || '/shop'} className="group">
            <div className="relative h-80 w-full overflow-hidden rounded-3xl">
              <Image
                src={banner.image_url || '/placeholder.svg'}
                alt={banner.title || 'Promo banner'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                <h3 className="text-3xl md:text-4xl font-bold font-headline">{banner.title}</h3>
                {banner.subtitle && <p className="mt-2 text-lg text-white/80">{banner.subtitle}</p>}
                <Button variant="outline" className="mt-6 bg-white/10 backdrop-blur-lg border-white/30 hover:bg-white/20 text-white">
                  {banner.cta_text || 'Shop Now'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
