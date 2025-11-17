'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ShoppingCart, Heart, User as UserIcon } from 'lucide-react';

const navItems = [
  { href: '/account/orders', label: 'My Orders', icon: ShoppingCart },
  { href: '/account/wishlist', label: 'My Wishlist', icon: Heart },
  { href: '/account/profile', label: 'My Profile', icon: UserIcon },
];

export function AccountNavClient() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-2 sticky top-24">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:text-primary hover:bg-primary/10',
            pathname === item.href && 'bg-primary/10 text-primary font-semibold'
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}