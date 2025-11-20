'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingCart, User, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from './ui/input';

const navLinks = [
  { href: '/shop', label: 'Shoes' },
  { href: '/shop', label: 'Watches' },
  { href: '/shop', label: 'Clothing' },
  { href: '/shop', label: 'Accessories' },
];

export function HeaderClient({ user, cartCount: initialCartCount }: { user: any, cartCount: number }) {
  const isMobile = useIsMobile();
  const { cartCount } = useCart();
  const { logout, session, user: contextUser } = useAuth();

  const normalizeRoles = React.useCallback((value?: unknown): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
    if (typeof value === 'string') return value.split(',').map((v) => v.trim()).filter(Boolean);
    return [];
  }, []);

  const profileUser = React.useMemo(() => {
    const candidate = contextUser as any;
    if (candidate && typeof candidate.role === 'string') {
      return candidate as { role: string; roles?: string[]; email?: string; name?: string };
    }
    return null;
  }, [contextUser]);

  const authUser = session?.user ?? (user ?? null);
  const resolvedUser = profileUser ?? authUser ?? null;
  const resolvedRoles = React.useMemo(() => {
    const profileRoles = normalizeRoles(profileUser?.role).concat(normalizeRoles((profileUser as any)?.roles));
    const metaRoles = normalizeRoles(authUser?.user_metadata?.role);
    const all = new Set([...profileRoles, ...metaRoles]);
    return Array.from(all);
  }, [authUser?.user_metadata?.role, normalizeRoles, profileUser]);
  const resolvedRole =
    resolvedRoles.find((r) => r === 'admin') ??
    resolvedRoles.find((r) => r === 'vendor') ??
    resolvedRoles.find((r) => r === 'salesperson') ??
    resolvedRoles.find((r) => r === 'customer');
  const resolvedCartCount = cartCount ?? initialCartCount;
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  React.useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);
  
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getWelcomeMessage = () => {
    if (!resolvedUser) return '';
    if (profileUser?.name) return `Welcome, ${profileUser.name.split(' ')[0]}`;
    if (resolvedRoles.includes('customer')) return 'My Account';
    const role = resolvedRole || resolvedRoles[0] || '';
    return role ? `Welcome, ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'My Account';
  }

  const getAccountHomePage = () => {
    if (!resolvedUser) return '/login';
    switch (resolvedRole) {
      case 'admin': return '/admin';
      case 'vendor': return '/vendor';
      case 'salesperson': return '/salesperson';
      default: return '/account/orders';
    }
  }


  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-300 border-b border-border/40 bg-background/80 backdrop-blur-xl'
      )}
    >
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline text-lg">
              Ethereal Commerce
            </span>
          </Link>
          {!isMobile && (
             <nav className="flex items-center gap-10 text-sm">
                {navLinks.map((link, index) => (
                  <Link
                    key={`${link.href}-${link.label}-${index}`}
                    href={link.href}
                    className="px-3 py-1.5 rounded-md transition-colors hover:bg-foreground/5 hover:text-foreground text-foreground/60"
                  >
                    {link.label}
                  </Link>
                ))}
            </nav>
          )}
        </div>


        {isMobile ? (
          <div className="flex items-center justify-end">
             <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className='hover:bg-foreground/5'>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            <Button variant="ghost" size="icon" asChild className='hover:bg-foreground/5'>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {resolvedCartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute top-0 right-0 h-5 w-5 justify-center p-0"
                  >
                    {resolvedCartCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className='hover:bg-foreground/5'>
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
                    {resolvedUser ? (
                      <>
                        <p className='text-center text-muted-foreground mb-2'>{getWelcomeMessage()}</p>
                        <Button onClick={logout}>Logout</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" asChild>
                          <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild>
                          <Link href="/signup">Sign Up</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-4">
            <div className="relative flex items-center">
                <div
                    className={cn(
                    'absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out',
                    isSearchOpen ? 'opacity-100 w-96' : 'opacity-0 w-0'
                    )}
                >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={searchInputRef}
                        placeholder="Search products..."
                        className="pl-9 w-full"
                        onBlur={() => setIsSearchOpen(false)}
                    />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)} className='hover:bg-foreground/5'>
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                </Button>
            </div>

            <Button variant="ghost" size="icon" asChild className='hover:bg-foreground/5'>
            <Link href="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {resolvedCartCount > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0"
                >
                    {resolvedCartCount}
                </Badge>
                )}
            </Link>
            </Button>

            {resolvedUser ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className='hover:bg-foreground/5'>
                    <User className="mr-2 h-4 w-4" />
                    {getWelcomeMessage()}
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href={getAccountHomePage()}>Dashboard</Link></DropdownMenuItem>
                {resolvedRoles.includes('customer') && (
                  <>
                    <DropdownMenuItem asChild><Link href="/account/orders">My Orders</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/account/wishlist">My Wishlist</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/account/profile">My Profile</Link></DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            ) : (
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className='hover:bg-foreground/5'>
                <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
