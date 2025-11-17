import './globals.css';
import { Providers } from './providers';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default async function RootLayout({
  children,
}: { 
  children: React.ReactNode;
}) {

  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Providers session={session}>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
