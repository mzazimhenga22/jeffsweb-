
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/auth-context'
import type { Order } from '@/lib/types'

type PayoutHistoryRow = {
  id: string
  date: string
  amount: number
  status: string
}

const fallbackHistory: PayoutHistoryRow[] = [
  { id: 'payout-1', date: '2023-06-01', amount: 1250.75, status: 'Paid' },
]

export default function VendorPayoutsPage() {
  const { supabase, user } = useAuth()
  const [orders, setOrders] = React.useState<Order[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    const loadOrders = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Failed to load vendor profile for payouts', error)
        setIsLoading(false)
        return
      }

      const vendorId = data?.id ?? user.id
      const { data: orderRows, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendorId)

      if (!isMounted) return
      if (orderError) {
        console.error('Failed to load vendor orders for payouts', orderError)
      }
      setOrders((orderRows as Order[]) ?? [])
      setIsLoading(false)
    }

    loadOrders()
    return () => {
      isMounted = false
    }
  }, [supabase, user?.id])

  const gross = orders.reduce((sum, order) => sum + (order.total ?? 0), 0)
  const available = gross * 0.6 // 40% platform commission

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available for Payout</CardTitle>
            <CardDescription>This is the net amount after 40% platform commission.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-bold">{isLoading ? '—' : `$${available.toFixed(2)}`}</p>
            </div>
            <Button className="w-full sm:w-auto mt-4 sm:mt-0" disabled={isLoading}>
              Request Payout
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payout Method</CardTitle>
            <CardDescription>Your funds will be sent to this account.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">Stripe Connect</p>
              <p className="text-sm text-muted-foreground">**** **** **** 1234</p>
            </div>
            <Button variant="outline">Manage</Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>A record of your past payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(fallbackHistory).map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.id}</TableCell>
                  <TableCell>{payout.date}</TableCell>
                  <TableCell>${payout.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={payout.status === 'Paid' ? 'default' : 'secondary'}>
                      {payout.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
