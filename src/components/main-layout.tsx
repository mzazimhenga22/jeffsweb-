import type React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function MainLayout({
  children,
  backgroundImage,
}: {
  children: React.ReactNode;
  backgroundImage?: string | null;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {backgroundImage && (
        <div className="fixed inset-0 z-[-1] overflow-hidden">
          <Image
            src={backgroundImage}
            alt="Dynamic background"
            fill
            className="object-cover opacity-20 blur-2xl transition-all duration-1000"
          />
           <div className="absolute inset-0 bg-background/80" />
        </div>
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
