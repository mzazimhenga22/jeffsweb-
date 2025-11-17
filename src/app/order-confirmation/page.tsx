
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CartItem } from '@/lib/types';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderData = searchParams.get('order');
    const [orderItems, setOrderItems] = React.useState<CartItem[]>([]);
    const [orderId, setOrderId] = React.useState('');

    React.useEffect(() => {
        if (orderData) {
            try {
                const items = JSON.parse(decodeURIComponent(orderData));
                setOrderItems(items);
            } catch (e) {
                console.error("Failed to parse order data", e);
            }
        }
        // Generate a mock order ID
        setOrderId(`EC${Math.floor(Math.random() * 90000) + 10000}`);
    }, [orderData]);

    const subtotal = React.useMemo(() => {
        return orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [orderItems]);
    
    const taxes = subtotal * 0.08; // 8% tax
    const total = subtotal + taxes;

    return (
        <MainLayout>
            <div className="container mx-auto py-12 px-4 md:px-6">
                <div className="flex flex-col items-center justify-center text-center">
                    <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
                    <h1 className="text-4xl font-bold tracking-tight font-headline mb-2">
                        Thank You For Your Order!
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mb-8">
                        Your receipt and order details are below.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <Card className='bg-card/60 backdrop-blur-xl border-border/20 rounded-3xl'>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Order #{orderId}</CardTitle>
                            <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                        </CardHeader>
                        <CardContent className="p-6">
                             <div className="space-y-4 mb-8">
                                {orderItems.map(item => {
                                    const image = PlaceHolderImages.find(p => p.id === item.imageIds[0]);
                                    const sellerName = item.salespersonName || item.vendorName || 'Ethereal Commerce';
                                    return (
                                        <div key={item.id} className='flex items-center gap-4'>
                                            <div className="w-16 h-16 relative rounded-md overflow-hidden">
                                                {image && <Image src={image.imageUrl} alt={item.name} fill className="object-cover" />}
                                            </div>
                                            <div className='flex-1'>
                                                <p className='font-medium'>{item.name}</p>
                                                <p className='text-sm text-muted-foreground'>Qty: {item.quantity}</p>
                                                <p className='text-xs text-muted-foreground'>Sold by: {sellerName}</p>
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
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taxes</span>
                                    <span>${taxes.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <Separator className="my-8" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div>
                                    <h3 className="font-semibold mb-2">Shipping To</h3>
                                    <p className="text-muted-foreground">
                                        John Doe<br/>
                                        123 Main St<br/>
                                        New York, NY 10001
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Billed To</h3>
                                    <p className="text-muted-foreground">
                                        John Doe<br/>
                                        Visa ending in 1234<br/>
                                        123 Main St<br/>
                                        New York, NY 10001
                                    </p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>
                
                 <div className="flex gap-4 justify-center mt-8">
                    <Button asChild size="lg">
                        <Link href="/shop">Continue Shopping</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/account/orders">View My Orders</Link>
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}

export default function OrderConfirmationPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <OrderConfirmationContent />
        </React.Suspense>
    )
}
