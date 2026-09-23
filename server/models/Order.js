const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: String,
    cartId: String,
    cartItems: [
      {
        productId: String,
        title: String,
        image: String,
        price: String,
        quantity: Number,
        size: {
          type: String,
          required: true,
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
    orderStatus: {
      type: String,
      default: "pending",
    },
    // Explicit payment mode tracking field (e.g., "Razorpay", "PayPal", "COD")
    payment_mode: {
      type: String,
      default: "Razorpay",
    },
    paymentMethod: {
      type: String,
      default: "Razorpay",
    },
    // Updated to exactly "Paid via Razorpay" upon successful verification
    payment_status: {
      type: String,
      default: "pending",
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },
    totalAmount: Number,
    subtotalAmount: Number,
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: "",
    },
    couponApplied: {
      type: Boolean,
      default: false,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    orderUpdateDate: {
      type: Date,
      default: Date.now,
    },
    paymentId: String,
    payerId: String,
    // Razorpay specific gateway transaction IDs
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
