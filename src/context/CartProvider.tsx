import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { CartContext } from "./CartContext";
import type { CartItem } from "../types/CartItem";
import { toast } from "react-toastify";
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
  const [lastToastTime, setLastToastTime] = useState<Record<string, number>>(
    {}
  );

  const raceManager = useRef(new RaceConditionManager());

  const safeLocalStorage = useMemo(
    () => ({
      getItem: (key: string): string | null => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error(`Failed to read from localStorage (${key}):`, error);
          toast.error("Failed to load saved data");
          return null;
        }
      },

      setItem: (key: string, value: string): void => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error(`Failed to save to localStorage (${key}):`, error);
          toast.error("Storage full - unable to save");
        }
      },
    }),
    []
  );

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "warning" = "success") => {
      const now = Date.now();
      const lastTime = lastToastTime[message] || 0;

      if (now - lastTime > 2000) {
        setLastToastTime((prev) => ({ ...prev, [message]: now }));
        toast[type](message);
      }
    },
    [lastToastTime]
  );

  const simulateApiCall = useCallback(async () => {
    const fail = Math.random() < 0.03;
    await new Promise((res) => setTimeout(res, Math.random() * 400 + 100));
    if (fail) {
      const error = new Error("Network request failed");
      error.name = "NetworkError";
      throw error;
    }
  }, []);

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

          case "SAVE_FOR_LATER":
            const itemToSave = operation.payload;
            updateCartItemsSafely((prev) =>
              prev.filter((i) => i.productId !== operation.productId)
            );
            updateSavedItemsSafely((prev) => {
              const exists = prev.find(
                (i) => i.productId === operation.productId
              );
              return exists
                ? prev
                : [...prev, { ...itemToSave, quantity: itemToSave.quantity }];
            });
            break;

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
        showToast("Failed to load cart data", "error");
      }
    };

    loadData();
  }, [safeLocalStorage, showToast]);

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
      raceManager.current.enqueueOperation({
        type: "ADD_TO_CART",
        productId: item.productId,
        payload: item,
      });

      showToast("✅ Added to cart");
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    async (productId: number) => {
      if (raceManager.current.isProductLocked(productId)) {
        showToast("⏳ Processing...", "warning");
        return;
      }

      raceManager.current.enqueueOperation({
        type: "REMOVE_FROM_CART",
        productId,
      });
      updateCartItemsSafely((prev) =>
        prev.filter((item) => item.productId !== productId)
      );
      showToast("Removed from cart");
    },
    [updateCartItemsSafely, showToast]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (raceManager.current.isProductLocked(productId)) {
        showToast("⏳ Processing...", "warning");
        return;
      }

      raceManager.current.enqueueOperation({
        type: "UPDATE_QUANTITY",
        productId,
        payload: { quantity },
      });

      updateCartItemsSafely((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
      showToast("Quantity updated");
    },
    [updateCartItemsSafely, showToast, removeFromCart]
  );

  const saveForLater = useCallback(
    async (item: CartItem) => {
      if (raceManager.current.isProductLocked(item.productId)) {
        showToast("⏳ Processing...", "warning");
        return;
      }

      raceManager.current.enqueueOperation({
        type: "SAVE_FOR_LATER",
        productId: item.productId,
        payload: item,
      });

      updateCartItemsSafely((prev) =>
        prev.filter((i) => i.productId !== item.productId)
      );
      updateSavedItemsSafely((prev) => {
        const exists = prev.find((i) => i.productId === item.productId);
        return exists ? prev : [...prev, item];
      });

      showToast("⭐ Saved for later");
    },
    [updateCartItemsSafely, updateSavedItemsSafely, showToast]
  );

  const moveToCart = useCallback(
    async (productId: number) => {
      if (raceManager.current.isProductLocked(productId)) {
        showToast("⏳ Processing...", "warning");
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
          showToast("Quantity increased");
          return prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          showToast("Moved to cart");
          return [...prev, item];
        }
      });
    },
    [savedItems, updateCartItemsSafely, updateSavedItemsSafely, showToast]
  );

  const removeFromSaved = useCallback(
    async (productId: number) => {
      if (raceManager.current.isProductLocked(productId)) {
        showToast("⏳ Processing...", "warning");
        return;
      }

      raceManager.current.enqueueOperation({
        type: "REMOVE_FROM_SAVED",
        productId,
      });
      updateSavedItemsSafely((prev) =>
        prev.filter((i) => i.productId !== productId)
      );
      showToast("🗑️ Removed from saved items");
    },
    [updateSavedItemsSafely, showToast]
  );

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
