import type { Product } from "../types/Product";

// Function to simulate stock changes randomly
export function simulateStockUpdate(products: Product[]): Product[] {
  return products.map((product) => {
    const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
    const newStock = product.stock + change;
    return {
      ...product,
      stock: Math.max(0, Math.min(20, newStock)), // keep stock between 0 and 20
    };
  });
}
