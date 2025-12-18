'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Product, Order } from '@/lib/types';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderIdsParam = searchParams.get('orderIds') ?? searchParams.get('orderId');
    const orderIds = React.useMemo(
        () => orderIdsParam?.split(',').map((id) => id.trim()).filter(Boolean) ?? [],
        [orderIdsParam],
    );

    const { supabase, user } = useAuth();
    const customerId = (user as any)?.id ?? null;
    const [confirmedOrders, setConfirmedOrders] = React.useState<Order[]>([]);
    const [productsById, setProductsById] = React.useState<Record<string, Product>>({});
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [salespeopleById, setSalespeopleById] = React.useState<Record<string, string>>({});

    const vatRate = 0.16;
    const subtotal = React.useMemo(
        () =>
            confirmedOrders.reduce((sum, order) => {
                const gross = order.total ?? 0;
                return sum + gross / (1 + vatRate);
            }, 0),
        [confirmedOrders, vatRate],
    );
    const total = React.useMemo(
        () => confirmedOrders.reduce((sum, order) => sum + (order.total ?? 0), 0),
        [confirmedOrders],
    );
    const taxes = total - subtotal;

    React.useEffect(() => {
        if (!orderIds.length) return;

        const fetchOrders = async () => {
            setLoading(true);
            setError(null);

            const baseQuery = supabase.from('orders').select('*').in('id', orderIds);
            const { data, error } = customerId
                ? await baseQuery.eq('user_id', customerId)
                : await baseQuery;

            if (error) {
                console.error('Failed to load orders for confirmation', error);
                setError('Could not load your order details.');
                setConfirmedOrders([]);
                setLoading(false);
                return;
            }

            const orders = (data as Order[]) ?? [];
            setConfirmedOrders(orders);
            setLoading(false);

            const productIds = Array.from(
                new Set(orders.map((o) => o.product_id).filter(Boolean) as string[]),
            );
            if (productIds.length === 0) return;

            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('*')
                .in('id', productIds);

            if (productsError) {
                console.error('Failed to load products for confirmation', productsError);
                return;
            }

            const map: Record<string, Product> = {};
            (products ?? []).forEach((p) => {
                map[p.id] = p as Product;
            });
            setProductsById(map);
        };

        fetchOrders();
    }, [orderIds, supabase]);

    React.useEffect(() => {
        const salespeopleIds = Array.from(
            new Set(confirmedOrders.map((o) => o.salesperson_id).filter(Boolean) as string[]),
        );
        if (salespeopleIds.length === 0) return;

        const loadSalespeople = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, name, email')
                .in('id', salespeopleIds);

            if (error) {
                console.error('Failed to load salesperson details', error);
                return;
            }

            const map: Record<string, string> = {};
            (data ?? []).forEach((u) => {
                map[u.id] = (u as any)?.full_name ?? (u as any)?.name ?? u.email ?? 'Salesperson';
            });
            setSalespeopleById(map);
        };

        loadSalespeople();
    }, [confirmedOrders, supabase]);

    if (loading) {
        return (
            <MainLayout>
                <div className="container mx-auto py-12 px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Loading your order...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!orderIds.length || error || confirmedOrders.length === 0) {
        return (
            <MainLayout>
                <div className="container mx-auto py-12 px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center text-center">
                        <h1 className="text-4xl font-bold tracking-tight font-headline mb-2">
                            {error ? 'Could not load order' : 'Order not found'}
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mb-8">
                            {error
                                ? 'Something went wrong while fetching your order. Please try again.'
                                : "We couldn't find the order you're looking for."}
                        </p>
                        <Button asChild size="lg">
                            <Link href="/shop">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const firstOrder = confirmedOrders[0];
    const placeholderImage = PlaceHolderImages.all[0];
    const customerName =
        (user as any)?.full_name ??
        (user as any)?.name ??
        (user as any)?.email ??
        'Valued customer';
    const servedBy =
        firstOrder?.salesperson_id && salespeopleById[firstOrder.salesperson_id]
            ? salespeopleById[firstOrder.salesperson_id]
            : 'Online checkout';
    const handlePrint = () => window.print();

    return (
        <MainLayout>
            <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/30 via-background/80 to-background backdrop-blur-3xl" />
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
                    <Card className='bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-lg shadow-black/10'>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">
                                Order #{firstOrder.id.substring(0, 8)}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Date:{' '}
                                {firstOrder?.order_date
                                    ? new Date(firstOrder.order_date).toLocaleDateString()
                                    : 'N/A'}
                            </p>
                        </CardHeader>
                        <CardContent className="p-6">
                             <div className="space-y-4 mb-8">
                                {confirmedOrders.map((order) => {
                                    const product = order.product_id
                                        ? productsById[order.product_id]
                                        : undefined;
                                    return (
                                        <div key={order.id} className="flex items-start gap-4">
                                            <div className="w-16 h-16 relative rounded-md overflow-hidden bg-muted">
                                                {product?.image_url ? (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Image
                                                        src={placeholderImage.imageUrl}
                                                        alt="Placeholder"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {product?.name ?? 'Product'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Qty: {order.quantity}
                                                </p>
                                            </div>
                                            <p className="font-semibold">
                                                Ksh {(order.total ?? 0).toFixed(2)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>Ksh {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>Ksh 0.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taxes</span>
                                    <span>Ksh {taxes.toFixed(2)} (16% VAT)</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>Ksh {total.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <Separator className="my-8" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div>
                                    <h3 className="font-semibold mb-2">Shipping To</h3>
                                    <p className="text-muted-foreground">
                                        {customerName}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Billed To</h3>
                                    <p className="text-muted-foreground">
                                        {customerName}<br/>
                                        {typeof (user as any)?.email === 'string'
                                            ? (user as any)?.email
                                            : 'Email on file'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Served By</h3>
                                    <p className="text-muted-foreground">
                                        {servedBy}
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
                    <Button variant="secondary" size="lg" onClick={handlePrint}>
                        Print Receipt
                    </Button>
                </div>
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
