'use client'

import * as React from 'react'
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  Building2,
  Eye,
  PackageCheck,
  Star,
  PiggyBank,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase-client'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/lib/database.types'
import type { OrderStatus } from '@/lib/types'

export type SalesDatum = {
  name: string
  sales: number
}

export type RecentOrderSummary = {
  id: string
  total: number
  status: OrderStatus
  customerName: string
  customerEmail?: string | null
}

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

interface DashboardContentProps {
  salesData: SalesDatum[]
  recentOrders: RecentOrderSummary[]
  stats: {
    totalRevenue: number
    commission: number
    totalSales: number
    totalUsers: number
    totalVendors: number
    averageRating: string
    startingCapital: number
    productsInValue: number
    productsOutValue: number
    netBalance: number
    financeUpdatedAt: string | null
    reachedCheckout: number
  }
}

export function DashboardContent({ salesData, recentOrders, stats }: DashboardContentProps) {
  const { toast } = useToast()
  const [liveStats, setLiveStats] = React.useState(stats)
  const [activeUsers, setActiveUsers] = React.useState(0)
  const [startingCapital, setStartingCapital] = React.useState(stats.startingCapital ?? 0)
  const [productsInValue, setProductsInValue] = React.useState(stats.productsInValue ?? 0)
  const [productsOutValue, setProductsOutValue] = React.useState(stats.productsOutValue ?? 0)
  const [savingFinance, setSavingFinance] = React.useState(false)

  const formattedProductsIn = React.useMemo(
    () =>
      new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2,
      }).format(productsInValue),
    [productsInValue],
  )

  const formattedProductsOut = React.useMemo(
    () =>
      new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2,
      }).format(productsOutValue),
    [productsOutValue],
  )

  const formattedProductProfit = React.useMemo(
    () =>
      new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2,
      }).format(productsOutValue - productsInValue),
    [productsInValue, productsOutValue],
  )

  const formattedRevenue = React.useMemo(() => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(liveStats.totalRevenue)
  }, [liveStats.totalRevenue])

  const formattedCommission = React.useMemo(() => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(liveStats.commission)
  }, [liveStats.commission])

  const formattedNetBalance = React.useMemo(() => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(
      startingCapital + productsInValue + liveStats.totalRevenue - productsOutValue,
    )
  }, [productsInValue, productsOutValue, startingCapital, liveStats.totalRevenue])

  const chartData = salesData.length > 0 ? salesData : [{ name: 'N/A', sales: 0 }]

  React.useEffect(() => {
    setLiveStats(stats)
  }, [stats])

  async function handleSaveFinance() {
    setSavingFinance(true)
    const financePayload = {
      id: 'platform-finance',
      starting_capital: startingCapital,
      products_in_value: productsInValue,
      products_out_value: productsOutValue,
      created_at: stats.financeUpdatedAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('platform_finance')
      .upsert([financePayload] as Database['public']['Tables']['platform_finance']['Insert'][])

    if (error) {
      toast({
        title: 'Unable to save finance data',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Finance data updated',
        description: 'Starting capital and product movements saved.',
      })
    }
    setSavingFinance(false)
  }

  React.useEffect(() => {
    const channel = supabase
      .channel('orders-stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const inserted: any = payload.new
          const addedTotal = Number(inserted?.total ?? 0)
          setLiveStats((prev) => {
            const newTotalRevenue = prev.totalRevenue + addedTotal
            return {
              ...prev,
              totalRevenue: newTotalRevenue,
              commission: newTotalRevenue * 0.4,
              totalSales: prev.totalSales + 1,
              netBalance: startingCapital + productsInValue + newTotalRevenue - productsOutValue,
            }
          })
        },
      )

    const presenceKey =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `anon-${Math.random().toString(36).slice(2)}`

    const presenceChannel = supabase.channel('active-users', {
      config: { presence: { key: presenceKey } },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const total = Object.keys(state).length
        setActiveUsers(total)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ status: 'online' })
        }
      })

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(presenceChannel)
    }
  }, [productsInValue, startingCapital, supabase, productsOutValue])

  return (
    <div className="space-y-6">
      {/* Top stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedRevenue}</div>
            <p className="text-xs text-muted-foreground">Sum of all completed orders</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{liveStats.totalSales}</div>
            <p className="text-xs text-muted-foreground">Orders recorded in Supabase</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission (40%)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedCommission}</div>
            <p className="text-xs text-muted-foreground">Based on gross order totals</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedNetBalance}</div>
            <p className="text-xs text-muted-foreground">
              Starting capital + sales + products in - products out
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reached Checkout</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reachedCheckout}</div>
            <p className="text-xs text-muted-foreground">Recorded checkout visits</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Product Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">Across all published reviews</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starting Capital</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
              }).format(startingCapital)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated {stats.financeUpdatedAt ? new Date(stats.financeUpdatedAt).toLocaleString() : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products In Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formattedProductsIn}
            </div>
            <p className="text-xs text-muted-foreground">Value added into inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Out Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formattedProductsOut}
            </div>
            <p className="text-xs text-muted-foreground">Value moved out of inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Profit</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedProductProfit}</div>
            <p className="text-xs text-muted-foreground">
              Products out (sales) minus products in (cost)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">Approved vendor profiles</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Live presence (site/POS)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Update Finance Snapshot</CardTitle>
          <CardDescription>
            Set the starting capital and inventory movement to keep the balance up to date.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Starting Capital</label>
            <Input
              type="number"
              value={startingCapital}
              onChange={(e) => setStartingCapital(Number(e.target.value || 0))}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Products In Value</label>
            <Input
              type="number"
              value={productsInValue}
              onChange={(e) => setProductsInValue(Number(e.target.value || 0))}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Products Out Value</label>
            <Input
              type="number"
              value={productsOutValue}
              onChange={(e) => setProductsOutValue(Number(e.target.value || 0))}
              min={0}
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={handleSaveFinance} disabled={savingFinance}>
              {savingFinance ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart + Recent orders */}
      <div className="grid gap-6 lg:grid-cols-5 items-start">
        {/* Sales Overview */}
        <Card className="bg-card/70 backdrop-blur-sm lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full sm:h-72">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `KSh ${Math.round(Number(value) / 1000)}k`}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-card/70 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>A list of the most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table className="min-w-[480px] sm:min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        No orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.customerEmail}
                          </div>
                        </TableCell>
                        <TableCell>Ksh {order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === 'delivered'
                                ? 'default'
                                : order.status === 'on transit'
                                ? 'secondary'
                                : order.status === 'processing'
                                ? 'secondary'
                                : order.status === 'pending'
                                ? 'outline'
                                : 'destructive'
                            }
                            className="bg-opacity-50"
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
