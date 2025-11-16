'use client';

import * as React from 'react';
import Image from 'next/image';
import { products } from '@/lib/data';
import type { CartItem } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, Search, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VendorPosPage() {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { toast } = useToast();
  
  // For the vendor dashboard, we only show products belonging to 'vendor-2'
  const vendorProducts = products.filter(p => p.vendorId === 'vendor-2');

  const filteredProducts = vendorProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (productId: string) => {
    const product = vendorProducts.find((p) => p.id === productId);
    if (!product) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          size: product.sizes?.[0] || null,
          color: product.colors?.[0] || null,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };
  
  const updatePrice = (productId: string, newPrice: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, price: newPrice } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };
  
  const clearCart = () => {
    setCart([]);
  }

  const cartSubtotal = React.useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);
  
  const tax = cartSubtotal * 0.08;
  const cartTotal = cartSubtotal + tax;

  const handleCreateOrder = () => {
    if(cart.length === 0) {
        toast({
            variant: "destructive",
            title: "Cannot create order",
            description: "Your cart is empty.",
        });
        return;
    }
    toast({
        title: "Order Created!",
        description: "The new order has been successfully created.",
    });
    clearCart();
  }

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Product List */}
      <div className="col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4 -mr-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const image = PlaceHolderImages.find(
                    (p) => p.id === product.imageId
                  );
                  return (
                    <Card
                      key={product.id}
                      className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                      onClick={() => addToCart(product.id)}
                    >
                      {image && (
                        <div className="aspect-square relative">
                          <Image
                            src={image.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            data-ai-hint={image.imageHint}
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <div className="col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Cart</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearCart} disabled={cart.length === 0}>
                <XCircle className="mr-2 h-4 w-4" />
                Clear Cart
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
                {cart.length > 0 ? (
                    <div className='divide-y'>
                    {cart.map((item) => (
                        <div key={item.id} className="flex items-start gap-4 p-4">
                            <div className="flex-1 space-y-2">
                                <p className="font-semibold">{item.name}</p>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span>{item.quantity}</span>
                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div className="text-right">
                                <Input 
                                    type="number" 
                                    value={item.price.toFixed(2)}
                                    onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                                    className="w-24 h-8 text-right font-semibold"
                                />
                                <Button variant="ghost" size="icon" className="h-8 w-8 mt-1 text-muted-foreground" onClick={() => removeFromCart(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Cart is empty</p>
                    </div>
                )}
            </ScrollArea>
          </CardContent>
          {cart.length > 0 && (
            <div className="p-6 border-t mt-auto">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${cartSubtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Tax (8%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                </div>
                <Button size="lg" className="w-full mt-4" onClick={handleCreateOrder}>
                    Create Order
                </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
