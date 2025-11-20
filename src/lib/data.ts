import { PlaceHolderImages } from './placeholder-images'
import type { Category, Order, Product, Testimonial, User, Vendor } from './types'

const now = new Date().toISOString()

const categoryImages = {
  Electronics: PlaceHolderImages.find((img) => img.id === 'cat-watches')?.imageUrl ?? '/placeholder.svg',
  Apparel: PlaceHolderImages.find((img) => img.id === 'cat-clothing')?.imageUrl ?? '/placeholder.svg',
  Footwear: PlaceHolderImages.find((img) => img.id === 'cat-shoes')?.imageUrl ?? '/placeholder.svg',
  Accessories: PlaceHolderImages.find((img) => img.id === 'cat-accessories')?.imageUrl ?? '/placeholder.svg',
}

export const categories: Category[] = [
  { id: 'cat-1', name: 'Electronics', image_url: categoryImages.Electronics },
  { id: 'cat-2', name: 'Apparel', image_url: categoryImages.Apparel },
  { id: 'cat-3', name: 'Footwear', image_url: categoryImages.Footwear },
  { id: 'cat-4', name: 'Accessories', image_url: categoryImages.Accessories },
]

export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Sophia Turner',
    avatar_url: PlaceHolderImages.find((img) => img.id === 'avatar-1')?.imageUrl ?? null,
    rating: 5,
    text: 'The quality and service were outstanding. My new watch arrived quickly and looks incredible!',
  },
  {
    id: 'testimonial-2',
    name: 'Michael Chen',
    avatar_url: PlaceHolderImages.find((img) => img.id === 'avatar-2')?.imageUrl ?? null,
    rating: 4,
    text: 'Great selection of products and fast checkout. I found everything I needed.',
  },
  {
    id: 'testimonial-3',
    name: 'Aisha Rahman',
    avatar_url: PlaceHolderImages.find((img) => img.id === 'avatar-3')?.imageUrl ?? null,
    rating: 5,
    text: 'Love the curated collections! The vendor details made it easy to trust my purchase.',
  },
]

export const users: User[] = [
  {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    avatarId: 'avatar-1',
    avatar_url: PlaceHolderImages.find((img) => img.id === 'avatar-1')?.imageUrl ?? null,
    createdAt: now,
    phone: '+1 555-0100',
  },
  {
    id: 'vendor-1',
    name: 'Artisan Creations',
    email: 'vendor1@example.com',
    role: 'vendor',
    avatarId: 'avatar-2',
    avatar_url: PlaceHolderImages.find((img) => img.id === 'avatar-2')?.imageUrl ?? null,
    createdAt: now,
    phone: '+1 555-0101',
  },
  {
    id: 'vendor-2',
    name: 'Modern Designs',
    email: 'vendor2@example.com',
    role: 'vendor',
    avatarId: 'avatar-3',
    avatar_url: PlaceHolderImages.find((img) => img.id === 'avatar-3')?.imageUrl ?? null,
    createdAt: now,
    phone: '+1 555-0102',
  },
  {
    id: 'user-5',
    name: 'Sales Team',
    email: 'sales@example.com',
    role: 'salesperson',
    avatarId: 'avatar-4',
    avatar_url: PlaceHolderImages.find((img) => img.id === 'avatar-4')?.imageUrl ?? null,
    createdAt: now,
    phone: '+1 555-0105',
  },
]

export const vendors: Vendor[] = [
  { id: 'vendor-1', name: 'John Doe', storeName: 'Artisan Creations', email: 'john.doe@example.com', products: 25, status: 'Approved', avatarId: 'avatar-2' },
  { id: 'vendor-2', name: 'Jane Smith', storeName: 'Modern Designs', email: 'jane.smith@example.com', products: 15, status: 'Pending', avatarId: 'avatar-3' },
  { id: 'vendor-3', name: 'Robert Johnson', storeName: 'Vintage Finds', email: 'robert.j@example.com', products: 40, status: 'Approved', avatarId: 'avatar-1' },
  { id: 'vendor-4', name: 'Emily White', storeName: 'Home Comforts', email: 'emily.w@example.com', products: 10, status: 'Rejected', avatarId: 'avatar-4' },
]

const productImageIds = ['product-watch-1', 'product-shoe-1', 'product-clothing-1', 'product-accessory-1']

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Chrono Luxe Watch',
    description: 'A handcrafted timepiece with sapphire crystal and automatic movement.',
    price: 299.99,
    category: 'Electronics',
    sizes: [],
    colors: ['#000000', '#C0C0C0'],
    stock: 25,
    image_url: PlaceHolderImages.find((img) => img.id === productImageIds[0])?.imageUrl ?? null,
    vendorId: 'vendor-1',
    created_at: now,
    imageIds: [productImageIds[0]],
    vendorName: 'Artisan Creations',
  },
  {
    id: 'prod-2',
    name: 'AeroFlex Sneakers',
    description: 'Lightweight running shoes engineered for comfort and speed.',
    price: 149.5,
    category: 'Footwear',
    sizes: ['8', '9', '10', '11'],
    colors: ['#1F2937', '#FFFFFF'],
    stock: 60,
    image_url: PlaceHolderImages.find((img) => img.id === productImageIds[1])?.imageUrl ?? null,
    vendorId: 'vendor-2',
    created_at: now,
    imageIds: [productImageIds[1]],
    vendorName: 'Modern Designs',
  },
  {
    id: 'prod-3',
    name: 'Heritage Denim Jacket',
    description: 'A premium denim jacket with a timeless silhouette and modern fit.',
    price: 189.0,
    category: 'Apparel',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#1E3A8A', '#111827'],
    stock: 40,
    image_url: PlaceHolderImages.find((img) => img.id === productImageIds[2])?.imageUrl ?? null,
    vendorId: 'vendor-1',
    created_at: now,
    imageIds: [productImageIds[2]],
    vendorName: 'Artisan Creations',
  },
  {
    id: 'prod-4',
    name: 'Signature Leather Wallet',
    description: 'Hand-stitched leather wallet with RFID protection.',
    price: 89.99,
    category: 'Accessories',
    sizes: [],
    colors: ['#4B2E2A', '#0F172A'],
    stock: 75,
    image_url: PlaceHolderImages.find((img) => img.id === productImageIds[3])?.imageUrl ?? null,
    vendorId: null,
    created_at: now,
    imageIds: [productImageIds[3]],
    vendorName: 'Admin',
  },
]

export const orders: Order[] = [
  {
    id: 'order-1001',
    userId: 'admin-1',
    vendorId: 'vendor-1',
    salespersonId: 'user-5',
    productId: 'prod-1',
    quantity: 1,
    total: 299.99,
    status: 'Processing',
    orderDate: now,
    created_at: now,
    size: null,
    color: null,
  },
  {
    id: 'order-1002',
    userId: 'admin-1',
    vendorId: 'vendor-2',
    salespersonId: 'user-5',
    productId: 'prod-2',
    quantity: 2,
    total: 299.0,
    status: 'Delivered',
    orderDate: now,
    created_at: now,
    size: '10',
    color: '#1F2937',
  },
]

export const salesData = [
  { name: 'Week 1', sales: 4200 },
  { name: 'Week 2', sales: 3800 },
  { name: 'Week 3', sales: 5100 },
  { name: 'Week 4', sales: 4700 },
]

export function addProduct(product: Product) {
  products.push({ ...product, created_at: product.created_at || new Date().toISOString() })
}

export function addOrder(order: Order) {
  orders.push({ ...order, created_at: order.created_at || new Date().toISOString() })
}
