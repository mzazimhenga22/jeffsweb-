'use client'

import * as React from 'react'
import { MoreHorizontal, PlusCircle } from 'lucide-react'

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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import type { VendorTableItem } from './page'

const ITEMS_PER_PAGE = 10

type VendorStatus = 'pending' | 'approved' | 'rejected'

const statusToBadgeVariant = (status: string) => {
  switch (status) {
    case 'approved':
      return 'default'
    case 'pending':
      return 'secondary'
    default:
      return 'destructive'
  }
}

export function VendorsTable({ vendors: initialVendors }: { vendors: VendorTableItem[] }) {
  const [vendors, setVendors] = React.useState(initialVendors)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const { toast } = useToast()
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const filteredVendors = React.useMemo(() => {
    const query = searchQuery.toLowerCase()
    return vendors.filter(
      (vendor) =>
        vendor.storeName.toLowerCase().includes(query) ||
        vendor.contactEmail?.toLowerCase().includes(query),
    )
  }, [vendors, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / ITEMS_PER_PAGE))
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleStatusUpdate = async (vendorId: string, status: VendorStatus) => {
    try {
      setUpdatingId(vendorId)
      const { error } = await supabase.from('vendor_profiles').update({ status }).eq('id', vendorId)
      if (error) throw error
      setVendors((prev) => prev.map((vendor) => (vendor.id === vendorId ? { ...vendor, status } : vendor)))
      toast({
        title: `Vendor ${status}`,
        description: `Vendor has been ${status}.`,
      })
    } catch (error) {
      console.error('Error updating vendor status', error)
      toast({
        variant: 'destructive',
        title: 'Unable to update vendor status',
        description: 'Try again in a moment.',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>Approve and manage vendors for the platform.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search vendors..."
              className="w-full sm:w-64"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setCurrentPage(1)
              }}
            />
            <Button variant="outline">
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  {vendors.length === 0
                    ? 'No vendors yet. Connect a vendor profile to get started.'
                    : 'No vendors match your search.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{vendor.storeName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{vendor.storeName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.contactEmail ?? 'N/A'}</TableCell>
                  <TableCell>{vendor.products}</TableCell>
                  <TableCell>
                    <Badge variant={statusToBadgeVariant(vendor.status)} className="capitalize">
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
                        {vendor.status !== 'approved' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(vendor.id, 'approved')}
                            disabled={updatingId === vendor.id}
                          >
                            Approve
                          </DropdownMenuItem>
                        )}
                        {vendor.status !== 'rejected' && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleStatusUpdate(vendor.id, 'rejected')}
                            disabled={updatingId === vendor.id}
                          >
                            Reject
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-4">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedVendors.length} of {filteredVendors.length} vendors
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
