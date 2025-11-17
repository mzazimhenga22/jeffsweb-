
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { users as initialUsers } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { AddEditSalespersonDialog } from '@/components/add-edit-salesperson-dialog';
import { DeleteSalespersonDialog } from '@/components/delete-salesperson-dialog';

const ITEMS_PER_PAGE = 10;

export default function AdminSalespersonsPage() {
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();

  const [isAddEditDialogOpen, setAddEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSalesperson, setSelectedSalesperson] = React.useState<User | null>(null);

  const salespersons = users.filter(user => user.role === 'salesperson');

  const filteredSalespersons = salespersons.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSalespersons.length / ITEMS_PER_PAGE);
  const paginatedSalespersons = filteredSalespersons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleAdd = () => {
    setSelectedSalesperson(null);
    setAddEditDialogOpen(true);
  }

  const handleEdit = (user: User) => {
    setSelectedSalesperson(user);
    setAddEditDialogOpen(true);
  };
  
  const handleDelete = (user: User) => {
    setSelectedSalesperson(user);
    setDeleteDialogOpen(true);
  };

  const handleSaveSalesperson = (data: { name: string, email: string }) => {
    if (selectedSalesperson) {
      // Edit existing
      setUsers(users.map(u => u.id === selectedSalesperson.id ? { ...u, ...data } : u));
      toast({ title: "Salesperson Updated", description: `${data.name}'s information has been updated.` });
    } else {
      // Add new
      const newUser: User = {
        id: `user-${users.length + 1}`,
        ...data,
        role: 'salesperson',
        avatarId: 'avatar-1', // Default avatar
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
      toast({ title: "Salesperson Added", description: `${data.name} has been added to the platform.` });
    }
    setAddEditDialogOpen(false);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedSalesperson) {
      setUsers(users.filter(u => u.id !== selectedSalesperson.id));
      toast({ variant: 'destructive', title: "Salesperson Deleted", description: `${selectedSalesperson.name} has been removed.` });
      setDeleteDialogOpen(false);
      setSelectedSalesperson(null);
    }
  };

  return (
    <>
      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Salespersons</CardTitle>
              <CardDescription>Manage all salespersons on the platform.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input 
                placeholder="Search salespersons..." 
                className="w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Salesperson
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salesperson</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSalespersons.map((user) => {
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
                        <DropdownMenuItem onClick={() => handleEdit(user)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({title: 'Details page coming soon!'})}>View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end space-x-2 py-4">
              <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </CardContent>
      </Card>
      
      <AddEditSalespersonDialog
        isOpen={isAddEditDialogOpen}
        setIsOpen={setAddEditDialogOpen}
        onSave={handleSaveSalesperson}
        salesperson={selectedSalesperson}
      />
      
      <DeleteSalespersonDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        salespersonName={selectedSalesperson?.name || ''}
      />
    </>
  );
}

