import type { LoyaltyTier } from "../types/Loyalty";
import type { CartItem } from "../types/CartItem";

export function applyCategoryPromotion(cartItems: CartItem[]): {
  updatedCart: CartItem[];
  promotionDiscount: number;
} {
  const electronics = cartItems.filter((item) => item.category === "Electronics");
  const accessories = cartItems.filter((item) => item.category === "Accessories");

  let discount = 0;

  if (electronics.length >= 2 && accessories.length >= 1) {
    const cheapestAccessory = [...accessories].sort((a, b) => a.basePrice - b.basePrice)[0];
    discount = cheapestAccessory.basePrice * 0.5;
  }

  return {
    updatedCart: cartItems,
    promotionDiscount: discount,
  };
}

export function getLoyaltyDiscountWithMessage(tier: LoyaltyTier, price: number): {
  price: number;
  message: string;
} {
  switch (tier) {
    case "Bronze":
      return { price: price * 0.95, message: "Bronze Tier: 5% off" };
    case "Silver":
      return { price: price * 0.90, message: "Silver Tier: 10% off" };
    case "Gold":
      return { price: price * 0.85, message: "Gold Tier: 15% off" };
    default:
      return { price, message: "" };
  }
}

export function getLoyaltyDiscount(tier: LoyaltyTier, price: number): number {
  return getLoyaltyDiscountWithMessage(tier, price).price;
}

export function isPeakHour(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 9 && hour < 18;
}

export function getDynamicPrice(basePrice: number): number {
  const peakMultiplier = 1.1;
  return isPeakHour() ? Math.round(basePrice * peakMultiplier) : basePrice;
}

export function getVolumeDiscount(quantity: number, price: number): number {
  if (quantity >= 5) return price * 0.9;
  if (quantity >= 3) return price * 0.95;
  return price;
}
