import type { Product } from "../types/Product";
import type { CartItem } from "../types/CartItem";
import type { LoyaltyTier } from "../types/Loyalty";
import ProductCard from "./ProductCard";

interface ProductsGridProps {
  products: Product[];
  isLoading: boolean;
  loadingStates: Record<number, boolean>;
  onAddToCart: (
    productId: number,
    action: () => Promise<void>
  ) => Promise<void>;
  onSaveForLater: (
    productId: number,
    action: () => Promise<void>
  ) => Promise<void>;
  addToCart: (item: CartItem) => Promise<void>;
  saveForLater: (item: CartItem) => Promise<void>;
  savedItems: CartItem[];
  removeFromSaved: (productId: number) => Promise<void>;
  userLoyaltyTier: LoyaltyTier;
  cartItems: CartItem[]; // <-- ADD THIS PROP to props
}

const ProductsGrid = ({
  products,
  isLoading,
  loadingStates,
  onAddToCart,
  onSaveForLater,
  addToCart,
  saveForLater,
  savedItems,
  removeFromSaved,
  userLoyaltyTier,
  cartItems,
}: ProductsGridProps) => {
  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      basePrice: product.basePrice,
      quantity: quantity,
      image: product.image,
      category: product.category,
      stock: product.stock,
    };

    await onAddToCart(product.id, async () => await addToCart(cartItem));
  };

  const handleSaveForLater = async (product: Product, quantity: number = 1) => {
    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      basePrice: product.basePrice,
      quantity: quantity,
      image: product.image,
      category: product.category,
      stock: product.stock,
    };

    // Check if already saved
    const isAlreadySaved = savedItems.some(
      (item) => item.productId === product.id
    );

    if (isAlreadySaved) {
      // Remove from saved
      await onSaveForLater(
        product.id,
        async () => await removeFromSaved(product.id)
      );
    } else {
      // Add to saved
      await onSaveForLater(
        product.id,
        async () => await saveForLater(cartItem)
      );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {isLoading
        ? // Show skeleton loaders while loading
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border animate-pulse"
            >
              <div className="w-full h-40 sm:h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-8 bg-gray-200 rounded-md"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            </div>
          ))
        : products.map((product) => {
            const isProductSaved = savedItems.some(
              (item) => item.productId === product.id
            );

            return (
              <ProductCard
                key={product.id}
                product={product}
                isLoading={loadingStates[product.id] || false}
                isProductSaved={isProductSaved}
                userLoyaltyTier={userLoyaltyTier}
                cartItems={cartItems} // <-- PASS THIS
                onAddToCart={(quantity) => handleAddToCart(product, quantity)}
                onSaveForLater={(quantity) =>
                  handleSaveForLater(product, quantity)
                }
              />
            );
          })}
    </div>
  );
};

export default ProductsGrid;
