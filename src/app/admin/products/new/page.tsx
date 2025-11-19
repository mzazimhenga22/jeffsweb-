'use client';

import { useState } from 'react';
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
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';

const categories = [
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Apparel' },
    { id: '3', name: 'Footwear' },
    { id: '4', name: 'Accessories' },
    { id: '5', name: 'Home Goods' },
];

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
      const { data: imageData, error: imageError } = await supabase.storage
        .from('product-images')
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
        .from('product-images')
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
