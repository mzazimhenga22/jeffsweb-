import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { HeaderClient } from './header-client';

export async function Header() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  // TODO: Fetch cart count from the database
  const cartCount = 0;

  return <HeaderClient user={session?.user} cartCount={cartCount} />;
}
