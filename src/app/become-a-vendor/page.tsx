
'use client';

import * as React from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = [
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Apparel' },
    { id: '3', name: 'Footwear' },
    { id: '4', name: 'Accessories' },
    { id: '5', name: 'Home Goods' },
];

export default function BecomeAVendorPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend.
    toast({
      title: 'Application Submitted!',
      description: 'Thank you for your interest. We will review your application and get back to you soon.',
    });
    // Redirect the user after submission
    setTimeout(() => {
        router.push('/');
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl py-24 px-4 md:px-6">
        <Card className="bg-card/80 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">
              Sell on Jeff's Concepts
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              Join our curated marketplace and reach a community of discerning shoppers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="store-name">Proposed Store Name</Label>
                    <Input id="store-name" placeholder="e.g., Artisan Creations" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Product Category</Label>
                    <Select required>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  Tell us about your products
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the type of products you sell, your brand story, and what makes your items unique."
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full text-lg py-6">
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
