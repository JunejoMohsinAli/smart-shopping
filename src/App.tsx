import { useEffect, useState, useCallback, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import {
  ErrorBoundary,
  Header,
  OfflineBanner,
  LoyaltySection,
  ProductsGrid,
  CartSidebar,
} from "./components";

// Services & Utils
import { fakeProducts } from "./services/fakeProducts";
import { simulateStockUpdate } from "./services/stockSimulator";
import { useCartContext } from "./context/CartContext";

// Types
import type { Product } from "./types/Product";
import type { LoyaltyTier } from "./types/Loyalty";
import type { CartItem } from "./types/CartItem";

function App() {
  // State
  const [products, setProducts] = useState<Product[]>(fakeProducts);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"cart" | "saved">("cart");
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
    {}
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  // Context
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

  // Loyalty tier
  const [userLoyaltyTier, setUserLoyaltyTier] = useState<LoyaltyTier>(() => {
    return (localStorage.getItem("loyaltyTier") as LoyaltyTier) || "None";
  });

  // Memoized calculations to prevent unnecessary re-renders
  const { totalItemsInCart, availableProductsCount } = useMemo(() => {
    const totalItemsInCart = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const availableProductsCount = products.filter(
      (product) => product.stock > 0
    ).length;

    return { totalItemsInCart, availableProductsCount };
  }, [cartItems, products]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Optimized products loading (reduced time)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsProductsLoading(false);
    }, 800); // Reduced from 1500ms to 800ms
    return () => clearTimeout(timer);
  }, []);

  // Debounced loyalty tier saving
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("loyaltyTier", userLoyaltyTier);
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [userLoyaltyTier]);

  // Optimized stock simulation with race condition prevention
  useEffect(() => {
    const interval = setInterval(() => {
      setProducts((prevProducts) => {
        const updated = simulateStockUpdate(prevProducts);

        // Only auto-remove if no operations are pending for those products
        const outOfStockIds = updated
          .filter((product) => product.stock === 0)
          .map((product) => product.id);

        if (outOfStockIds.length > 0) {
          // Add small delay to avoid race conditions with ongoing operations
          setTimeout(() => {
            const itemsToRemove = cartItems.filter((item) =>
              outOfStockIds.includes(item.productId)
            );

            if (itemsToRemove.length > 0) {
              itemsToRemove.forEach((item) => {
                removeFromCart(item.productId);
              });
            }
          }, 1000); // 1 second delay to avoid conflicts
        }

        return updated;
      });
    }, 60000); // Increased to 1 minute for better performance
    return () => clearInterval(interval);
  }, [cartItems, removeFromCart]);

  // Optimized loading handler with debouncing
  const handleAsyncAction = useCallback(
    async (productId: number, action: () => Promise<void>) => {
      setLoadingStates((prev) => ({ ...prev, [productId]: true }));
      try {
        await action();
      } finally {
        // Debounce loading state reset
        setTimeout(() => {
          setLoadingStates((prev) => ({ ...prev, [productId]: false }));
        }, 100);
      }
    },
    []
  );

  // Memoized wrapper functions
  const handleAddToCart = useCallback(
    async (item: CartItem): Promise<void> => {
      await addToCart(item);
    },
    [addToCart]
  );

  const handleSaveForLater = useCallback(
    async (item: CartItem): Promise<void> => {
      await saveForLater(item);
    },
    [saveForLater]
  );

  const handleRemoveFromCart = useCallback(
    async (productId: number): Promise<void> => {
      await removeFromCart(productId);
    },
    [removeFromCart]
  );

  const handleUpdateQuantity = useCallback(
    async (productId: number, quantity: number): Promise<void> => {
      await updateQuantity(productId, quantity);
    },
    [updateQuantity]
  );

  const handleMoveToCart = useCallback(
    async (productId: number): Promise<void> => {
      await moveToCart(productId);
    },
    [moveToCart]
  );

  const handleRemoveFromSaved = useCallback(
    async (productId: number): Promise<void> => {
      await removeFromSaved(productId);
    },
    [removeFromSaved]
  );

  const handleCartToggle = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  // Show loading message while cart is initializing
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-gray-700 mb-2">
          Loading your cart...
        </div>
        <div className="text-sm text-gray-500">This won't take long</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        {/* Simplified Background Elements - Reduced blur complexity */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200/10 to-blue-200/10 rounded-full"></div>
        </div>

        {/* Offline Banner */}
        <OfflineBanner isVisible={!isOnline} />

        {/* Header */}
        <Header
          isOnline={isOnline}
          totalItemsInCart={totalItemsInCart}
          onCartToggle={handleCartToggle}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          {/* Simplified Welcome Section */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Smart Shopping
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Intelligent shopping with dynamic pricing and real-time updates
            </p>
          </div>

          {/* Simplified Stats Cards - Reduced blur effects */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/90 rounded-xl p-3 shadow-sm border border-white/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {availableProductsCount}/{products.length}
                </p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
            </div>

            <div className="bg-white/90 rounded-xl p-3 shadow-sm border border-white/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {totalItemsInCart}
                </p>
                <p className="text-sm text-gray-600">Cart Items</p>
              </div>
            </div>

            <div className="bg-white/90 rounded-xl p-3 shadow-sm border border-white/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {savedItems.length}
                </p>
                <p className="text-sm text-gray-600">Saved</p>
              </div>
            </div>

            <div className="bg-white/90 rounded-xl p-3 shadow-sm border border-white/50">
              <div className="text-center">
                <p className="text-lg font-bold text-orange-600">
                  {userLoyaltyTier}
                </p>
                <p className="text-sm text-gray-600">Tier</p>
              </div>
            </div>
          </div>

          {/* Loyalty Section */}
          <LoyaltySection
            userLoyaltyTier={userLoyaltyTier}
            onTierChange={setUserLoyaltyTier}
          />

          {/* Products Section - Reduced blur effects */}
          <div className="bg-white/90 rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Products
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Live updates
              </div>
            </div>

            {/* Products Grid */}
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
            />
          </div>
        </main>

        {/* Cart Sidebar */}
        <CartSidebar
          isOpen={isCartOpen}
          activeTab={activeTab}
          cartItems={cartItems}
          savedItems={savedItems}
          userLoyaltyTier={userLoyaltyTier}
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

        {/* Optimized Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
          className="mt-16"
          toastClassName="!bg-white !border !border-gray-200 !shadow-lg !rounded-lg !mb-2"
          limit={3}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
