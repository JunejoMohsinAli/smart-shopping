import { createContext, useContext } from "react";
import type { CartItem } from "../types/CartItem";

export interface CartContextType {
  cartItems: CartItem[];
  savedItems: CartItem[];
  isLoaded: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  saveForLater: (item: CartItem) => void;
  moveToCart: (productId: number) => void;
  removeFromSaved: (productId: number) => void;
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
