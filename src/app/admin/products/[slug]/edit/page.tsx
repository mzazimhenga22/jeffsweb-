
'use client';

import * as React from 'react';
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
import { categories, products } from '@/lib/data';
import { Upload } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function EditProductPage({ params }: { params: { slug: string } }) {
  const resolvedParams = React.use(params);
  const product = products.find(p => p.id === resolvedParams.slug);

  if (!product) {
    notFound();
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
          <form className="space-y-6">
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
                        defaultValue={product.name}
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-description">Description</Label>
                      <Textarea
                        id="product-description"
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
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" multiple />
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
                            <Input id="price" type="number" defaultValue={product.price} />
                        </div>
                        <div>
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input id="stock" type="number" defaultValue={product.stock} />
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
                            <Select defaultValue={product.category}>
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
                         <div>
                            <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                            <Input id="sizes" defaultValue={product.sizes.join(', ')} />
                        </div>
                         <div>
                            <Label htmlFor="colors">Colors (comma-separated)</Label>
                            <Input id="colors" defaultValue={product.colors.join(', ')} />
                        </div>
                    </CardContent>
                 </Card>
              </div>
            </div>
             <div className="flex justify-end gap-2">
                <Button variant="outline">Discard Changes</Button>
                <Button>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
