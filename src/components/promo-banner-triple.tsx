
'use client';

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import type { Banner } from '@/lib/types'

type Props = {
  banners: Banner[]
}

export function PromoBannerTriple({ banners }: Props) {
  const slots = banners.slice(0, 3)
  if (slots.length === 0) return null

  return (
    <section className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {slots.map((bannerInfo) => {
          return (
            <Link key={bannerInfo.id} href={bannerInfo.cta_url || '/shop'} className="group">
              <Card className="overflow-hidden rounded-3xl h-96 border-none">
                <CardContent className="p-0 h-full">
                  <div className="relative h-full w-full">
                    <Image
                      src={bannerInfo.image_url || '/placeholder.svg'}
                      alt={bannerInfo.title || 'Promo banner'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between text-white p-6">
                      <h3 className="text-2xl font-bold font-headline">{bannerInfo.title}</h3>
                      <div className="h-10 w-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
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
  )
}
