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
import { vendors } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';

export default function AdminVendorsPage() {
  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>
              Approve and manage vendors for the platform.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search vendors..." className="w-64" />
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => {
              const avatar = PlaceHolderImages.find(
                (p) => p.id === vendor.avatarId
              );
              return (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {avatar && (
                          <AvatarImage
                            src={avatar.imageUrl}
                            data-ai-hint={avatar.imageHint}
                          />
                        )}
                        <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{vendor.storeName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.products}</TableCell>
                  <TableCell>{vendor.rating.toFixed(1)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        vendor.status === 'Approved'
                          ? 'default'
                          : vendor.status === 'Pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Approve</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
