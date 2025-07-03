import type { Product } from "../types/Product";

export const fakeProducts: Product[] = [
  {
    id: 1,
    name: "Eye Glasses",
    image: "/products/glasses.jpg",
    basePrice: 5000,
    category: "Apparel",
    stock: 10,
    variants: [
      { color: "Black" },
      { color: "White" },
    ],
  },
  {
    id: 2,
    name: "Headphone",
    image: "/products/headphone.jpg",
    basePrice: 13000,
    category: "Electronics",
    stock: 5,
    variants: [{ color: "Black" }, { color: "Silver" }],
  },
  {
    id: 3,
    name: "T-Shirt",
    image: "/products/tshirt.jpg",
    basePrice: 1800,
    category: "Apparel",
    stock: 20,
    variants: [{ size: "M" }, { size: "L" }],
  },
  {
      id: 4,
    name: "Shoes",
    image: "/products/shoes.jpg",
    basePrice: 3899,
    category: "Apparel",
    stock: 20,
    variants: [{ size: "35" }, { size: "38" }],
  },
];
