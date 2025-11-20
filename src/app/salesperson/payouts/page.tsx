
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import * as React from 'react';
import type { Order } from '@/lib/types';

const payouts = [
    { id: 'sp-payout-1', date: '2023-06-05', amount: 450.25, status: 'Paid' },
    { id: 'sp-payout-2', date: '2023-05-20', amount: 380.00, status: 'Paid' },
];

export default function SalespersonPayoutsPage() {
  const { toast } = useToast();
  const { supabase, user } = useAuth();
  const salespersonId = user?.id ?? null;
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    if (!salespersonId) {
      setIsLoading(false);
      return;
    }

    const loadOrders = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('salespersonId', salespersonId)
        .in('status', ['Delivered', 'Processing', 'On Transit', 'Pending']);

      if (!isMounted) return;

      if (error) {
        console.error('Failed to load commission orders', error);
        toast({
          title: 'Could not load commission data',
          description: 'Please refresh to try again.',
          variant: 'destructive',
        });
      }

      setOrders((data as Order[]) ?? []);
      setIsLoading(false);
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [salespersonId, supabase, toast]);

  const availableCommission = orders.reduce((sum, order) => sum + (order.total ?? 0) * 0.05, 0);

  const handleRequestPayout = () => {
    toast({
      title: "Payout Requested",
      description: "Your payout request has been submitted for processing.",
    });
  };
  
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Commission Available</CardTitle>
                    <CardDescription>This is your earned commission ready for the next payout cycle.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                        <p className="text-4xl font-bold">
                          {isLoading ? '—' : `$${availableCommission.toFixed(2)}`}
                        </p>
                    </div>
                    <Button onClick={handleRequestPayout} className='w-full sm:w-auto mt-4 sm:mt-0'>Request Payout</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Payout Method</CardTitle>
                    <CardDescription>Your commission will be sent to this account.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Direct Deposit</p>
                        <p className="text-sm text-muted-foreground">Bank Account ending in ...5678</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                </CardContent>
            </Card>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            A record of all your past commission payouts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.id}</TableCell>
                  <TableCell>{payout.date}</TableCell>
                  <TableCell>${payout.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={payout.status === 'Paid' ? 'default' : 'secondary'}>
                      {payout.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
