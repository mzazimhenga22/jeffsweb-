
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
  CreditCard,
  Package,
  Star,
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
import type { Order, Product, User, VendorProfile } from '@/lib/types';
import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function VendorDashboardPage() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [customers, setCustomers] = React.useState<User[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [vendorProfile, setVendorProfile] = React.useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

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
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Failed to load vendor profile', profileError);
        toast({
          title: 'Could not load vendor data',
          description: 'Please refresh to try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const vendorId = profile?.id;
      setVendorProfile(profile ?? null);

      const [{ data: orderRows, error: orderError }, { data: productRows, error: productError }, { data: userRows, error: userError }] =
        await Promise.all([
          supabase.from('orders').select('*').eq('vendor_id', vendorId ?? 'NONE'),
          supabase.from('products').select('*').eq('vendor_id', vendorId ?? 'NONE'),
          supabase.from('users').select('id, name, email'),
        ]);

      if (!isMounted) return;

      if (orderError || productError || userError) {
        console.error('Failed to load vendor dashboard data', { orderError, productError, userError });
        toast({
          title: 'Could not load vendor data',
          description: 'Please refresh to try again.',
          variant: 'destructive',
        });
      }

      setOrders((orderRows as Order[]) ?? []);
      setProducts((productRows as Product[]) ?? []);
      setCustomers((userRows as User[]) ?? []);
      setIsLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [supabase, toast, user?.id]);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);
  const salesData = React.useMemo(() => {
    const buckets = new Map<string, number>();
    orders.forEach((order) => {
      const date = order.orderDate || order.created_at;
      const monthKey = date ? new Date(date).toLocaleString('en-US', { month: 'short' }) : 'N/A';
      buckets.set(monthKey, (buckets.get(monthKey) ?? 0) + (order.total ?? 0));
    });
    return Array.from(buckets.entries()).map(([name, sales]) => ({ name, sales }));
  }, [orders]);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {!user?.id && (
        <Card>
          <CardHeader>
            <CardTitle>Sign in to view your vendor dashboard</CardTitle>
            <CardDescription>Vendor metrics appear after you log in.</CardDescription>
          </CardHeader>
        </Card>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : `$${totalRevenue.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : `+${orders.length}`}
            </div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : products.length}
            </div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">Based on 215 reviews</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Your sales trend over the last 7 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <BarChart data={salesData}  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your most recent customer orders.</CardDescription>
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
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => {
                  const customer = customers.find((u) => u.id === order.userId);
                  return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{customer?.name ?? 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{customer?.email}</div>
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
