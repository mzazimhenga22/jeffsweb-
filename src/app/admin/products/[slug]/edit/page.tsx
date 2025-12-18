'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import type { Product, Category } from '@/lib/types';

export default function AdminEditProductPage({ params }: { params: { slug: string } }) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const { toast } = useToast();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', slug)
        .single();

      if (error || !data) {
        console.error('Error fetching product:', error);
        notFound();
        return;
      }

      setProduct(data as Product);
    };

    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      setCategories(data as Category[]);
    };

    fetchProduct();
    fetchCategories();
  }, [slug]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product || isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const priceRaw = String(formData.get('price') ?? '').trim();
    const stockRaw = String(formData.get('stock') ?? '').trim();
    const category = String(formData.get('category') ?? '').trim();
    const sizesRaw = String(formData.get('sizes') ?? '');
    const colorsRaw = String(formData.get('colors') ?? '');

    if (!name || !description || !priceRaw || !stockRaw || !category) {
      toast({
        title: 'Missing details',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const price = Number(priceRaw);
    const stock = Number.parseInt(stockRaw, 10);

    if (!Number.isFinite(price) || Number.isNaN(stock)) {
      toast({
        title: 'Invalid values',
        description: 'Price and stock must be valid numbers.',
        variant: 'destructive',
      });
      return;
    }

    const sizes = sizesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const colors = colorsRaw
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name,
          description,
          price,
          stock,
          category,
          sizes,
          colors,
        })
        .eq('id', slug);

      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: 'Could not update product',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Product updated',
        description: 'The product details have been saved.',
      });

      router.push('/admin/products');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>
            Update the details for &quot;{product.name}&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="product-name">Product Name</Label>
                      <Input
                        id="product-name"
                        name="name"
                        defaultValue={product.name}
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-description">Description</Label>
                      <Textarea
                        id="product-description"
                        name="description"
                        defaultValue={product.description}
                        rows={6}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            SVG, PNG, JPG or GIF (MAX. 800x400px)
                          </p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" multiple disabled />
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={product.price}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        defaultValue={product.stock}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Categorization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        defaultValue={product.category}
                        onValueChange={(value) => {
                          const input = document.getElementById('category-hidden') as HTMLInputElement | null;
                          if (input) input.value = value;
                        }}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        id="category-hidden"
                        name="category"
                        type="hidden"
                        defaultValue={product.category ?? ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                      <Input
                        id="sizes"
                        name="sizes"
                        defaultValue={product.sizes?.join(', ') ?? ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="colors">Colors (comma-separated)</Label>
                      <Input
                        id="colors"
                        name="colors"
                        defaultValue={product.colors?.join(', ') ?? ''}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/products')}
                disabled={isSubmitting}
              >
                Discard Changes
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

