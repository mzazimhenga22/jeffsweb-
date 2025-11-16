
'use client';

import * as React from 'react';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type WishlistContextType = {
  wishlistItems: Product[];
  toggleWishlist: (item: Product) => void;
  isInWishlist: (itemId: string) => boolean;
};

const WishlistContext = React.createContext<WishlistContextType | undefined>(undefined);

export function useWishlist() {
  const context = React.useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = React.useState<Product[]>([]);
  const { toast } = useToast();

  const toggleWishlist = (item: Product) => {
    setWishlistItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        toast({
          title: 'Removed from wishlist',
          description: `${item.name} has been removed from your wishlist.`,
        });
        return prevItems.filter((i) => i.id !== item.id);
      } else {
        toast({
          title: 'Added to wishlist!',
          description: `${item.name} has been added to your wishlist.`,
        });
        return [...prevItems, item];
      }
    });
  };

  const isInWishlist = (itemId: string) => {
    return wishlistItems.some(item => item.id === itemId);
  }

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, toggleWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
