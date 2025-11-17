import Link from 'next/link';
import { Package, Twitter, Facebook, Instagram } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Footer() {
  return (
    <footer className="bg-secondary/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-headline">Ethereal Commerce</span>
            </Link>
            <p className="mt-4 text-muted-foreground">
              The future of luxury shopping.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-6 w-6" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold tracking-wider uppercase">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary">Shoes</Link></li>
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary">Watches</Link></li>
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary">Clothing</Link></li>
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold tracking-wider uppercase">About</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Our Story</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Press</Link></li>
              <li><Link href="/become-a-vendor" className="text-muted-foreground hover:text-primary">Vendor Program</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold tracking-wider uppercase">Newsletter</h3>
            <p className="mt-4 text-muted-foreground">Stay updated with our latest arrivals and offers.</p>
            <form className="mt-4 flex">
              <Input type="email" placeholder="Your email" className="rounded-r-none" />
              <Button type="submit" className="rounded-l-none">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ethereal Commerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
