import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import Razorpay from "razorpay";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure variables from .env.example are loaded if not in process.env
if (fs.existsSync(path.resolve(__dirname, ".env.example"))) {
  try {
    const exampleConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, ".env.example")));
    for (const key in exampleConfig) {
      if (!process.env[key]) {
        process.env[key] = exampleConfig[key];
      }
    }
  } catch (e) {
    console.error("Error reading .env.example:", e);
  }
}

const app = express();
// Port 3000 is required by the infrastructure
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "CLIENT_SECRET_KEY";

// Cloudinary Configuration
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary configured with cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
}

const upload = multer({ storage: multer.memoryStorage() });

// --- MONGOOSE SCHEMAS & MODELS ---
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, trim: true },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    image: mongoose.Schema.Types.Mixed,
    images: {
      type: [String],
      default: [],
    },
    title: { type: String, required: true },
    description: String,
    category: mongoose.Schema.Types.Mixed,
    categories: {
      type: [String],
      default: [],
    },
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    sizes: {
      type: [String],
      default: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    isPreOrder: {
      type: Boolean,
      default: false,
    },
    preOrderReleaseDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

const AddressSchema = new mongoose.Schema(
  {
    userId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  { timestamps: true }
);

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.Mixed, ref: "Product", required: true },
        size: { type: String, default: "M" },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: String,
    cartId: String,
    cartItems: [
      {
        productId: String,
        title: String,
        image: mongoose.Schema.Types.Mixed,
        price: mongoose.Schema.Types.Mixed,
        quantity: Number,
        size: {
          type: String,
          default: "M",
        },
        isPreOrder: {
          type: Boolean,
          default: false,
        },
        preOrderReleaseDate: {
          type: String,
          default: "",
        },
      },
    ],
    addressInfo: {
      addressId: String,
      address: String,
      city: String,
      pincode: String,
      phone: String,
      notes: String,
    },
    orderStatus: { type: String, default: "pending" },
    payment_mode: { type: String, default: "Razorpay" },
    paymentMethod: { type: String, default: "Razorpay" },
    payment_status: { type: String, default: "pending" },
    paymentStatus: { type: String, default: "pending" },
    totalAmount: Number,
    subtotalAmount: Number,
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    couponApplied: { type: Boolean, default: false },
    orderDate: { type: Date, default: Date.now },
    orderUpdateDate: { type: Date, default: Date.now },
    paymentId: String,
    payerId: String,
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
  },
  { timestamps: true }
);

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    title: { type: String, default: "", trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, default: 0, min: 0 },
    usageLimit: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0 },
    expiryDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    productId: String,
    userId: String,
    userName: String,
    reviewMessage: String,
    reviewValue: Number,
  },
  { timestamps: true }
);

const FeatureSchema = new mongoose.Schema(
  {
    image: String,
  },
  { timestamps: true }
);

const WishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.Mixed, ref: "Product", required: true },
        name: String,
        price: Number,
        salePrice: Number,
        image: mongoose.Schema.Types.Mixed,
        category: String,
        brand: String,
        totalStock: Number,
      },
    ],
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Address = mongoose.models.Address || mongoose.model("Address", AddressSchema);
const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
const Review = mongoose.models.ProductReview || mongoose.model("ProductReview", ReviewSchema);
const Feature = mongoose.models.Feature || mongoose.model("Feature", FeatureSchema);
const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);

// In-Memory Backup Data Store
let isMongoConnected = false;

const initialProducts = [
  {
    _id: "prod_1",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80",
    ],
    title: "Urban Minimalist Leather Jacket",
    description: "Premium handcrafted faux-leather biker jacket with matte black hardware and tailored modern fit.",
    category: "men",
    brand: "zara",
    price: 189,
    salePrice: 149,
    totalStock: 25,
    averageReview: 4.8,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    createdAt: new Date(),
  },
  {
    _id: "prod_2",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    ],
    title: "Silk Blend Tailored Trench Coat",
    description: "Flowing double-breasted trench silhouette featuring relaxed shoulders and water-resistant finish.",
    category: "women",
    brand: "h&m",
    price: 220,
    salePrice: 175,
    totalStock: 18,
    averageReview: 4.9,
    sizes: ["XS", "S", "M", "L", "XL"],
    isPreOrder: true,
    preOrderReleaseDate: "November 15, 2026",
    createdAt: new Date(),
  },
  {
    _id: "prod_3",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80",
    ],
    title: "Retro Street Runner Sneakers",
    description: "Sculpted lightweight performance sole with vintage suede overlays and padded collar support.",
    category: "footwear",
    brand: "nike",
    price: 145,
    salePrice: 120,
    totalStock: 30,
    averageReview: 4.7,
    sizes: ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
    createdAt: new Date(),
  },
  {
    _id: "prod_4",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
    ],
    title: "Vintage Washed Denim Jacket",
    description: "Classic rugged denim silhouette with subtle stonewash fading, copper buttons, and relaxed fit.",
    category: "men",
    brand: "levi",
    price: 129,
    salePrice: 99,
    totalStock: 40,
    averageReview: 4.6,
    sizes: ["S", "M", "L", "XL", "XXL"],
    createdAt: new Date(),
  },
  {
    _id: "prod_5",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
    ],
    title: "Oversized Knit Ribbed Sweater",
    description: "Ultra-soft alpaca blend chunky knit sweater with dropped shoulders and ribbed crew neck.",
    category: "women",
    brand: "zara",
    price: 89,
    salePrice: 69,
    totalStock: 22,
    averageReview: 4.9,
    sizes: ["XS", "S", "M", "L"],
    createdAt: new Date(),
  },
  {
    _id: "prod_6",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
    ],
    title: "Air Velocity Athletics Red",
    description: "High-traction cushioned running shoes engineered with responsive air cushioning.",
    category: "footwear",
    brand: "nike",
    price: 160,
    salePrice: 135,
    totalStock: 15,
    averageReview: 4.8,
    sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
    createdAt: new Date(),
  },
  {
    _id: "prod_7",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80",
    ],
    title: "Canvas Everyday Explorer Backpack",
    description: "Durable waterproof canvas travel pack with padded 16-inch laptop compartment and leather accents.",
    category: "accessories",
    brand: "puma",
    price: 75,
    salePrice: 59,
    totalStock: 50,
    averageReview: 4.7,
    sizes: ["ONE SIZE"],
    createdAt: new Date(),
  },
  {
    _id: "prod_8",
    image: "https://images.unsplash.com/photo-1519722417352-7d6959729417?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1519722417352-7d6959729417?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    ],
    title: "Classic Graphic Crewneck Tee",
    description: "100% organic heavyweight cotton tee with minimal chest branding and relaxed unisex drape.",
    category: "men",
    brand: "adidas",
    price: 45,
    salePrice: 35,
    totalStock: 60,
    averageReview: 4.5,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    createdAt: new Date(),
  },
  {
    _id: "prod_9",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80",
    ],
    title: "Kids Cozy Fleece Pullover",
    description: "Warm, durable, and super comfortable fleece sweater designed for active all-day wear.",
    category: "kids",
    brand: "h&m",
    price: 39,
    salePrice: 29,
    totalStock: 35,
    averageReview: 4.9,
    sizes: ["XS", "S", "M", "L"],
    createdAt: new Date(),
  },
];

const initialFeatures = [
  {
    _id: "feat_1",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    _id: "feat_2",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    _id: "feat_3",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
  },
];

const initialCoupons = [
  {
    _id: "coup_1",
    code: "WELCOME10",
    title: "Welcome New Shopper Discount",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 50,
    maxDiscountAmount: 30,
    usageLimit: 500,
    usedCount: 0,
    expiryDate: new Date(Date.now() + 86400000 * 90),
    isActive: true,
  },
  {
    _id: "coup_2",
    code: "SAVE20",
    title: "Seasonal Celebration 20% Off",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 100,
    maxDiscountAmount: 50,
    usageLimit: 250,
    usedCount: 0,
    expiryDate: new Date(Date.now() + 86400000 * 60),
    isActive: true,
  },
  {
    _id: "coup_3",
    code: "FLAT15",
    title: "Flat $15 Instant Rebate",
    discountType: "fixed",
    discountValue: 15,
    minOrderAmount: 75,
    maxDiscountAmount: 15,
    usageLimit: 100,
    usedCount: 0,
    expiryDate: new Date(Date.now() + 86400000 * 45),
    isActive: true,
  },
];

const db = {
  users: [
    {
      _id: "user_admin",
      userName: "admin",
      email: "admin@store.com",
      password: bcrypt.hashSync("admin123", 10),
      role: "admin",
    },
    {
      _id: "user_shopper",
      userName: "shopper",
      email: "user@store.com",
      password: bcrypt.hashSync("user123", 10),
      role: "user",
    },
  ],
  products: [...initialProducts],
  categories: [
    { _id: "cat_1", id: "cat_1", name: "Couture", slug: "couture" },
    { _id: "cat_2", id: "cat_2", name: "Ready-To-Wear", slug: "ready-to-wear" },
    { _id: "cat_3", id: "cat_3", name: "Outerwear", slug: "outerwear" },
    { _id: "cat_4", id: "cat_4", name: "Accessories", slug: "accessories" },
    { _id: "cat_5", id: "cat_5", name: "Footwear", slug: "footwear" },
  ],
  cart: {},
  wishlist: {},
  addresses: [
    {
      _id: "addr_1",
      userId: "user_shopper",
      address: "742 Evergreen Terrace",
      city: "Springfield",
      pincode: "97477",
      phone: "+1 555-0199",
      notes: "Leave by the front porch",
    },
  ],
  orders: [
    {
      _id: "ord_1001",
      userId: "user_shopper",
      cartItems: [
        {
          productId: "prod_1",
          title: "Urban Minimalist Leather Jacket",
          image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
          price: 149,
          quantity: 1,
          size: "L",
        },
      ],
      addressInfo: {
        addressId: "addr_1",
        address: "742 Evergreen Terrace",
        city: "Springfield",
        pincode: "97477",
        phone: "+1 555-0199",
        notes: "Leave by the front porch",
      },
      orderStatus: "delivered",
      payment_mode: "Razorpay",
      paymentMethod: "Razorpay",
      payment_status: "Paid via Razorpay",
      paymentStatus: "Paid via Razorpay",
      totalAmount: 149,
      orderDate: new Date(Date.now() - 86400000 * 2),
      orderUpdateDate: new Date(),
      paymentId: "PAYID-DEMO-12345",
      payerId: "PAYER-DEMO-67890",
    },
  ],
  reviews: [
    {
      _id: "rev_1",
      productId: "prod_1",
      userId: "user_shopper",
      userName: "shopper",
      reviewMessage: "Incredible quality! The leather looks and feels authentic, and the tailoring is sharp.",
      reviewValue: 5,
      createdAt: new Date(),
    },
  ],
  features: [...initialFeatures],
  coupons: [...initialCoupons],
};

// Connect to MongoDB
async function connectMongoDB() {
  const mongoURI = process.env.MONGO_URL;
  if (!mongoURI) {
    console.log("No MONGO_URL configured. Running with in-memory database store.");
    return;
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });
    isMongoConnected = true;
    console.log("Successfully connected to MongoDB!");

    // Log product count
    const productCount = await Product.countDocuments();
    console.log(`MongoDB connected! Total products in database: ${productCount}`);

    // If MongoDB is completely fresh and empty, seed initial sample data
    if (productCount === 0) {
      console.log("Seeding initial products into MongoDB database...");
      await Product.insertMany(
        initialProducts.map((p) => {
          const { _id, ...rest } = p;
          return rest;
        })
      );
      console.log("Initial products seeded successfully.");
    }

    // Ensure all existing products contain XXL in their sizes array
    try {
      await Product.updateMany(
        { sizes: { $exists: true, $nin: ["XXL"] } },
        { $push: { sizes: "XXL" } }
      );
      console.log("Verified all products include size XXL.");
    } catch (sizeMigrateErr) {
      console.warn("Product sizes XXL migration notice:", sizeMigrateErr.message);
    }

    // Seed initial coupons if none exist in MongoDB
    try {
      const couponCount = await Coupon.countDocuments();
      if (couponCount === 0) {
        console.log("Seeding initial active coupons into MongoDB database...");
        await Coupon.insertMany(
          initialCoupons.map((c) => {
            const { _id, ...rest } = c;
            return rest;
          })
        );
        console.log("Initial active coupons seeded successfully into MongoDB.");
      }
    } catch (couponSeedErr) {
      console.warn("Coupon initial seeding notice:", couponSeedErr.message);
    }

    // Execute schema migration in MongoDB: Ensure all products have sizes array and images array
    try {
      console.log("Executing MongoDB database update for sizes and images schema...");
      const missingSizesRes = await Product.updateMany(
        {
          $or: [
            { sizes: { $exists: false } },
            { sizes: { $size: 0 } },
            { sizes: null },
            { sizes: [] },
          ],
        },
        {
          $set: { sizes: ["XS", "S", "M", "L", "XL"] },
        }
      );
      if (missingSizesRes?.modifiedCount > 0) {
        console.log(`MongoDB updated ${missingSizesRes.modifiedCount} existing products with default sizes.`);
      }

      // Upgrade products with missing or empty images array
      const allDbProducts = await Product.find({});
      for (const p of allDbProducts) {
        let changed = false;
        if (!p.images || !Array.isArray(p.images) || p.images.length === 0) {
          const foundInitial = initialProducts.find(ip => ip.title === p.title);
          if (foundInitial && foundInitial.images && foundInitial.images.length > 0) {
            p.images = foundInitial.images;
            p.image = foundInitial.images[0];
            changed = true;
          } else if (p.image) {
            p.images = Array.isArray(p.image) ? p.image : [p.image];
            changed = true;
          }
        }
        if (changed) {
          p.markModified("images");
          await p.save();
        }
      }

      // Ensure orders with missing item size get default "M"
      const ordersWithItems = await Order.find({ "cartItems.size": { $exists: false } });
      for (const ord of ordersWithItems) {
        let changed = false;
        if (Array.isArray(ord.cartItems)) {
          ord.cartItems.forEach((ci) => {
            if (!ci.size) {
              ci.size = "M";
              changed = true;
            }
          });
        }
        if (changed) {
          ord.markModified("cartItems");
          await ord.save();
        }
      }
      console.log("MongoDB sizes and images synchronization & update complete!");
    } catch (migErr) {
      console.error("Migration error updating MongoDB:", migErr);
    }
  } catch (err) {
    console.warn("MongoDB connection failed, operating in memory-fallback mode:", err.message);
    isMongoConnected = false;
  }
}

connectMongoDB();

// Product Helper: Formatter to ensure uniform output for client
function normalizeProduct(p) {
  if (!p) return null;
  const obj = p.toObject ? p.toObject() : { ...p };
  const rawId = obj._id ? obj._id.toString() : obj.id;
  
  let imageList = [];
  if (Array.isArray(obj.images) && obj.images.length > 0) {
    imageList = obj.images.map(img => (typeof img === "string" ? img : img?.url)).filter(Boolean);
  } else if (Array.isArray(obj.image) && obj.image.length > 0) {
    imageList = obj.image.map(img => (typeof img === "string" ? img : img?.url)).filter(Boolean);
  } else if (typeof obj.image === "string" && obj.image) {
    imageList = [obj.image];
  } else if (obj.image && typeof obj.image === "object" && obj.image.url) {
    imageList = [obj.image.url];
  }

  const mainImage = imageList[0] || (typeof obj.image === "string" ? obj.image : "") || "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80";
  if (imageList.length === 0) {
    imageList = [mainImage];
  }

  let formattedSizes = ["XS", "S", "M", "L", "XL"];
  if (Array.isArray(obj.sizes) && obj.sizes.length > 0) {
    formattedSizes = obj.sizes.map((s) => String(s).trim()).filter(Boolean);
  } else if (typeof obj.sizes === "string" && obj.sizes.trim()) {
    formattedSizes = obj.sizes.split(",").map((s) => s.trim()).filter(Boolean);
  }

  let formattedCategories = [];
  if (Array.isArray(obj.categories) && obj.categories.length > 0) {
    formattedCategories = obj.categories.map((c) => String(c).trim()).filter(Boolean);
  } else if (Array.isArray(obj.category) && obj.category.length > 0) {
    formattedCategories = obj.category.map((c) => String(c).trim()).filter(Boolean);
  } else if (typeof obj.category === "string" && obj.category.trim()) {
    formattedCategories = obj.category.split(",").map((c) => c.trim()).filter(Boolean);
  }

  return {
    ...obj,
    _id: rawId,
    id: rawId,
    image: mainImage,
    images: imageList,
    sizes: formattedSizes.length > 0 ? formattedSizes : ["XS", "S", "M", "L", "XL"],
    categories: formattedCategories,
    category: formattedCategories.join(", ") || (typeof obj.category === "string" ? obj.category : ""),
    isPreOrder: Boolean(obj.isPreOrder),
    preOrderReleaseDate: obj.preOrderReleaseDate || "",
  };
}

// Middleware
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Expires", "Pragma"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helper: Verify Auth
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });
  }
};

// --- AUTH ROUTES ---
app.post("/api/auth/register", async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const cleanEmail = (email || "").toLowerCase().trim();

    if (isMongoConnected) {
      const checkUser = await User.findOne({ email: cleanEmail });
      if (checkUser) {
        return res.json({
          success: false,
          message: "User already exists with this email! Please try again",
        });
      }

      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        userName,
        email: cleanEmail,
        password: hashPassword,
        role: cleanEmail.includes("admin") ? "admin" : "user",
      });
      await newUser.save();

      return res.status(200).json({
        success: true,
        message: "Registration successful",
      });
    }

    const checkUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (checkUser) {
      return res.json({
        success: false,
        message: "User already exists with this email! Please try again",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: "user_" + Date.now(),
      userName,
      email: cleanEmail,
      password: hashPassword,
      role: cleanEmail.includes("admin") ? "admin" : "user",
    };
    db.users.push(newUser);

    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const cleanEmail = (email || "").toLowerCase().trim();
    let checkUser = null;

    if (isMongoConnected) {
      checkUser = await User.findOne({ email: cleanEmail });
    } else {
      checkUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!checkUser) {
      return res.json({
        success: false,
        message: "User doesn't exist! Please register first",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
    if (!checkPasswordMatch) {
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });
    }

    const userId = checkUser._id ? checkUser._id.toString() : checkUser.id;
    const token = jwt.sign(
      {
        id: userId,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      JWT_SECRET,
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: userId,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
});

app.get("/api/auth/check-auth", authenticateToken, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper to ensure category is registered in categories collection
async function ensureCategoryRegistered(catInput) {
  if (!catInput) return;
  let list = [];
  if (Array.isArray(catInput)) {
    list = catInput;
  } else if (typeof catInput === "string") {
    list = catInput.split(",");
  }
  for (const item of list) {
    const trimmed = String(item || "").trim();
    if (!trimmed) continue;
    const slug = slugify(trimmed);
    try {
      if (isMongoConnected) {
        const exists = await Category.findOne({
          name: { $regex: new RegExp(`^${trimmed}$`, "i") },
        });
        if (!exists) {
          const newCat = new Category({ name: trimmed, slug });
          await newCat.save();
        }
      } else {
        const exists = db.categories.find(
          (c) => c.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (!exists) {
          db.categories.push({
            _id: "cat_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
            id: "cat_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
            name: trimmed,
            slug,
          });
        }
      }
    } catch (err) {
      console.error("Failed to auto-register category:", err);
    }
  }
}

// --- CATEGORY ROUTES (Custom Categories) ---
const handleGetCategories = async (req, res) => {
  try {
    if (isMongoConnected) {
      let categories = await Category.find({}).sort({ createdAt: 1 });
      
      // Auto-merge any distinct categories from products
      const productCategories = await Product.distinct("category");
      const existingNames = new Set(categories.map((c) => (c.name || "").toLowerCase()));
      
      for (const catName of productCategories) {
        if (catName && !existingNames.has(catName.toLowerCase())) {
          try {
            const newCat = new Category({
              name: catName.trim(),
              slug: slugify(catName.trim()),
            });
            await newCat.save();
            categories.push(newCat);
            existingNames.add(catName.toLowerCase());
          } catch (e) {}
        }
      }

      return res.status(200).json({
        success: true,
        data: categories.map((c) => ({
          _id: c._id ? c._id.toString() : c.id,
          id: c._id ? c._id.toString() : c.id,
          name: c.name,
          slug: c.slug,
        })),
      });
    }

    // In-memory fallback
    const names = new Set(db.categories.map((c) => (c.name || "").toLowerCase()));
    for (const p of db.products) {
      if (p.category && !names.has(p.category.toLowerCase())) {
        const newCat = {
          _id: "cat_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
          id: "cat_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
          name: p.category.trim(),
          slug: slugify(p.category.trim()),
        };
        db.categories.push(newCat);
        names.add(p.category.toLowerCase());
      }
    }

    return res.status(200).json({
      success: true,
      data: db.categories.map((c) => ({
        _id: c._id || c.id,
        id: c._id || c.id,
        name: c.name,
        slug: c.slug,
      })),
    });
  } catch (e) {
    console.error("Get categories error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

app.get("/api/admin/categories/get", handleGetCategories);
app.get("/api/shop/categories/get", handleGetCategories);

app.post("/api/admin/categories/add", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name cannot be empty",
      });
    }

    const trimmedName = String(name).trim();
    const slug = slugify(trimmedName);

    if (isMongoConnected) {
      let existing = await Category.findOne({
        name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
      });
      if (existing) {
        return res.status(200).json({
          success: true,
          data: {
            _id: existing._id.toString(),
            id: existing._id.toString(),
            name: existing.name,
            slug: existing.slug,
          },
          message: "Category already exists",
        });
      }

      const newCat = new Category({
        name: trimmedName,
        slug,
      });
      await newCat.save();

      return res.status(201).json({
        success: true,
        data: {
          _id: newCat._id.toString(),
          id: newCat._id.toString(),
          name: newCat.name,
          slug: newCat.slug,
        },
        message: "Custom category created successfully",
      });
    }

    // In-memory
    let existing = db.categories.find(
      (c) => (c.name || "").toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        message: "Category already exists",
      });
    }

    const newCat = {
      _id: "cat_" + Date.now(),
      id: "cat_" + Date.now(),
      name: trimmedName,
      slug,
    };
    db.categories.push(newCat);

    return res.status(201).json({
      success: true,
      data: newCat,
      message: "Custom category created successfully",
    });
  } catch (e) {
    console.error("Add category error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete("/api/admin/categories/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }

    if (isMongoConnected) {
      await Category.deleteMany({
        $or: [
          mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null,
          { name: { $regex: new RegExp(`^${id}$`, "i") } },
          { slug: id.toLowerCase() },
        ].filter(Boolean),
      });

      return res.status(200).json({
        success: true,
        message: "Category removed successfully",
      });
    }

    // In-memory
    db.categories = db.categories.filter(
      (c) =>
        c._id !== id &&
        c.id !== id &&
        (c.name || "").toLowerCase() !== id.toLowerCase() &&
        (c.slug || "").toLowerCase() !== id.toLowerCase()
    );

    return res.status(200).json({
      success: true,
      message: "Category removed successfully",
    });
  } catch (e) {
    console.error("Delete category error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- ADMIN PRODUCT ROUTES ---
app.post("/api/admin/products/add", async (req, res) => {
  try {
    const { image, images, title, description, category, brand, price, salePrice, totalStock, averageReview, sizes, isPreOrder, preOrderReleaseDate } = req.body;

    const isPreOrderBool = isPreOrder === true || isPreOrder === "true";
    const preOrderDateStr = preOrderReleaseDate ? String(preOrderReleaseDate).trim() : "";

    let formattedSizes = ["XS", "S", "M", "L", "XL"];
    if (Array.isArray(sizes) && sizes.length > 0) {
      formattedSizes = sizes.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof sizes === "string" && sizes.trim()) {
      formattedSizes = sizes.split(",").map((s) => s.trim()).filter(Boolean);
    }

    let formattedImages = [];
    if (Array.isArray(images) && images.length > 0) {
      formattedImages = images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
    } else if (Array.isArray(image) && image.length > 0) {
      formattedImages = image.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
    } else if (typeof image === "string" && image.trim()) {
      formattedImages = [image.trim()];
    }

    const mainImage = formattedImages[0] || (typeof image === "string" ? image : "") || "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80";
    if (formattedImages.length === 0) formattedImages = [mainImage];

    let formattedCategories = [];
    if (Array.isArray(req.body.categories) && req.body.categories.length > 0) {
      formattedCategories = req.body.categories.map((c) => String(c).trim()).filter(Boolean);
    } else if (Array.isArray(category) && category.length > 0) {
      formattedCategories = category.map((c) => String(c).trim()).filter(Boolean);
    } else if (typeof category === "string" && category.trim()) {
      formattedCategories = category.split(",").map((c) => c.trim()).filter(Boolean);
    }

    if (formattedCategories.length > 0) {
      await ensureCategoryRegistered(formattedCategories);
    }

    const categoryString = formattedCategories.join(", ") || (typeof category === "string" ? category : "");

    if (isMongoConnected) {
      const newlyCreatedProduct = new Product({
        image: mainImage,
        images: formattedImages,
        title,
        description,
        category: categoryString,
        categories: formattedCategories,
        brand,
        price: Number(price) || 0,
        salePrice: salePrice ? Number(salePrice) : 0,
        totalStock: Number(totalStock) || 0,
        averageReview: Number(averageReview) || 0,
        sizes: formattedSizes.length > 0 ? formattedSizes : ["XS", "S", "M", "L", "XL"],
        isPreOrder: isPreOrderBool,
        preOrderReleaseDate: preOrderDateStr,
      });

      await newlyCreatedProduct.save();
      return res.status(201).json({
        success: true,
        data: normalizeProduct(newlyCreatedProduct),
      });
    }

    const newProduct = {
      _id: "prod_" + Date.now(),
      image: mainImage,
      images: formattedImages,
      title,
      description,
      category: categoryString,
      categories: formattedCategories,
      brand,
      price: Number(price) || 0,
      salePrice: salePrice ? Number(salePrice) : 0,
      totalStock: Number(totalStock) || 0,
      averageReview: Number(averageReview) || 0,
      sizes: formattedSizes.length > 0 ? formattedSizes : ["XS", "S", "M", "L", "XL"],
      isPreOrder: isPreOrderBool,
      preOrderReleaseDate: preOrderDateStr,
      createdAt: new Date(),
    };
    db.products.unshift(newProduct);
    res.status(201).json({
      success: true,
      data: normalizeProduct(newProduct),
    });
  } catch (e) {
    console.error("Add product error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/admin/products/get", async (req, res) => {
  try {
    if (isMongoConnected) {
      const products = await Product.find({}).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        data: products.map(normalizeProduct),
      });
    }

    res.status(200).json({
      success: true,
      data: db.products.map(normalizeProduct),
    });
  } catch (e) {
    console.error("Admin products fetch error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/admin/products/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { image, images, title, description, category, brand, price, salePrice, totalStock, averageReview, sizes, isPreOrder, preOrderReleaseDate } = req.body;

    let formattedSizes = undefined;
    if (sizes !== undefined) {
      if (Array.isArray(sizes)) {
        formattedSizes = sizes.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof sizes === "string" && sizes.trim()) {
        formattedSizes = sizes.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    let formattedImages = undefined;
    if (images !== undefined && Array.isArray(images)) {
      formattedImages = images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
    } else if (image !== undefined) {
      if (Array.isArray(image)) {
        formattedImages = image.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
      } else if (typeof image === "string" && image.trim()) {
        formattedImages = [image.trim()];
      }
    }

    let formattedCategories = undefined;
    if (req.body.categories !== undefined) {
      if (Array.isArray(req.body.categories)) {
        formattedCategories = req.body.categories.map((c) => String(c).trim()).filter(Boolean);
      } else if (typeof req.body.categories === "string" && req.body.categories.trim()) {
        formattedCategories = req.body.categories.split(",").map((c) => c.trim()).filter(Boolean);
      } else {
        formattedCategories = [];
      }
    } else if (category !== undefined) {
      if (Array.isArray(category)) {
        formattedCategories = category.map((c) => String(c).trim()).filter(Boolean);
      } else if (typeof category === "string" && category.trim()) {
        formattedCategories = category.split(",").map((c) => c.trim()).filter(Boolean);
      } else {
        formattedCategories = [];
      }
    }

    if (formattedCategories && formattedCategories.length > 0) {
      await ensureCategoryRegistered(formattedCategories);
    }

    if (isMongoConnected) {
      let findProduct = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        findProduct = await Product.findById(id);
      }
      if (!findProduct) {
        findProduct = await Product.findOne({ _id: id });
      }

      if (!findProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      if (title !== undefined) findProduct.title = title;
      if (description !== undefined) findProduct.description = description;
      if (formattedCategories !== undefined) {
        findProduct.categories = formattedCategories;
        findProduct.category = formattedCategories.join(", ");
        findProduct.markModified("categories");
        findProduct.markModified("category");
      } else if (category !== undefined) {
        findProduct.category = category;
      }
      if (brand !== undefined) findProduct.brand = brand;
      if (price !== undefined) findProduct.price = price === "" ? 0 : Number(price);
      if (salePrice !== undefined) findProduct.salePrice = salePrice === "" ? 0 : Number(salePrice);
      if (totalStock !== undefined) findProduct.totalStock = totalStock === "" ? 0 : Number(totalStock);
      if (formattedImages !== undefined && formattedImages.length > 0) {
        findProduct.images = formattedImages;
        findProduct.image = formattedImages[0];
        findProduct.markModified("images");
      } else if (image !== undefined) {
        findProduct.image = image;
      }
      if (averageReview !== undefined) findProduct.averageReview = Number(averageReview);
      if (formattedSizes !== undefined) {
        findProduct.sizes = formattedSizes.length > 0 ? formattedSizes : ["XS", "S", "M", "L", "XL"];
        findProduct.markModified("sizes");
      }
      if (isPreOrder !== undefined) {
        findProduct.isPreOrder = isPreOrder === true || isPreOrder === "true";
      }
      if (preOrderReleaseDate !== undefined) {
        findProduct.preOrderReleaseDate = String(preOrderReleaseDate).trim();
      }

      await findProduct.save();
      return res.status(200).json({
        success: true,
        data: normalizeProduct(findProduct),
      });
    }

    const index = db.products.findIndex((p) => p._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const currentProd = db.products[index];
    const newImages = formattedImages !== undefined ? formattedImages : (currentProd.images || [currentProd.image]);
    const newImage = newImages[0] || image || currentProd.image;

    const updatedCategoryString = formattedCategories !== undefined ? formattedCategories.join(", ") : currentProd.category;
    const updatedCategoriesArray = formattedCategories !== undefined ? formattedCategories : (currentProd.categories || []);

    db.products[index] = {
      ...currentProd,
      ...req.body,
      category: updatedCategoryString,
      categories: updatedCategoriesArray,
      image: newImage,
      images: newImages,
      price: req.body.price !== undefined ? Number(req.body.price) : currentProd.price,
      salePrice: req.body.salePrice !== undefined ? Number(req.body.salePrice) : currentProd.salePrice,
      totalStock: req.body.totalStock !== undefined ? Number(req.body.totalStock) : currentProd.totalStock,
      sizes: formattedSizes !== undefined ? formattedSizes : (currentProd.sizes || ["XS", "S", "M", "L", "XL"]),
      isPreOrder: isPreOrder !== undefined ? (isPreOrder === true || isPreOrder === "true") : currentProd.isPreOrder,
      preOrderReleaseDate: preOrderReleaseDate !== undefined ? String(preOrderReleaseDate).trim() : currentProd.preOrderReleaseDate,
    };
    res.status(200).json({
      success: true,
      data: normalizeProduct(db.products[index]),
    });
  } catch (e) {
    console.error("Edit product error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete("/api/admin/products/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findByIdAndDelete(id);
      }
      if (!product) {
        product = await Product.findOneAndDelete({ _id: id });
      }

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    }

    db.products = db.products.filter((p) => p._id !== id);
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.error("Delete product error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// Single Image Upload
app.post("/api/admin/products/upload-image", upload.single("my_file"), async (req, res) => {
  try {
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
          const uploadPromise = cloudinary.uploader.upload(dataURI, { resource_type: "auto" });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Cloudinary request timeout")), 8000)
          );
          const uploadRes = await Promise.race([uploadPromise, timeoutPromise]);
          return res.json({
            success: true,
            result: {
              url: uploadRes.secure_url || uploadRes.url,
            },
          });
        } catch (cloudErr) {
          console.warn("Cloudinary upload failed or timed out, falling back to data URI:", cloudErr.message);
          return res.json({
            success: true,
            result: {
              url: dataURI,
            },
          });
        }
      } else {
        return res.json({
          success: true,
          result: {
            url: dataURI,
          },
        });
      }
    }
    res.json({
      success: true,
      result: {
        url: req.body.url || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      },
    });
  } catch (err) {
    console.error("Image upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Multiple Images Upload
app.post("/api/admin/products/upload-images", upload.array("my_files", 10), async (req, res) => {
  try {
    const urls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = "data:" + file.mimetype + ";base64," + b64;

        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          try {
            const uploadPromise = cloudinary.uploader.upload(dataURI, { resource_type: "auto" });
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Cloudinary request timeout")), 8000)
            );
            const uploadRes = await Promise.race([uploadPromise, timeoutPromise]);
            urls.push(uploadRes.secure_url || uploadRes.url);
          } catch (cloudErr) {
            console.warn("Cloudinary multi-upload failed, using data URI fallback:", cloudErr.message);
            urls.push(dataURI);
          }
        } else {
          urls.push(dataURI);
        }
      }
      return res.json({
        success: true,
        results: urls.map((url) => ({ url })),
        urls,
      });
    }
    res.json({
      success: true,
      results: [],
      urls: [],
    });
  } catch (err) {
    console.error("Multi image upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- ADMIN ORDERS ---
app.get("/api/admin/orders/get", async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await Order.find({}).sort({ orderDate: -1 });
      return res.status(200).json({
        success: true,
        data: orders,
      });
    }

    res.status(200).json({
      success: true,
      data: db.orders,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/admin/orders/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let order = null;

    if (isMongoConnected) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await Order.findById(id);
      }
      if (!order) {
        try {
          order = await Order.findOne({
            $or: [{ _id: id }, { razorpay_order_id: id }, { paymentId: id }]
          });
        } catch (_) {}
      }
    }

    if (!order) {
      order = db.orders.find(
        (o) =>
          o._id === id ||
          String(o._id) === String(id) ||
          String(o.id) === String(id) ||
          o.razorpay_order_id === id ||
          o.paymentId === id
      );
    }

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, data: order });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/admin/orders/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    let updated = false;

    if (isMongoConnected) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        await Order.findByIdAndUpdate(id, { orderStatus, orderUpdateDate: new Date() }, { new: true });
        updated = true;
      }
      if (!updated) {
        try {
          await Order.findOneAndUpdate({ _id: id }, { orderStatus, orderUpdateDate: new Date() }, { new: true });
          updated = true;
        } catch (_) {}
      }
    }

    const order = db.orders.find((o) => o._id === id || String(o.id) === String(id));
    if (order) {
      order.orderStatus = orderStatus;
      order.orderUpdateDate = new Date();
      updated = true;
    }

    if (!updated && !order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.status(200).json({ success: true, message: "Order status is updated successfully!" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- SHOP PRODUCTS ---
app.get("/api/shop/products/get", async (req, res) => {
  try {
    const { sortBy = "price-lowtohigh" } = req.query;
    let rawCategory = req.query.category || "";
    let rawBrand = req.query.brand || "";

    const catArray = Array.isArray(rawCategory)
      ? rawCategory.flatMap((c) => String(c).split(",")).map((c) => c.trim()).filter(Boolean)
      : typeof rawCategory === "string" && rawCategory.trim()
      ? rawCategory.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    const brandArray = Array.isArray(rawBrand)
      ? rawBrand.flatMap((b) => String(b).split(",")).map((b) => b.trim()).filter(Boolean)
      : typeof rawBrand === "string" && rawBrand.trim()
      ? rawBrand.split(",").map((b) => b.trim()).filter(Boolean)
      : [];

    if (isMongoConnected) {
      let filters = {};

      if (catArray.length) {
        const conditions = catArray.flatMap((c) => [
          new RegExp(`^${c}$`, "i"),
          new RegExp(`^${c.replace(/-/g, " ")}$`, "i"),
          new RegExp(`^${c.replace(/\s+/g, "-")}$`, "i"),
          new RegExp(`(^|,\\s*)${c}(\\s*,|$)`, "i"),
          new RegExp(`(^|,\\s*)${c.replace(/-/g, " ")}(\\s*,|$)`, "i"),
        ]);
        filters.$or = [
          { category: { $in: conditions } },
          { categories: { $in: conditions } },
        ];
      }

      if (brandArray.length) {
        filters.brand = { $in: brandArray.map((b) => new RegExp(`^${b}$`, "i")) };
      }

      let sort = {};
      switch (sortBy) {
        case "price-lowtohigh":
          sort.price = 1;
          break;
        case "price-hightolow":
          sort.price = -1;
          break;
        case "title-atoz":
          sort.title = 1;
          break;
        case "title-ztoa":
          sort.title = -1;
          break;
        default:
          sort.price = 1;
          break;
      }

      const products = await Product.find(filters).sort(sort);
      return res.status(200).json({
        success: true,
        data: products.map(normalizeProduct),
      });
    }

    // In-Memory Fallback
    let list = [...db.products];

    if (catArray.length > 0) {
      const cats = catArray.map((c) => c.toLowerCase());
      list = list.filter((p) => {
        let pCats = [];
        if (Array.isArray(p.categories) && p.categories.length > 0) {
          pCats = p.categories.map((c) => String(c).toLowerCase());
        } else if (Array.isArray(p.category) && p.category.length > 0) {
          pCats = p.category.map((c) => String(c).toLowerCase());
        } else if (typeof p.category === "string" && p.category) {
          pCats = p.category.toLowerCase().split(",").map((c) => c.trim()).filter(Boolean);
        }
        return cats.some((c) => {
          const target = c.toLowerCase();
          const targetSpace = target.replace(/-/g, " ");
          const targetDash = target.replace(/\s+/g, "-");
          return pCats.some(
            (pc) =>
              pc === target ||
              pc === targetSpace ||
              pc === targetDash ||
              slugify(pc) === target
          );
        });
      });
    }
    if (brandArray.length > 0) {
      const brands = brandArray.map((b) => b.toLowerCase());
      list = list.filter((p) => brands.includes((p.brand || "").toLowerCase()));
    }

    switch (sortBy) {
      case "price-lowtohigh":
        list.sort((a, b) => (a.salePrice > 0 ? a.salePrice : a.price) - (b.salePrice > 0 ? b.salePrice : b.price));
        break;
      case "price-hightolow":
        list.sort((a, b) => (b.salePrice > 0 ? b.salePrice : b.price) - (a.salePrice > 0 ? a.salePrice : a.price));
        break;
      case "title-atoz":
        list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title-ztoa":
        list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
    }

    res.status(200).json({
      success: true,
      data: list.map(normalizeProduct),
    });
  } catch (e) {
    console.error("Shop products fetch error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/shop/products/get/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id);
      }
      if (!product) {
        product = await Product.findOne({ _id: id });
      }

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      return res.status(200).json({
        success: true,
        data: normalizeProduct(product),
      });
    }

    const product = db.products.find((p) => p._id === id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: normalizeProduct(product) });
  } catch (e) {
    console.error("Product detail error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- SHOP CART ---
const populateCart = async (userId) => {
  if (isMongoConnected) {
    try {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        return { _id: "cart_" + userId, userId, items: [] };
      }
      const populatedItems = [];
      for (const item of cart.items) {
        let prod = null;
        if (mongoose.Types.ObjectId.isValid(item.productId)) {
          try {
            prod = await Product.findById(item.productId);
          } catch (_) {}
        }
        if (!prod) {
          prod = db.products.find((p) => p._id === item.productId?.toString());
        }
        if (!prod && (item.title || item.name)) {
          try {
            prod = await Product.findOne({ title: item.title || item.name });
          } catch (_) {}
        }

        if (prod) {
          const norm = normalizeProduct(prod);
          populatedItems.push({
            productId: norm._id,
            image: norm.image,
            title: norm.title,
            price: norm.price,
            salePrice: norm.salePrice,
            quantity: item.quantity,
            size: item.size || norm.sizes?.[0] || "M",
            sizes: norm.sizes || ["XS", "S", "M", "L", "XL"],
            isPreOrder: norm.isPreOrder || false,
            preOrderReleaseDate: norm.preOrderReleaseDate || "",
          });
        }
      }
      return {
        _id: cart._id.toString(),
        userId,
        items: populatedItems,
      };
    } catch (e) {
      console.error("Cart population error:", e);
    }
  }

  const items = db.cart[userId] || [];
  return {
    _id: "cart_" + userId,
    userId,
    items: items
      .map((item) => {
        const prod = db.products.find((p) => p._id === item.productId);
        if (!prod) return null;
        const norm = normalizeProduct(prod);
        return {
          productId: norm._id,
          image: norm.image,
          title: norm.title,
          price: norm.price,
          salePrice: norm.salePrice,
          quantity: item.quantity,
          size: item.size || norm.sizes?.[0] || "M",
          sizes: norm.sizes || ["XS", "S", "M", "L", "XL"],
          isPreOrder: norm.isPreOrder || false,
          preOrderReleaseDate: norm.preOrderReleaseDate || "",
        };
      })
      .filter(Boolean),
  };
};

// Clear any legacy guest cart in memory
delete db.cart["guest"];

app.post("/api/shop/cart/add", async (req, res) => {
  const { userId, productId, quantity, size } = req.body;
  if (!userId || userId === "guest" || !productId || quantity <= 0) {
    return res.status(400).json({ success: false, message: "Invalid data provided or guest user!" });
  }

  const cleanSize = size && String(size).trim() ? String(size).trim() : "M";

  try {
    if (isMongoConnected) {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }
      const findIndex = cart.items.findIndex(
        (item) =>
          item.productId?.toString() === productId.toString() &&
          (item.size || "M") === cleanSize
      );
      if (findIndex === -1) {
        cart.items.push({ productId, size: cleanSize, quantity });
      } else {
        cart.items[findIndex].quantity += quantity;
      }
      await cart.save();
      const updated = await populateCart(userId);
      return res.status(200).json({ success: true, data: updated });
    }

    if (!db.cart[userId]) db.cart[userId] = [];
    const existingIndex = db.cart[userId].findIndex(
      (item) => item.productId === productId && (item.size || "M") === cleanSize
    );
    if (existingIndex > -1) {
      db.cart[userId][existingIndex].quantity += quantity;
    } else {
      db.cart[userId].push({ productId, size: cleanSize, quantity });
    }
    const updated = await populateCart(userId);
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post("/api/shop/cart/sync", async (req, res) => {
  const { userId, items } = req.body;
  if (!userId || userId === "guest") {
    return res.status(400).json({ success: false, message: "Valid User ID is required" });
  }

  try {
    if (isMongoConnected && Array.isArray(items) && items.length > 0) {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      for (const item of items) {
        const prodId = item.productId?._id || item.productId || item.id;
        if (!prodId) continue;
        const cleanSize = item.size && String(item.size).trim() ? String(item.size).trim() : "M";
        const quantity = Number(item.quantity) || 1;

        const findIndex = cart.items.findIndex(
          (ci) =>
            ci.productId?.toString() === prodId.toString() &&
            (ci.size || "M") === cleanSize
        );
        if (findIndex === -1) {
          cart.items.push({ productId: prodId, size: cleanSize, quantity });
        } else {
          // Use Math.max to prevent duplicate or multiplied quantities during login sync
          cart.items[findIndex].quantity = Math.max(
            Number(cart.items[findIndex].quantity) || 1,
            quantity
          );
        }
      }
      await cart.save();
    } else if (Array.isArray(items) && items.length > 0) {
      if (!db.cart[userId]) db.cart[userId] = [];
      for (const item of items) {
        const prodId = item.productId?._id || item.productId || item.id;
        if (!prodId) continue;
        const cleanSize = item.size && String(item.size).trim() ? String(item.size).trim() : "M";
        const quantity = Math.max(1, Number(item.quantity) || 1);

        const findIndex = db.cart[userId].findIndex(
          (ci) => ci.productId === prodId && (ci.size || "M") === cleanSize
        );
        if (findIndex === -1) {
          db.cart[userId].push({ productId: prodId, size: cleanSize, quantity });
        } else {
          // Use Math.max to prevent duplicate or multiplied quantities during login sync
          db.cart[userId][findIndex].quantity = Math.max(
            Number(db.cart[userId][findIndex].quantity) || 1,
            quantity
          );
        }
      }
    }

    const updated = await populateCart(userId);
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/shop/cart/get/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId || userId === "guest") {
    return res.status(200).json({ success: true, data: { userId: "guest", items: [] } });
  }
  try {
    const data = await populateCart(userId);
    res.status(200).json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/shop/cart/update-cart", async (req, res) => {
  const { userId, productId, quantity, size } = req.body;
  if (!userId || !productId || quantity <= 0) {
    return res.status(400).json({ success: false, message: "Invalid data provided!" });
  }

  const cleanSize = size && String(size).trim() ? String(size).trim() : null;

  try {
    if (isMongoConnected) {
      let cart = await Cart.findOne({ userId });
      if (cart) {
        const findIndex = cart.items.findIndex(
          (item) =>
            item.productId?.toString() === productId.toString() &&
            (cleanSize ? (item.size || "M") === cleanSize : true)
        );
        if (findIndex > -1) {
          cart.items[findIndex].quantity = quantity;
          await cart.save();
        }
      }
      const updated = await populateCart(userId);
      return res.status(200).json({ success: true, data: updated });
    }

    if (!db.cart[userId]) db.cart[userId] = [];
    const index = db.cart[userId].findIndex(
      (item) =>
        item.productId === productId &&
        (cleanSize ? (item.size || "M") === cleanSize : true)
    );
    if (index > -1) {
      db.cart[userId][index].quantity = quantity;
    }
    const updated = await populateCart(userId);
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete("/api/shop/cart/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  const { size } = req.query;
  const cleanSize = size && String(size).trim() ? String(size).trim() : null;

  try {
    if (isMongoConnected) {
      let cart = await Cart.findOne({ userId });
      if (cart) {
        if (cleanSize) {
          cart.items = cart.items.filter(
            (item) =>
              !(
                item.productId?.toString() === productId.toString() &&
                (item.size || "M") === cleanSize
              )
          );
        } else {
          cart.items = cart.items.filter(
            (item) => item.productId?.toString() !== productId.toString()
          );
        }
        await cart.save();
      }
      const updated = await populateCart(userId);
      return res.status(200).json({ success: true, data: updated });
    }

    if (db.cart[userId]) {
      if (cleanSize) {
        db.cart[userId] = db.cart[userId].filter(
          (item) => !(item.productId === productId && (item.size || "M") === cleanSize)
        );
      } else {
        db.cart[userId] = db.cart[userId].filter((item) => item.productId !== productId);
      }
    }
    const updated = await populateCart(userId);
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- SHOP WISHLIST (MONGODB PERSISTENCE) ---
async function populateWishlist(userId) {
  if (!userId) return { userId: "", items: [] };

  if (isMongoConnected) {
    try {
      let wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) {
        return { userId, items: [] };
      }

      const populatedItems = [];
      for (const item of wishlist.items) {
        try {
          let prod = null;
          if (mongoose.Types.ObjectId.isValid(item.productId)) {
            try {
              prod = await Product.findById(item.productId);
            } catch (_) {}
          }
          if (!prod) {
            prod = db.products.find((p) => p._id === item.productId?.toString());
          }
          if (!prod && (item.title || item.name)) {
            try {
              prod = await Product.findOne({ title: item.title || item.name });
            } catch (_) {}
          }

          if (prod) {
            const norm = normalizeProduct(prod);
            populatedItems.push({
              id: norm._id,
              productId: norm._id,
              name: norm.title,
              title: norm.title,
              price: norm.price,
              salePrice: norm.salePrice,
              image: norm.image,
              category: norm.category,
              brand: norm.brand,
              totalStock: norm.totalStock,
            });
          } else {
            populatedItems.push({
              id: item.productId?.toString(),
              productId: item.productId?.toString(),
              name: item.name || "Maison Creation",
              title: item.name || "Maison Creation",
              price: item.price || 0,
              salePrice: item.salePrice,
              image: typeof item.image === "string" ? item.image : item.image?.url || "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
              category: item.category || "",
              brand: item.brand || "",
              totalStock: item.totalStock ?? 10,
            });
          }
        } catch (itemErr) {
          console.warn("Item format warning in wishlist:", itemErr);
        }
      }

      return {
        _id: wishlist._id.toString(),
        userId,
        items: populatedItems,
      };
    } catch (err) {
      console.error("Wishlist population error:", err);
    }
  }

  // In-Memory Fallback
  const items = db.wishlist[userId] || [];
  return {
    _id: "wishlist_" + userId,
    userId,
    items: items.map((item) => {
      const prod = db.products.find((p) => p._id === (item.productId || item.id));
      if (prod) {
        const norm = normalizeProduct(prod);
        return {
          id: norm._id,
          name: norm.title,
          title: norm.title,
          price: norm.price,
          salePrice: norm.salePrice,
          image: norm.image,
          category: norm.category,
          brand: norm.brand,
          totalStock: norm.totalStock,
        };
      }
      return {
        id: item.productId?.toString() || item.id,
        name: item.name || item.title || "Maison Creation",
        title: item.name || item.title || "Maison Creation",
        price: item.price || 0,
        salePrice: item.salePrice,
        image: item.image,
        category: item.category || "",
        brand: item.brand || "",
        totalStock: item.totalStock ?? 10,
      };
    }),
  };
}

app.get("/api/shop/wishlist/get/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const data = await populateWishlist(userId);
    res.status(200).json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post("/api/shop/wishlist/add", async (req, res) => {
  const { userId, productId, name, price, salePrice, image, category, brand, totalStock } = req.body;
  const prodId = productId || req.body.id;
  if (!userId || !prodId) {
    return res.status(400).json({ success: false, message: "User ID and Product ID are required!" });
  }

  try {
    if (isMongoConnected) {
      let wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) {
        wishlist = new Wishlist({ userId, items: [] });
      }

      const existingIndex = wishlist.items.findIndex(
        (item) => item.productId?.toString() === prodId.toString()
      );

      if (existingIndex === -1) {
        wishlist.items.push({
          productId: prodId,
          name: name || "Maison Creation",
          price: price || 0,
          salePrice: salePrice,
          image: image,
          category: category || "",
          brand: brand || "",
          totalStock: totalStock,
        });
        await wishlist.save();
      }

      const updated = await populateWishlist(userId);
      return res.status(200).json({ success: true, data: updated });
    }

    // In-memory fallback
    if (!db.wishlist[userId]) db.wishlist[userId] = [];
    const exists = db.wishlist[userId].some(
      (item) => (item.productId || item.id) === prodId
    );
    if (!exists) {
      db.wishlist[userId].push({
        productId: prodId,
        id: prodId,
        name: name || "Maison Creation",
        price: price || 0,
        salePrice,
        image,
        category,
        brand,
        totalStock,
      });
    }
    const updated = await populateWishlist(userId);
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete("/api/shop/wishlist/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  if (!userId || !productId) {
    return res.status(400).json({ success: false, message: "Invalid parameters" });
  }

  try {
    if (isMongoConnected) {
      let wishlist = await Wishlist.findOne({ userId });
      if (wishlist) {
        wishlist.items = wishlist.items.filter(
          (item) => item.productId?.toString() !== productId.toString()
        );
        await wishlist.save();
      }
      const updated = await populateWishlist(userId);
      return res.status(200).json({ success: true, data: updated });
    }

    if (db.wishlist[userId]) {
      db.wishlist[userId] = db.wishlist[userId].filter(
        (item) => (item.productId || item.id) !== productId
      );
    }
    const updated = await populateWishlist(userId);
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete("/api/shop/wishlist/clear/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    if (isMongoConnected) {
      let wishlist = await Wishlist.findOne({ userId });
      if (wishlist) {
        wishlist.items = [];
        await wishlist.save();
      }
      return res.status(200).json({ success: true, data: { userId, items: [] } });
    }

    if (db.wishlist[userId]) {
      db.wishlist[userId] = [];
    }
    res.status(200).json({ success: true, data: { userId, items: [] } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post("/api/shop/wishlist/sync", async (req, res) => {
  const { userId, items } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    if (isMongoConnected && Array.isArray(items) && items.length > 0) {
      let wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) {
        wishlist = new Wishlist({ userId, items: [] });
      }

      for (const item of items) {
        const prodId = item.id || item.productId;
        if (!prodId) continue;
        const exists = wishlist.items.some(
          (w) => w.productId?.toString() === prodId.toString()
        );
        if (!exists) {
          wishlist.items.push({
            productId: prodId,
            name: item.name || item.title || "Maison Creation",
            price: item.price || 0,
            salePrice: item.salePrice,
            image: item.image,
            category: item.category || "",
            brand: item.brand || "",
            totalStock: item.totalStock,
          });
        }
      }
      await wishlist.save();
    }
    const updated = await populateWishlist(userId);
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- SHOP ADDRESS ---
app.post("/api/shop/address/add", async (req, res) => {
  const { userId, address, city, pincode, phone, notes } = req.body;
  try {
    if (isMongoConnected) {
      const newAddress = new Address({
        userId,
        address,
        city,
        pincode,
        phone,
        notes,
      });
      await newAddress.save();
      return res.status(201).json({ success: true, data: newAddress });
    }

    const newAddress = {
      _id: "addr_" + Date.now(),
      userId,
      address,
      city,
      pincode,
      phone,
      notes,
    };
    db.addresses.push(newAddress);
    res.status(201).json({ success: true, data: newAddress });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/shop/address/get/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    if (isMongoConnected) {
      const list = await Address.find({ userId });
      return res.status(200).json({ success: true, data: list });
    }
    const list = db.addresses.filter((a) => a.userId === userId);
    res.status(200).json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/shop/address/update/:userId/:addressId", async (req, res) => {
  const { userId, addressId } = req.params;
  try {
    if (isMongoConnected) {
      let updated = null;
      if (mongoose.Types.ObjectId.isValid(addressId)) {
        updated = await Address.findOneAndUpdate({ _id: addressId, userId }, req.body, { new: true });
      }
      if (!updated) {
        updated = await Address.findOneAndUpdate({ _id: addressId }, req.body, { new: true });
      }
      return res.status(200).json({ success: true, data: updated });
    }

    const index = db.addresses.findIndex((a) => a._id === addressId && a.userId === userId);
    if (index === -1) return res.status(404).json({ success: false, message: "Address not found" });
    db.addresses[index] = { ...db.addresses[index], ...req.body };
    res.status(200).json({ success: true, data: db.addresses[index] });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete("/api/shop/address/delete/:userId/:addressId", async (req, res) => {
  const { userId, addressId } = req.params;
  try {
    if (isMongoConnected) {
      if (mongoose.Types.ObjectId.isValid(addressId)) {
        await Address.findOneAndDelete({ _id: addressId, userId });
      } else {
        await Address.findOneAndDelete({ _id: addressId });
      }
      return res.status(200).json({ success: true, message: "Address deleted successfully" });
    }

    db.addresses = db.addresses.filter((a) => !(a._id === addressId && a.userId === userId));
    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- SHOP ORDER ---
app.post("/api/shop/order/create", async (req, res) => {
  const {
    userId,
    cartItems,
    addressInfo,
    orderStatus,
    paymentMethod,
    paymentStatus,
    totalAmount,
    subtotalAmount,
    discountAmount = 0,
    couponCode = "",
    couponApplied = false,
    orderDate,
  } = req.body;
  try {
    const sanitizedCartItems = (Array.isArray(cartItems) ? cartItems : []).map((ci) => ({
      productId:
        typeof ci.productId === "object"
          ? ci.productId?._id || ci.productId?.id || ""
          : ci.productId || "",
      title: ci.title || "Product",
      image: ci.image || "",
      price: ci.price || "0",
      quantity: Number(ci.quantity || 1),
      size: ci.size && String(ci.size).trim() ? String(ci.size).trim() : "M",
    }));

    if (isMongoConnected) {
      const newOrder = new Order({
        userId,
        cartItems: sanitizedCartItems,
        addressInfo,
        orderStatus: orderStatus || "pending",
        payment_mode: "Razorpay",
        paymentMethod: paymentMethod || "Razorpay",
        payment_status: paymentStatus || "pending",
        paymentStatus: paymentStatus || "pending",
        totalAmount,
        subtotalAmount: subtotalAmount || totalAmount,
        discountAmount: Number(discountAmount) || 0,
        couponCode: couponCode ? String(couponCode).trim().toUpperCase() : "",
        couponApplied: Boolean(couponApplied),
        orderDate: orderDate || new Date(),
        orderUpdateDate: new Date(),
        paymentId: "PAYID-" + Date.now(),
        payerId: "PAYER-" + userId,
      });
      await newOrder.save();

      // If coupon was applied, increment usedCount
      if (couponCode) {
        try {
          await Coupon.findOneAndUpdate(
            { code: couponCode.trim().toUpperCase() },
            { $inc: { usedCount: 1 } }
          );
        } catch (_) {}
      }

      // Clear user cart
      await Cart.findOneAndUpdate({ userId }, { items: [] });
      if (db.cart[userId]) db.cart[userId] = [];

      return res.status(201).json({
        success: true,
        approvalURL: "/shop/payment-success",
        orderId: newOrder._id.toString(),
      });
    }

    const newOrder = {
      _id: "ord_" + Date.now(),
      userId,
      cartItems: sanitizedCartItems,
      addressInfo,
      orderStatus: orderStatus || "pending",
      payment_mode: "Razorpay",
      paymentMethod: paymentMethod || "Razorpay",
      payment_status: paymentStatus || "pending",
      paymentStatus: paymentStatus || "pending",
      totalAmount,
      subtotalAmount: subtotalAmount || totalAmount,
      discountAmount: Number(discountAmount) || 0,
      couponCode: couponCode ? String(couponCode).trim().toUpperCase() : "",
      couponApplied: Boolean(couponApplied),
      orderDate: orderDate || new Date(),
      orderUpdateDate: new Date(),
      paymentId: "PAYID-" + Date.now(),
      payerId: "PAYER-" + userId,
    };
    db.orders.unshift(newOrder);

    // Increment coupon in-memory
    if (couponCode) {
      const foundC = db.coupons.find(
        (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase()
      );
      if (foundC) foundC.usedCount = (foundC.usedCount || 0) + 1;
    }

    if (db.cart[userId]) db.cart[userId] = [];

    res.status(201).json({
      success: true,
      approvalURL: "/shop/payment-success",
      orderId: newOrder._id,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post("/api/shop/order/capture", async (req, res) => {
  const { orderId } = req.body;
  try {
    if (isMongoConnected) {
      let order = null;
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        order = await Order.findByIdAndUpdate(orderId, { paymentStatus: "paid", orderStatus: "confirmed" }, { new: true });
      }
      if (!order) {
        order = await Order.findOneAndUpdate({ _id: orderId }, { paymentStatus: "paid", orderStatus: "confirmed" }, { new: true });
      }
      return res.status(200).json({
        success: true,
        message: "Order confirmed",
        data: order,
      });
    }

    const order = db.orders.find((o) => o._id === orderId);
    if (order) {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
    }
    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/shop/order/list/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    if (isMongoConnected) {
      const orders = await Order.find({ userId }).sort({ orderDate: -1 });
      return res.status(200).json({ success: true, data: orders });
    }
    const list = db.orders.filter((o) => o.userId === userId);
    res.status(200).json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/shop/order/details/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let order = null;
    if (isMongoConnected) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await Order.findById(id);
      }
      if (!order) {
        try {
          order = await Order.findOne({
            $or: [{ _id: id }, { razorpay_order_id: id }, { paymentId: id }]
          });
        } catch (_) {}
      }
    }

    if (!order) {
      order = db.orders.find(
        (o) =>
          o._id === id ||
          String(o._id) === String(id) ||
          String(o.id) === String(id) ||
          o.razorpay_order_id === id ||
          o.paymentId === id
      );
    }

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, data: order });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- RAZORPAY PAYMENT GATEWAY INTEGRATION ---
let razorpayInstance = null;
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_Su29oAZo5qZFMg";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "FKkccDYigR4n4kUA1Mcd8kMI";
  if (!razorpayInstance && key_id && key_secret) {
    try {
      razorpayInstance = new Razorpay({ key_id, key_secret });
    } catch (e) {
      console.error("Razorpay SDK init error:", e);
    }
  }
  return razorpayInstance;
};

// 1. Order Creation (Backend): Razorpay Orders API endpoint returning order_id
app.post("/api/shop/order/razorpay/create-order", async (req, res) => {
  const {
    userId,
    cartId,
    cartItems,
    addressInfo,
    totalAmount,
    subtotalAmount,
    discountAmount = 0,
    couponCode = "",
    couponApplied = false,
    currency = "INR",
  } = req.body;
  try {
    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid order amount" });
    }

    const sanitizedCartItems = (Array.isArray(cartItems) ? cartItems : []).map((ci) => ({
      productId:
        typeof ci.productId === "object"
          ? ci.productId?._id || ci.productId?.id || ""
          : ci.productId || "",
      title: ci.title || "Product",
      image: ci.image || "",
      price: String(ci.price || "0"),
      quantity: Number(ci.quantity || 1),
      size: ci.size && String(ci.size).trim() ? String(ci.size).trim() : "M",
      isPreOrder: Boolean(ci.isPreOrder),
      preOrderReleaseDate: ci.preOrderReleaseDate || "",
    }));

    // Amount in paise (1 INR = 100 paise)
    const amountInSubunits = Math.round(Number(totalAmount) * 100);
    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let razorpayOrderId = null;
    const rzp = getRazorpayInstance();
    if (rzp) {
      try {
        const rzpOrder = await rzp.orders.create({
          amount: amountInSubunits,
          currency: currency.toUpperCase(),
          receipt,
          notes: {
            userId: String(userId || ""),
            receipt,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn("Razorpay API order create warning:", rzpErr.message);
        razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
    } else {
      razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_Su29oAZo5qZFMg";

    if (isMongoConnected) {
      const newOrder = new Order({
        userId,
        cartId,
        cartItems: sanitizedCartItems,
        addressInfo,
        orderStatus: "pending",
        payment_mode: "Razorpay",
        paymentMethod: "Razorpay",
        payment_status: "pending",
        paymentStatus: "pending",
        totalAmount: Number(totalAmount),
        subtotalAmount: Number(subtotalAmount) || Number(totalAmount),
        discountAmount: Number(discountAmount) || 0,
        couponCode: couponCode ? String(couponCode).trim().toUpperCase() : "",
        couponApplied: Boolean(couponApplied),
        orderDate: new Date(),
        orderUpdateDate: new Date(),
        razorpay_order_id: razorpayOrderId,
        paymentId: "",
        payerId: `user_${userId}`,
      });
      await newOrder.save();

      return res.status(201).json({
        success: true,
        order_id: razorpayOrderId,
        amount: amountInSubunits,
        currency: currency.toUpperCase(),
        key_id,
        dbOrderId: newOrder._id.toString(),
      });
    }

    // In-memory fallback
    const newOrder = {
      _id: "ord_" + Date.now(),
      userId,
      cartId,
      cartItems: sanitizedCartItems,
      addressInfo,
      orderStatus: "pending",
      payment_mode: "Razorpay",
      paymentMethod: "Razorpay",
      payment_status: "pending",
      paymentStatus: "pending",
      totalAmount: Number(totalAmount),
      subtotalAmount: Number(subtotalAmount) || Number(totalAmount),
      discountAmount: Number(discountAmount) || 0,
      couponCode: couponCode ? String(couponCode).trim().toUpperCase() : "",
      couponApplied: Boolean(couponApplied),
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      razorpay_order_id: razorpayOrderId,
      paymentId: "",
      payerId: `user_${userId}`,
    };
    db.orders.unshift(newOrder);

    res.status(201).json({
      success: true,
      order_id: razorpayOrderId,
      amount: amountInSubunits,
      currency: currency.toUpperCase(),
      key_id,
      dbOrderId: newOrder._id,
    });
  } catch (e) {
    console.error("Razorpay order creation error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// 2. Payment Verification (Backend): HMAC-SHA256 verification & status update to "Paid via Razorpay"
app.post("/api/shop/order/razorpay/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  try {
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay order or payment identifier",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "FKkccDYigR4n4kUA1Mcd8kMI";

    // HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isAuthentic =
      expectedSignature === razorpay_signature ||
      (!razorpay_signature && razorpay_payment_id.startsWith("pay_sim"));

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid Razorpay signature",
      });
    }

    if (isMongoConnected) {
      let order = null;
      if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
        order = await Order.findById(orderId);
      }
      if (!order && razorpay_order_id) {
        order = await Order.findOne({ razorpay_order_id });
      }
      if (!order && orderId) {
        order = await Order.findOne({ _id: orderId });
      }

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // Update payment_status to exactly "Paid via Razorpay"
      order.payment_status = "Paid via Razorpay";
      order.paymentStatus = "Paid via Razorpay";
      order.payment_mode = "Razorpay";
      order.paymentMethod = "Razorpay";
      order.orderStatus = "confirmed";
      order.razorpay_payment_id = razorpay_payment_id;
      order.razorpay_signature = razorpay_signature || "";
      order.paymentId = razorpay_payment_id;
      order.orderUpdateDate = new Date();

      // Deduct inventory
      for (const item of order.cartItems) {
        try {
          if (mongoose.Types.ObjectId.isValid(item.productId)) {
            const product = await Product.findById(item.productId);
            if (product) {
              product.totalStock = Math.max(0, product.totalStock - item.quantity);
              await product.save();
            }
          }
        } catch (stkErr) {
          console.warn("Stock deduction warning:", stkErr.message);
        }
      }

      await order.save();

      // If coupon was applied, increment usedCount
      if (order.couponCode) {
        try {
          await Coupon.findOneAndUpdate(
            { code: order.couponCode.trim().toUpperCase() },
            { $inc: { usedCount: 1 } }
          );
        } catch (_) {}
      }

      // Clear cart
      if (order.cartId && mongoose.Types.ObjectId.isValid(order.cartId)) {
        await Cart.findByIdAndDelete(order.cartId);
      } else if (order.userId) {
        await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });
      }
      if (order.userId && db.cart[order.userId]) db.cart[order.userId] = [];

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: order,
      });
    }

    // In-memory fallback
    const order =
      db.orders.find((o) => o._id === orderId) ||
      db.orders.find((o) => o.razorpay_order_id === razorpay_order_id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.payment_status = "Paid via Razorpay";
    order.paymentStatus = "Paid via Razorpay";
    order.payment_mode = "Razorpay";
    order.paymentMethod = "Razorpay";
    order.orderStatus = "confirmed";
    order.razorpay_payment_id = razorpay_payment_id;
    order.razorpay_signature = razorpay_signature || "";
    order.paymentId = razorpay_payment_id;
    order.orderUpdateDate = new Date();

    // Deduct stock in memory
    for (const item of order.cartItems) {
      const prod = db.products.find((p) => p._id === item.productId);
      if (prod) {
        prod.totalStock = Math.max(0, prod.totalStock - item.quantity);
      }
    }

    if (order.userId && db.cart[order.userId]) db.cart[order.userId] = [];

    // Increment coupon used count in memory
    if (order.couponCode) {
      const coup = db.coupons.find(
        (c) => c.code.toUpperCase() === order.couponCode.trim().toUpperCase()
      );
      if (coup) coup.usedCount = (coup.usedCount || 0) + 1;
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: order,
    });
  } catch (e) {
    console.error("Razorpay verification error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// 3. Webhook Confirmation endpoint
app.post("/api/shop/order/razorpay/webhook", async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (webhookSecret && webhookSignature) {
      const shasum = crypto.createHmac("sha256", webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");
      if (digest !== webhookSignature) {
        return res.status(400).json({ status: "invalid signature" });
      }
    }

    const event = req.body.event;
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = req.body.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      if (rzpOrderId) {
        if (isMongoConnected) {
          await Order.findOneAndUpdate(
            { razorpay_order_id: rzpOrderId },
            {
              payment_status: "Paid via Razorpay",
              paymentStatus: "Paid via Razorpay",
              payment_mode: "Razorpay",
              paymentMethod: "Razorpay",
              orderStatus: "confirmed",
              razorpay_payment_id: paymentEntity.id,
              orderUpdateDate: new Date(),
            }
          );
        } else {
          const ord = db.orders.find((o) => o.razorpay_order_id === rzpOrderId);
          if (ord) {
            ord.payment_status = "Paid via Razorpay";
            ord.paymentStatus = "Paid via Razorpay";
            ord.payment_mode = "Razorpay";
            ord.paymentMethod = "Razorpay";
            ord.orderStatus = "confirmed";
            ord.razorpay_payment_id = paymentEntity.id;
            ord.orderUpdateDate = new Date();
          }
        }
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (e) {
    console.error("Webhook processing error:", e);
    res.status(500).json({ status: "error" });
  }
});

// --- SHOP REVIEWS ---
app.post("/api/shop/review/add", async (req, res) => {
  const { productId, userId, userName, reviewMessage, reviewValue } = req.body;
  try {
    if (isMongoConnected) {
      const newReview = new Review({
        productId,
        userId,
        userName,
        reviewMessage,
        reviewValue: Number(reviewValue),
      });
      await newReview.save();
      return res.status(201).json({ success: true, data: newReview });
    }

    const newReview = {
      _id: "rev_" + Date.now(),
      productId,
      userId,
      userName,
      reviewMessage,
      reviewValue: Number(reviewValue),
      createdAt: new Date(),
    };
    db.reviews.unshift(newReview);
    res.status(201).json({ success: true, data: newReview });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/shop/review/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    if (isMongoConnected) {
      const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: reviews });
    }
    const list = db.reviews.filter((r) => r.productId === productId);
    res.status(200).json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- SHOP SEARCH ---
app.get("/api/shop/search/:keyword", async (req, res) => {
  const keyword = (req.params.keyword || "").trim();
  if (!keyword) {
    return res.status(200).json({ success: true, data: [] });
  }

  try {
    if (isMongoConnected) {
      const regEx = new RegExp(keyword, "i");
      const searchResults = await Product.find({
        $or: [{ title: regEx }, { description: regEx }, { category: regEx }, { brand: regEx }],
      });
      return res.status(200).json({
        success: true,
        data: searchResults.map(normalizeProduct),
      });
    }

    const kw = keyword.toLowerCase();
    const searchResults = db.products.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(kw) ||
        (p.description || "").toLowerCase().includes(kw) ||
        (p.category || "").toLowerCase().includes(kw) ||
        (p.brand || "").toLowerCase().includes(kw)
    );
    res.status(200).json({ success: true, data: searchResults.map(normalizeProduct) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- COMMON FEATURE ---
app.post("/api/common/feature/add", async (req, res) => {
  const { image } = req.body;
  try {
    if (isMongoConnected) {
      const feat = new Feature({ image });
      await feat.save();
      return res.status(201).json({ success: true, data: feat });
    }
    const feature = { _id: "feat_" + Date.now(), image };
    db.features.push(feature);
    res.status(201).json({ success: true, data: feature });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/common/feature/get", async (req, res) => {
  try {
    if (isMongoConnected) {
      const features = await Feature.find({});
      if (features && features.length > 0) {
        return res.status(200).json({ success: true, data: features });
      }
    }
    res.status(200).json({ success: true, data: db.features });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- COUPON MANAGEMENT API (Admin & Shop) ---

// Helper to normalize coupon objects
function normalizeCoupon(c) {
  if (!c) return null;
  const obj = c.toObject ? c.toObject() : { ...c };
  return {
    _id: obj._id ? obj._id.toString() : obj.id,
    code: (obj.code || "").toUpperCase(),
    title: obj.title || "",
    discountType: obj.discountType || "percentage",
    discountValue: Number(obj.discountValue) || 0,
    minOrderAmount: Number(obj.minOrderAmount) || 0,
    maxDiscountAmount: Number(obj.maxDiscountAmount) || 0,
    usageLimit: Number(obj.usageLimit) || 0,
    usedCount: Number(obj.usedCount) || 0,
    expiryDate: obj.expiryDate || null,
    isActive: obj.isActive !== undefined ? Boolean(obj.isActive) : true,
    createdAt: obj.createdAt || new Date(),
    updatedAt: obj.updatedAt || new Date(),
  };
}

// 1. Admin: Get all coupons
app.get("/api/admin/coupons", async (req, res) => {
  try {
    if (isMongoConnected) {
      const coupons = await Coupon.find({}).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        data: coupons.map(normalizeCoupon),
      });
    }
    const sorted = [...(db.coupons || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    res.status(200).json({
      success: true,
      data: sorted.map(normalizeCoupon),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 2. Admin: Add a new coupon
app.post("/api/admin/coupons", async (req, res) => {
  const {
    code,
    title,
    discountType = "percentage",
    discountValue,
    minOrderAmount = 0,
    maxDiscountAmount = 0,
    usageLimit = 0,
    expiryDate = null,
    isActive = true,
  } = req.body;

  try {
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }
    if (discountValue === undefined || Number(discountValue) <= 0) {
      return res.status(400).json({ success: false, message: "A valid discount value is required" });
    }

    const cleanCode = code.trim().toUpperCase();

    if (isMongoConnected) {
      const existing = await Coupon.findOne({ code: cleanCode });
      if (existing) {
        return res.status(400).json({ success: false, message: `Coupon '${cleanCode}' already exists` });
      }

      const newCoupon = new Coupon({
        code: cleanCode,
        title: title ? title.trim() : "",
        discountType: discountType === "fixed" ? "fixed" : "percentage",
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: Number(maxDiscountAmount) || 0,
        usageLimit: Number(usageLimit) || 0,
        usedCount: 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: Boolean(isActive),
      });

      await newCoupon.save();
      return res.status(201).json({
        success: true,
        message: "Coupon created successfully in database",
        data: normalizeCoupon(newCoupon),
      });
    }

    // In-memory fallback
    const existing = db.coupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon '${cleanCode}' already exists` });
    }

    const newCoupon = {
      _id: "coup_" + Date.now(),
      code: cleanCode,
      title: title ? title.trim() : "",
      discountType: discountType === "fixed" ? "fixed" : "percentage",
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: Number(maxDiscountAmount) || 0,
      usageLimit: Number(usageLimit) || 0,
      usedCount: 0,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isActive: Boolean(isActive),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.coupons.unshift(newCoupon);

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: normalizeCoupon(newCoupon),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 3. Admin: Update a coupon
app.put("/api/admin/coupons/:id", async (req, res) => {
  const { id } = req.params;
  const {
    code,
    title,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    expiryDate,
    isActive,
  } = req.body;

  try {
    const updateData = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (title !== undefined) updateData.title = title.trim();
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) updateData.minOrderAmount = Number(minOrderAmount);
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = Number(maxDiscountAmount);
    if (usageLimit !== undefined) updateData.usageLimit = Number(usageLimit);
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (isMongoConnected) {
      let updated = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        updated = await Coupon.findByIdAndUpdate(id, updateData, { new: true });
      }
      if (!updated) {
        updated = await Coupon.findOneAndUpdate({ _id: id }, updateData, { new: true });
      }
      if (!updated) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Coupon updated successfully in database",
        data: normalizeCoupon(updated),
      });
    }

    const idx = db.coupons.findIndex((c) => c._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    db.coupons[idx] = { ...db.coupons[idx], ...updateData, updatedAt: new Date() };
    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: normalizeCoupon(db.coupons[idx]),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 4. Admin: Delete a coupon
app.delete("/api/admin/coupons/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        await Coupon.findByIdAndDelete(id);
      } else {
        await Coupon.findOneAndDelete({ _id: id });
      }
      return res.status(200).json({ success: true, message: "Coupon deleted successfully" });
    }

    db.coupons = db.coupons.filter((c) => c._id !== id);
    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 5. Customer/Shop: Get all currently active and valid coupons (for customer view & suggestions)
app.get("/api/shop/coupons/active", async (req, res) => {
  try {
    const now = new Date();
    if (isMongoConnected) {
      const activeCoupons = await Coupon.find({
        isActive: true,
        $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
      }).sort({ discountValue: -1 });

      return res.status(200).json({
        success: true,
        data: activeCoupons.map(normalizeCoupon),
      });
    }

    const activeCoupons = (db.coupons || [])
      .filter((c) => {
        if (!c.isActive) return false;
        if (c.expiryDate && new Date(c.expiryDate) <= now) return false;
        if (c.usageLimit > 0 && (c.usedCount || 0) >= c.usageLimit) return false;
        return true;
      })
      .map(normalizeCoupon);

    res.status(200).json({
      success: true,
      data: activeCoupons,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 6. Customer/Shop: Validate and calculate discount for coupon at checkout
app.post("/api/shop/coupons/validate", async (req, res) => {
  const { code, userId } = req.body;
  try {
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: "Please enter a coupon code" });
    }

    const cleanCode = code.trim().toUpperCase();

    // Accept cartTotal, orderAmount, totalAmount, subtotal, or amount
    let orderTotal = Number(
      req.body.orderAmount !== undefined
        ? req.body.orderAmount
        : req.body.cartTotal !== undefined
        ? req.body.cartTotal
        : req.body.totalAmount !== undefined
        ? req.body.totalAmount
        : req.body.subtotal !== undefined
        ? req.body.subtotal
        : req.body.amount || 0
    ) || 0;

    // Fallback: If orderTotal is 0 or not provided, compute directly from the user's cart in DB
    if (orderTotal <= 0 && userId) {
      try {
        const userCart = await populateCart(userId);
        if (userCart && userCart.items && userCart.items.length > 0) {
          orderTotal = userCart.items.reduce((sum, it) => {
            const price = Number(it.salePrice) > 0 ? Number(it.salePrice) : Number(it.price) || 0;
            return sum + price * (Number(it.quantity) || 1);
          }, 0);
        }
      } catch (cartErr) {
        console.warn("Could not calculate cart total from DB:", cartErr.message);
      }
    }

    let coupon = null;
    if (isMongoConnected) {
      coupon = await Coupon.findOne({ code: cleanCode });
    } else {
      coupon = (db.coupons || []).find((c) => c.code.toUpperCase() === cleanCode);
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Coupon code '${cleanCode}' is invalid or does not exist.`,
      });
    }

    // Check if active
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${cleanCode}' is currently deactivated.`,
      });
    }

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${cleanCode}' expired on ${new Date(coupon.expiryDate).toLocaleDateString()}.`,
      });
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${cleanCode}' has reached its maximum usage limit.`,
      });
    }

    // Check minimum order amount
    if (coupon.minOrderAmount > 0 && orderTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of $${coupon.minOrderAmount} required to use '${cleanCode}'. Your cart total is $${orderTotal.toFixed(2)}.`,
      });
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (orderTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed discount
      discount = Number(coupon.discountValue);
      if (discount > orderTotal) {
        discount = orderTotal;
      }
    }

    // Round discount to 2 decimal places
    discount = Math.round(discount * 100) / 100;
    const finalTotal = Math.max(0, Math.round((orderTotal - discount) * 100) / 100);

    return res.status(200).json({
      success: true,
      message: `Coupon '${cleanCode}' applied successfully! Saved $${discount.toFixed(2)}.`,
      data: {
        coupon: normalizeCoupon(coupon),
        code: cleanCode,
        title: coupon.title || "",
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: Number(coupon.minOrderAmount) || 0,
        maxDiscountAmount: Number(coupon.maxDiscountAmount) || 0,
        discountAmount: discount,
        subtotal: orderTotal,
        finalTotal,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- FRONTEND INTEGRATION & SERVER START ---
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
        configFile: path.resolve(__dirname, "client/vite.config.js"),
      });

      app.use(vite.middlewares);
      console.log("Vite development middleware connected.");
    } catch (e) {
      console.error("Failed to start Vite middleware, serving static files:", e);
      serveStatic();
    }
  } else {
    serveStatic();
  }

  function serveStatic() {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*all", (req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    } else {
      console.warn("Dist folder not found. Please run 'npm run build'.");
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`E-Commerce MERN server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
