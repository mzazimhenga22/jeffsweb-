import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product } from '@/lib/types'
import type { Database } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

type OrdersRow = Database['public']['Tables']['orders']['Row']
type ProductRow = Database['public']['Tables']['products']['Row']

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Orders Found</CardTitle>
          <CardDescription>You must be logged in to view your orders.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { data: ordersData, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id as any)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Could not load orders. Please try again later.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const orders = (ordersData ?? []) as unknown as OrdersRow[]

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Orders Found</CardTitle>
          <CardDescription>You haven't placed any orders yet.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const productIds: string[] = Array.from(
    new Set(
      orders
        .map((order) => order.product_id)
        .filter((id): id is string => Boolean(id)),
    ),
  )

  const { data: productsData } = productIds.length
    ? await supabase
        .from('products')
        .select('*')
        .in('id', productIds as any)
    : { data: null as unknown }

  const products = (productsData ?? []) as unknown as Product[]

  const productsById = new Map<string, Product>(products.map((product) => [product.id, product]))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your Orders</h1>
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
              <CardDescription>
                {new Date(order.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge className={order.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}>
              {order.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>
                  {productsById.get(order.product_id ?? '')?.name ?? 'Product'} (x
                  {order.quantity})
                </span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
