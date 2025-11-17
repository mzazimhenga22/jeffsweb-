
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

export function SearchModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0">
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search products..."
                className="pl-12 h-14 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
