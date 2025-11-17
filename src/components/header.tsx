import { createSupabaseServerClient } from '@/lib/supabase-server';
import { HeaderClient } from './header-client';

export async function Header() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  // TODO: Fetch cart count from the database
  const cartCount = 0;

  return <HeaderClient user={session?.user} cartCount={cartCount} />;
}
