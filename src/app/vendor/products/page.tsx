
'use client';

import Link from 'next/link';
import Image from 'next/image';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Product } from '@/lib/types';

export default function VendorProductsPage() {
    const router = useRouter();
    const [products, setProducts] = React.useState<Product[]>([]);

    React.useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase.from('products').select('*');
            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data as Product[]);
            }
        };
        fetchProducts();
    }, []);

    const handleEdit = (productId: string) => {
        router.push(`/vendor/products/${productId}/edit`);
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your product inventory and listings.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search products..." className="w-64" />
            <Button asChild>
                <Link href="/vendor/products/new">
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
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        {product.image_url && 
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded-md object-cover"
                            />
                        }
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                        <Star className='w-4 h-4 text-primary fill-primary' />
                        4.5
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
                        <DropdownMenuItem>View on site</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
