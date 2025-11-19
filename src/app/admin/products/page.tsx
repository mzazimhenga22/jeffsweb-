import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product, VendorProfile } from '@/lib/types'
import { ProductsTable } from './products-table'

export type AdminProductRow = Product & {
  vendorName?: string | null
}

export default async function AdminProductsPage() {
  const supabase = await createSupabaseServerClient()
  const [{ data: productRows, error: productError }, { data: vendorRows, error: vendorError }] =
    await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }).returns<Product[]>(),
      supabase.from('vendor_profiles').select('id, store_name').returns<Pick<VendorProfile, 'id' | 'store_name'>[]>(),
    ])

  if (productError) {
    console.error('Failed to load products', productError)
    return <ProductsTable products={[]} />
  }

  if (vendorError) {
    console.error('Failed to load vendor profiles', vendorError)
  }

  const vendorMap = new Map<string, string>()
  vendorRows?.forEach((vendor) => vendorMap.set(vendor.id, vendor.store_name))

  const productsWithVendors: AdminProductRow[] =
    productRows?.map((product) => ({
      ...product,
      vendorName: product.vendorId ? vendorMap.get(product.vendorId) : null,
    })) ?? []

  return <ProductsTable products={productsWithVendors} />
}
