import type { Product } from "../types/Product";

export const fakeProducts: Product[] = [
  {
    id: 1,
    name: "Running Shoes",
    image: "/products/shoes.jpg",
    basePrice: 5000,
    category: "Footwear",
    stock: 10,
    variants: [
      { size: "8", color: "Black" },
      { size: "9", color: "White" },
    ],
  },
  {
    id: 2,
    name: "Smartphone",
    image: "/products/phone.webp",
    basePrice: 60000,
    category: "Electronics",
    stock: 5,
    variants: [{ color: "Black" }, { color: "Silver" }],
  },
  {
    id: 3,
    name: "T-Shirt",
    image: "/products/tshirt.webp",
    basePrice: 1200,
    category: "Apparel",
    stock: 20,
    variants: [{ size: "M", color: "Red" }, { size: "L", color: "Blue" }],
  },
];
