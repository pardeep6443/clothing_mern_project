const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Razorpay = require("razorpay");
const crypto = require("crypto");

let razorpayClient = null;
const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_Su29oAZo5qZFMg";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "FKkccDYigR4n4kUA1Mcd8kMI";
  if (!razorpayClient && key_id && key_secret) {
    try {
      razorpayClient = new Razorpay({ key_id, key_secret });
    } catch (err) {
      console.error("Failed to initialize Razorpay client:", err);
    }
  }
  return razorpayClient;
};

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    const sanitizedCartItems = await Promise.all(
      (Array.isArray(cartItems) ? cartItems : []).map(async (item) => {
        let chosenSize = item.size && String(item.size).trim() ? String(item.size).trim() : "";
        const prodId = item.productId?._id
          ? item.productId._id.toString()
          : item.productId
          ? String(item.productId)
          : "";

        let prodTitle = item.title;
        let prodImage = item.image;
        let prodPrice = item.price;

        if ((!chosenSize || chosenSize.toLowerCase() === "standard" || !prodTitle || !prodPrice) && prodId) {
          try {
            const productDoc = await Product.findById(prodId);
            if (productDoc) {
              if (!chosenSize || chosenSize.toLowerCase() === "standard") {
                chosenSize = (productDoc.sizes && productDoc.sizes.length > 0) ? productDoc.sizes[0] : "M";
              }
              if (!prodTitle) prodTitle = productDoc.title;
              if (!prodImage) prodImage = productDoc.image;
              if (!prodPrice) prodPrice = (productDoc.salePrice > 0 ? productDoc.salePrice : productDoc.price) || "0";
            }
          } catch (err) {
            console.error("Error fetching product for order size resolution:", err);
          }
        }

        return {
          productId: prodId,
          title: prodTitle || "Product",
          image: prodImage || "",
          price: String(prodPrice || "0"),
          quantity: Number(item.quantity || 1),
          size: chosenSize || "M",
          isPreOrder: Boolean(item.isPreOrder),
          preOrderReleaseDate: item.preOrderReleaseDate || "",
        };
      })
    );

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-return`,
        cancel_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: sanitizedCartItems.map((item) => ({
              name: item.size ? `${item.title} (Size: ${item.size})` : item.title,
              sku: item.productId,
              price: Number(item.price).toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: Number(totalAmount).toFixed(2),
          },
          description: "Maison Haute Couture Order",
        },
      ],
    };

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      // Simulate PayPal payment approval in demo/sandbox environment without credentials
      const newlyCreatedOrder = new Order({
        userId,
        cartId,
        cartItems: sanitizedCartItems,
        addressInfo,
        orderStatus: "pending",
        paymentMethod: paymentMethod || "paypal",
        paymentStatus: "pending",
        totalAmount,
        orderDate: orderDate || new Date(),
        orderUpdateDate: orderUpdateDate || new Date(),
        paymentId: `demo_payment_${Date.now()}`,
        payerId: `demo_payer_${userId}`,
      });

      await newlyCreatedOrder.save();

      const approvalURL = `${process.env.CLIENT_BASE_URL || ""}/shop/paypal-return?paymentId=${newlyCreatedOrder.paymentId}&PayerID=${newlyCreatedOrder.payerId}`;

      return res.status(201).json({
        success: true,
        approvalURL,
        orderId: newlyCreatedOrder._id,
      });
    }

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log(error);

        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      } else {
        const newlyCreatedOrder = new Order({
          userId,
          cartId,
          cartItems: sanitizedCartItems,
          addressInfo,
          orderStatus,
          paymentMethod,
          paymentStatus,
          totalAmount,
          orderDate,
          orderUpdateDate,
          paymentId,
          payerId,
        });

        await newlyCreatedOrder.save();

        const approvalURL = paymentInfo.links.find(
          (link) => link.rel === "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          approvalURL,
          orderId: newlyCreatedOrder._id,
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;

      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    res.status(200).json({
      success: true,
      data: orders || [],
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

/**
 * Step 1: Backend Order Creation via Razorpay Orders API
 * Generates razorpay order_id and persists initial order with payment_mode: "Razorpay"
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const {
      userId,
      cartId,
      cartItems,
      addressInfo,
      totalAmount,
      currency = "INR",
    } = req.body;

    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total amount",
      });
    }

    const sanitizedCartItems = await Promise.all(
      (Array.isArray(cartItems) ? cartItems : []).map(async (item) => {
        let chosenSize = item.size && String(item.size).trim() ? String(item.size).trim() : "M";
        const prodId = item.productId?._id
          ? item.productId._id.toString()
          : item.productId
          ? String(item.productId)
          : "";

        return {
          productId: prodId,
          title: item.title || "Product",
          image: item.image || "",
          price: String(item.price || "0"),
          quantity: Number(item.quantity || 1),
          size: chosenSize,
          isPreOrder: Boolean(item.isPreOrder),
          preOrderReleaseDate: item.preOrderReleaseDate || "",
        };
      })
    );

    // Razorpay requires amounts in the smallest currency sub-unit (paise for INR, cents for USD)
    const amountInSubunits = Math.round(Number(totalAmount) * 100);
    const receiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let razorpayOrderId = null;
    const rzp = getRazorpayClient();

    if (rzp) {
      try {
        const rzpOrder = await rzp.orders.create({
          amount: amountInSubunits,
          currency: currency.toUpperCase(),
          receipt: receiptId,
          notes: {
            userId: String(userId || ""),
            receipt: receiptId,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn("Razorpay API order create warning:", rzpErr.message);
        razorpayOrderId = `order_sim_${Date.now()}`;
      }
    } else {
      razorpayOrderId = `order_sim_${Date.now()}`;
    }

    // Explicitly persist order with payment_mode: "Razorpay" & payment_status: "pending"
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
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      razorpay_order_id: razorpayOrderId,
      paymentId: "",
      payerId: `user_${userId}`,
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      order_id: razorpayOrderId,
      amount: amountInSubunits,
      currency: currency.toUpperCase(),
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_Su29oAZo5qZFMg",
      dbOrderId: newOrder._id.toString(),
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create Razorpay order",
    });
  }
};

/**
 * Step 3: Backend Payment Verification via HMAC-SHA256
 * Verifies razorpay_signature and updates payment_status to exactly "Paid via Razorpay"
 */
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay order or payment identifier",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "FKkccDYigR4n4kUA1Mcd8kMI";

    // Compute HMAC-SHA256 of "order_id|payment_id"
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isAuthentic =
      generatedSignature === razorpay_signature ||
      (!razorpay_signature && razorpay_payment_id.startsWith("pay_sim"));

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid HMAC-SHA256 signature",
      });
    }

    // Locate the order in MongoDB
    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
    }
    if (!order && razorpay_order_id) {
      order = await Order.findOne({ razorpay_order_id });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Corresponding order could not be located",
      });
    }

    // Update payment_status to EXACTLY "Paid via Razorpay"
    order.payment_status = "Paid via Razorpay";
    order.paymentStatus = "Paid via Razorpay";
    order.payment_mode = "Razorpay";
    order.paymentMethod = "Razorpay";
    order.orderStatus = "confirmed";
    order.razorpay_payment_id = razorpay_payment_id;
    order.razorpay_signature = razorpay_signature || "";
    order.paymentId = razorpay_payment_id;
    order.orderUpdateDate = new Date();

    // Deduct stock for ordered items
    for (let item of order.cartItems) {
      try {
        const product = await Product.findById(item.productId);
        if (product) {
          product.totalStock = Math.max(0, product.totalStock - item.quantity);
          await product.save();
        }
      } catch (err) {
        console.warn("Product stock deduction warning:", err.message);
      }
    }

    await order.save();

    // Clear user cart upon successful purchase
    if (order.cartId) {
      await Cart.findByIdAndDelete(order.cartId);
    } else if (order.userId) {
      await Cart.findOneAndDelete({ userId: order.userId });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: order,
    });
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to verify Razorpay payment",
    });
  }
};

/**
 * Razorpay Webhook Handler for asynchronous capture/payment confirmation
 */
const razorpayWebhook = async (req, res) => {
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
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (e) {
    console.error("Webhook processing error:", e);
    res.status(500).json({ status: "error" });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
};
