
'use client';

import * as React from 'react';
import { orders as allOrders, products } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function MyOrdersPage() {
  // Mocking customer orders. In a real app, this would come from an API call for the logged-in user.
  const customerId = 'user-1';
  const customerOrders = allOrders.filter((o) => o.userId === customerId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            View your complete order history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customerOrders.length > 0 ? (
             <div className="space-y-8">
              {customerOrders.map((order) => {
                const product = products.find((p) => p.id === order.productId);
                 const image = product ? PlaceHolderImages.find(i => i.id === product.imageIds[0]) : null;

                return (
                  <div key={order.id} className="border-b pb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold">Order ID: #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">Date: {order.orderDate}</p>
                        </div>
                        <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                    </div>

                    <div className="flex items-start gap-4">
                      {image && (
                        <div className="w-24 h-24 relative rounded-md overflow-hidden">
                           <Image src={image.imageUrl} alt={product?.name || 'Product'} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                          <p className='font-semibold'>{product?.name || 'Product not found'}</p>
                          {(order.size || order.color) && (
                            <p className="text-sm text-muted-foreground">
                                {order.color && `Color: ${order.color}`}
                                {order.size && order.color && ' / '}
                                {order.size && `Size: ${order.size}`}
                            </p>
                          )}
                          <p className='text-sm text-muted-foreground'>Qty: {order.quantity}</p>
                          <p className='text-lg font-bold mt-1'>${order.total.toFixed(2)}</p>
                      </div>
                       <Button variant="outline">Track Order</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
