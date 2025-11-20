'use client';

import * as React from 'react';
import { MainLayout } from '@/components/main-layout';
import { ProductCard } from '@/components/product-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ListFilter, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase-client';
import { Product, Category } from '@/lib/types';

type SortOption = 'newest' | 'price-asc' | 'price-desc';

export default function ShopPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [sortOption, setSortOption] = React.useState<SortOption>('newest');
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data as Product[]);
        setFilteredProducts(data as Product[]);
      }
    };

    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories((data as Category[]) ?? []);
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  React.useEffect(() => {
    let tempProducts = [...products];

    // Filter by category
    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter((p) => selectedCategories.includes(p.category));
    }

    // Sort products
    switch (sortOption) {
      case 'price-asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        tempProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        break;
    }

    setFilteredProducts(tempProducts);
  }, [selectedCategories, sortOption, products]);

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-headline">
              All Products
            </h1>
            <p className="mt-2 text-muted-foreground">
              Explore our curated collection of fine goods.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ListFilter className="mr-2 h-4 w-4" />
                  Filter by Category
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} onSelect={(e) => e.preventDefault()}>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={cat.id}
                        checked={selectedCategories.includes(cat.name)}
                        onCheckedChange={() => handleCategoryChange(cat.name)}
                      />
                      <Label htmlFor={cat.id} className="font-normal cursor-pointer">{cat.name}</Label>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Sort by <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-asc">Price: Low to High</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-desc">Price: High to Low</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
