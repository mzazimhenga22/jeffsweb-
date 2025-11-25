
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderStatus } from '@/lib/types';
import { OrderStatusUpdater } from '@/components/order-status-updater';
import { useAuth } from '@/context/auth-context';

export default function SalespersonOrdersPage() {
  const { toast } = useToast();
  const { supabase, user } = useAuth();
  const salespersonId = user?.id ?? null;
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [users, setUsers] = React.useState<Record<string, { name: string; email: string }>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;
    if (!salespersonId) {
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      const [{ data: orderRows, error: orderError }, { data: userRows, error: userError }] = await Promise.all([
        supabase
          .from('orders')
          .select(
            'id, created_at, user_id, vendor_id, product_id, quantity, salesperson_id, status, total, total_amount, order_date, shipping_address',
          )
          .eq('salesperson_id', salespersonId)
          .order('created_at', { ascending: false }),
        supabase.from('users').select('id, full_name, email'),
      ]);

      if (!isMounted) return;

      if (orderError || userError) {
        console.error('Failed to load salesperson orders', { orderError, userError });
        toast({
          title: 'Unable to load orders',
          description: 'Please refresh to try again.',
          variant: 'destructive',
        });
      }

      setOrders((orderRows as Order[]) ?? []);
      const usersMap: Record<string, { name: string; email: string }> = {};
      (userRows ?? []).forEach((u: any) => {
        usersMap[u.id] = { name: u.full_name ?? '', email: u.email ?? '' };
      });
      setUsers(usersMap);
      setIsLoading(false);
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [salespersonId, supabase, toast]);

  const handleAction = (message: string) => {
    toast({
      title: message,
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      toast({
        title: 'Order Status Updated',
        description: `Order ${orderId} has been updated to "${newStatus}".`,
      });
    } catch (error) {
      console.error('Failed to update status', error);
      toast({
        title: 'Unable to update order status',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const customer = users[order.userId ?? ''];
    return (
      order.id.toLowerCase().includes(term) ||
      (customer?.name?.toLowerCase().includes(term) ?? false) ||
      (customer?.email?.toLowerCase().includes(term) ?? false)
    );
  });

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>View and track all orders you're credited for.</CardDescription>
            </div>
            <Input
              placeholder="Search orders..."
              className="w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders found.</p>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
                const customer = users[order.userId ?? ''];
                return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{customer?.name || 'Unknown User'}</TableCell>
                <TableCell>
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleDateString()
                    : order.created_at
                    ? new Date(order.created_at).toLocaleDateString()
                    : '—'}
                </TableCell>
                <TableCell>${(order.total ?? 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === 'Delivered'
                        ? 'default'
                        : order.status === 'On Transit'
                        ? 'secondary'
                        : order.status === 'Processing'
                        ? 'secondary'
                        : order.status === 'Pending'
                        ? 'outline'
                        : 'destructive'
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <OrderStatusUpdater order={order} onStatusChange={handleStatusChange}>
                      <DropdownMenuItem onClick={() => handleAction('Order details viewed.')}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Customer contacted.')}>Contact Customer</DropdownMenuItem>
                  </OrderStatusUpdater>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
        )}
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}
