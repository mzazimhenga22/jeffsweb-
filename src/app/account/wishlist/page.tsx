
'use client';

import * as React from 'react';
import { useWishlist } from '@/context/wishlist-context';
import { ProductCard } from '@/components/product-card';
import { Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MyWishlistPage() {
  const { wishlistItems } = useWishlist();

  return (
    <Card>
        <CardHeader>
            <CardTitle>My Wishlist</CardTitle>
            <CardDescription>
                Your collection of favorite items.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {wishlistItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-secondary/30 rounded-2xl">
                    <Heart className="mx-auto h-24 w-24 text-muted-foreground" />
                    <h2 className="mt-6 text-2xl font-semibold">Your wishlist is empty</h2>
                    <p className="mt-2 text-muted-foreground">Explore our collections and add your favorite items.</p>
                    <Button asChild className="mt-6">
                        <Link href="/shop">Start Shopping</Link>
                    </Button>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
