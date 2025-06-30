export interface Variant {
  size?: string;
  color?: string;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  basePrice: number;
  category: string;
  stock: number;
  variants: Variant[];
}
