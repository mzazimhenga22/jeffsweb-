
'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { Minus, Plus, Trash2, ShoppingCart, Loader } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { products } from '@/lib/data';
import { getStyleSuggestions, type GetStyleSuggestionsOutput } from '@/ai/flows/get-style-suggestions';
import { ProductCard } from '@/components/product-card';

export default function CartPage() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, cartCount } = useCart();
  const [styleSuggestions, setStyleSuggestions] = React.useState<GetStyleSuggestionsOutput['suggestions']>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(true);

  React.useEffect(() => {
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      setLoadingSuggestions(true);
      getStyleSuggestions({
        productName: firstItem.name,
        productCategory: firstItem.category,
        currentProductId: firstItem.id
      }).then(result => {
        // Filter out items that are already in the cart
        const suggestionsInCart = result.suggestions.filter(suggestion => 
          !cartItems.some(cartItem => cartItem.id === suggestion.productId)
        );
        setStyleSuggestions(suggestionsInCart);
      }).finally(() => {
        setLoadingSuggestions(false);
      });
    } else {
      setLoadingSuggestions(false);
      setStyleSuggestions([]);
    }
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
                        const primaryImageId = item.imageIds?.[0]
                        const placeholder = primaryImageId ? PlaceHolderImages.find((p) => p.id === primaryImageId) : null
                        const imageUrl = item.image_url ?? placeholder?.imageUrl

                        return (
                          <li key={item.id} className="flex items-center p-6">
                            <div className="w-24 h-24 relative rounded-md overflow-hidden">
                              {imageUrl && (
                                <Image
                                  src={imageUrl}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  data-ai-hint={placeholder?.imageHint}
                                />
                              )}
                            </div>
                            <div className="ml-6 flex-1">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">Vendor: {item.vendorName || 'Admin'}</p>
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
            {styleSuggestions.length > 0 && (
              <div className="mt-24">
                <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
                  You Might Also Like
                </h2>
                {loadingSuggestions ? (
                    <div className="flex justify-center"><Loader className="h-8 w-8 animate-spin" /></div>
                ) : (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                    {styleSuggestions.slice(0, 4).map((suggestion) => {
                        const suggestedProduct = products.find(p => p.id === suggestion.productId);
                        if (!suggestedProduct) return null;
                        return (
                            <div key={suggestion.productId}>
                                <ProductCard product={suggestedProduct} />
                            </div>
                        )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
