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
import { Separator } from '@/components/ui/separator';
import { OrderStatusUpdater } from '@/components/order-status-updater';
import type { Order, OrderStatus, User } from '@/lib/types';
import { supabase } from '@/lib/supabase-client';

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [users, setUsers] = React.useState<Record<string, { name: string; email: string }>>({});
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  React.useEffect(() => {
    const fetchOrders = async () => {
      const [{ data: orderRows, error: orderError }, { data: userRows, error: userError }] = await Promise.all([
        supabase
          .from('orders')
          .select(
            'id, created_at, user_id, vendor_id, product_id, quantity, salesperson_id, status, total, total_amount, order_date, shipping_address',
          )
          .order('created_at', { ascending: false }),
        supabase.from('users').select('id, full_name, email'),
      ]);

      if (orderError) {
        console.error('Error fetching orders:', orderError);
      } else {
        setOrders((orderRows as Order[]) ?? []);
      }

      if (userError) {
        console.error('Error fetching users for orders:', userError);
      } else {
        const map: Record<string, { name: string; email: string }> = {};
        (userRows as any[] | null | undefined)?.forEach((u) => {
          map[u.id] = { name: u.full_name ?? u.email ?? 'Unknown', email: u.email ?? '' };
        });
        setUsers(map);
      }
    };
    fetchOrders();
  }, []);

  const getSellerName = (order: Order) => {
    if (order.salesperson_id && users[order.salesperson_id]) {
      return users[order.salesperson_id].name;
    }
    if (order.vendor_id && users[order.vendor_id]) {
      return users[order.vendor_id].name;
    }
    return 'Unassigned';
  };

  const handleAction = (message: string, isDestructive: boolean = false) => {
    toast({
      title: message,
      variant: isDestructive ? 'destructive' : 'default',
    });
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o)
    );
    toast({
        title: "Order Status Updated",
        description: `Order ${orderId} has been updated to "${newStatus}".`
    })
  }

  const handleDeleteOrder = async (orderId: string) => {
    const password = window.prompt('Enter admin password to delete this order:');
    if (!password) return;
    if (password !== 'LOCKEDIN@2026') {
      toast({
        variant: 'destructive',
        title: 'Incorrect password',
        description: 'The order was not deleted.',
      });
      return;
    }

    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      console.error('Failed to delete order', error);
      toast({
        variant: 'destructive',
        title: 'Could not delete order',
        description: error.message,
      });
      return;
    }

    setOrders((prev) => prev.filter((order) => order.id !== orderId));
    toast({
      title: 'Order deleted',
      description: `Order ${orderId} has been permanently removed.`,
    });
  };

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>Orders</CardTitle>
                <CardDescription>View and manage all customer orders.</CardDescription>
            </div>
            <Input placeholder="Search orders..." className="w-full sm:w-64" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Sold By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{users[order.user_id]?.name ?? 'Unknown User'}</TableCell>
                <TableCell>{getSellerName(order)}</TableCell>
                <TableCell>{new Date(order.created_at ?? order.order_date ?? '').toLocaleDateString()}</TableCell>
                <TableCell>${Number(order.total ?? order.total_amount ?? 0).toFixed(2)}</TableCell>
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
                      <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange(order.id, 'Cancelled')}>
                        Cancel Order
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteOrder(order.id)}>
                        Delete Order
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedOrder(order)}>View Receipt</DropdownMenuItem>
                  </OrderStatusUpdater>
                </TableCell>
              </TableRow>
            )})}
            </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
        </div>
        {selectedOrder && (
          <div className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">Receipt</h3>
                <p className="text-sm text-muted-foreground">Order ID: {selectedOrder.id}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>Close</Button>
            </div>
            <Separator className="my-3" />
              <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Customer</span>
                <span>{users[selectedOrder.user_id]?.name ?? 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span>Sold By</span>
                <span>{getSellerName(selectedOrder)}</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span>{selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleString() : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="capitalize">{selectedOrder.status}</span>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${Number(selectedOrder.total ?? selectedOrder.total_amount ?? 0).toFixed(2)}</span>
            </div>
            {selectedOrder.shipping_address && (
              <>
                <Separator className="my-3" />
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(selectedOrder.shipping_address, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
