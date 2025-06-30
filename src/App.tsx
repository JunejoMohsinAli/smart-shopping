import { useEffect, useState } from "react";
import { fakeProducts } from "./services/fakeProducts";
import type { Product } from "./types/Product";
import { useCartContext } from "./context/CartContext";
import { getDynamicPrice, isPeakHour } from "./utils/pricing";
import { simulateStockUpdate } from "./services/stockSimulator";
import { Link } from "react-router-dom";
import type { LoyaltyTier } from "./types/Loyalty";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [products, setProducts] = useState<Product[]>(fakeProducts);
  const {
    cartItems,
    savedItems,
    addToCart,
    saveForLater,
    moveToCart,
    removeFromCart,
    removeFromSaved,
    isLoaded,
  } = useCartContext();

  const [userLoyaltyTier, setUserLoyaltyTier] = useState<LoyaltyTier>(() => {
    return (localStorage.getItem("loyaltyTier") as LoyaltyTier) || "None";
  });

  useEffect(() => {
    localStorage.setItem("loyaltyTier", userLoyaltyTier);
  }, [userLoyaltyTier]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProducts((prevProducts) => {
        const updated = simulateStockUpdate(prevProducts);

        // Auto-remove cart items that went out of stock
        updated.forEach((product) => {
          const isOutOfStock = product.stock === 0;
          if (isOutOfStock) {
            const inCart = cartItems.find(
              (item) => item.productId === product.id
            );
            if (inCart) removeFromCart(product.id);
          }
        });

        return updated;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [cartItems, removeFromCart]);

  if (!isLoaded) return <div>Loading your cart...</div>;

  const tierMessages: Record<LoyaltyTier, string> = {
    Bronze: "🎖 Bronze Tier: 5% off",
    Silver: "🥈 Silver Tier: 10% off",
    Gold: "🥇 Gold Tier: 15% off",
    None: "",
  };

  return (
    <ErrorBoundary>
      <div style={{ padding: "20px" }}>
        <h1>
          🛒 Smart Shopping – <Link to="/cart">Go to Cart</Link>
        </h1>
        <p>
          Total items in cart:{" "}
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        </p>
        <p>Saved for Later: {savedItems.length}</p>

        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px dashed gray",
            borderRadius: "10px",
          }}
        >
          <h3>💡 Active Discounts</h3>
          <ul>
            {tierMessages[userLoyaltyTier] && (
              <li style={{ color: "blue" }}>{tierMessages[userLoyaltyTier]}</li>
            )}
            {isPeakHour() && (
              <li style={{ color: "red" }}>
                ⚡ Peak Hour: Prices increased by 10% (9 AM – 6 PM)
              </li>
            )}
            <li>📦 Volume Discount: 5% off (3+ units), 10% off (5+ units)</li>
            <li>
              🎁 Buy 2 electronics, get 1 accessory 50% off (visible in cart)
            </li>
          </ul>
        </div>

        <label htmlFor="tier">Select Loyalty Tier: </label>
        <select
          id="tier"
          value={userLoyaltyTier}
          onChange={(e) => setUserLoyaltyTier(e.target.value as LoyaltyTier)}
          style={{ marginBottom: "20px" }}
        >
          <option value="None">None</option>
          <option value="Bronze">Bronze</option>
          <option value="Silver">Silver</option>
          <option value="Gold">Gold</option>
        </select>

        {/* 🔽 Products */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "10px",
                width: "250px",
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: "100%", height: "150px", objectFit: "cover" }}
              />
              <h3>{product.name}</h3>
              <p>
                💰 Price: Rs.{" "}
                <strong>{getDynamicPrice(product.basePrice)}</strong>{" "}
                {isPeakHour() && (
                  <span style={{ color: "red" }}>(Peak Hour)</span>
                )}
              </p>
              <p>
                📦 Stock:{" "}
                <strong
                  style={{ color: product.stock === 0 ? "red" : "green" }}
                >
                  {product.stock}
                </strong>
              </p>
              <p>📂 Category: {product.category}</p>
              <p>Variants:</p>
              <ul>
                {product.variants.map((v, idx) => (
                  <li key={idx}>
                    {v.size ? `Size: ${v.size}` : ""}{" "}
                    {v.color ? `Color: ${v.color}` : ""}
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  disabled={product.stock === 0}
                  onClick={() =>
                    addToCart({
                      productId: product.id,
                      name: product.name,
                      basePrice: product.basePrice,
                      quantity: 1,
                      image: product.image,
                      category: product.category,
                    })
                  }
                  style={{
                    backgroundColor: product.stock === 0 ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    padding: "8px 10px",
                    borderRadius: "5px",
                    cursor: product.stock === 0 ? "not-allowed" : "pointer",
                    flex: 1,
                  }}
                >
                  Add to Cart
                </button>
                <button
                  onClick={() =>
                    saveForLater({
                      productId: product.id,
                      name: product.name,
                      basePrice: product.basePrice,
                      quantity: 1,
                      image: product.image,
                      category: product.category,
                    })
                  }
                  style={{
                    backgroundColor: "#ffc107",
                    color: "black",
                    border: "none",
                    padding: "8px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  Save for Later
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Saved for Later Section */}
        {savedItems.length > 0 && (
          <div style={{ marginTop: "40px" }}>
            <h2>Saved for Later</h2>
            {savedItems.map((item) => (
              <div
                key={item.productId}
                style={{
                  borderBottom: "1px solid #ccc",
                  padding: "10px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
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
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Move to Cart
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
                    marginLeft: "10px",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ErrorBoundary>
  );
}

export default App;
