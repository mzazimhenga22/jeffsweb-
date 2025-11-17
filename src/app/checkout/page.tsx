
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
import { addOrder } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import type { Order } from '@/lib/types';


export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();

    const handlePlaceOrder = () => {
        // In a real app, you would process the payment here.
        const newOrderId = `order-${Date.now()}`;
        
        cartItems.forEach((item, index) => {
             const newOrder: Order = {
                id: `${newOrderId}-${index}`,
                userId: user?.role === 'customer' ? 'user-1' : 'user-2', // Mock user ID
                vendorId: item.vendorId,
                productId: item.id,
                salespersonId: 'user-5', // Mock salesperson
                quantity: item.quantity,
                total: item.price * item.quantity,
                status: 'Pending',
                orderDate: new Date().toISOString().split('T')[0],
                size: item.size,
                color: item.color
            };
            addOrder(newOrder);
        })
        
        toast({
            title: "Order Placed!",
            description: "Thank you for your purchase.",
        });
        
        const href = `/order-confirmation?orderId=${newOrderId}`;
        clearCart();
        router.push(href);
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
                                    {cartItems.map(item => {
                                        const image = PlaceHolderImages.find(p => p.id === item.imageIds[0]);
                                        return (
                                            <div key={item.id} className='flex items-start gap-4'>
                                                <div className="w-16 h-16 relative rounded-md overflow-hidden">
                                                    {image && <Image src={image.imageUrl} alt={item.name} fill className="object-cover" />}
                                                </div>
                                                <div className='flex-1'>
                                                    <p className='font-medium'>{item.name}</p>
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

                                <Button size="lg" className="w-full mt-6 text-lg py-6" onClick={handlePlaceOrder}>
                                    Place Order
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
