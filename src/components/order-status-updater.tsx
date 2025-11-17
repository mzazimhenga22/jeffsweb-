
'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

interface OrderStatusUpdaterProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  children?: React.ReactNode;
}

const availableStatuses: OrderStatus[] = ['Pending', 'Processing', 'On Transit', 'Delivered', 'Cancelled'];

export function OrderStatusUpdater({ order, onStatusChange, children }: OrderStatusUpdaterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {children}
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    {availableStatuses.map(status => (
                        <DropdownMenuItem 
                            key={status} 
                            onClick={() => onStatusChange(order.id, status)}
                            disabled={order.status === status}
                        >
                            {status}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
