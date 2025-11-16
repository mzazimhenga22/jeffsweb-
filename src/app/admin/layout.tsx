
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
  Building2,
  Bell,
  PanelLeft,
  Receipt,
  Users2
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
import { ThemeToggle } from '@/components/theme-toggle';
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

const adminNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/pos', icon: Receipt, label: 'POS' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/salespersons', icon: Users2, label: 'Salespersons' },
  { href: '/admin/vendors', icon: Building2, label: 'Vendors' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const avatar = PlaceHolderImages.find(p => p.id === 'avatar-1');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarContent className="flex flex-col justify-between">
            <div>
              <SidebarHeader className="p-4">
                <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-primary">
                  <Package />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Admin
                  </span>
                </Link>
              </SidebarHeader>
              <SidebarMenu>
                {adminNavItems.map((item) => (
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
                {adminNavItems.find(item => item.href === pathname)?.label || 'Dashboard'}
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
                      {avatar && <AvatarImage src={avatar.imageUrl} alt="Admin" data-ai-hint={avatar.imageHint} />}
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
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
  );
}
