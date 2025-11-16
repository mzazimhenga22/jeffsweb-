export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  category: string;
  imageId: string;
  vendorId: string;
  sizes: string[];
};

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
  role: 'customer' | 'vendor' | 'admin';
  createdAt: string;
};

export type Order = {
  id: string;
  userId: string;
  vendorId: string;
  productId: string;
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
  rating: number;
  products: number;
  joinedDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
};
