
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function PromoBanners() {
  return (
    <section className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/shop" className="group">
            <div className="relative h-80 w-full overflow-hidden rounded-3xl">
              <Image
                src="/placeholder.svg"
                alt="Timeless Watches"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                <h3 className="text-3xl md:text-4xl font-bold font-headline">Timeless Watches</h3>
                <p className="mt-2 text-lg text-white/80">Discover our new collection</p>
                <Button variant="outline" className="mt-6 bg-white/10 backdrop-blur-lg border-white/30 hover:bg-white/20 text-white">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Link>
            <Link href="/shop" className="group">
            <div className="relative h-80 w-full overflow-hidden rounded-3xl">
              <Image
                src="/placeholder.svg"
                alt="Summer Sale"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                <h3 className="text-3xl md:text-4xl font-bold font-headline">Summer Sale</h3>
                <p className="mt-2 text-lg text-white/80">Up to 40% off</p>
                 <Button variant="outline" className="mt-6 bg-white/10 backdrop-blur-lg border-white/30 hover:bg-white/20 text-white">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Link>
      </div>
    </section>
  );
}
