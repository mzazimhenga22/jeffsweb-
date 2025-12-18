'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
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
type ProductWithRatings = Product & { product_reviews?: { rating: number }[] };
const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ShopPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [sortOption, setSortOption] = React.useState<SortOption>('newest');
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') ?? '';

  React.useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_reviews(rating)')
        .or('is_deleted.is.null,is_deleted.eq.false');
      if (error) {
        console.error('Error fetching products:', error);
        setErrorMessage('We could not load products right now. Please try again shortly.');
        return;
      }

      const mapped =
        (data as ProductWithRatings[])?.map((product) => {
          const ratings = product.product_reviews?.map((r) => r.rating) ?? [];
          const reviewCount = ratings.length;
          const averageRating = reviewCount
            ? ratings.reduce((acc, rating) => acc + rating, 0) / reviewCount
            : 0;
          return { ...product, averageRating, reviewCount };
        }) ?? [];
      setProducts(mapped);
      setFilteredProducts(mapped);
    };

    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories((data as Category[]) ?? []);
      }
    };

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      setErrorMessage('Connect Supabase to populate products and categories.');
      return;
    }

    setIsLoading(true);
    Promise.all([fetchCategories(), fetchProducts()]).finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    if (!initialCategory) return;
    // Normalize category name to match DB values (case-insensitive)
    const match = categories.find(
      (cat) => cat.name.toLowerCase() === initialCategory.toLowerCase(),
    );
    if (match) {
      setSelectedCategories([match.name]);
    }
  }, [initialCategory, categories]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  React.useEffect(() => {
    let tempProducts = [...products];

    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter((p) => selectedCategories.includes(p.category));
    }

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
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Curated for you
            </p>
            <h1 className="text-4xl font-bold tracking-tight font-headline">All Products</h1>
            <p className="text-muted-foreground">
              Explore our curated collection of fine goods. Filter and sort to find the perfect piece faster.
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
                        id={cat.name}
                        checked={selectedCategories.includes(cat.name)}
                        onCheckedChange={() => handleCategoryChange(cat.name)}
                      />
                      <Label htmlFor={cat.name} className="font-normal cursor-pointer">{cat.name}</Label>
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

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {selectedCategories.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Filtering by:
              {selectedCategories.map((cat) => (
                <span key={cat} className="rounded-full bg-secondary px-3 py-1 text-foreground">{cat}</span>
              ))}
            </div>
          )}
          {(selectedCategories.length > 0 || sortOption !== 'newest') && (
            <Button variant="ghost" size="sm" onClick={() => { setSelectedCategories([]); setSortOption('newest'); setFilteredProducts(products); }}>
              Reset
            </Button>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-dashed border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-border/40 bg-muted/40 h-80" />
            ))}
          {!isLoading && filteredProducts.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-border/60 bg-muted/40 p-10 text-center">
              <p className="text-lg font-medium text-foreground">No products found.</p>
              <p className="text-muted-foreground">Try clearing filters or check back soon for fresh drops.</p>
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" onClick={() => { setSelectedCategories([]); setSortOption('newest'); setFilteredProducts(products); }}>
                  Clear filters
                </Button>
              </div>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
        </div>
      </div>
    </MainLayout>
  );
}
