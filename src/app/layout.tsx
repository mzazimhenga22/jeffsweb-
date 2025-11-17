
import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { WishlistProvider } from '@/context/wishlist-context';
import { QuickViewProvider } from '@/context/quick-view-context';
import { QuickView } from '@/components/quick-view';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Ethereal Commerce',
  description: 'A premium eCommerce experience by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${figtree.className} font-body antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <QuickViewProvider>
                  {children}
                  <QuickView />
                </QuickViewProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
