
import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { users, orders, products } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DollarSign, ShoppingCart, ArrowLeft, Wallet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminSalespersonDetailPage({ params }: { params: { salespersonId: string } }) {
  const resolvedParams = React.use(params);
  const user = users.find(u => u.id === resolvedParams.salespersonId && u.role === 'salesperson');

  if (!user) {
    notFound();
  }

  const salespersonOrders = orders.filter(o => o.salespersonId === user.id);
  const totalRevenue = salespersonOrders.reduce((acc, order) => acc + order.total, 0);
  
  const totalCommission = salespersonOrders.reduce((sum, order) => {
    const product = products.find(p => p.id === order.productId);
    const commissionRate = product?.commission ? product.commission / 100 : 0.05; // 5% default commission
    return sum + (order.total * commissionRate);
  }, 0);
  
  const avatar = PlaceHolderImages.find(p => p.id === user.avatarId);

  return (
    <div className="space-y-6">
       <Button variant="outline" asChild>
          <Link href="/admin/salespersons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Salespersons
          </Link>
        </Button>
        
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-20 w-20">
                {avatar && <AvatarImage src={avatar.imageUrl} data-ai-hint={avatar.imageHint} />}
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <p className="text-sm text-muted-foreground mt-1">Joined: {user.createdAt}</p>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue Generated</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commission Earned (Est.)</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${totalCommission.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{salespersonOrders.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>A list of all orders credited to this salesperson.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salespersonOrders.map(order => {
                    const customer = users.find(u => u.id === order.userId);
                    return (
                        <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{customer?.name || 'N/A'}</TableCell>
                        <TableCell>{order.orderDate}</TableCell>
                        <TableCell>
                            <Badge variant={
                                order.status === 'Delivered'
                                    ? 'default'
                                    : order.status === 'Cancelled'
                                    ? 'destructive'
                                    : 'secondary'
                            }>
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                        </TableRow>
                    )
                  })}
                   {salespersonOrders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            This salesperson has not been credited with any orders yet.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
