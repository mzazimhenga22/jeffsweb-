'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingCart, User, Package } from 'lucide-react';
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
import type { Product } from '@/lib/types';

const navLinks = [
  { href: '/shop', label: 'Shoes' },
  { href: '/shop', label: 'Watches' },
  { href: '/shop', label: 'Clothing' },
  { href: '/shop', label: 'Accessories' },
];

export function HeaderClient({
  user,
  cartCount: initialCartCount,
}: {
  user: any;
  cartCount: number;
}) {
  const isMobile = useIsMobile();
  const { cartCount } = useCart();
  const { logout, session, user: contextUser, supabase } = useAuth();
  const [hasHydrated, setHasHydrated] = React.useState(false);

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
    const profileRoles = normalizeRoles(profileUser?.role).concat(
      normalizeRoles((profileUser as any)?.roles),
    );
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
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

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
    const controller = new AbortController();
    const runSearch = async () => {
      const q = searchTerm.trim();
      if (!q) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, category')
        .ilike('name', `%${q}%`)
        .limit(5);
      if (!controller.signal.aborted) {
        if (error) {
          console.error('Search failed', error);
          setSearchResults([]);
        } else {
          setSearchResults((data as Product[]) ?? []);
        }
        setIsSearching(false);
      }
    };
    const handle = setTimeout(runSearch, 200);
    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [searchTerm, supabase]);

  const renderSearchResults = () => {
    if (!searchTerm.trim()) return null;
    return (
      <div className="absolute left-0 right-0 mt-2 rounded-xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-xl">
        {isSearching ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">Searching...</p>
        ) : searchResults.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">No products found.</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {searchResults.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/shop/${product.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-foreground/5"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <p className="text-sm font-semibold">Ksh {product.price?.toFixed(2)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

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

  React.useEffect(() => {
    setHasHydrated(true);
  }, []);

  const getWelcomeMessage = () => {
    if (!resolvedUser || !hasHydrated) return 'My Account';
    const displayName =
      (profileUser as any)?.full_name ||
      profileUser?.name ||
      resolvedUser.user_metadata?.full_name ||
      resolvedUser.user_metadata?.name ||
      resolvedUser.email;

    if (displayName) {
      const first = String(displayName).split(' ')[0];
      return `Welcome, ${first}`;
    }

    if (resolvedRoles.includes('customer')) return 'My Account';
    const role = resolvedRole || resolvedRoles[0] || '';
    return role ? `Welcome, ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'My Account';
  };

  const getAccountHomePage = () => {
    if (!resolvedUser) return '/login';
    switch (resolvedRole) {
      case 'admin':
        return '/admin';
      case 'vendor':
        return '/vendor';
      case 'salesperson':
        return '/salesperson';
      default:
        return '/account/orders';
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 shadow-[0_10px_50px_-30px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-colors duration-300',
        isScrolled ? 'backdrop-saturate-150' : 'backdrop-saturate-100',
      )}
    >
      {/* Top bar */}
      <div className="container flex h-16 max-w-screen-2xl items-center gap-3 px-4 sm:px-6">
        {/* Left: logo + desktop nav */}
        <div className="mr-auto flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            {/* Hide long text on very small screens */}
            <span className="hidden font-headline text-lg font-bold sm:inline-block">
              Ethereal Commerce
            </span>
          </Link>

          {/* Desktop nav */}
          {!isMobile && (
            <nav className="hidden items-center gap-6 text-sm md:flex">
              {navLinks.map((link, index) => (
                <Link
                  key={`${link.href}-${link.label}-${index}`}
                  href={link.href}
                  className="rounded-md px-3 py-1.5 text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right side */}
        {isMobile ? (
          // MOBILE RIGHT SIDE
          <div className="flex items-center gap-1">
            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className="hover:bg-foreground/5"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative hover:bg-foreground/5">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {resolvedCartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0 text-[10px]"
                  >
                    {resolvedCartCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile drawer (menu + account) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-foreground/5">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col py-6">
                {/* Drawer header */}
                <Link href="/" className="mb-6 flex items-center space-x-2">
                  <Package className="h-6 w-6 text-primary" />
                  <span className="font-headline text-lg font-bold">Ethereal Commerce</span>
                </Link>

                {/* Search inside drawer (nice for mobile) */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="w-full pl-9"
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="relative z-50">{renderSearchResults()}</div>
                  </div>
                </div>

                {/* Nav links */}
                <nav className="mb-6 flex flex-col gap-3">
                  {navLinks.map((link, index) => (
                    <Link
                      key={`${link.href}-${link.label}-${index}`}
                      href={link.href}
                      className="text-base font-medium text-foreground/80 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Account actions */}
                <div className="mt-auto flex flex-col gap-2">
                  {resolvedUser ? (
                    <>
                      <p className="mb-2 text-center text-sm text-muted-foreground">
                        {getWelcomeMessage()}
                      </p>
                      <Button asChild variant="outline">
                        <Link href={getAccountHomePage()}>Go to Dashboard</Link>
                      </Button>
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
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          // DESKTOP RIGHT SIDE
          <div className="flex items-center justify-end gap-3">
            {/* Desktop search (animated) */}
            <div className="relative flex items-center">
              <div
                className={cn(
                  'absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out overflow-visible',
                  isSearchOpen ? 'w-80 opacity-100' : 'w-0 opacity-0',
                )}
              >
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search products..."
                    className="w-full pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="relative z-50">{renderSearchResults()}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                className="hover:bg-foreground/5"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </div>

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative hover:bg-foreground/5">
              <Link href="/cart">
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

            {/* Account dropdown / auth buttons */}
            {resolvedUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:bg-foreground/5">
                    <User className="mr-2 h-4 w-4" />
                    {getWelcomeMessage()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getAccountHomePage()}>Dashboard</Link>
                  </DropdownMenuItem>
                  {resolvedRoles.includes('customer') && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/account/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/wishlist">My Wishlist</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/profile">My Profile</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="hover:bg-foreground/5">
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

      {/* MOBILE SEARCH BAR DROPDOWN (under header) */}
      {isMobile && isSearchOpen && (
        <div className="border-t border-white/10 bg-background/90 px-4 pb-3 pt-2 backdrop-blur-xl sm:px-6">
          <div className="container max-w-screen-2xl px-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <div className="relative">
                  <Input
                    ref={searchInputRef}
                    placeholder="Search products..."
                    className="w-full pl-9"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="relative z-50">{renderSearchResults()}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 hover:bg-foreground/5"
                onClick={() => setIsSearchOpen(false)}
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
