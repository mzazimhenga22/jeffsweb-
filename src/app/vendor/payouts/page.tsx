
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const payouts = [
    { id: 'payout-1', date: '2023-06-01', amount: 1250.75, status: 'Paid' },
    { id: 'payout-2', date: '2023-05-15', amount: 980.50, status: 'Paid' },
    { id: 'payout-3', date: '2023-05-01', amount: 1100.00, status: 'Paid' },
    { id: 'payout-4', date: '2023-04-15', amount: 850.25, status: 'Paid' },
]

export default function VendorPayoutsPage() {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Available for Payout</CardTitle>
                    <CardDescription>This is the amount ready to be transferred to your bank.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-baseline justify-between">
                    <p className="text-4xl font-bold">$1,580.20</p>
                    <Button>Request Payout</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Payout Method</CardTitle>
                    <CardDescription>Your funds will be sent to this account.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Stripe Connect</p>
                        <p className="text-sm text-muted-foreground">**** **** **** 1234</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                </CardContent>
            </Card>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            A record of all your past payouts.
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
