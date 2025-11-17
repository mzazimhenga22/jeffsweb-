export type Product = {
  id: string;
  created_at: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  image_url: string;
};

export type CartItem = Product & {
    quantity: number;
    size: string | null;
    color: string | null;
};

export type Category = {
  id: string;
  name: string;
  imageId: string;
};
