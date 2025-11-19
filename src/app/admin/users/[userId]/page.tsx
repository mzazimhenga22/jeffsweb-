'use client';

import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DollarSign, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

type UserRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: 'customer' | 'vendor' | 'admin' | 'salesperson' | string;
  createdAt: string;
  avatarId?: string | null;
};

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
};

export default function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const { toast } = useToast();
  const { supabase } = useAuth();

  const [user, setUser] = React.useState<UserRow | null>(null);
  const [orders, setOrders] = React.useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPromoting, setIsPromoting] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);

      // 1) Fetch user from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, email, role, createdAt')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('Error loading user:', userError);
        toast({
          title: 'Unable to load user',
          description: userError.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!userData) {
        // User not found in DB
        if (isMounted) {
          notFound();
        }
        return;
      }

      const mappedUser: UserRow = {
        id: userData.id,
        full_name: userData.full_name ?? '',
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt,
        avatarId: null, // if you later add avatar_id to users, map it here
      };

      // 2) Fetch orders for this user
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, user_id, status, total, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
        toast({
          title: 'Unable to load orders',
          description: ordersError.message,
          variant: 'destructive',
        });
      }

      if (!isMounted) return;

      setUser(mappedUser);
      setOrders((ordersData ?? []) as OrderRow[]);
      setIsLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [supabase, toast, userId]);

  if (!user && !isLoading) {
    notFound();
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Users
          </Link>
        </Button>
        <p className="text-muted-foreground">Loading user...</p>
      </div>
    );
  }

  const userOrders = orders;
  const totalSpent = userOrders.reduce((acc, order) => acc + (order.total ?? 0), 0);
  const avatar = user.avatarId
    ? PlaceHolderImages.find((p) => p.id === user.avatarId)
    : undefined;

  const joinedText = user.createdAt
    ? new Date(user.createdAt).toLocaleString()
    : user.createdAt ?? '';

  const handlePromote = async (newRole: 'vendor' | 'salesperson') => {
    if (user.role === newRole) {
      toast({
        title: `User is already a ${newRole}`,
      });
      return;
    }

    try {
      setIsPromoting(true);

      // 1) Update role on users table
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user.id)
        .select('id, full_name, email, role, createdAt')
        .maybeSingle();

      if (error) {
        console.error('Error promoting user:', error);
        toast({
          title: 'Promotion failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                role: data.role,
              }
            : prev
        );
      }

      // 2) OPTIONAL: create vendor/salesperson profile rows
      if (newRole === 'vendor') {
        const { error: vpError } = await supabase
          .from('vendor_profiles')
          .insert({
            user_id: user.id,
            store_name: `${user.full_name || 'New'} Store`,
            contact_email: user.email,
          })
          .select()
          .single();

        // ignore duplicate error (unique user_id)
        if (vpError && vpError.code !== '23505') {
          console.warn('Failed to create vendor profile:', vpError);
        }
      } else if (newRole === 'salesperson') {
        const { error: spError } = await supabase
          .from('salesperson_profiles')
          .insert({
            user_id: user.id,
          })
          .select()
          .single();

        if (spError && spError.code !== '23505') {
          console.warn('Failed to create salesperson profile:', spError);
        }
      }

      toast({
        title: 'User promoted',
        description: `User is now a ${newRole}.`,
      });
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href="/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Users
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-20 w-20">
                {avatar && (
                  <AvatarImage
                    src={avatar.imageUrl}
                    data-ai-hint={avatar.imageHint}
                  />
                )}
                <AvatarFallback>
                  {user.full_name?.charAt(0).toUpperCase() ??
                    user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {user.full_name || user.email}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      user.role === 'admin'
                        ? 'default'
                        : user.role === 'vendor'
                        ? 'secondary'
                        : user.role === 'salesperson'
                        ? 'outline'
                        : 'outline'
                    }
                  >
                    {user.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Joined: {joinedText}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">Promote user</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={
                    user.role === 'vendor' ? 'default' : 'outline'
                  }
                  onClick={() => handlePromote('vendor')}
                  disabled={isPromoting}
                >
                  Make Vendor
                </Button>
                <Button
                  size="sm"
                  variant={
                    user.role === 'salesperson' ? 'default' : 'outline'
                  }
                  onClick={() => handlePromote('salesperson')}
                  disabled={isPromoting}
                >
                  Make Salesperson
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Spent
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalSpent.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userOrders.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                A complete list of all orders placed by this customer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.id}
                      </TableCell>
                      <TableCell>
                        {new Date(
                          order.created_at
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'Delivered'
                              ? 'default'
                              : order.status === 'Cancelled'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(order.total ?? 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {userOrders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        This user has not placed any orders yet.
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
