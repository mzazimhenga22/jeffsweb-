import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { User } from '@/lib/types'
import { SalespersonsTable } from './salespersons-table'

export default async function AdminSalespersonsPage() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, createdAt, avatar_url')
    .eq('role' as const, 'salesperson')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Failed to load salespersons', error)
    return <SalespersonsTable salespersons={[]} />
  }

  const mapped: User[] =
    (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.full_name ?? '',
      email: row.email,
      role: row.role,
      avatarId: null,
      avatar_url: row.avatar_url ?? null,
      createdAt: row.createdAt ?? null,
      phone: null,
    })) ?? []

  return <SalespersonsTable salespersons={mapped} />
}
