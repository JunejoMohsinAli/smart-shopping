import { useCartContext } from "../context/CartContext";
import {
  getLoyaltyDiscountWithMessage,
  getVolumeDiscount,
  applyCategoryPromotion,
} from "../utils/pricing";
import type { LoyaltyTier } from "../types/Loyalty";

const userLoyaltyTier: LoyaltyTier = "Silver";

const CartPage = () => {
  const {
    cartItems,
    savedItems,
    removeFromCart,
    saveForLater,
    moveToCart,
    removeFromSaved,
  } = useCartContext();

  const total = cartItems.reduce((sum, item) => {
    const priceAfterVolume = getVolumeDiscount(item.quantity, item.basePrice);
    const { price: finalPrice } = getLoyaltyDiscountWithMessage(
      userLoyaltyTier,
      priceAfterVolume
    );
    return sum + finalPrice * item.quantity;
  }, 0);

  const { promotionDiscount } = applyCategoryPromotion(cartItems);
  const grandTotal = total - promotionDiscount;

  const tierMessage = {
    Bronze: "🎖 Bronze Member: 5% discount on all items.",
    Silver: "🥈 Silver Member: 10% discount on all items.",
    Gold: "🥇 Gold Member: 15% discount on all items.",
    None: "",
  }[userLoyaltyTier];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Cart</h2>

      {tierMessage && <p style={{ color: "blue" }}>{tierMessage}</p>}

      {cartItems.length === 0 ? (
        <p>Your cart is empty 🛒</p>
      ) : (
        <div>
          {cartItems.map((item) => {
            const priceAfterVolume = getVolumeDiscount(
              item.quantity,
              item.basePrice
            );
            const { price: finalPrice, message: loyaltyMsg } =
              getLoyaltyDiscountWithMessage(userLoyaltyTier, priceAfterVolume);
            const itemTotal = finalPrice * item.quantity;

            return (
              <div
                key={item.productId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  borderBottom: "1px solid #ccc",
                  padding: "10px 0",
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <div style={{ flex: 1 }}>
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>
                    Price per item: Rs. {finalPrice.toFixed(0)}{" "}
                    {finalPrice !== item.basePrice && (
                      <span style={{ color: "green" }}>
                        {priceAfterVolume !== item.basePrice &&
                          "Volume Discount, "}
                        {loyaltyMsg}
                      </span>
                    )}
                  </p>
                  <p>Total: Rs. {itemTotal.toFixed(0)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
                <button
                  onClick={() => saveForLater(item)}
                  style={{
                    backgroundColor: "#ffc107",
                    color: "black",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginLeft: "10px",
                  }}
                >
                  Save for Later
                </button>
              </div>
            );
          })}
          {promotionDiscount > 0 && (
            <p style={{ color: "green" }}>
              🎁 Category Promo: -Rs. {promotionDiscount.toFixed(0)} (50% off 1
              accessory)
            </p>
          )}
          <h3 style={{ marginTop: "10px" }}>
            Grand Total: Rs. {grandTotal.toFixed(0)}
          </h3>
        </div>
      )}

      {/* ✅ Saved for Later Section */}
      {savedItems.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3>Saved for Later</h3>
          {savedItems.map((item) => {
            const alreadyInCart = cartItems.some(
              (i) => i.productId === item.productId
            );
            return (
              <div
                key={item.productId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  borderBottom: "1px solid #ccc",
                  padding: "10px 0",
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <div style={{ flex: 1 }}>
                  <h4>{item.name}</h4>
                  <p>Price: Rs. {item.basePrice}</p>
                </div>
                <button
                  onClick={() => moveToCart(item.productId)}
                  disabled={alreadyInCart}
                  style={{
                    backgroundColor: alreadyInCart ? "#ccc" : "#28a745",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: alreadyInCart ? "not-allowed" : "pointer",
                  }}
                >
                  {alreadyInCart ? "In Cart" : "Move to Cart"}
                </button>
                <button
                  onClick={() => removeFromSaved(item.productId)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CartPage;
