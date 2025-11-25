'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, Users, Star, Eye, PackageCheck } from 'lucide-react';

import { useAuth } from '@/context/auth-context';
import type { Product, Order } from '@/lib/types';

const chartConfig = {
  sales: { label: 'Sales', color: 'hsl(var(--primary))' },
  revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

const pieChartColors = ['#2563eb', '#f97316', '#16a34a', '#9333ea'];

type SalesPoint = { name: string; sales: number };

export default function VendorAnalyticsPage() {
  const { supabase, user } = useAuth();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [productViews, setProductViews] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);

  const vendorIdListRef = React.useRef<string[]>([]);

  const fetchAnalytics = React.useCallback(
    async (vendorIds: string[]) => {
      if (vendorIds.length === 0) {
        setProducts([]);
        setOrders([]);
        setProductViews({});
        setLoading(false);
        return;
      }

      setLoading(true);

      const [{ data: productRows, error: productError }, { data: orderRows, error: orderError }] =
        await Promise.all([
          supabase.from('products').select('*').in('vendor_id', vendorIds),
          supabase.from('orders').select('*').in('vendor_id', vendorIds),
        ]);

      if (productError) {
        console.error('Error fetching products for analytics:', productError);
      }
      if (orderError) {
        console.error('Error fetching orders for analytics:', orderError);
      }

      setProducts((productRows as Product[]) ?? []);
      setOrders((orderRows as Order[]) ?? []);

      // Optional product_views table support; ignore if it doesn't exist.
      const { data: viewRows, error: viewError } = await supabase
        .from('product_views')
        .select('product_id')
        .in('vendor_id', vendorIds)
        .catch(() => ({ data: null, error: null }));

      if (viewError) {
        console.error('Error fetching product views for analytics:', viewError);
      }

      if (Array.isArray(viewRows)) {
        const counts: Record<string, number> = {};
        viewRows.forEach((row: any) => {
          counts[row.product_id] = (counts[row.product_id] ?? 0) + 1;
        });
        setProductViews(counts);
      } else {
        setProductViews({});
      }

      setLoading(false);
    },
    [supabase],
  );

  React.useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadVendorIds = async () => {
      const { data: profile, error: profileError } = await supabase
        .from('vendor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading vendor profile for analytics:', profileError);
      }

      const vendorIds = [profile?.id, user.id].filter(Boolean) as string[];
      vendorIdListRef.current = vendorIds;
      await fetchAnalytics(vendorIds);

      if (vendorIds.length > 0) {
        const filter = vendorIds.map((id) => `vendor_id=eq.${id}`).join(',');
        channel = supabase
          .channel(`vendor-analytics-${vendorIds.join('-')}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders', filter },
            () => fetchAnalytics(vendorIds),
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products', filter },
            () => fetchAnalytics(vendorIds),
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'product_views', filter },
            () => fetchAnalytics(vendorIds),
          )
          .subscribe();
      }
    };

    loadVendorIds();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchAnalytics, supabase, user?.id]);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);
  const totalOrders = orders.length;
  const revenueOverTime: SalesPoint[] = React.useMemo(() => {
    const buckets = new Map<string, number>();
    orders.forEach((order) => {
      const date = order.order_date || order.created_at;
      const key = date ? new Date(date).toLocaleString('en-US', { month: 'short' }) : 'N/A';
      buckets.set(key, (buckets.get(key) ?? 0) + (order.total ?? 0));
    });
    const entries = Array.from(buckets.entries()).map(([name, sales]) => ({ name, sales }));
    return entries.length ? entries : [{ name: 'N/A', sales: 0 }];
  }, [orders]);

  const topProducts = React.useMemo(() => {
    const withViews = products.map((p) => ({
      ...p,
      view_count: productViews[p.id] ?? 0,
    }));
    return withViews.sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0)).slice(0, 4);
  }, [productViews, products]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : `$${totalRevenue.toFixed(2)}`}</div>
            <p className="text-xs text-muted-foreground">Updated live from orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : `+${totalOrders}`}</div>
            <p className="text-xs text-muted-foreground">Orders for your catalog</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">Static placeholder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading
                ? '—'
                : Object.values(productViews).reduce((sum, count) => sum + (count ?? 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Counts from product_views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reached Checkout</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">956</div>
            <p className="text-xs text-muted-foreground">Static placeholder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+132</div>
            <p className="text-xs text-muted-foreground">Static placeholder</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Live orders grouped by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <LineChart data={revenueOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="name" tickLine={false} axisLine={false}/>
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`}/>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Viewed Products</CardTitle>
            <CardDescription>Live views from product_views</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-72 w-full">
                 <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={topProducts} dataKey="view_count" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                         {topProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
