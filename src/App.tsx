import { useEffect, useState, useCallback, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import CheckoutPage from "./pages/CheckOut";
import About from "./pages/About";
import Support from "./pages/Support";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

// Components
import {
  ErrorBoundary,
  Header,
  LoyaltySection,
  ProductsGrid,
  CartSidebar,
  Footer,
} from "./components";

// Services & Utils
import { fakeProducts } from "./services/fakeProducts";
import { simulateStockUpdate } from "./services/stockSimulator";
import { useCartContext } from "./context/CartContext";
import { LoyaltyProvider } from "./context/LoyaltyContext";

// Types
import type { Product } from "./types/Product";
import type { LoyaltyTier } from "./types/Loyalty";
import type { CartItem } from "./types/CartItem";

function App() {
  // ─── State & Hooks ─────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(fakeProducts);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"cart" | "saved">("cart");
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
    {}
  );
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  const {
    cartItems,
    savedItems,
    addToCart,
    saveForLater,
    moveToCart,
    removeFromCart,
    removeFromSaved,
    updateQuantity,
    isLoaded,
  } = useCartContext();

  const [userLoyaltyTier] = useState<LoyaltyTier>(() => {
    return (localStorage.getItem("loyaltyTier") as LoyaltyTier) || "None";
  });

  const { totalItemsInCart, availableProductsCount } = useMemo(() => {
    const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const availableCount = products.filter((p) => p.stock > 0).length;
    return {
      totalItemsInCart: totalItems,
      availableProductsCount: availableCount,
    };
  }, [cartItems, products]);

  useEffect(() => {
    const t = setTimeout(() => setIsProductsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = setTimeout(
      () => localStorage.setItem("loyaltyTier", userLoyaltyTier),
      200
    );
    return () => clearTimeout(id);
  }, [userLoyaltyTier]);

  useEffect(() => {
    const iv = setInterval(() => {
      setProducts((prev) => {
        const updated = simulateStockUpdate(prev);
        const outOfStockIds = updated
          .filter((p) => p.stock === 0)
          .map((p) => p.id);
        if (outOfStockIds.length) {
          setTimeout(() => {
            cartItems
              .filter((i) => outOfStockIds.includes(i.productId))
              .forEach((i) => removeFromCart(i.productId));
          }, 1000);
        }
        return updated;
      });
    }, 60000);
    return () => clearInterval(iv);
  }, [cartItems, removeFromCart]);

  const handleAsyncAction = useCallback(
    async (productId: number, action: () => Promise<void>) => {
      setLoadingStates((s) => ({ ...s, [productId]: true }));
      try {
        await action();
      } finally {
        setTimeout(
          () => setLoadingStates((s) => ({ ...s, [productId]: false })),
          100
        );
      }
    },
    []
  );

  const handleAddToCart = useCallback(
    (item: CartItem) => addToCart(item),
    [addToCart]
  );
  const handleSaveForLater = useCallback(
    (item: CartItem) => saveForLater(item),
    [saveForLater]
  );
  const handleRemoveFromCart = useCallback(
    (id: number) => removeFromCart(id),
    [removeFromCart]
  );
  const handleUpdateQuantity = useCallback(
    (id: number, qty: number) => updateQuantity(id, qty),
    [updateQuantity]
  );
  const handleMoveToCart = useCallback(
    (id: number) => moveToCart(id),
    [moveToCart]
  );
  const handleRemoveFromSaved = useCallback(
    (id: number) => removeFromSaved(id),
    [removeFromSaved]
  );
  const handleCartToggle = useCallback(() => setIsCartOpen((o) => !o), []);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-700">Loading your cart…</p>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <LoyaltyProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex flex-col">
                <Header
                  totalItemsInCart={totalItemsInCart}
                  onCartToggle={handleCartToggle}
                />

                <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      {
                        label: "Available",
                        value: `${availableProductsCount}/${products.length}`,
                        color: "text-blue-600",
                      },
                      {
                        label: "Cart Items",
                        value: totalItemsInCart,
                        color: "text-green-600",
                      },
                      {
                        label: "Saved",
                        value: savedItems.length,
                        color: "text-purple-600",
                      },
                      {
                        label: "Tier",
                        value: userLoyaltyTier,
                        color: "text-orange-600",
                      },
                    ].map((card) => (
                      <div
                        key={card.label}
                        className="bg-white/90 rounded-xl p-3 shadow-sm border border-white/50 text-center"
                      >
                        <p className={`text-2xl font-bold ${card.color}`}>
                          {card.value}
                        </p>
                        <p className="text-sm text-gray-600">{card.label}</p>
                      </div>
                    ))}
                  </div>

                  <LoyaltySection />

                  <section className="bg-white/90 rounded-2xl p-6 shadow-lg border border-white/50">
                    <h2 className="text-2xl font-bold mb-4">
                      Featured Products
                    </h2>
                    <ProductsGrid
                      products={products}
                      isLoading={isProductsLoading}
                      loadingStates={loadingStates}
                      onAddToCart={handleAsyncAction}
                      onSaveForLater={handleAsyncAction}
                      addToCart={handleAddToCart}
                      saveForLater={handleSaveForLater}
                      savedItems={savedItems}
                      removeFromSaved={handleRemoveFromSaved}
                      userLoyaltyTier={userLoyaltyTier}
                    />
                  </section>
                </main>

                <CartSidebar
                  isOpen={isCartOpen}
                  activeTab={activeTab}
                  cartItems={cartItems}
                  savedItems={savedItems}
                  loadingStates={loadingStates}
                  onClose={() => setIsCartOpen(false)}
                  onTabChange={setActiveTab}
                  onAsyncAction={handleAsyncAction}
                  removeFromCart={handleRemoveFromCart}
                  updateQuantity={handleUpdateQuantity}
                  saveForLater={handleSaveForLater}
                  moveToCart={handleMoveToCart}
                  removeFromSaved={handleRemoveFromSaved}
                />

                <Footer />
              </div>
            }
          />
        </Routes>
      </ErrorBoundary>
    </LoyaltyProvider>
  );
}

export default App;
