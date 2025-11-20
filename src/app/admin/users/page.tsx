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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const ITEMS_PER_PAGE = 10;

// Type we actually use in this page
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin' | 'salesperson' | string;
  avatarId: string | null;
  createdAt: string | null;
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();
  const router = useRouter();
  const { supabase } = useAuth();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setIsLoading(true);

      // 👉 Use the REAL column names from your DB:
      // id, name, email, role, created_at
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at, avatar_id, avatar_url')
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error('Failed to load users', error);
        toast({
          title: 'Unable to load users',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const mapped: AdminUser[] =
        (data ?? []).map((u: any) => ({
          id: u.id,
          name: u.name ?? '',
          email: u.email,
          role: u.role,
          avatarId: u.avatar_id ?? u.avatar_url ?? null,
          createdAt: u.created_at ?? u.createdAt ?? null,
        })) ?? [];

      setUsers(mapped);
      setIsLoading(false);
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [supabase, toast]);

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE),
    1
  );

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleAction = (message: string, isDestructive: boolean = false) => {
    toast({
      title: message,
      variant: isDestructive ? 'destructive' : 'default',
    });
  };

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage all users on the platform.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search users..."
              className="w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Button onClick={() => handleAction('Add User form opened.')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-sm text-muted-foreground"
                >
                  {isLoading ? 'Loading users...' : 'No users found.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => {
                const avatar = PlaceHolderImages.find(
                  (p) => p.id === user.avatarId
                );

                const joinedDate = user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : '';

                return (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {avatar ? (
                            <AvatarImage
                              src={avatar.imageUrl}
                              data-ai-hint={avatar.imageHint}
                            />
                          ) : null}
                          <AvatarFallback>
                            {user.name?.charAt(0).toUpperCase() ?? '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{joinedDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/users/${user.id}`)
                            }
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction('User edit page opened.')
                            }
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleAction('User deleted.', true)
                            }
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
