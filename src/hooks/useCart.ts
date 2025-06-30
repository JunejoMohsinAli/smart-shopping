import { useState, useEffect } from "react";
import type { CartItem } from "../types/CartItem";

const CART_KEY = "smart_cart";
const SAVED_KEY = "saved_items";


export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart and saved items from localStorage
  useEffect(() => {
  const storedCart = localStorage.getItem(CART_KEY);
  const storedSaved = localStorage.getItem(SAVED_KEY);

  if (storedCart) {
    const parsed = JSON.parse(storedCart);
    console.log("Loaded cart from localStorage:", parsed); // ✅ ADD THIS
    setCartItems(parsed);
  }

  if (storedSaved) {
    const parsedSaved = JSON.parse(storedSaved);
    console.log("Loaded savedItems:", parsedSaved); // ✅ ADD THIS
    setSavedItems(parsedSaved);
  }

  setIsLoaded(true);
}, []);




  // Save both to localStorage whenever they change
useEffect(() => {
  if (isLoaded) {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedItems));
  }
}, [cartItems, savedItems, isLoaded]);




  const addToCart = (item: CartItem) => {
  setCartItems((prev) => {
    console.log("Cart before add:", prev); // ✅ ADD THIS
    console.log("Item being added:", item); // ✅ ADD THIS

    const existing = prev.find((i) => i.productId === item.productId);

    if (existing) {
      console.log("Found existing item:", existing); // ✅ Optional
      return prev.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      console.log("Adding new item"); // ✅ Optional
      return [...prev, item];
    }
  });
};



  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const saveForLater = (productId: number) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
    setSavedItems((prev) => [...prev, item]);
  };

  const moveToCart = (productId: number) => {
    const item = savedItems.find((i) => i.productId === productId);
    if (!item) return;
    setSavedItems((prev) => prev.filter((i) => i.productId !== productId));
    setCartItems((prev) => [...prev, item]);
  };

 return {
  cartItems,
  savedItems,
  isLoaded, // ✅ add this
  addToCart,
  removeFromCart,
  saveForLater,
  moveToCart,
};

};
