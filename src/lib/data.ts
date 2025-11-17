

import type { Product, Category, User, Order, Vendor, Testimonial, ProductReview, OrderStatus } from './types';

export const categories: Category[] = [
  { id: 'cat-1', name: 'Shoes', imageId: 'product-shoe-1' },
  { id: 'cat-2', name: 'Watches', imageId: 'product-watch-1' },
  { id: 'cat-3', name: 'Clothing', imageId: 'product-clothing-1' },
  { id: 'cat-4', name: 'Accessories', imageId: 'product-accessory-1' },
];

const reviews: ProductReview[] = [
    { id: 'rev-1', author: 'Alex Johnson', rating: 5, title: 'Masterpiece!', text: 'A masterpiece of precision and style. Worth every penny.', date: '2023-04-15', avatarId: 'avatar-1' },
    { id: 'rev-2', author: 'Maria Garcia', rating: 4, title: 'Great Watch', text: 'Beautiful watch, a bit heavy but feels premium.', date: '2023-05-01', avatarId: 'avatar-2' },
    { id: 'rev-3', author: 'Chen Wei', rating: 5, title: 'So Comfortable!', text: 'These are the most comfortable sneakers I have ever worn. 10/10.', date: '2023-05-10', avatarId: 'avatar-3' },
    { id: 'rev-4', author: 'David Lee', rating: 5, title: 'Timeless Classic', text: 'This jacket is a timeless classic for any wardrobe. Great quality.', date: '2023-03-20', avatarId: 'avatar-1' },
];


let initialProducts: Product[] = [
  { id: 'prod-1', name: 'Chronograph Excellence', description: 'A masterpiece of precision and style.', price: 1250.00, reviewCount: 150, category: 'Watches', imageIds: ['product-watch-1', 'product-watch-2', 'product-watch-3'], vendorId: 'vendor-1', sizes: ['One Size'], colors: ['#000000', '#C0C0C0', '#FFD700'], commission: 10, stock: 15, reviews: [reviews[0], reviews[1]] },
  { id: 'prod-2', name: 'Urban Runner Sneakers', description: 'Experience comfort and style on the go.', price: 180.00, reviewCount: 230, category: 'Shoes', imageIds: ['product-shoe-1', 'product-shoe-2', 'product-shoe-3'], vendorId: 'vendor-2', sizes: ['8', '9', '10', '11', '12'], colors: ['#FFFFFF', '#000000', '#0000FF'], commission: 15, stock: 30, reviews: [reviews[2]] },
  { id: 'prod-3', name: 'Denim Voyager Jacket', description: 'A timeless classic for any wardrobe.', price: 250.00, reviewCount: 95, category: 'Clothing', imageIds: ['product-clothing-1', 'product-clothing-2', 'product-clothing-3'], vendorId: 'vendor-3', sizes: ['S', 'M', 'L', 'XL'], colors: ['#0000FF', '#000000'], commission: 12, stock: 25, reviews: [reviews[3]] },
  { id: 'prod-4', name: 'Classic Aviators', description: 'Iconic sunglasses for a sharp look.', price: 150.00, reviewCount: 300, category: 'Accessories', imageIds: ['product-accessory-2'], vendorId: 'vendor-1', sizes: ['One Size'], colors: ['#000000', '#A52A2A'], commission: 20, stock: 50, reviews: [] },
  { id: 'prod-5', name: 'Minimalist Timepiece', description: 'Simplicity meets elegance.', price: 800.00, reviewCount: 120, category: 'Watches', imageIds: ['product-watch-3', 'product-watch-1'], vendorId: 'vendor-2', sizes: ['One Size'], colors: ['#C0C0C0', '#E6BFB1'], commission: 10, stock: 8, reviews: [] },
  { id: 'prod-6', name: 'Trail-Ready Hikers', description: 'Durable boots for your next adventure.', price: 220.00, reviewCount: 180, category: 'Shoes', imageIds: ['product-shoe-2', 'product-shoe-3'], vendorId: 'vendor-3', sizes: ['9', '10', '11'], colors: ['#A52A2A', '#000000', '#008000'], commission: 15, stock: 3, reviews: [] },
  { id: 'prod-7', name: 'Cozy Knit Hoodie', description: 'The perfect blend of comfort and street style.', price: 95.00, reviewCount: 450, category: 'Clothing', imageIds: ['product-clothing-2'], vendorId: 'vendor-1', sizes: ['S', 'M', 'L'], colors: ['#808080', '#000000', '#0000FF'], commission: 18, stock: 40, reviews: [] },
  { id: 'prod-8', name: 'Leather Tech Backpack', description: 'Carry your essentials in style.', price: 350.00, reviewCount: 110, category: 'Accessories', imageIds: ['product-accessory-3'], vendorId: 'vendor-2', sizes: ['One Size'], colors: ['#000000', '#A52A2A'], commission: 12, stock: 12, reviews: [] },
  { id: 'prod-9', name: 'Artisan Graphic Tee', description: 'Unique designs, premium comfort.', price: 45.00, reviewCount: 500, category: 'Clothing', imageIds: ['product-clothing-3'], vendorId: 'vendor-3', sizes: ['M', 'L', 'XL'], colors: ['#FFFFFF', '#000000', '#808080'], commission: 25, stock: 100, reviews: [] },
  { id: 'prod-10', name: 'Heritage Driver Shoes', description: 'Supple leather for a luxurious feel.', price: 320.00, reviewCount: 88, category: 'Shoes', imageIds: ['product-shoe-3', 'product-shoe-1'], vendorId: 'vendor-1', sizes: ['9', '10', '10.5'], colors: ['#A52A2A', '#000000'], commission: 15, stock: 22, reviews: [] },
  { id: 'prod-11', name: 'Digital Sport Watch', description: 'Track your fitness with precision.', price: 299.99, reviewCount: 215, category: 'Watches', imageIds: ['product-watch-2'], vendorId: 'vendor-2', sizes: ['One Size'], colors: ['#000000', '#C0C0C0'], commission: 10, stock: 18, reviews: [] },
  { id: 'prod-12', name: 'Slim-Fit Wallet', description: 'A minimalist wallet for the modern man.', price: 75.00, reviewCount: 320, category: 'Accessories', imageIds: ['product-accessory-1'], vendorId: 'vendor-3', sizes: ['One Size'], colors: ['#000000', '#A52A2A'], commission: 20, stock: 0, reviews: [] },
];

export const products: Product[] = [...initialProducts];

export const addProduct = (product: Product) => {
    products.unshift(product);
}

export const users: User[] = [
    { id: 'user-1', name: 'Alex Johnson', email: 'alex.j@example.com', avatarId: 'avatar-1', role: 'customer', createdAt: '2023-01-15' },
    { id: 'user-2', name: 'Maria Garcia', email: 'maria.g@example.com', avatarId: 'avatar-2', role: 'vendor', createdAt: '2023-02-20' },
    { id: 'user-3', name: 'Chen Wei', email: 'chen.w@example.com', avatarId: 'avatar-3', role: 'customer', createdAt: '2023-03-10' },
    { id: 'user-4', name: 'Admin User', email: 'admin@ethereal.com', avatarId: 'avatar-1', role: 'admin', createdAt: '2023-01-01' },
    { id: 'user-5', name: 'David Lee', email: 'david.lee@example.com', avatarId: 'avatar-1', role: 'salesperson', createdAt: '2023-04-05' },
    { id: 'user-6', name: 'Sophia Miller', email: 'sophia.m@example.com', avatarId: 'avatar-2', role: 'salesperson', createdAt: '2023-04-12' },
];

export const vendors: Vendor[] = [
  { id: 'vendor-1', name: 'Chrono Lux', email: 'contact@chronolux.com', avatarId: 'avatar-1', storeName: 'Chrono Lux', products: 15, joinedDate: '2022-08-10', status: 'Approved' },
  { id: 'vendor-2', name: 'Urban Step', email: 'support@urbanstep.com', avatarId: 'avatar-2', storeName: 'Urban Step', products: 32, joinedDate: '2022-09-01', status: 'Approved' },
  { id: 'vendor-3', name: 'The Apparel Co.', email: 'hello@apparelco.com', avatarId: 'avatar-3', storeName: 'The Apparel Co.', products: 50, joinedDate: '2023-01-20', status: 'Approved' },
  { id: 'vendor-4', name: 'Future Gadgets', email: 'info@futuregadgets.com', avatarId: 'avatar-1', storeName: 'Future Gadgets', products: 0, joinedDate: '2023-05-01', status: 'Pending' },
];

let initialOrders: Order[] = [
  { id: 'order-1', userId: 'user-1', vendorId: 'vendor-1', productId: 'prod-1', quantity: 1, total: 1250.00, status: 'Delivered', orderDate: '2023-05-01', salespersonId: 'user-5', size: 'One Size', color: 'Black' },
  { id: 'order-2', userId: 'user-3', vendorId: 'vendor-2', productId: 'prod-2', quantity: 1, total: 180.00, status: 'On Transit', orderDate: '2023-05-03', size: '10', color: 'White' },
  { id: 'order-3', userId: 'user-1', vendorId: 'vendor-3', productId: 'prod-3', quantity: 1, total: 250.00, status: 'Processing', orderDate: '2023-05-04', salespersonId: 'user-6', size: 'L', color: 'Blue' },
  { id: 'order-4', userId: 'user-2', vendorId: 'vendor-1', productId: 'prod-4', quantity: 2, total: 300.00, status: 'Delivered', orderDate: '2023-04-28', size: 'One Size', color: 'Black' },
];

export const orders: Order[] = [...initialOrders];

export const addOrder = (order: Order) => {
    orders.unshift(order);
}

export const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
  { name: 'Jul', sales: 7000 },
];

export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Sarah J.',
    avatarId: 'avatar-1',
    text: "The quality of the Chronograph Excellence watch I bought exceeded all my expectations. It's a true masterpiece!",
    rating: 5,
  },
  {
    id: 'testimonial-2',
    name: 'Mike D.',
    avatarId: 'avatar-2',
    text: "Urban Runner Sneakers are the most comfortable shoes I've ever owned. Fast shipping and great customer service.",
    rating: 5,
  },
  {
    id: 'testimonial-3',
    name: 'Emily R.',
    avatarId: 'avatar-3',
    text: "I love my Denim Voyager Jacket. It's stylish, well-made, and gets compliments everywhere I go. Will definitely shop here again.",
    rating: 5,
  },
];
