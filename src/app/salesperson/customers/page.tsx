
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { users, orders } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function SalespersonCustomersPage() {
  const { toast } = useToast();
  const salespersonId = 'user-5'; // Mock salesperson
  
  const customerIds = [...new Set(orders.filter(o => o.salespersonId === salespersonId).map(o => o.userId))];
  const customers = users.filter(u => customerIds.includes(u.id));

  const handleAction = (message: string) => {
    toast({
      title: message,
    });
  };

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Your Customers</CardTitle>
            <CardDescription>A list of customers who have purchased through you.</CardDescription>
          </div>
          <Input placeholder="Search customers..." className="w-full sm:w-64" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((user) => {
              const avatar = PlaceHolderImages.find((p) => p.id === user.avatarId);
              return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {avatar && <AvatarImage src={avatar.imageUrl} data-ai-hint={avatar.imageHint} />}
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction('Customer details viewed.')}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Customer contacted.')}>Send Email</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
