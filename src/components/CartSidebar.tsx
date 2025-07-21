import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLoyalty } from "../context/LoyaltyContext";

import {
  ShoppingCart,
  X,
  Trash2,
  Heart,
  Loader2,
  Gift,
  CreditCard,
  Plus,
  Minus,
} from "lucide-react";
import type { CartItem } from "../types";
import {
  applyCategoryPromotion,
  calculateItemFinalPrice,
} from "../utils/pricing";

interface CartSidebarProps {
  isOpen: boolean;
  activeTab: "cart" | "saved";
  cartItems: CartItem[];
  savedItems: CartItem[];
  loadingStates: Record<number, boolean>;
  onClose: () => void;
  onTabChange: (tab: "cart" | "saved") => void;
  onAsyncAction: (
    productId: number,
    action: () => Promise<void>
  ) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  saveForLater: (item: CartItem) => Promise<void>;
  moveToCart: (productId: number) => Promise<void>;
  removeFromSaved: (productId: number) => Promise<void>;
}
const CartItemComponent = React.memo(
  ({
    item,
    isItemLoading,
    onRemove,
    onSaveForLater,
    onUpdateQuantity,
  }: {
    item: CartItem;
    isItemLoading: boolean;
    onRemove: () => void;
    onSaveForLater: () => void;
    onUpdateQuantity: (quantity: number) => void;
  }) => {
    const { userLoyaltyTier } = useLoyalty();

    const { finalPrice, appliedDiscounts, savings } = useMemo(
      () =>
        calculateItemFinalPrice(item.basePrice, item.quantity, userLoyaltyTier),
      [item.basePrice, item.quantity, userLoyaltyTier]
    );

    const itemTotal = finalPrice * item.quantity;

    const handleQuantityChange: (change: number) => void = (change) => {
      const newQuantity = item.quantity + change;
      if (newQuantity >= 1 && newQuantity <= item.stock) {
        onUpdateQuantity(newQuantity);
      }
    };

    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg">
        <div className="flex gap-3">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0 shadow-md"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate mb-1">
              {item.name}
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Qty:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={isItemLoading || item.quantity <= 1}
                    className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={isItemLoading || item.quantity >= item.stock}
                    className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 🔧 ADDED: Explicit Stock Line for Debugging */}
              <p className="text-xs text-gray-500">
                Stock Available:{" "}
                <span className="font-medium">{item.stock}</span>
              </p>

              <p className="text-sm font-medium text-gray-900">
                Rs. {finalPrice.toFixed(0)} each
              </p>

              {appliedDiscounts.length > 0 && (
                <div className="space-y-1">
                  {appliedDiscounts.map((discount, idx) => (
                    <p key={idx} className="text-xs text-green-600 font-medium">
                      {discount}
                    </p>
                  ))}
                </div>
              )}

              {savings > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  You save: Rs. {(savings * item.quantity).toFixed(0)}
                </p>
              )}

              <p className="text-base font-bold text-blue-600">
                Total: Rs. {itemTotal.toFixed(0)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={onRemove}
              disabled={isItemLoading}
              className={`p-2 rounded-lg transition-all ${
                isItemLoading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 shadow-md hover:shadow-lg"
              }`}
              title="Remove from cart"
            >
              {isItemLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
            <button
              onClick={onSaveForLater}
              disabled={isItemLoading}
              className={`p-2 rounded-lg transition-all ${
                isItemLoading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-orange-50 text-orange-600 hover:bg-orange-100 active:bg-orange-200 shadow-md hover:shadow-lg"
              }`}
              title="Save for later"
            >
              {isItemLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

CartItemComponent.displayName = "CartItemComponent";

const CartSidebar = ({
  isOpen,
  activeTab,
  cartItems,
  savedItems,
  loadingStates,
  onClose,
  onTabChange,
  onAsyncAction,
  removeFromCart,
  updateQuantity,
  saveForLater,
  moveToCart,
  removeFromSaved,
}: CartSidebarProps) => {
  const { userLoyaltyTier } = useLoyalty();
  const navigate = useNavigate();
  const {
    promotionDiscount,
    grandTotal,
    totalItemsInCart,
    totalSavings,
    affectedItem,
  } = useMemo(() => {
    let subtotal = 0;
    let totalSavings = 0;

    cartItems.forEach((item) => {
      const { finalPrice, savings } = calculateItemFinalPrice(
        item.basePrice,
        item.quantity,
        userLoyaltyTier
      );
      subtotal += finalPrice * item.quantity;
      totalSavings += savings * item.quantity;
    });

    const { promotionDiscount, affectedItem } =
      applyCategoryPromotion(cartItems);
    const grandTotal = subtotal - promotionDiscount;
    const totalItemsInCart = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return {
      promotionDiscount,
      grandTotal,
      totalItemsInCart,
      totalSavings: totalSavings + promotionDiscount,
      affectedItem,
    };
  }, [cartItems, userLoyaltyTier]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Cart Sidebar - Reduced blur effects */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white/95 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col translate-x-0">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Cart
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 active:bg-white/70 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex mt-4 bg-white/50 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => onTabChange("cart")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "cart"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              <ShoppingCart size={16} />
              Cart ({totalItemsInCart})
            </button>
            <button
              onClick={() => onTabChange("saved")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "saved"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              <Heart size={16} />
              Saved ({savedItems.length})
            </button>
          </div>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {activeTab === "cart" ? (
            cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart size={32} className="text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-4">
                  Add some amazing products to get started
                </p>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemComponent
                    key={item.productId}
                    item={item}
                    isItemLoading={loadingStates[item.productId] || false}
                    onRemove={() =>
                      onAsyncAction(
                        item.productId,
                        async () => await removeFromCart(item.productId)
                      )
                    }
                    onSaveForLater={() =>
                      onAsyncAction(
                        item.productId,
                        async () => await saveForLater(item)
                      )
                    }
                    onUpdateQuantity={(quantity) =>
                      onAsyncAction(
                        item.productId,
                        async () =>
                          await updateQuantity(item.productId, quantity)
                      )
                    }
                  />
                ))}
              </div>
            )
          ) : savedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-pink-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No saved items
              </h3>
              <p className="text-gray-500 mb-4">
                Items you save will appear here
              </p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-red-600 transition-all"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedItems.map((item) => {
                const alreadyInCart = cartItems.some(
                  (i) => i.productId === item.productId
                );
                const isItemLoading = loadingStates[item.productId] || false;

                return (
                  <div
                    key={item.productId}
                    className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0 shadow-md"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate mb-1">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          Rs. {item.basePrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            onAsyncAction(
                              item.productId,
                              async () => await moveToCart(item.productId)
                            )
                          }
                          disabled={alreadyInCart || isItemLoading}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            alreadyInCart || isItemLoading
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl"
                          }`}
                        >
                          {isItemLoading ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Moving
                            </>
                          ) : alreadyInCart ? (
                            "In Cart"
                          ) : (
                            "Move to Cart"
                          )}
                        </button>
                        <button
                          onClick={() =>
                            onAsyncAction(
                              item.productId,
                              async () => await removeFromSaved(item.productId)
                            )
                          }
                          disabled={isItemLoading}
                          className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                            isItemLoading
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 shadow-md hover:shadow-lg"
                          }`}
                          title="Remove from saved"
                        >
                          {isItemLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm font-medium">
                                Removing...
                              </span>
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} />
                              <span className="text-sm font-medium">
                                Remove
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enhanced Cart Footer */}
        {activeTab === "cart" && cartItems.length > 0 && (
          <div className="border-t border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50 p-4 flex-shrink-0">
            {/* Savings Summary */}
            {totalSavings > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="text-green-700 text-sm font-medium">
                  🎉 Total Savings: Rs. {totalSavings.toFixed(0)}
                </div>
              </div>
            )}

            {/* Category Promotion */}
            {promotionDiscount > 0 && affectedItem && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Gift className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Category Promo: -Rs. {promotionDiscount.toFixed(0)} on{" "}
                    {affectedItem.name}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between text-2xl font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rs. {grandTotal.toFixed(0)}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-bold text-lg transition-colors duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(CartSidebar);
