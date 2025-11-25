'use client';

import { useEffect, useState } from 'react';
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
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { supabase, session } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [newCategoryImagePreview, setNewCategoryImagePreview] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (!isMounted) return;
      if (error) {
        console.error('Failed to load categories', error);
        toast({
          title: 'Could not load categories',
          description: error.message,
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

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const name = newCategory.trim();
    let imageUrl: string | null = null;
    try {
      if (newCategoryImage) {
        const { data: uploaded, error: uploadError } = await supabase.storage
          .from('categories')
          .upload(`${Date.now()}_${newCategoryImage.name}`, newCategoryImage, {
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadError || !uploaded) throw uploadError ?? new Error('Upload failed');
        const { data: publicUrlData } = supabase.storage.from('categories').getPublicUrl(uploaded.path);
        imageUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, image_url: imageUrl }])
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setCategories((prev) => [...prev, data as Category].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setNewCategory('');
      setNewCategoryImage(null);
      setNewCategoryImagePreview(null);
      toast({ title: 'Category added' });
    } catch (error) {
      console.error('Failed to add category', error);
      toast({
        title: 'Could not add category',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (
      !productName.trim() ||
      !description.trim() ||
      !price.trim() ||
      !stock.trim() ||
      !category ||
      !sizes.trim() ||
      !colors.trim()
    ) {
      toast({
        title: 'Missing details',
        description: 'Please fill in all product details before publishing.',
        variant: 'destructive',
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: 'Error',
        description: 'Please select an image for the product.',
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
        toast({
          title: 'Error uploading image',
          description: imageError?.message ?? 'Something went wrong while uploading the product image.',
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
          name: productName.trim(),
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
        toast({
          title: 'Error adding product',
          description: productError.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Product published',
        description: 'The product has been added successfully.',
      });

      setProductName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategory('');
      setSizes('');
      setColors('');
      setImageFile(null);
      setImagePreview(null);
      router.push('/admin/products');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
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
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
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
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">
                                Click to upload
                              </span>{' '}
                              or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SVG, PNG, JPG or GIF (MAX. 800x400px)
                            </p>
                          </div>
                        )}
                        <input
                          id="dropzone-file"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Pricing & Inventory
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="e.g., 50"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
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
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category" className="bg-background">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-category">Add Category</Label>
                      <div className="flex flex-col gap-2">
                        <Input
                          id="new-category"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="New category name"
                        />
                        <label
                          htmlFor="new-category-image"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary text-sm text-muted-foreground"
                        >
                          {newCategoryImagePreview ? (
                            <img src={newCategoryImagePreview} alt="Category preview" className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4">
                              <Upload className="w-5 h-5 mb-2" />
                              <span>Upload category image (optional)</span>
                            </div>
                          )}
                          <input
                            id="new-category-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setNewCategoryImage(file);
                                const reader = new FileReader();
                                reader.onloadend = () => setNewCategoryImagePreview(reader.result as string);
                                reader.readAsDataURL(file);
                              } else {
                                setNewCategoryImage(null);
                                setNewCategoryImagePreview(null);
                              }
                            }}
                          />
                        </label>
                        <div className="flex justify-end">
                          <Button type="button" variant="outline" onClick={handleAddCategory}>
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                      <Input
                        id="sizes"
                        placeholder="e.g., S, M, L, XL"
                        value={sizes}
                        onChange={(e) => setSizes(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="colors">Colors (comma-separated)</Label>
                      <Input
                        id="colors"
                        placeholder="e.g., Black, White, Blue"
                        value={colors}
                        onChange={(e) => setColors(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Save Draft
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
