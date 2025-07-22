import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { CartContext } from "./CartContext";
import type { CartItem } from "../types/CartItem";
import {
  RaceConditionManager,
  type Operation,
} from "../utils/RaceConditionManager";

const CART_KEY = "smart_cart";
const SAVED_KEY = "saved_items";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Race condition manager - only create once
  const raceManager = useRef(new RaceConditionManager());

  // Safe localStorage operations with error handling
  const safeLocalStorage = useMemo(
    () => ({
      getItem: (key: string): string | null => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error(`Failed to read from localStorage (${key}):`, error);
          return null;
        }
      },

      setItem: (key: string, value: string): void => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error(`Failed to save to localStorage (${key}):`, error);
        }
      },
    }),
    []
  );

  // Improved API simulation - reduce failure rate to 3%
  const simulateApiCall = useCallback(async () => {
    const fail = Math.random() < 0.03;
    await new Promise((res) => setTimeout(res, Math.random() * 400 + 100));
    if (fail) {
      const error = new Error("Network request failed");
      error.name = "NetworkError";
      throw error;
    }
  }, []);

  // Memoized state updaters
  const updateCartItemsSafely = useCallback(
    (updater: (prev: CartItem[]) => CartItem[]) => {
      setCartItems(updater);
    },
    []
  );

  const updateSavedItemsSafely = useCallback(
    (updater: (prev: CartItem[]) => CartItem[]) => {
      setSavedItems(updater);
    },
    []
  );

  // Optimized operation executor with memoization
  const executeOperation = useCallback(
    async (operation: Operation): Promise<void> => {
      try {
        await simulateApiCall();

        switch (operation.type) {
          case "ADD_TO_CART":
            updateCartItemsSafely((prev) => {
              const existing = prev.find(
                (i) => i.productId === operation.productId
              );
              return existing
                ? prev.map((i) =>
                    i.productId === operation.productId
                      ? {
                          ...i,
                          quantity: i.quantity + operation.payload.quantity,
                        }
                      : i
                  )
                : [...prev, operation.payload];
            });
            break;

          case "REMOVE_FROM_CART":
            updateCartItemsSafely((prev) =>
              prev.filter((item) => item.productId !== operation.productId)
            );
            break;

          case "SAVE_FOR_LATER": {
            const itemToSave = operation.payload;
            updateSavedItemsSafely((prev) => {
              const exists = prev.find(
                (i) => i.productId === operation.productId
              );
              return exists
                ? prev
                : [...prev, { ...itemToSave, quantity: itemToSave.quantity }];
            });
            // *** NOTE: DO NOT REMOVE FROM CART ***
            break;
          }

          case "MOVE_TO_CART":
            const savedItem = savedItems.find(
              (i) => i.productId === operation.productId
            );
            if (savedItem) {
              updateSavedItemsSafely((prev) =>
                prev.filter((i) => i.productId !== operation.productId)
              );
              updateCartItemsSafely((prev) => {
                const exists = prev.find(
                  (i) => i.productId === operation.productId
                );
                return exists
                  ? prev.map((i) =>
                      i.productId === operation.productId
                        ? { ...i, quantity: i.quantity + savedItem.quantity }
                        : i
                    )
                  : [...prev, savedItem];
              });
            }
            break;

          case "REMOVE_FROM_SAVED":
            updateSavedItemsSafely((prev) =>
              prev.filter((i) => i.productId !== operation.productId)
            );
            break;

          case "UPDATE_QUANTITY":
            updateCartItemsSafely((prev) =>
              prev.map((item) =>
                item.productId === operation.productId
                  ? { ...item, quantity: operation.payload.quantity }
                  : item
              )
            );
            break;
        }
      } catch (error) {
        console.error("Operation failed:", error);
        throw error;
      }
    },
    [simulateApiCall, updateCartItemsSafely, updateSavedItemsSafely, savedItems]
  );

  // Queue processing with better error handling
  useEffect(() => {
    let isProcessing = false;

    const processQueue = async () => {
      if (isProcessing) return;
      isProcessing = true;

      try {
        await raceManager.current.processAllOperations(executeOperation);
      } catch (error) {
        console.error("Queue processing error:", error);
      } finally {
        isProcessing = false;
      }
    };

    const interval = setInterval(processQueue, 300);
    return () => clearInterval(interval);
  }, [executeOperation]);

  // Improved data loading with error handling
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedCart, storedSaved] = [
          safeLocalStorage.getItem(CART_KEY),
          safeLocalStorage.getItem(SAVED_KEY),
        ];

        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
        }

        if (storedSaved) {
          const parsedSaved = JSON.parse(storedSaved);
          setSavedItems(Array.isArray(parsedSaved) ? parsedSaved : []);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error("Load error:", error);
        setIsLoaded(true);
      }
    };

    loadData();
  }, [safeLocalStorage]);

  // Improved localStorage saving with error handling
  useEffect(() => {
    if (!isLoaded) return;

    const timeoutId = setTimeout(() => {
      try {
        safeLocalStorage.setItem(CART_KEY, JSON.stringify(cartItems));
        safeLocalStorage.setItem(SAVED_KEY, JSON.stringify(savedItems));
      } catch (error) {
        console.error("Save error:", error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cartItems, savedItems, isLoaded, safeLocalStorage]);

  const addToCart = useCallback(
    async (item: CartItem) => {
      const existing = cartItems.find((i) => i.productId === item.productId);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + item.quantity;

      if (newQty > item.stock) {
        console.warn("Cannot add more than available stock.");
        return;
      }

      raceManager.current.enqueueOperation({
        type: "ADD_TO_CART",
        productId: item.productId,
        payload: item,
      });
    },
    [cartItems]
  );

  const removeFromCart = useCallback(
    async (productId: number) => {
      if (raceManager.current.isProductLocked(productId)) {
        return;
      }

      raceManager.current.enqueueOperation({
        type: "REMOVE_FROM_CART",
        productId,
      });
      updateCartItemsSafely((prev) =>
        prev.filter((item) => item.productId !== productId)
      );
    },
    [updateCartItemsSafely]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      const item = cartItems.find((i) => i.productId === productId);
      if (!item) return;

      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (quantity > item.stock) {
        console.warn("Cannot add more than available stock.");
        return;
      }

      if (raceManager.current.isProductLocked(productId)) return;

      raceManager.current.enqueueOperation({
        type: "UPDATE_QUANTITY",
        productId,
        payload: { quantity },
      });

      updateCartItemsSafely((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      );
    },
    [cartItems, removeFromCart, updateCartItemsSafely]
  );

  // *** THIS IS THE ONLY REAL CHANGE ***
  // saveForLater: just add to savedItems, do NOT remove from cart!
  const saveForLater = useCallback(
    async (item: CartItem) => {
      if (raceManager.current.isProductLocked(item.productId)) {
        return;
      }

      raceManager.current.enqueueOperation({
        type: "SAVE_FOR_LATER",
        productId: item.productId,
        payload: item,
      });

      updateSavedItemsSafely((prev) => {
        const exists = prev.find((i) => i.productId === item.productId);
        return exists ? prev : [...prev, item];
      });
      // *** Don't remove from cart ***
    },
    [updateSavedItemsSafely]
  );

  const moveToCart = useCallback(
    async (productId: number) => {
      if (raceManager.current.isProductLocked(productId)) {
        return;
      }

      const item = savedItems.find((i) => i.productId === productId);
      if (!item) return;

      raceManager.current.enqueueOperation({ type: "MOVE_TO_CART", productId });

      updateSavedItemsSafely((prev) =>
        prev.filter((i) => i.productId !== productId)
      );
      updateCartItemsSafely((prev) => {
        const exists = prev.find((i) => i.productId === productId);
        if (exists) {
          return prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          return [...prev, item];
        }
      });
    },
    [savedItems, updateCartItemsSafely, updateSavedItemsSafely]
  );

  const removeFromSaved = useCallback(
    async (productId: number) => {
      if (raceManager.current.isProductLocked(productId)) {
        return;
      }

      raceManager.current.enqueueOperation({
        type: "REMOVE_FROM_SAVED",
        productId,
      });
      updateSavedItemsSafely((prev) =>
        prev.filter((i) => i.productId !== productId)
      );
    },
    [updateSavedItemsSafely]
  );

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      cartItems,
      savedItems,
      isLoaded,
      addToCart,
      removeFromCart,
      updateQuantity,
      saveForLater,
      moveToCart,
      removeFromSaved,
    }),
    [
      cartItems,
      savedItems,
      isLoaded,
      addToCart,
      removeFromCart,
      updateQuantity,
      saveForLater,
      moveToCart,
      removeFromSaved,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
