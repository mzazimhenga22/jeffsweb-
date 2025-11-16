
'use client';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
    return (
        <MainLayout>
            <div className="container mx-auto py-24 px-4 md:px-6">
                <div className="flex flex-col items-center justify-center text-center">
                    <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
                    <h1 className="text-4xl font-bold tracking-tight font-headline mb-4">
                        Thank You For Your Order!
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mb-8">
                        Your order has been placed successfully. You will receive an email confirmation shortly with your order details and tracking information.
                    </p>
                    <div className="flex gap-4">
                        <Button asChild size="lg">
                            <Link href="/shop">Continue Shopping</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/account/orders">View My Orders</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
