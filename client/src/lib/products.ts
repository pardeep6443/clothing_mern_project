export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  category: string;
  sizes: string[];
  colors: { name: string; value: string; image: string }[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  tags: string[];
}

// export interface Collection {
//   id: string;
//   name: string;
//   description: string;
//   image: string;
//   productCount: number;
//   path: string;
// }

export const collections= [
  {
    id: "new-arrivals",
    name: "New Arrivals",
    description: "Fresh drops & latest trends",
    image: "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800",
    productCount: 24,
    path: "/shop/listing"
  },
  {
    id: "streetwear",
    name: "Streetwear",
    description: "Bold urban essentials",
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
    productCount: 18,
    path: "/shop/listing"
  },
  {
    id: "hoodies",
    name: "Hoodies",
    description: "Comfort meets style",
    image: "https://images.pexels.com/photos/2294342/pexels-photo-2294342.jpeg?auto=compress&cs=tinysrgb&w=800",
    productCount: 12,
    path: "/shop/listing"
  },
  {
    id: "accessories",
    name: "Accessories", 
    description: "Complete your look",
    image: "https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?auto=compress&cs=tinysrgb&w=800",
    productCount: 32,
    path: "/shop/listing"
  }
];

export const sampleProducts: Product[] = [
  {
    id: "oversized-hoodie-black",
    name: "Oversized Comfort Hoodie",
    price: 78,
    originalPrice: 98,
    images: [
      "https://images.pexels.com/photos/2294342/pexels-photo-2294342.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Premium oversized hoodie crafted from organic cotton blend. Features dropped shoulders, kangaroo pocket, and our signature logo embroidery.",
    category: "hoodies",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", value: "#000000", image: "https://images.pexels.com/photos/2294342/pexels-photo-2294342.jpeg?auto=compress&cs=tinysrgb&w=800" },
      { name: "White", value: "#FFFFFF", image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800" },
      { name: "Gray", value: "#6B7280", image: "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800" }
    ],
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    isNew: false,
    isOnSale: true,
    tags: ["comfort", "oversized", "streetwear"]
  },
  {
    id: "graphic-tee-bold",
    name: "Bold Graphic Tee",
    price: 45,
    images: [
      "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Statement graphic tee with bold typography and street-inspired artwork. 100% cotton, regular fit.",
    category: "tops",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Black", value: "#000000", image: "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800" },
      { name: "White", value: "#FFFFFF", image: "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=800" }
    ],
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    isNew: true,
    isOnSale: false,
    tags: ["graphic", "casual", "statement"]
  },
  {
    id: "denim-jacket-vintage",
    name: "Vintage Wash Denim Jacket",
    price: 125,
    images: [
      "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Classic denim jacket with vintage wash and distressed details. Adjustable cuffs and chest pockets.",
    category: "tops",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Light Blue", value: "#93C5FD", image: "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800" },
      { name: "Dark Blue", value: "#1E3A8A", image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800" }
    ],
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    isNew: false,
    isOnSale: false,
    tags: ["denim", "vintage", "classic"]
  },
  {
    id: "cargo-pants-tactical",
    name: "Tactical Cargo Pants",
    price: 89,
    originalPrice: 110,
    images: [
      "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Utility-inspired cargo pants with multiple pockets and adjustable straps. Durable ripstop fabric.",
    category: "bottoms",
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: [
      { name: "Khaki", value: "#A3A3A3", image: "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=800" },
      { name: "Black", value: "#000000", image: "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800" }
    ],
    rating: 4.5,
    reviewCount: 203,
    inStock: true,
    isNew: false,
    isOnSale: true,
    tags: ["cargo", "utility", "streetwear"]
  },
  {
    id: "bucket-hat-reversible",
    name: "Reversible Bucket Hat",
    price: 32,
    images: [
      "https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Reversible bucket hat with contrasting colors. Water-resistant material with UV protection.",
    category: "accessories",
    sizes: ["S/M", "L/XL"],
    colors: [
      { name: "Black/White", value: "#000000", image: "https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?auto=compress&cs=tinysrgb&w=800" },
      { name: "Khaki/Orange", value: "#A3A3A3", image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800" }
    ],
    rating: 4.3,
    reviewCount: 67,
    inStock: true,
    isNew: true,
    isOnSale: false,
    tags: ["hat", "reversible", "accessories"]
  },
  {
    id: "crossbody-bag-tech",
    name: "Tech Crossbody Bag",
    price: 65,
    images: [
      "https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Functional crossbody bag with tech-focused compartments. Water-resistant exterior with reflective details.",
    category: "accessories",
    sizes: ["One Size"],
    colors: [
      { name: "Black", value: "#000000", image: "https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?auto=compress&cs=tinysrgb&w=800" },
      { name: "Gray", value: "#6B7280", image: "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800" }
    ],
    rating: 4.9,
    reviewCount: 312,
    inStock: true,
    isNew: true,
    isOnSale: false,
    tags: ["bag", "tech", "crossbody", "functional"]
  }
];

export const categories = [
  { name: "New", path: "/shop/listing" },
  { name: "Tops", path: "/shop/listing" },
  { name: "Bottoms", path: "/shop/listing" },
  { name: "Hoodies", path: "/shop/listing" },
  { name: "Accessories", path: "/shop/listing" }
];

export function getProductById(id: string): Product | undefined {
  return sampleProducts.find(product => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return sampleProducts.filter(product => product.category === category);
}

export function getFeaturedProducts(): Product[] {
  return sampleProducts.filter(product => product.isNew || product.isOnSale);
}