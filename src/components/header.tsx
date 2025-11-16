'use client';

import Link from 'next/link';
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCart } from '@/context/cart-context';
import { Badge } from '@/components/ui/badge';

const navLinks = [
  { href: '/shop', label: 'Shoes' },
  { href: '/shop', label: 'Watches' },
  { href: '/shop', label: 'Clothing' },
  { href: '/shop', label: 'Accessories' },
];

export function Header() {
  const isMobile = useIsMobile();
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline text-lg">
              Ethereal Commerce
            </span>
          </Link>
        </div>

        {isMobile ? (
          <div className="flex flex-1 items-center justify-end">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                 {cartCount > 0 && (
                    <Badge variant="destructive" className="absolute top-0 right-0 h-5 w-5 justify-center p-0">{cartCount}</Badge>
                )}
              </Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col h-full py-6">
                  <Link href="/" className="mb-8 flex items-center space-x-2">
                     <Package className="h-6 w-6 text-primary" />
                    <span className="font-bold">Ethereal Commerce</span>
                  </Link>
                  <nav className="flex flex-col gap-4 mb-auto">
                    {navLinks.map((link, index) => (
                      <Link
                        key={`${link.href}-${link.label}-${index}`}
                        href={link.href}
                        className="text-lg font-medium text-foreground/80 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                   <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <>
            <nav className="flex items-center gap-6 text-sm">
              {navLinks.map((link, index) => (
                <Link
                  key={`${link.href}-${link.label}-${index}`}
                  href={link.href}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-1 items-center justify-end gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-9" />
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{cartCount}</Badge>
                  )}
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
