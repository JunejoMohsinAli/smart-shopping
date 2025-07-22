import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CartProvider } from "./context/CartProvider.tsx";
import { BrowserRouter } from "react-router-dom";
import { LoyaltyProvider } from "./context/LoyaltyContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LoyaltyProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </LoyaltyProvider>
    </BrowserRouter>
  </StrictMode>
);
