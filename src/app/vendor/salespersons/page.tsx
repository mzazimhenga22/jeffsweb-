
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
import { users } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

export default function VendorSalespersonsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();

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

  const handleAction = (message: string, isDestructive: boolean = false) => {
    toast({
      title: message,
      variant: isDestructive ? 'destructive' : 'default',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Salespersons</CardTitle>
            <CardDescription>Manage all salespersons for your store.</CardDescription>
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
            <Button onClick={() => handleAction('Add Salesperson form opened.')}>
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
                      <DropdownMenuItem onClick={() => handleAction('Salesperson edit page opened.')}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Salesperson details viewed.')}>View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Salesperson deleted.', true)}>
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
  );
}
