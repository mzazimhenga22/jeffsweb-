
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Star } from 'lucide-react';
import { products, vendors } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 10;

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();
  const router = useRouter();

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
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
  
  const handleEdit = (productId: string) => {
    router.push(`/admin/products/${productId}/edit`);
  }

  const handleViewOnSite = (productId: string) => {
    window.open(`/shop/${productId}`, '_blank');
  }

  const getAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  }

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage all products on the platform.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input 
              placeholder="Search products..." 
              className="w-full sm:w-64" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Button asChild>
                <Link href="/admin/products/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Product
                </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => {
              const image = PlaceHolderImages.find(
                (p) => p.id === product.imageIds[0]
              );
              const vendor = vendors.find(v => v.id === product.vendorId)
              const rating = getAverageRating(product.reviews);
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        {image && 
                            <Image
                                src={image.imageUrl}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded-md object-cover"
                                data-ai-hint={image.imageHint}
                            />
                        }
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{vendor?.storeName || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                        <Star className='w-4 h-4 text-primary fill-primary' />
                        {rating.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(product.id)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewOnSite(product.id)}>View on site</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Product deleted.', true)}>
                          Delete
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
          <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
