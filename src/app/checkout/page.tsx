
'use client';

import * as React from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { User as DbUser } from '@/lib/types';
import type { Database } from '@/lib/database.types';
import { useEffect, useMemo, useState } from 'react';


export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { toast } = useToast();
    const router = useRouter();
    const { supabase, session, user } = useAuth();
    const profileUser = (user as DbUser | null) ?? null;
    const [isPlacing, setIsPlacing] = React.useState(false);
    const [vendorsById, setVendorsById] = useState<Record<string, string>>({});

    useEffect(() => {
        const vendorIds = Array.from(new Set(cartItems.map((item) => item.vendor_id).filter(Boolean) as string[]));
        if (vendorIds.length === 0) return;

        supabase
          .from('users')
          .select('id, name, full_name, email')
          .in('id', vendorIds)
          .then(({ data, error }) => {
            if (error) {
              console.error('Failed to load vendor names for checkout', error);
              return;
            }
            const map: Record<string, string> = {};
            (data ?? []).forEach((u) => {
              map[u.id] = u.name ?? (u as any).full_name ?? u.email ?? 'Vendor';
            });
            setVendorsById(map);
          });
    }, [cartItems, supabase]);

    const resolvedItems = useMemo(() => {
        return cartItems.map((item) => ({
            ...item,
            vendorName: item.vendor_id ? vendorsById[item.vendor_id] : null,
        }));
    }, [cartItems, vendorsById]);

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            toast({
                title: 'Your cart is empty',
                description: 'Add some items before checking out.',
            });
            return;
        }

        const customerId = profileUser?.id ?? session?.user?.id ?? null;
        if (!customerId) {
            toast({
                title: 'Please sign in',
                description: 'Login to place your order.',
                variant: 'destructive',
            });
            router.push('/login');
            return;
        }

        try {
            setIsPlacing(true);
            const orderDate = new Date().toISOString();
            const baseOrderId = `order-${Date.now()}`;
            const orderRows: Database['public']['Tables']['orders']['Insert'][] = cartItems.map((item, index) => ({
                id: `${baseOrderId}-${index}`,
                userId: customerId,
                vendor_id: item.vendor_id,
                productId: item.id,
                salespersonId: null,
                quantity: item.quantity,
                total: item.price * item.quantity,
                status: 'Pending',
                orderDate,
                created_at: orderDate,
              }));

            const { data, error } = await supabase
                .from('orders')
                .insert(orderRows)
                .select('id')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const confirmationId = data?.[0]?.id ?? orderRows[0].id;

            toast({
                title: "Order Placed!",
                description: "Thank you for your purchase.",
            });
            
            clearCart();
            router.push(`/order-confirmation?orderId=${confirmationId}`);
        } catch (err) {
            console.error('Failed to place order', err);
            toast({
                title: 'Could not place order',
                description: 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsPlacing(false);
        }
    }
    
    return (
        <MainLayout>
            <div className="container mx-auto py-12 px-4 md:px-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline mb-8 text-center">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Shipping and Payment Info */}
                    <div className="space-y-8">
                        <Card className='bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl'>
                            <CardHeader>
                                <CardTitle>Shipping Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <Label htmlFor="first-name">First Name</Label>
                                        <Input id="first-name" placeholder="John" />
                                    </div>
                                    <div className="col-span-1">
                                        <Label htmlFor="last-name">Last Name</Label>
                                        <Input id="last-name" placeholder="Doe" />
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input id="address" placeholder="123 Main St" />
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type='email' placeholder="john@example.com" />
                                    </div>
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" placeholder="New York" />
                                    </div>
                                    <div>
                                        <Label htmlFor="state">State</Label>
                                        <Input id="state" placeholder="NY" />
                                    </div>
                                    <div>
                                        <Label htmlFor="zip">Zip Code</Label>
                                        <Input id="zip" placeholder="10001" />
                                    </div>
                                     <div>
                                        <Label htmlFor="country">Country</Label>
                                        <Input id="country" placeholder="USA" />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className='bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl'>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div>
                                        <Label htmlFor="card-number">Card Number</Label>
                                        <Input id="card-number" placeholder="**** **** **** 1234" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="expiry-date">Expiry</Label>
                                            <Input id="expiry-date" placeholder="MM/YY" />
                                        </div>
                                        <div className='col-span-2'>
                                            <Label htmlFor="cvc">CVC</Label>
                                            <Input id="cvc" placeholder="123" />
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:sticky lg:top-28 self-start">
                         <Card className='bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl'>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                                <CardDescription>{cartItems.length} items in your cart</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {resolvedItems.map(item => {
                                        const imageId = Array.isArray(item.imageIds) ? item.imageIds[0] : undefined;
                                        const image = imageId ? PlaceHolderImages.find(p => p.id === imageId) : undefined;
                                        return (
                                            <div key={item.id} className='flex items-start gap-4'>
                                                <div className="w-16 h-16 relative rounded-md overflow-hidden">
                                                    {image && <Image src={image.imageUrl} alt={item.name} fill className="object-cover" />}
                                                </div>
                                                <div className='flex-1'>
                                                    <p className='font-medium'>{item.name}</p>
                                                    {item.vendorName && (
                                                        <p className='text-xs text-muted-foreground'>Sold by {item.vendorName}</p>
                                                    )}
                                                    <p className='text-sm text-muted-foreground'>Qty: {item.quantity}</p>
                                                    {(item.size || item.color) && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.color && `Color: ${item.color}`}
                                                            {item.size && item.color && ' / '}
                                                            {item.size && `Size: ${item.size}`}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className='font-semibold'>${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        )
                                    })}
                                </div>

                                <Separator className="my-6" />

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span>$0.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Taxes</span>
                                        <span>$0.00</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>${cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button size="lg" className="w-full mt-6 text-lg py-6" onClick={handlePlaceOrder} disabled={isPlacing}>
                                    {isPlacing ? 'Placing Order...' : 'Place Order'}
                                </Button>
                                <p className='text-center text-xs text-muted-foreground mt-4'>By placing your order, you agree to our <Link href="#" className='underline'>Terms & Conditions</Link>.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
