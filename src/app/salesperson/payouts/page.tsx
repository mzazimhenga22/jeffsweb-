
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const payouts = [
    { id: 'sp-payout-1', date: '2023-06-05', amount: 450.25, status: 'Paid' },
    { id: 'sp-payout-2', date: '2023-05-20', amount: 380.00, status: 'Paid' },
    { id: 'sp-payout-3', date: '2023-05-05', amount: 510.75, status: 'Paid' },
]

export default function SalespersonPayoutsPage() {
  const { toast } = useToast();

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
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-4">
                    <p className="text-4xl font-bold">$620.50</p>
                    <Button onClick={handleRequestPayout} className='w-full sm:w-auto'>Request Payout</Button>
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
