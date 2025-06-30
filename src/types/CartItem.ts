import type { Variant } from "./Product";

export interface CartItem {
  productId: number;
  name: string;
  basePrice: number;
  quantity: number;
  image: string;
  category: string;
  // optionally: variantId or size/color if you're using them
}