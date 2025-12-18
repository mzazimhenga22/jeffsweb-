
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LineChart,
  Wallet,
  Settings,
  Bell,
  PanelLeft,
  Receipt,
  Users2,
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
  useSidebar,
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
import { RoleGuard } from '@/lib/role-guard';

const vendorNavItems = [
  { href: '/vendor', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/vendor/pos', icon: Receipt, label: 'POS' },
  { href: '/vendor/products', icon: Package, label: 'Products' },
  { href: '/vendor/salespersons', icon: Users2, label: 'Salespersons' },
  { href: '/vendor/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/vendor/analytics', icon: LineChart, label: 'Analytics' },
  { href: '/vendor/payouts', icon: Wallet, label: 'Payouts' },
  { href: '/vendor/settings', icon: Settings, label: 'Settings' },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const avatar = PlaceHolderImages.find(p => p.id === 'avatar-2');

  return (
    <RoleGuard allowed={['vendor', 'admin']}>
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsible="icon" className="border-r bg-secondary text-secondary-foreground">
          <SidebarContent className="flex flex-col justify-between">
            <div>
              <SidebarHeader className="p-4">
                <Link href="/vendor" className="flex items-center gap-2 font-bold text-lg text-primary">
                  <Package />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Vendor
                  </span>
                </Link>
              </SidebarHeader>
              <SidebarMenu>
                {vendorNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href) && (item.href !== '/vendor' || pathname === '/vendor')}
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
          <header className="flex h-16 items-center justify-between border-b px-6 bg-secondary/30">
            <div className="flex items-center gap-2">
               <SidebarTrigger className='md:hidden' />
               <h1 className="text-xl font-semibold">
                {vendorNavItems.find(item => item.href === pathname)?.label || 'Dashboard'}
               </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar>
                      {avatar && <AvatarImage src={avatar.imageUrl} alt="Vendor" data-ai-hint={avatar.imageHint} />}
                      <AvatarFallback>V</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Vendor Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-background/80 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </RoleGuard>
  );
}
