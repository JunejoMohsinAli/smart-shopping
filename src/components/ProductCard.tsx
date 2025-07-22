import {
  Loader2,
  ShoppingCart,
  Zap,
  Package,
  Plus,
  Minus,
  Heart,
} from "lucide-react";
import { useState } from "react";
import type { Product, Variant } from "../types/Product";
import type { LoyaltyTier } from "../types/Loyalty";
import type { CartItem } from "../types/CartItem";
import {
  getDynamicPrice,
  isPeakHour,
  getLoyaltyDiscountWithMessage,
  getAvailableStock,
} from "../utils/pricing";

interface ProductCardProps {
  product: Product;
  isLoading: boolean;
  isProductSaved: boolean;
  userLoyaltyTier: LoyaltyTier;
  cartItems: CartItem[];
  onAddToCart: (quantity: number) => Promise<void>;
  onSaveForLater: (quantity: number) => Promise<void>;
}

const ProductCard = ({
  product,
  isLoading,
  isProductSaved,
  userLoyaltyTier,
  cartItems,
  onAddToCart,
  onSaveForLater,
}: ProductCardProps) => {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  );
  const availableStock = getAvailableStock(product, cartItems);

  const getStockStatus = () => {
    if (availableStock === 0) {
      return {
        color: "text-red-600 bg-red-50",
        text: "Out of Stock",
        icon: "❌",
      };
    } else if (availableStock <= 3) {
      return {
        color: "text-orange-600 bg-orange-50",
        text: "Low Stock",
        icon: "⚠️",
      };
    } else {
      return {
        color: "text-green-600 bg-green-50",
        text: "In Stock",
        icon: "✅",
      };
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = selectedQuantity + change;
    if (newQuantity >= 1 && newQuantity <= availableStock) {
      setSelectedQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (selectedQuantity > availableStock) {
      alert("Cannot add more than available stock!");
      return;
    }
    await onAddToCart(selectedQuantity);
    setSelectedQuantity(1);
  };

  const handleSaveForLater = async () => {
    await onSaveForLater(selectedQuantity);
  };

  const stockStatus = getStockStatus();
  const colorClass =
    stockStatus && stockStatus.color ? stockStatus.color.split(" ")[0] : "";
  const { price: currentPrice } = getDynamicPrice(product.basePrice);
  const originalPrice = product.basePrice;
  const hasDiscount = currentPrice !== originalPrice;

  const { price: loyaltyPrice, message: loyaltyMessage } =
    getLoyaltyDiscountWithMessage(userLoyaltyTier, currentPrice);
  const hasLoyaltyDiscount =
    loyaltyPrice < currentPrice && userLoyaltyTier !== "Bronze";

  return (
    <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 sm:h-56 object-cover"
          loading="lazy"
        />

        {/* Overlay Elements */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isPeakHour() && (
            <span className="flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
              <Zap className="w-3 h-3" />
              Peak Hour
            </span>
          )}
          <span
            className={`flex items-center gap-1 ${stockStatus.color} text-xs px-2 py-1 rounded-full font-medium shadow-lg border`}
          >
            {stockStatus.icon} {stockStatus.text}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
            {product.category}
          </span>
        </div>

        {/* Saved Indicator */}
        {isProductSaved && (
          <div className="absolute top-12 right-3">
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" />
              Saved
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {hasLoyaltyDiscount ? (
                <>
                  <div className="text-2xl font-bold text-blue-600">
                    Rs. {loyaltyPrice.toFixed(0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-gray-500 line-through">
                      Rs. {currentPrice.toLocaleString()}
                    </span>
                    <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                      {loyaltyMessage}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900">
                    Rs. {currentPrice.toLocaleString()}
                  </div>
                  {hasDiscount && (
                    <span className="text-sm text-gray-500 line-through">
                      Rs. {originalPrice.toLocaleString()}
                    </span>
                  )}
                </>
              )}
            </div>
            {hasDiscount && !hasLoyaltyDiscount && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                +10%
              </span>
            )}
          </div>
        </div>

        {/* Stock Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Stock:</span>
          </div>
          <span className={`font-bold ${colorClass}`}>
            {typeof availableStock === "number" ? availableStock : 0} units
          </span>
        </div>

        {/* Variants Selection */}
        {product.variants.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Options:</p>
            <div className="flex flex-wrap gap-1">
              {product.variants.map((variant: Variant, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVariant(variant)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors cursor-pointer border ${
                    selectedVariant === variant
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                  }`}
                >
                  {variant.size && `${variant.size} `}
                  {variant.color && variant.color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        {availableStock > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Quantity:</p>
            {selectedQuantity >= availableStock && (
              <p className="text-xs text-red-500 font-medium">
                You've reached max stock limit
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={selectedQuantity <= 1}
                className="p-1 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">
                {selectedQuantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={selectedQuantity >= availableStock}
                className="p-1 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            disabled={availableStock === 0 || isLoading}
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
              availableStock === 0 || isLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="inline">Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span className="inline">
                  Add {selectedQuantity > 1 ? `${selectedQuantity} ` : ""}to
                  Cart
                </span>
              </>
            )}
          </button>
          <button
            disabled={isLoading}
            onClick={handleSaveForLater}
            className={`p-3 rounded-xl transition-colors duration-200 ${
              isLoading
                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                : isProductSaved
                ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100 shadow-lg"
                : "text-gray-600 hover:text-yellow-500 hover:bg-yellow-50 bg-gray-100 hover:shadow-lg"
            }`}
            title={isProductSaved ? "Saved" : "Save for Later"}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart
                className={`w-4 h-4 ${isProductSaved ? "fill-current" : ""}`}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
