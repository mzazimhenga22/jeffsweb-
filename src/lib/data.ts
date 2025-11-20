import { PlaceHolderImages } from './placeholder-images'
import type { Category, Order, Product, SalesDatum, User, Vendor } from './types'

const now = () => new Date().toISOString()
const makeId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`)

const adminUser: User = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
  avatarId: 'avatar-1',
  avatar_url: PlaceHolderImages.find((p) => p.id === 'avatar-1')?.imageUrl ?? null,
  createdAt: now(),
  phone: null,
}

const vendorUser: User = {
  id: 'vendor-1',
  name: 'Apex Outfitters',
  email: 'vendor@example.com',
  role: 'vendor',
  avatarId: 'avatar-2',
  avatar_url: PlaceHolderImages.find((p) => p.id === 'avatar-2')?.imageUrl ?? null,
  createdAt: now(),
  phone: '+1 (555) 123-4567',
}

const salespersonUser: User = {
  id: 'sales-1',
  name: 'Jordan Lee',
  email: 'sales@example.com',
  role: 'salesperson',
  avatarId: 'avatar-3',
  avatar_url: PlaceHolderImages.find((p) => p.id === 'avatar-3')?.imageUrl ?? null,
  createdAt: now(),
  phone: '+1 (555) 555-0100',
}

export const users: User[] = [adminUser, vendorUser, salespersonUser]

export const vendors: Vendor[] = [
  {
    id: vendorUser.id,
    name: vendorUser.name,
    status: 'Approved',
    contactEmail: vendorUser.email,
    phone: vendorUser.phone ?? undefined,
  },
]

export const categories: Category[] = [
  { id: 'cat-1', name: 'Accessories', image_url: PlaceHolderImages.find((p) => p.id === 'cat-accessories')?.imageUrl ?? null },
  { id: 'cat-2', name: 'Footwear', image_url: PlaceHolderImages.find((p) => p.id === 'cat-shoes')?.imageUrl ?? null },
  { id: 'cat-3', name: 'Electronics', image_url: PlaceHolderImages.find((p) => p.id === 'cat-gadgets')?.imageUrl ?? null },
  { id: 'cat-4', name: 'Apparel', image_url: PlaceHolderImages.find((p) => p.id === 'cat-clothing')?.imageUrl ?? null },
]

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Lumina Chrono Watch',
    description: 'A precision timepiece with sapphire glass and interchangeable straps.',
    price: 299,
    category: 'Accessories',
    sizes: [],
    colors: ['#111827', '#f3f4f6'],
    stock: 24,
    created_at: now(),
    image_url: PlaceHolderImages.find((p) => p.id === 'hero-watch-1')?.imageUrl ?? null,
    imageIds: ['hero-watch-1'],
    vendorId: vendorUser.id,
    vendorName: vendorUser.name,
    reviewCount: 12,
    reviews: [
      { id: 'rev-1', rating: 5, comment: 'Stunning build quality!' },
      { id: 'rev-2', rating: 4, comment: 'Great everyday watch.' },
    ],
  },
  {
    id: 'prod-002',
    name: 'AeroFlow Sneakers',
    description: 'Breathable running sneakers with adaptive cushioning.',
    price: 129,
    category: 'Footwear',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['#111827', '#2563eb'],
    stock: 58,
    created_at: now(),
    image_url: PlaceHolderImages.find((p) => p.id === 'hero-shoe-1')?.imageUrl ?? null,
    imageIds: ['hero-shoe-1'],
    vendorId: vendorUser.id,
    vendorName: vendorUser.name,
    reviewCount: 8,
    reviews: [{ id: 'rev-3', rating: 4 }],
  },
  {
    id: 'prod-003',
    name: 'Minimalist Cotton Tee',
    description: 'Premium weight cotton tee with a relaxed modern fit.',
    price: 42,
    category: 'Apparel',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#f3f4f6', '#111827'],
    stock: 120,
    created_at: now(),
    image_url: PlaceHolderImages.find((p) => p.id === 'hero-fashion-1')?.imageUrl ?? null,
    imageIds: ['hero-fashion-1'],
    vendorId: adminUser.id,
    vendorName: adminUser.name,
    reviewCount: 4,
    reviews: [{ id: 'rev-4', rating: 5, comment: 'Soft and comfortable.' }],
  },
]

export const orders: Order[] = [
  {
    id: 'order-1001',
    userId: 'customer-1',
    vendorId: products[0].vendorId,
    salespersonId: salespersonUser.id,
    productId: products[0].id,
    quantity: 1,
    total: products[0].price,
    status: 'Pending',
    orderDate: now(),
    created_at: now(),
  },
  {
    id: 'order-1002',
    userId: 'customer-2',
    vendorId: products[1].vendorId,
    salespersonId: salespersonUser.id,
    productId: products[1].id,
    quantity: 2,
    total: products[1].price * 2,
    status: 'Processing',
    orderDate: now(),
    created_at: now(),
  },
]

export const salesData: SalesDatum[] = [
  { name: 'Jan', sales: 4200 },
  { name: 'Feb', sales: 3900 },
  { name: 'Mar', sales: 5800 },
  { name: 'Apr', sales: 6100 },
]

export function addProduct(product: Product) {
  const existing = products.find((p) => p.id === product.id)
  if (existing) {
    Object.assign(existing, product)
    return existing
  }

  const nextProduct: Product = {
    ...product,
    id: product.id || `prod-${makeId()}`,
    vendorId: product.vendorId || adminUser.id,
    vendorName: product.vendorName || (product.vendorId ? vendors.find((v) => v.id === product.vendorId)?.name : adminUser.name),
    created_at: product.created_at || now(),
    imageIds: product.imageIds && product.imageIds.length > 0 ? product.imageIds : product.image_url ? ['custom-upload'] : [],
  }

  products.push(nextProduct)
  return nextProduct
}

export function addOrder(order: Order) {
  const nextOrder: Order = {
    ...order,
    id: order.id || `order-${makeId()}`,
    vendorId: order.vendorId || adminUser.id,
    orderDate: order.orderDate || now(),
    created_at: order.created_at || now(),
  }

  orders.unshift(nextOrder)
  return nextOrder
}
