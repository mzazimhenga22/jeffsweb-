
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
import { salesData, orders, users as allUsers } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { products } from '@/lib/data';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function SalespersonDashboardPage() {
    // Mocking data for salesperson 'user-5' (David Lee)
    const salespersonId = 'user-5';
    const salespersonOrders = orders.filter(o => o.salespersonId === salespersonId);
    const recentOrders = salespersonOrders.slice(0, 5);

    const totalRevenue = salespersonOrders.reduce((sum, order) => sum + order.total, 0);
    const totalCommission = salespersonOrders.reduce((sum, order) => {
        const product = products.find(p => p.id === order.productId);
        const commissionRate = product?.commission ? product.commission / 100 : 0.05; // 5% default commission
        return sum + (order.total * commissionRate);
    }, 0);
    
    const uniqueCustomerIds = [...new Set(salespersonOrders.map(o => o.userId))];


  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+10.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{salespersonOrders.length}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCommission.toFixed(2)}</div>
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
              <BarChart data={salesData.slice(0, salespersonOrders.length)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                  const user = allUsers.find(u => u.id === order.userId);
                  return (
                  <TableRow key={order.id}>
                    <TableCell>
                        <div className='font-medium'>{user?.name || 'Unknown'}</div>
                        <div className='text-sm text-muted-foreground'>{user?.email}</div>
                    </TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === 'Delivered'
                            ? 'default'
                            : order.status === 'Shipped'
                            ? 'secondary'
                            : 'outline'
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
