import { createContext, useContext } from "react";
import type { CartItem } from "../types/CartItem";

export interface CartContextType {
  cartItems: CartItem[];
  savedItems: CartItem[];
  isLoaded: boolean;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  saveForLater: (item: CartItem) => Promise<void>;
  moveToCart: (productId: number) => Promise<void>;
  removeFromSaved: (productId: number) => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCartContext must be used inside CartProvider");
  return context;
};
