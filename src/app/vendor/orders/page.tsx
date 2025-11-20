
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
import { supabase } from '@/lib/supabase-client';

const ITEMS_PER_PAGE = 10;

export default function VendorOrdersPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data as Order[]);
      }
    };
    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data as User[]);
        }
    };

    fetchOrders();
    fetchUsers();
  }, []);

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    users.find(u => u.id === order.user_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                const user = users.find(u => u.id === order.user_id);
                return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{user?.name || 'Unknown User'}</TableCell>
                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleAction('Packing slip printed.')}>Print Packing Slip</DropdownMenuItem>
                  </OrderStatusUpdater>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}
