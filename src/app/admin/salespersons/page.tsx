import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { User } from '@/lib/types'
import { SalespersonsTable } from './salespersons-table'

export default async function AdminSalespersonsPage() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role' as const, 'salesperson')
    .order('createdAt', { ascending: false })
    .returns<User[]>()

  if (error) {
    console.error('Failed to load salespersons', error)
    return <SalespersonsTable salespersons={[]} />
  }

  return <SalespersonsTable salespersons={data ?? []} />
}
