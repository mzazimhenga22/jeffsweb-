
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function PromoBannerSingle() {
  return (
    <section className="container mx-auto">
      <Link href="/shop" className="group">
        <div className="relative h-[400px] w-full overflow-hidden rounded-3xl">
          <Image
            src="/placeholder.svg"
            alt="New Collection"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-start text-white p-12">
            <h3 className="text-4xl md:text-5xl font-bold font-headline max-w-lg">The Dawn of a New Collection</h3>
            <p className="mt-2 text-lg text-white/80 max-w-lg">Explore curated pieces that redefine elegance and sophistication.</p>
            <Button variant="secondary" size="lg" className="mt-6">
              Discover Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
    </section>
  );
}
