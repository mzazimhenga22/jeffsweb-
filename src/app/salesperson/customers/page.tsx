
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import type { Order, User } from '@/lib/types';

export default function SalespersonCustomersPage() {
  const { toast } = useToast();
  const { supabase, user } = useAuth();
  const salespersonId = user?.id ?? null;
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    if (!salespersonId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      const [{ data: orderRows, error: orderError }, { data: userRows, error: userError }] = await Promise.all([
        supabase.from('orders').select('*').eq('salespersonId', salespersonId),
        supabase.from('users').select('*'),
      ]);

      if (!isMounted) return;

      if (orderError || userError) {
        console.error('Failed to load customers', { orderError, userError });
        toast({
          title: 'Unable to load customers',
          description: 'Please refresh to try again.',
          variant: 'destructive',
        });
      }

      setOrders((orderRows as Order[]) ?? []);
      setUsers((userRows as User[]) ?? []);
      setIsLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [salespersonId, supabase, toast]);

  const customerIds = React.useMemo(
    () => new Set(orders.filter((o) => o.salespersonId === salespersonId).map((o) => o.userId)),
    [orders, salespersonId],
  );

  const filteredCustomers = React.useMemo(() => {
    const term = search.toLowerCase();
    return users
      .filter((u) => customerIds.has(u.id))
      .filter((u) =>
        term
          ? (u.name ?? '').toLowerCase().includes(term) ||
            (u.email ?? '').toLowerCase().includes(term)
          : true,
      );
  }, [customerIds, search, users]);

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
          <Input
            placeholder="Search customers..."
            className="w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading customers...</p>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No customers yet.</p>
        ) : (
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
            {filteredCustomers.map((user) => {
              const avatar = user.avatarId
                ? PlaceHolderImages.find((p) => p.id === user.avatarId)
                : undefined;
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
                <TableCell>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : '—'}
                </TableCell>
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
        )}
      </CardContent>
    </Card>
  );
}
