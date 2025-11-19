import { notFound } from 'next/navigation'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product, VendorProfile } from '@/lib/types'
import { VendorsTable } from './vendors-table'

export type VendorTableItem = {
  id: string
  storeName: string
  status: string
  contactEmail: string | null
  contactPhone: string | null
  products: number
  createdAt: string
}

export default async function AdminVendorsPage() {
  const supabase = await createSupabaseServerClient()

  const [{ data: vendorRows, error: vendorError }, { data: vendorProducts, error: productError }] =
    await Promise.all([
      supabase.from('vendor_profiles').select('*').order('created_at', { ascending: false }).returns<VendorProfile[]>(),
      supabase.from('products').select('id, vendorId').returns<Pick<Product, 'id' | 'vendorId'>[]>(),
    ])

  if (vendorError) {
    console.error('Failed to load vendors', vendorError)
    notFound()
  }

  if (productError) {
    console.error('Failed to load vendor products', productError)
  }

  const productCountMap = new Map<string, number>()
  vendorProducts?.forEach((product) => {
    if (!product.vendorId) return
    productCountMap.set(product.vendorId, (productCountMap.get(product.vendorId) ?? 0) + 1)
  })

  const vendors: VendorTableItem[] =
    vendorRows?.map((vendor) => ({
      id: vendor.id,
      storeName: vendor.store_name,
      status: vendor.status,
      contactEmail: vendor.contact_email,
      contactPhone: vendor.contact_phone,
      products: productCountMap.get(vendor.id) ?? 0,
      createdAt: vendor.created_at,
    })) ?? []

  return <VendorsTable vendors={vendors} />
}
