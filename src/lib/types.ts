
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  reviewCount: number;
  category: string;
  imageIds: string[];
  vendorId: string;
  sizes: string[];
  colors: string[];
  commission?: number;
  stock: number;
  reviews: ProductReview[];
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  avatarId: string;
}

export type CartItem = Product & {
    quantity: number;
    size: string | null;
    color: string | null;
}

export type Category = {
  id: string;
  name: string;
  imageId: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarId: string;
  role: 'customer' | 'vendor' | 'admin' | 'salesperson';
  createdAt: string;
};

export type Order = {
  id: string;
  userId: string;
  vendorId: string;
  productId: string;
  salespersonId?: string;
  quantity: number;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
};

export type Vendor = {
  id: string;
  name: string;
  email: string;
  avatarId: string;
  storeName: string;
  products: number;
  joinedDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
};

export type Testimonial = {
  id: string;
  name: string;
  avatarId: string;
  text: string;
  rating: number;
};
