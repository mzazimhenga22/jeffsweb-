
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Orders Found</CardTitle>
          <CardDescription>You must be logged in to view your orders.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items:(
        *,
        products:(*)
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Could not load orders. Please try again later.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Orders Found</CardTitle>
          <CardDescription>You haven't placed any orders yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your Orders</h1>
      {orders.map((order: any) => (
        <Card key={order.id}>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
              <CardDescription>
                {new Date(order.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge className={order.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}>
              {order.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                        <span>{item.products.name} (x{item.quantity})</span>
                        <span>${(item.products.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>${order.total_price.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
