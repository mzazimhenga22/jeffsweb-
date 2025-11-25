
'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { GetStyleSuggestionsOutput } from '@/ai/flows/get-style-suggestions';
import { useAuth } from '@/context/auth-context';

export default function CartPage() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, cartCount } = useCart();
  const [styleSuggestions, setStyleSuggestions] = React.useState<GetStyleSuggestionsOutput['suggestions']>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(true);
  const { supabase } = useAuth();
  const [vendorsById, setVendorsById] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    // Suggestions disabled until Supabase-backed recommendations are added.
    setStyleSuggestions([]);
    setLoadingSuggestions(false);
  }, [cartItems]);

  React.useEffect(() => {
    const vendorIds = Array.from(
      new Set(cartItems.map((item) => item.vendor_id).filter(Boolean) as string[])
    );
    if (vendorIds.length === 0) {
      setVendorsById({});
      return;
    }

    const loadVendors = async () => {
      const [{ data: profiles, error: profileError }, { data: users, error: userError }] =
        await Promise.all([
          supabase.from('vendor_profiles').select('id, user_id, store_name').in('id', vendorIds),
          supabase.from('users').select('id, full_name, name, email').in('id', vendorIds),
        ]);

      if (profileError || userError) {
        console.error('Failed to load vendor names for cart', { profileError, userError });
      }

      const map: Record<string, string> = {};
      (profiles ?? []).forEach((profile: any) => {
        const label = profile.store_name ?? 'Vendor';
        if (profile.id) map[profile.id] = label;
        if (profile.user_id) map[profile.user_id] = label;
      });
      (users ?? []).forEach((u: any) => {
        const label = u.full_name ?? u.name ?? u.email ?? 'Vendor';
        if (!map[u.id]) map[u.id] = label;
      });
      setVendorsById(map);
    };

    loadVendors();
  }, [cartItems, supabase]);


  return (
    <MainLayout>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/30 via-background/80 to-background backdrop-blur-3xl" />
        <div className="container mx-auto py-12 px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Your Cart</h1>
        
        {cartCount === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-2xl">
            <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild className="mt-6">
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <Card className='bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-lg shadow-black/10'>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border/50">
                      {cartItems.map((item) => {
                        const imageId = Array.isArray(item.imageIds) ? item.imageIds[0] : undefined;
                        const image = imageId ? PlaceHolderImages.find(p => p.id === imageId) : undefined;
                        const vendorName = item.vendor_id ? vendorsById[item.vendor_id] : undefined;
                        return (
                          <li key={item.id} className="flex items-center p-6">
                            <div className="w-24 h-24 relative rounded-md overflow-hidden">
                              {image && 
                                <Image 
                                  src={image.imageUrl} 
                                  alt={item.name} 
                                  fill
                                  className="object-cover" 
                                  data-ai-hint={image.imageHint}
                                />
                              }
                            </div>
                            <div className="ml-6 flex-1">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              {vendorName && (
                                <p className="text-xs text-muted-foreground">Sold by {vendorName}</p>
                              )}
                              <p className="text-muted-foreground text-sm">
                                  {item.color && `Color: ${item.color}`}
                                  {item.size && item.color && ' | '}
                                  {item.size && `Size: ${item.size}`}
                              </p>
                              <p className="text-lg font-bold mt-1">Ksh {item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 border rounded-md p-1">
                                <Button variant="ghost" size="icon" className='h-6 w-6' onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-bold w-4 text-center">{item.quantity}</span>
                                <Button variant="ghost" size="icon" className='h-6 w-6' onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                                <Trash2 className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <Card className='bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl sticky top-28 shadow-lg shadow-black/15'>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Ksh {cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes</span>
                        <span>Calculated at checkout</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>Ksh {cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button asChild size="lg" className="w-full mt-6 text-lg py-6">
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Suggestions temporarily disabled until Supabase-backed recommendations are implemented. */}
          </>
        )}
        </div>
      </div>
    </MainLayout>
  );
}
