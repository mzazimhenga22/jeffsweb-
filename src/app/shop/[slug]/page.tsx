'use client';

import Image from 'next/image';
import { Star, CheckCircle, ShieldCheck, Check, Minus, Plus } from 'lucide-react';
import * as React from 'react';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { products, vendors } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { notFound } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ProductCard } from '@/components/product-card';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = React.use(params);
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  const { addToCart } = useCart();
  const { toast } = useToast();

  const product = products.find((p) => p.id === slug);

  React.useEffect(() => {
    if (product?.colors?.length) {
      setSelectedColor(product.colors[0]);
    }
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  if (!product) {
    notFound();
  }
  
  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Please select a size.",
        });
        return;
    }
    addToCart({ ...product, quantity, size: selectedSize, color: selectedColor });
    toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
    });
  };

  const vendor = vendors.find((v) => v.id === product.vendorId);
  const image = PlaceHolderImages.find((p) => p.id === product.imageId);
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <MainLayout>
      <div className="container mx-auto max-w-screen-xl py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Image Gallery */}
          <div className="overflow-hidden rounded-3xl">
            {image && (
              <Image
                src={image.imageUrl}
                alt={product.name}
                width={800}
                height={800}
                className="h-full w-full object-cover"
                data-ai-hint={image.imageHint}
              />
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <Badge variant="secondary" className="w-fit">{product.category}</Badge>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground font-headline">
              {product.name}
            </h1>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(product.rating)
                        ? 'text-primary fill-primary'
                        : 'text-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">{product.reviewCount} reviews</span>
            </div>
            
            <p className="mt-6 text-4xl font-bold">${product.price.toFixed(2)}</p>

            <Separator className="my-8" />

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className='mb-8'>
                <h3 className="text-sm font-medium">Color: <span className='text-muted-foreground'>{selectedColor}</span></h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-transform duration-200 ease-in-out",
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'ring-1 ring-border'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select color ${color}`}
                    >
                      {selectedColor === color && (
                        <Check className="h-5 w-5 text-white mix-blend-difference" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Size Selector */}
             {product.sizes && product.sizes.length > 0 && (
                <div className='mb-8'>
                    <h3 className="text-sm font-medium">Size</h3>
                     <Select onValueChange={setSelectedSize} defaultValue={selectedSize || undefined}>
                        <SelectTrigger className="w-[180px] mt-2">
                            <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                        <SelectContent>
                            {product.sizes.map((size) => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
             )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <h3 className="text-sm font-medium">Quantity</h3>
              <div className="mt-2 flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-bold text-lg">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button size="lg" className="text-lg py-7" onClick={handleAddToCart}>Add to Cart</Button>
              <Button size="lg" variant="outline" className="text-lg py-7">Buy Now</Button>
            </div>
            
             <div className="mt-8 rounded-2xl border bg-background/50 p-6">
                <Accordion type="single" collapsible defaultValue="description">
                    <AccordionItem value="description">
                        <AccordionTrigger className='text-lg font-medium'>Description</AccordionTrigger>
                        <AccordionContent className='text-base text-muted-foreground'>
                        {product.description}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="vendor">
                        <AccordionTrigger className='text-lg font-medium'>Vendor Information</AccordionTrigger>
                        <AccordionContent className='text-base text-muted-foreground'>
                        Sold by <span className='text-foreground font-semibold'>{vendor?.storeName || 'Unknown'}</span>. A trusted partner on Ethereal Commerce.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="shipping" className='border-b-0'>
                        <AccordionTrigger className='text-lg font-medium'>Shipping & Returns</AccordionTrigger>
                        <AccordionContent className='text-base text-muted-foreground'>
                        Free shipping on orders over $50. Easy returns within 30 days.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

          </div>
        </div>

        {/* Related Products */}
        <div className="mt-24">
            <h2 className="mb-12 text-center text-4xl font-bold tracking-tight font-headline">
                You Might Also Like
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
