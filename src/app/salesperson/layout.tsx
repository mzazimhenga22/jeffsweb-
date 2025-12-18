
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  Wallet,
  Bell,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ThemeToggle } from '@/components/theme-toggle';
import { RoleGuard } from '@/lib/role-guard';

const salespersonNavItems = [
  { href: '/salesperson', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/salesperson/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/salesperson/customers', icon: Users, label: 'Customers' },
  { href: '/salesperson/payouts', icon: Wallet, label: 'Payouts' },
  { href: '/salesperson/settings', icon: Settings, label: 'Settings' },
];

export default function SalespersonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const avatar = PlaceHolderImages.find(p => p.id === 'avatar-1');

  return (
    <RoleGuard allowed={['salesperson', 'admin']}>
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarContent className="flex flex-col justify-between">
            <div>
              <SidebarHeader className="p-4">
                <Link href="/salesperson" className="flex items-center gap-2 font-bold text-lg text-primary">
                  <Package />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Sales
                  </span>
                </Link>
              </SidebarHeader>
              <SidebarMenu>
                {salespersonNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6 flex-wrap">
            <div className="flex items-center gap-2">
               <SidebarTrigger className='md:hidden' />
               <h1 className="text-lg sm:text-xl font-semibold">
                {salespersonNavItems.find(item => item.href === pathname)?.label || 'Dashboard'}
               </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar>
                      {avatar && <AvatarImage src={avatar.imageUrl} alt="Salesperson" data-ai-hint={avatar.imageHint} />}
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Salesperson Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-secondary/20 p-4 sm:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </RoleGuard>
  );
}
