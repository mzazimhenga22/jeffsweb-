import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Order, User } from '@/lib/types'
import { DashboardContent, type RecentOrderSummary, type SalesDatum } from './dashboard-content'

function buildSalesData(orders: Order[]): SalesDatum[] {
  const monthMap = new Map<
    string,
    {
      total: number
      timestamp: number
    }
  >()

  orders.forEach((order) => {
    const sourceDate = order.orderDate || order.created_at
    const parsedDate = new Date(sourceDate)
    if (Number.isNaN(parsedDate.getTime())) {
      return
    }
    const key = `${parsedDate.getFullYear()}-${parsedDate.getMonth()}`
    const entry = monthMap.get(key)
    const newTotal = (entry?.total ?? 0) + order.total
    monthMap.set(key, { total: newTotal, timestamp: parsedDate.getTime() })
  })

  return Array.from(monthMap.entries())
    .sort((a, b) => a[1].timestamp - b[1].timestamp)
    .map(([key, value]) => {
      const [, monthIndex] = key.split('-').map(Number)
      const label = new Date(2000, monthIndex ?? 0, 1).toLocaleString('default', { month: 'short' })
      return {
        name: label,
        sales: value.total,
      }
    })
}

function buildRecentOrders(orders: Order[], users: User[]): RecentOrderSummary[] {
  return orders
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((order) => {
      const customer = users.find((user) => user.id === order.userId)
      return {
        id: order.id,
        total: order.total,
        status: order.status,
        customerName: customer?.name ?? 'Unknown',
        customerEmail: customer?.email ?? 'N/A',
      }
    })
}

type ReviewRating = {
  rating: number
}

function formatAverageRating(reviews: ReviewRating[]): string {
  if (reviews.length === 0) return 'N/A'
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return (total / reviews.length).toFixed(1)
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient()

  const [
    { data: ordersData, error: ordersError },
    { data: usersData, error: usersError },
    { data: reviewData, error: reviewsError },
  ] =
    await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }).returns<Order[]>(),
      supabase.from('users').select('*').returns<User[]>(),
      supabase.from('product_reviews').select('rating').returns<ReviewRating[]>(),
    ])

  if (ordersError) {
    console.error('Error fetching orders:', ordersError)
  }
  if (usersError) {
    console.error('Error fetching users:', usersError)
  }
  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError)
  }

  const orders = ordersData ?? []
  const users = usersData ?? []
  const reviews = reviewData ?? []

  const stats = {
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalSales: orders.length,
    totalUsers: users.length,
    averageRating: formatAverageRating(reviews as ReviewRating[]),
  }

  const salesData = buildSalesData(orders)
  const recentOrders = buildRecentOrders(orders, users)

  return <DashboardContent salesData={salesData} recentOrders={recentOrders} stats={stats} />
}
