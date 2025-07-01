export interface CartItem {
  productId: number;
  name: string;
  basePrice: number;
  quantity: number;
  image: string;
  category: string;
  tempId?: string;
}