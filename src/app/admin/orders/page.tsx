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
import { OrderStatusUpdater } from '@/components/order-status-updater';
import type { Order, OrderStatus } from '@/lib/types';
import { supabase } from '@/lib/supabase-client';

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);

  React.useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data as Order[]);
      }
    };
    fetchOrders();
  }, []);

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
                <TableCell>Unknown User</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
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
      </CardContent>
    </Card>
  );
}
