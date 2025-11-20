
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

export default function CartPage() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, cartCount } = useCart();
  const [styleSuggestions, setStyleSuggestions] = React.useState<GetStyleSuggestionsOutput['suggestions']>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(true);

  React.useEffect(() => {
    // Suggestions disabled until Supabase-backed recommendations are added.
    setStyleSuggestions([]);
    setLoadingSuggestions(false);
  }, [cartItems]);


  return (
    <MainLayout>
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
                <Card className='bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl'>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border/50">
                      {cartItems.map((item) => {
                        const imageId = Array.isArray(item.imageIds) ? item.imageIds[0] : undefined;
                        const image = imageId ? PlaceHolderImages.find(p => p.id === imageId) : undefined;
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
                              <p className="text-muted-foreground text-sm">
                                  {item.color && `Color: ${item.color}`}
                                  {item.size && item.color && ' | '}
                                  {item.size && `Size: ${item.size}`}
                              </p>
                              <p className="text-lg font-bold mt-1">${item.price.toFixed(2)}</p>
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
                <Card className='bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl sticky top-28'>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
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
                        <span>${cartTotal.toFixed(2)}</span>
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
    </MainLayout>
  );
}
