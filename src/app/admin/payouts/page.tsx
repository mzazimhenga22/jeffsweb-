
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
const vendors: { id: string; storeName: string }[] = []
const users: { id: string; name: string }[] = []

const vendorPayouts = [
    { id: 'vp-1', vendorId: 'vendor-1', amount: 1580.20, requestedDate: '2023-06-10', status: 'Pending' },
    { id: 'vp-2', vendorId: 'vendor-3', amount: 850.50, requestedDate: '2023-06-11', status: 'Pending' },
];

const salespersonPayouts = [
    { id: 'spp-1', salespersonId: 'user-5', amount: 620.50, requestedDate: '2023-06-12', status: 'Pending' },
    { id: 'spp-2', salespersonId: 'user-6', amount: 730.00, requestedDate: '2023-06-12', status: 'Pending' },
];


export default function AdminPayoutsPage() {
    const { toast } = useToast();

    const handleApprove = (payoutId: string, name: string, amount: number) => {
        toast({
            title: "Payout Approved",
            description: `A payout of $${amount.toFixed(2)} for ${name} has been processed.`,
        });
        // Here you would typically update the status in your backend
    }

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Payouts</CardTitle>
        <CardDescription>
          Review and approve payout requests from vendors and salespeople.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vendors">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vendors">Vendor Payouts</TabsTrigger>
            <TabsTrigger value="salespersons">Salesperson Payouts</TabsTrigger>
          </TabsList>
          <TabsContent value="vendors">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Store Name</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vendorPayouts.map(payout => {
                        const vendor = vendors.find(v => v.id === payout.vendorId);
                        if (!vendor) return null;
                        return (
                            <TableRow key={payout.id}>
                                <TableCell className='font-medium'>{vendor.storeName}</TableCell>
                                <TableCell>${payout.amount.toFixed(2)}</TableCell>
                                <TableCell>{payout.requestedDate}</TableCell>
                                <TableCell>{payout.status}</TableCell>
                                <TableCell className='text-right'>
                                    <Button onClick={() => handleApprove(payout.id, vendor.storeName, payout.amount)}>
                                        Approve Payout
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="salespersons">
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Salesperson</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {salespersonPayouts.map(payout => {
                        const salesperson = users.find(u => u.id === payout.salespersonId);
                        if (!salesperson) return null;
                        return (
                            <TableRow key={payout.id}>
                                <TableCell className='font-medium'>{salesperson.name}</TableCell>
                                <TableCell>${payout.amount.toFixed(2)}</TableCell>
                                <TableCell>{payout.requestedDate}</TableCell>
                                <TableCell>{payout.status}</TableCell>
                                <TableCell className='text-right'>
                                     <Button onClick={() => handleApprove(payout.id, salesperson.name, payout.amount)}>
                                        Approve Payout
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
