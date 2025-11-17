
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
import { supabase } from '@/lib/supabase-client';
import type { Product, Sale } from '@/lib/types';

const chartConfig = {
  sales: { label: 'Sales', color: 'hsl(var(--primary))' },
  revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

const pieChartColors = ['#2563eb', '#f97316', '#16a34a', '#9333ea'];

export default function VendorAnalyticsPage() {
    const [salesData, setSalesData] = React.useState<Sale[]>([]);
    const [products, setProducts] = React.useState<Product[]>([]);

    React.useEffect(() => {
        const fetchSalesData = async () => {
            // In a real app, you'd likely have a view or function for aggregated sales data
            const { data, error } = await supabase.from('sales_data').select('*');
            if (error) {
                console.error('Error fetching sales data:', error);
            } else {
                setSalesData(data as Sale[]);
            }
        };

        const fetchProducts = async () => {
            const { data, error } = await supabase.from('products').select('*');
            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data as Product[]);
            }
        };

        fetchSalesData();
        fetchProducts();
    }, []);

    const topProducts = products
        .sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
        .slice(0, 4);

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$12,842.59</div>
                    <p className="text-xs text-muted-foreground">+15.2% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sales</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+782</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">4.7</div>
                    <p className="text-xs text-muted-foreground">Maintained from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Product Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12,408</div>
                    <p className="text-xs text-muted-foreground">+25% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reached Checkout</CardTitle>
                    <PackageCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">956</div>
                    <p className="text-xs text-muted-foreground">+18% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+132</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
            </Card>
        </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <LineChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-72 w-full">
                 <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={topProducts} dataKey="review_count" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
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
