import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";
import type { CartItem } from "../types/CartItem";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CART_KEY = "smart_cart";
const SAVED_KEY = "saved_items";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const simulateApiCall = async () => {
    const fail = Math.random() < 0.2; // 20% chance to fail
    await new Promise((res) => setTimeout(res, 500));
    if (fail) throw new Error("Simulated network error");
  };

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_KEY);
    const storedSaved = localStorage.getItem(SAVED_KEY);

    if (storedCart) setCartItems(JSON.parse(storedCart));
    if (storedSaved) setSavedItems(JSON.parse(storedSaved));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
      localStorage.setItem(SAVED_KEY, JSON.stringify(savedItems));
    }
  }, [cartItems, savedItems, isLoaded]);

  const addToCart = async (item: CartItem) => {
    try {
      await simulateApiCall();
      setCartItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          return [...prev, item];
        }
      });
      toast.success("✅ Item added to cart");
    } catch (error) {
      toast.error("❌ Failed to add item to cart");
    }
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    toast.success("Item removed from cart.");
  };

  const saveForLater = (item: CartItem) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== item.productId));
    setSavedItems((prev) => {
      const exists = prev.find((i) => i.productId === item.productId);
      return exists ? prev : [...prev, item];
    });
    toast.success("💾 Saved for later");
  };

  const moveToCart = (productId: number) => {
    const item = savedItems.find((i) => i.productId === productId);
    if (!item) return;
    setSavedItems((prev) => prev.filter((i) => i.productId !== productId));
    setCartItems((prev) => {
      const exists = prev.find((i) => i.productId === productId);
      if (exists) {
        toast.success("Increased quantity in cart from saved list.");
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        toast.success("Moved to cart.");
        return [...prev, item];
      }
    });
  };

  const removeFromSaved = (productId: number) => {
    setSavedItems((prev) => prev.filter((i) => i.productId !== productId));
    toast.success("Item removed from saved list.");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedItems,
        isLoaded,
        addToCart,
        removeFromCart,
        saveForLater,
        moveToCart,
        removeFromSaved,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
