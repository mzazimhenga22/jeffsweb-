
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Users,
  CreditCard,
  Wallet,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import type { Order, Product, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function SalespersonDashboardPage() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  const salespersonId = user?.id ?? null;

  React.useEffect(() => {
    let isMounted = true;
    if (!salespersonId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const [{ data: orderRows, error: orderError }, { data: productRows, error: productError }, { data: userRows, error: userError }] =
        await Promise.all([
          supabase.from('orders').select('*').eq('salespersonId', salespersonId),
          supabase.from('products').select('*'),
          supabase.from('users').select('*'),
        ]);

      if (!isMounted) return;

      if (orderError || productError || userError) {
        console.error('Failed to load salesperson dashboard data', { orderError, productError, userError });
        toast({
          title: 'Could not load dashboard data',
          description: 'Please refresh to try again.',
          variant: 'destructive',
        });
      }

      setOrders((orderRows as Order[]) ?? []);
      setProducts((productRows as Product[]) ?? []);
      setUsers((userRows as User[]) ?? []);
      setIsLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [salespersonId, supabase, toast]);

  const salespersonOrders = React.useMemo(
    () => orders.filter((o) => o.salespersonId === salespersonId),
    [orders, salespersonId],
  );
  const recentOrders = salespersonOrders.slice(0, 5);

  const totalRevenue = salespersonOrders.reduce((sum, order) => sum + (order.total ?? 0), 0);
  const totalCommission = salespersonOrders.reduce((sum, order) => {
    const product = products.find((p) => p.id === order.productId);
    const commissionRate = (product?.commission ?? 5) / 100;
    return sum + (order.total ?? 0) * commissionRate;
  }, 0);

  const uniqueCustomerIds = [...new Set(salespersonOrders.map((o) => o.userId))];

  const salesData = React.useMemo(() => {
    const buckets = new Map<string, number>();
    salespersonOrders.forEach((order) => {
      const date = order.orderDate || order.created_at;
      const monthKey = date ? new Date(date).toLocaleString('en-US', { month: 'short' }) : 'N/A';
      buckets.set(monthKey, (buckets.get(monthKey) ?? 0) + (order.total ?? 0));
    });
    return Array.from(buckets.entries()).map(([name, sales]) => ({ name, sales }));
  }, [salespersonOrders]);

  return (
    <div className="space-y-6">
      {!salespersonId && (
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Sign in to view your dashboard</CardTitle>
            <CardDescription>Salesperson data is only available when you are logged in.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : `$${totalRevenue.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">+10.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : `+${salespersonOrders.length}`}
            </div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : `$${totalCommission.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{uniqueCustomerIds.length}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Sales Chart */}
        <Card className="lg:col-span-3 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Your monthly sales performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <BarChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`}/>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>A list of your most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => {
                  const customer = users.find(u => u.id === order.userId);
                  return (
                  <TableRow key={order.id}>
                    <TableCell>
                        <div className='font-medium'>{customer?.name || 'Unknown'}</div>
                        <div className='text-sm text-muted-foreground'>{customer?.email}</div>
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
                        className='bg-opacity-50'
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
