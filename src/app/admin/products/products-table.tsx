'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, PlusCircle, Star } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase-client'
import type { AdminProductRow } from './page'

const ITEMS_PER_PAGE = 10

export function ProductsTable({ products: initialProducts }: { products: AdminProductRow[] }) {
  const [products, setProducts] = React.useState(initialProducts)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pendingDelete, setPendingDelete] = React.useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const filteredProducts = React.useMemo(() => {
    const query = searchQuery.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        (product.vendorName ?? 'Unassigned').toLowerCase().includes(query),
    )
  }, [products, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleDelete = async (productId: string) => {
    try {
      setPendingDelete(productId)
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) throw error
      setProducts((prev) => prev.filter((product) => product.id !== productId))
      toast({
        title: 'Product deleted',
        description: 'The product has been removed.',
      })
    } catch (error) {
      console.error('Failed to delete product', error)
      toast({
        variant: 'destructive',
        title: 'Could not delete product',
        description: 'Please try again later.',
      })
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage all products on the platform.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search products..."
              className="w-full sm:w-64"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setCurrentPage(1)
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
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  {products.length === 0
                    ? 'No products yet. Add your first product to get started.'
                    : 'No products match your search.'}
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(
                paginatedProducts.reduce<Record<string, AdminProductRow[]>>((acc, product) => {
                  const key = product.vendorName || 'Unassigned';
                  acc[key] = acc[key] ? [...acc[key], product] : [product];
                  return acc;
                }, {}),
              ).map(([vendorLabel, vendorProducts]) => (
                <React.Fragment key={vendorLabel}>
                  <TableRow className="bg-muted/40">
                    <TableCell colSpan={6} className="font-semibold text-foreground">
                      {vendorLabel}
                    </TableCell>
                  </TableRow>
                  {vendorProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url && (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="rounded-md object-cover"
                            />
                          )}
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.vendorName || 'Unassigned'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Star className="w-4 h-4 text-primary/60" />
                          N/A
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/products/${product.id}/edit`)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/shop/${product.id}`, '_blank')}>
                              View on site
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(product.id)}
                              disabled={pendingDelete === product.id}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-4">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedProducts.length} of {filteredProducts.length} products
          </p>
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
