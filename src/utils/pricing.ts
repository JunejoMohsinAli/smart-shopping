import type { LoyaltyTier } from "../types/Loyalty";
import type { CartItem } from "../types/CartItem";

export function getLoyaltyDiscountWithMessage(
  tier: LoyaltyTier,
  price: number
): { price: number; message: string } {
  switch (tier) {
    case "Bronze":
      return { price: price * 0.95, message: "Bronze Tier: 5% off" };
    case "Silver":
      return { price: price * 0.9, message: "Silver Tier: 10% off" };
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

export function getDynamicPrice(basePrice: number): {
  price: number;
  peakApplied: boolean;
} {
  const peakMultiplier = 1.1;
  const peakApplied = isPeakHour();
  return {
    price: peakApplied ? Math.round(basePrice * peakMultiplier) : basePrice,
    peakApplied,
  };
}

export function getVolumeDiscount(
  quantity: number,
  price: number
): {
  price: number;
  percent: number;
} {
  if (quantity >= 5) return { price: price * 0.9, percent: 10 };
  if (quantity >= 3) return { price: price * 0.95, percent: 5 };
  return { price, percent: 0 };
}

export function calculateItemFinalPrice(
  basePrice: number,
  quantity: number,
  loyaltyTier: LoyaltyTier
): {
  finalPrice: number;
  appliedDiscounts: string[];
  savings: number;
} {
  const appliedDiscounts: string[] = [];

  // Apply peak hour adjustment
  const { price: peakPrice, peakApplied } = getDynamicPrice(basePrice);
  if (peakApplied) {
    appliedDiscounts.push("Peak Hour: +10%");
  }

  // Apply volume discount
  const { price: volumePrice, percent: volumePercent } = getVolumeDiscount(quantity, peakPrice);
  if (volumePercent > 0) {
    appliedDiscounts.push(`Volume: -${volumePercent}%`);
  }

  // Loyalty discount is applied last
  const { price: loyaltyPrice, message } = getLoyaltyDiscountWithMessage(loyaltyTier, volumePrice);
  if (loyaltyPrice < volumePrice && message) {
    appliedDiscounts.push(message);
  }

  const finalPrice = loyaltyPrice;

  // Calculate savings from *only* loyalty discount
  const savings = Math.max(0, (volumePrice - loyaltyPrice) * quantity);

  return {
    finalPrice,
    appliedDiscounts,
    savings,
  };
}

export function applyCategoryPromotion(cartItems: CartItem[]): {
  promotionDiscount: number;
  affectedItem?: CartItem;
} {
  // Count total quantity of Electronics and Accessories
  const totalElectronicsQty = cartItems
    .filter((item) => item.category === "Electronics")
    .reduce((sum, item) => sum + item.quantity, 0);

  const accessories = cartItems.filter((item) => item.category === "Accessories");

  // Only apply promo if eligible
  if (totalElectronicsQty >= 2 && accessories.length > 0) {
    const cheapestAccessory = [...accessories].sort((a, b) => a.basePrice - b.basePrice)[0];

    const discount = cheapestAccessory.basePrice * 0.5;

    return {
      promotionDiscount: discount,
      affectedItem: cheapestAccessory,
    };
  }

  return {
    promotionDiscount: 0,
  };
}
