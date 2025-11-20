
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { QuickViewProvider } from '@/context/quick-view-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { type Session } from '@supabase/auth-helpers-nextjs';

export function Providers({ 
    children,
    session
}: { 
    children: React.ReactNode,
    session: Session | null
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider session={session}>
        <CartProvider>
          <WishlistProvider>
            <QuickViewProvider>{children}</QuickViewProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
