
'use client';

import * as React from 'react';
import type { Product } from '@/lib/types';

type QuickViewContextType = {
  product: Product | null;
  isOpen: boolean;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
};

const QuickViewContext = React.createContext<QuickViewContextType | undefined>(undefined);

export function useQuickView() {
  const context = React.useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
}

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = React.useState<Product | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const openQuickView = (product: Product) => {
    setProduct(product);
    setIsOpen(true);
  };

  const closeQuickView = () => {
    setIsOpen(false);
    // Delay clearing product to allow for exit animation
    setTimeout(() => {
        setProduct(null);
    }, 300);
  };

  return (
    <QuickViewContext.Provider value={{ product, isOpen, openQuickView, closeQuickView }}>
      {children}
    </QuickViewContext.Provider>
  );
}
