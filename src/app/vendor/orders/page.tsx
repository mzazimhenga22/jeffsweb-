
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
import type { Order, OrderStatus, User } from '@/lib/types';
import { useAuth } from '@/context/auth-context';

const ITEMS_PER_PAGE = 10;

export default function VendorOrdersPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { supabase, user } = useAuth();
  const [vendorId, setVendorId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const { data: profile, error: profileError } = await supabase
        .from('vendor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching vendor profile', profileError);
        toast({
          title: 'Unable to load vendor orders',
          description: 'Please refresh to try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const currentVendorId = profile?.id ?? null;
      setVendorId(currentVendorId);

      const [{ data: orderRows, error: orderError }, { data: userRows, error: userError }] = await Promise.all([
        supabase.from('orders').select('*').eq('vendor_id', currentVendorId ?? 'NONE'),
        supabase.from('users').select('*'),
      ]);

      if (!isMounted) return;

      if (orderError || userError) {
        console.error('Error fetching vendor data', { orderError, userError });
        toast({
          title: 'Unable to load orders',
          description: 'Please refresh to try again.',
          variant: 'destructive',
        });
      }

      setOrders((orderRows as Order[]) ?? []);
      setUsers((userRows as User[]) ?? []);
      setIsLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [supabase, toast, user?.id]);

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    users.find(u => u.id === order.userId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleAction = (message: string) => {
    toast({ title: message });
  };
  
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      toast({
        title: 'Order Status Updated',
        description: `Order ${orderId} has been updated to "${newStatus}".`,
      });
    } catch (error) {
      console.error('Failed to update order status', error);
      toast({
        title: 'Unable to update order status',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>View and manage your incoming orders.</CardDescription>
            </div>
            <Input 
              placeholder="Search orders..." 
              className="w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        ) : paginatedOrders.length === 0 ? (
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
            {paginatedOrders.map((order) => {
                const user = users.find(u => u.id === order.userId);
                return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{user?.name || 'Unknown User'}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleAction('Packing slip printed.')}>Print Packing Slip</DropdownMenuItem>
                  </OrderStatusUpdater>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
        )}
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}
