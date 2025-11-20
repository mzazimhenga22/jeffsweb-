
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import type { Category } from '@/lib/types';

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase, session } = useAuth();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [stock, setStock] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [sizes, setSizes] = React.useState('');
  const [colors, setColors] = React.useState('');
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [vendorProfileId, setVendorProfileId] = React.useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [newCategory, setNewCategory] = React.useState('');

  const describeError = (cause: unknown) => {
    if (!cause) return 'Unknown error';
    if (cause instanceof Error) {
      const status = (cause as { status?: number }).status;
      const body = (cause as { body?: unknown }).body;
      const suffix =
        typeof body === 'object' && body !== null && 'message' in body
          ? ` (${String((body as { message?: string }).message)})`
          : '';
      return `${cause.message}${status ? ` [status ${status}]` : ''}${suffix}`;
    }
    if (typeof cause === 'object') {
      try {
        return JSON.stringify(cause, Object.getOwnPropertyNames(cause));
      } catch {
        return '[object Object]';
      }
    }
    return String(cause);
  };

  React.useEffect(() => {
    let isMounted = true;

    const fetchVendorProfile = async () => {
      if (!session?.user) {
        setVendorProfileId(null);
        setIsLoadingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error('Failed to load vendor profile', error);
        toast({
          title: 'Cannot load vendor profile',
          description: 'Please try again or contact support.',
          variant: 'destructive',
        });
        setVendorProfileId(null);
      } else {
        setVendorProfileId(data?.id ?? null);
      }
      setIsLoadingProfile(false);
    };

    fetchVendorProfile();

    return () => {
      isMounted = false;
    };
    }, [session?.user, supabase, toast]);

  React.useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (!isMounted) return;
      if (error) {
        console.error('Failed to load categories', error);
        toast({
          title: 'Could not load categories',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
      setCategories((data as Category[]) ?? []);
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [supabase, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (
      !name.trim() ||
      !description.trim() ||
      !price.trim() ||
      !stock.trim() ||
      !category ||
      !sizes.trim() ||
      !colors.trim()
    ) {
      toast({
        title: 'Missing details',
        description: 'Please complete all product fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: 'Image required',
        description: 'Upload at least one product image.',
        variant: 'destructive',
      });
      return;
    }

    if (isLoadingProfile) {
      toast({
        title: 'Please wait',
        description: 'Still loading your vendor profile.',
      });
      return;
    }

    if (!vendorProfileId) {
      toast({
        title: 'No vendor profile found',
        description: 'You need an approved vendor profile before publishing products.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!session?.user) {
        toast({
          title: 'Authentication error',
          description: 'Please sign in again before publishing a product.',
          variant: 'destructive',
        });
        return;
      }

      const storageBucket = 'product_images'
      const { data: imageData, error: imageError } = await supabase.storage
        .from(storageBucket)
        .upload(`${Date.now()}_${imageFile.name}`, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (imageError || !imageData) {
        console.error('Image upload error', {
          error: imageError,
          vendorProfileId,
          userId: session.user.id,
        });
        toast({
          title: 'Error uploading image',
          description: describeError(imageError),
          variant: 'destructive',
        });
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from(storageBucket)
        .getPublicUrl(imageData.path);
      const imageUrl = publicUrlData.publicUrl;

      const { error: productError } = await supabase.from('products').insert([
        {
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          category,
          sizes: sizes.split(',').map((s) => s.trim()).filter(Boolean),
          colors: colors.split(',').map((c) => c.trim()).filter(Boolean),
          image_url: imageUrl,
          vendor_id: session.user.id,
        },
      ]);

      if (productError) {
        console.error('Product insert error', {
          error: productError,
          message: productError?.message,
          details: (productError as { details?: string })?.details,
          hint: (productError as { hint?: string })?.hint,
          code: (productError as { code?: string })?.code,
          vendorProfileId,
          userId: session.user.id,
        });
        toast({
          title: 'Error publishing product',
          description: describeError(productError),
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Product published',
        description: `"${name}" is now live in your catalog.`,
      });

      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategory('');
      setSizes('');
      setColors('');
      setImageFile(null);
      setImagePreview(null);

      router.push('/vendor/products');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const name = newCategory.trim();
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Failed to add category', error);
      toast({
        title: 'Could not add category',
        description: describeError(error),
        variant: 'destructive',
      });
      return;
    }

    setCategories((prev) => [...prev, data as Category].sort((a, b) => a.name.localeCompare(b.name)));
    setNewCategory('');
    toast({ title: 'Category added' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>
            Fill out the details below to list a new product.
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
                        placeholder="e.g., Urban Runner Sneakers"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-description">Description</Label>
                      <Textarea
                        id="product-description"
                        placeholder="Describe your product..."
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
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
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Product preview" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                  <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                              </div>
                            )}
                            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
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
                            <Input id="price" type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input id="stock" type="number" placeholder="e.g., 50" value={stock} onChange={(e) => setStock(e.target.value)} required />
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
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-category">Add Category</Label>
                          <div className="flex gap-2">
                            <Input
                              id="new-category"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              placeholder="New category name"
                            />
                            <Button type="button" variant="outline" onClick={handleAddCategory}>
                              Add
                            </Button>
                          </div>
                        </div>
                         <div>
                            <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                            <Input id="sizes" placeholder="e.g., S, M, L, XL" value={sizes} onChange={(e) => setSizes(e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="colors">Colors (comma-separated)</Label>
                            <Input id="colors" placeholder="e.g., Black, White, Blue" value={colors} onChange={(e) => setColors(e.target.value)} />
                        </div>
                    </CardContent>
                 </Card>
              </div>
            </div>
             <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Publishing...' : 'Publish Product'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
