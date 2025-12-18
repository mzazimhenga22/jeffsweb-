import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product, VendorProfile, User } from '@/lib/types'
import { ProductsTable } from './products-table'

export type AdminProductRow = Product & {
  vendorName?: string | null
}

export default async function AdminProductsPage() {
  const supabase = await createSupabaseServerClient()
  const [
    { data: productRows, error: productError },
    { data: vendorRows, error: vendorError },
    { data: userRows, error: usersError },
  ] =
    await Promise.all([
      supabase
        .from('products')
        .select('*')
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('created_at', { ascending: false })
        .returns<Product[]>(),
      supabase
        .from('vendor_profiles')
        .select('id, store_name, user_id')
        .returns<Pick<VendorProfile, 'id' | 'store_name' | 'user_id'>[]>(),
      supabase.from('users').select('id, full_name, email').returns<Pick<User, 'id' | 'full_name' | 'email'>[]>(),
    ])

  if (productError) {
    console.error('Failed to load products', productError)
    return <ProductsTable products={[]} />
  }

  if (vendorError) {
    console.error('Failed to load vendor profiles', vendorError)
  }
  if (usersError) {
    console.error('Failed to load users for vendor mapping', usersError)
  }

  const vendorMap = new Map<string, string>()
  vendorRows?.forEach((vendor) => {
    if (vendor.user_id) vendorMap.set(vendor.user_id, vendor.store_name)
    if (vendor.id) vendorMap.set(vendor.id, vendor.store_name)
  })
  const userMap = new Map<string, string>()
  userRows?.forEach((u) => {
    userMap.set(u.id, u.full_name ?? u.email ?? 'Vendor')
  })

  const productsWithVendors: AdminProductRow[] =
    productRows?.map((product) => ({
      ...product,
      vendorName: product.vendor_id
        ? vendorMap.get(product.vendor_id) ?? userMap.get(product.vendor_id) ?? null
        : null,
    })) ?? []

  return <ProductsTable products={productsWithVendors} />
}
