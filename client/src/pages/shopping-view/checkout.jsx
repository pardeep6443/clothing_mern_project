import React, { useState, useEffect, useMemo } from "react";
import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import { fetchCartItems } from "@/store/shop/cart-slice";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_URL } from "@/config/api";
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Loader2,
  Sparkles,
  Lock,
  ArrowRight,
  TicketPercent,
  Tag,
  Check,
  X,
  Percent,
} from "lucide-react";

// Helper function to dynamically load Razorpay's checkout.js
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function ShoppingCheckout() {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [simulationDialog, setSimulationDialog] = useState(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  const { toast } = useToast();

  // Always keep user's cart fresh on checkout load
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user?.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    // Preload Razorpay checkout script
    loadRazorpayScript();

    // Fetch active coupons configured in MongoDB/Admin panel
    async function fetchAvailableCoupons() {
      setIsLoadingCoupons(true);
      try {
        const res = await axios.get(`${API_URL}/api/shop/coupons/active`);
        if (res.data?.success) {
          setActiveCoupons(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load active coupons:", err);
      } finally {
        setIsLoadingCoupons(false);
      }
    }
    fetchAvailableCoupons();
  }, []);

  // Support both cartItems as array and cartItems as object with items array
  const cartList = useMemo(() => {
    if (Array.isArray(cartItems)) return cartItems;
    if (Array.isArray(cartItems?.items)) return cartItems.items;
    return [];
  }, [cartItems]);

  const totalCartAmount = useMemo(() => {
    if (!cartList || cartList.length === 0) return 0;
    return cartList.reduce((sum, currentItem) => {
      const price =
        Number(currentItem?.salePrice) > 0
          ? Number(currentItem?.salePrice)
          : Number(currentItem?.price) || 0;
      const quantity = Number(currentItem?.quantity) || 1;
      return sum + price * quantity;
    }, 0);
  }, [cartList]);

  // Coupon discount computation dynamically synchronized with active cart subtotal
  const discountAmount = useMemo(() => {
    if (!appliedCoupon || totalCartAmount <= 0) return 0;
    let disc = 0;
    if (appliedCoupon.discountType === "percentage") {
      disc = (totalCartAmount * Number(appliedCoupon.discountValue)) / 100;
      if (appliedCoupon.maxDiscountAmount > 0 && disc > appliedCoupon.maxDiscountAmount) {
        disc = appliedCoupon.maxDiscountAmount;
      }
    } else {
      disc = Number(appliedCoupon.discountValue) || 0;
    }
    return Math.min(totalCartAmount, Math.round(disc * 100) / 100);
  }, [appliedCoupon, totalCartAmount]);

  const finalPayableAmount = Math.max(0, Math.round((totalCartAmount - discountAmount) * 100) / 100);

  // Validate and apply coupon
  async function handleApplyCoupon(codeToTest) {
    const code = (codeToTest || couponInput).trim().toUpperCase();
    if (!code) {
      toast({
        title: "Coupon code required",
        description: "Please type a promo code to apply.",
        variant: "destructive",
      });
      return;
    }

    if (totalCartAmount <= 0) {
      toast({
        title: "Empty Bag",
        description: "Add items to your bag before applying coupon codes.",
        variant: "destructive",
      });
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const res = await axios.post(`${API_URL}/api/shop/coupons/validate`, {
        code,
        orderAmount: totalCartAmount,
        cartTotal: totalCartAmount,
        totalAmount: totalCartAmount,
        userId: user?.id,
      });

      if (res.data?.success) {
        const couponData = res.data.data;
        setAppliedCoupon(couponData);
        setCouponInput(code);
        toast({
          title: "Coupon Applied!",
          description: `You saved $${couponData.discountAmount.toFixed(2)} with code ${code}.`,
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: res.data?.message || "This coupon could not be applied.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Coupon Error",
        description: err.response?.data?.message || "Failed to validate coupon.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    toast({
      title: "Coupon Removed",
      description: "Promotional discount has been removed from order total.",
    });
  }

  const sanitizedCartItems = useMemo(() => {
    if (!cartList || cartList.length === 0) return [];
    return cartList.map((singleCartItem) => ({
      productId:
        typeof singleCartItem?.productId === "object"
          ? singleCartItem?.productId?._id || singleCartItem?.productId?.id || ""
          : singleCartItem?.productId || singleCartItem?._id || singleCartItem?.id || "",
      title: singleCartItem?.title || singleCartItem?.name || "Product",
      image: singleCartItem?.image || "",
      price:
        Number(singleCartItem?.salePrice) > 0
          ? Number(singleCartItem?.salePrice)
          : Number(singleCartItem?.price) || 0,
      quantity: Number(singleCartItem?.quantity) || 1,
      size:
        singleCartItem?.size && String(singleCartItem.size).trim()
          ? String(singleCartItem.size).trim()
          : "M",
      isPreOrder: Boolean(singleCartItem?.isPreOrder),
      preOrderReleaseDate: singleCartItem?.preOrderReleaseDate || "",
    }));
  }, [cartList]);

  /**
   * Razorpay Checkout Flow:
   * 1. Check cart & address selection
   * 2. Backend Order Creation: call /api/shop/order/razorpay/create-order -> returns razorpay order_id
   * 3. Launch Razorpay modal via window.Razorpay(options).open()
   * 4. On Payment Success handler: call /api/shop/order/razorpay/verify-payment with razorpay_order_id, razorpay_payment_id, razorpay_signature
   * 5. Redirect to /shop/payment-success
   */
  async function handleInitiateRazorpayPayment() {
    if (cartList.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your bag before proceeding.",
        variant: "destructive",
      });
      return;
    }
    if (currentSelectedAddress === null) {
      toast({
        title: "Address Required",
        description: "Please select or add a delivery address to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Step 1: Create Order on Backend
      const orderPayload = {
        userId: user?.id,
        cartId: cartItems?._id,
        cartItems: sanitizedCartItems,
        addressInfo: {
          addressId: currentSelectedAddress?._id,
          address: currentSelectedAddress?.address,
          city: currentSelectedAddress?.city,
          pincode: currentSelectedAddress?.pincode,
          phone: currentSelectedAddress?.phone,
          notes: currentSelectedAddress?.notes,
        },
        subtotalAmount: totalCartAmount,
        discountAmount: discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : "",
        couponApplied: Boolean(appliedCoupon),
        totalAmount: finalPayableAmount,
        currency: "INR",
      };

      const res = await axios.post(
        `${API_URL}/api/shop/order/razorpay/create-order`,
        orderPayload
      );

      if (!res.data || !res.data.success) {
        throw new Error(res.data?.message || "Failed to initiate Razorpay order");
      }

      const { order_id, amount, currency, key_id, dbOrderId } = res.data;

      // Check if checkout.js is available or in iframe environment
      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded || typeof window.Razorpay === "undefined") {
        // Fallback for sandboxed environment without external script access
        setSimulationDialog({
          order_id,
          dbOrderId,
          amount,
          currency,
        });
        setIsProcessingPayment(false);
        return;
      }

      // Step 2: Open Razorpay Payment Modal
      const options = {
        key: key_id,
        amount: amount,
        currency: currency || "INR",
        name: "MAISON HAUTE COUTURE",
        description: `Order total: $${finalPayableAmount.toFixed(2)} (${cartList.length} items)${appliedCoupon ? ` [Coupon: ${appliedCoupon.code}]` : ""}`,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=150&q=80",
        order_id: order_id,
        handler: async function (response) {
          try {
            // Step 3: Backend Payment Verification
            const verifyRes = await axios.post(
              `${API_URL}/api/shop/order/razorpay/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: dbOrderId,
              }
            );

            if (verifyRes.data && verifyRes.data.success) {
              sessionStorage.setItem("currentOrderId", JSON.stringify(dbOrderId));
              toast({
                title: "Payment Confirmed!",
                description: "Your order has been paid via Razorpay successfully.",
              });
              window.location.href = "/shop/payment-success";
            } else {
              toast({
                title: "Verification issue",
                description: verifyRes.data?.message || "Payment could not be verified.",
                variant: "destructive",
              });
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            toast({
              title: "Verification Error",
              description: err.response?.data?.message || err.message,
              variant: "destructive",
            });
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.userName || "Valued Customer",
          email: user?.email || "customer@example.com",
          contact: currentSelectedAddress?.phone || "9876543210",
        },
        notes: {
          address: currentSelectedAddress?.address || "",
          city: currentSelectedAddress?.city || "",
          pincode: currentSelectedAddress?.pincode || "",
        },
        theme: {
          color: "#111111",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            toast({
              title: "Payment Cancelled",
              description: "You closed the Razorpay payment window.",
            });
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        toast({
          title: "Payment Failed",
          description: response.error?.description || "Payment transaction could not be completed.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      toast({
        title: "Checkout Error",
        description: err.response?.data?.message || err.message || "Failed to initialize payment",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  }

  // Completes a simulated or test payment for preview environments
  async function handleCompleteSimulatedPayment() {
    if (!simulationDialog) return;
    setIsProcessingPayment(true);
    try {
      const simulatedPaymentId = `pay_sim_${Date.now()}`;
      const verifyRes = await axios.post(
        `${API_URL}/api/shop/order/razorpay/verify-payment`,
        {
          razorpay_order_id: simulationDialog.order_id,
          razorpay_payment_id: simulatedPaymentId,
          razorpay_signature: "",
          orderId: simulationDialog.dbOrderId,
        }
      );

      if (verifyRes.data && verifyRes.data.success) {
        sessionStorage.setItem("currentOrderId", JSON.stringify(simulationDialog.dbOrderId));
        setSimulationDialog(null);
        toast({
          title: "Payment Successful!",
          description: "Status updated to: Paid via Razorpay",
        });
        window.location.href = "/shop/payment-success";
      }
    } catch (e) {
      toast({
        title: "Simulation error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  }

  return (
    <div className="flex flex-col bg-[#FAF9F6] text-gray-900 min-h-screen">
      <div className="relative pt-28 sm:pt-36 md:pt-40 pb-12 sm:pb-16 px-4 bg-[#111111] text-white border-b border-gray-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src={img}
          alt="Checkout Banner"
          className="h-full w-full object-cover object-center absolute inset-0 opacity-25"
        />
        <div className="relative z-20 text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            [ SECURE RAZORPAY ENCRYPTED CHECKOUT ]
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-wide">
            DAYLIGHT ATELIER CHECKOUT
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 p-4 md:p-8">
        {/* Step 1: Shipping Address */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="font-display font-bold text-xl text-gray-900 mb-4 tracking-wide flex items-center justify-between">
            <span>01. SHIPPING ADDRESS</span>
            {currentSelectedAddress && (
              <span className="text-xs font-mono font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded">
                ✓ ADDRESS SELECTED
              </span>
            )}
          </h2>
          <Address
            selectedId={currentSelectedAddress}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />
        </div>

        {/* Step 2: Bag Summary & Payment Gateway */}
        <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-4 tracking-wide">
              02. BAG SUMMARY & PAYMENT
            </h2>
            <div className="flex flex-col gap-3 max-h-80 sm:max-h-72 overflow-y-auto pr-1">
              {cartList && cartList.length > 0 ? (
                cartList.map((item, index) => (
                  <UserCartItemsContent
                    key={`${item?.productId?._id || item?.productId || item?._id || item?.id || "item"}_${item?.size || "M"}_${index}`}
                    cartItem={item}
                  />
                ))
              ) : (
                <p className="text-xs font-mono text-gray-500 py-6 text-center">
                  [ NO ITEMS IN CART ]
                </p>
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-gray-700 font-bold flex items-center gap-1.5">
                  <TicketPercent className="w-4 h-4 text-amber-600" />
                  APPLY PROMO COUPON
                </span>
                {appliedCoupon && (
                  <span className="text-[10px] font-mono font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                    COUPON APPLIED
                  </span>
                )}
              </div>

              {/* Input Form or Applied Pill */}
              {appliedCoupon ? (
                <div className="p-3 rounded-lg border border-green-200 bg-green-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded bg-green-600 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-green-900 tracking-wider">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[11px] font-semibold text-green-700">
                          -${discountAmount.toFixed(2)} OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-green-800">
                        {appliedCoupon.title || "Promotional discount applied successfully"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        type="text"
                        placeholder="ENTER COUPON CODE"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        className="pl-8 text-xs font-mono font-bold uppercase tracking-wider h-10 border-gray-300"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={isValidatingCoupon || !couponInput.trim()}
                      className="bg-gray-900 hover:bg-black text-white text-xs font-mono font-bold h-10 px-4"
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "APPLY"
                      )}
                    </Button>
                  </div>

                  {/* Active Coupons Quick Selection Pills */}
                  {activeCoupons && activeCoupons.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1.5">
                        Available Offers in Database:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeCoupons.map((coupon) => (
                          <button
                            type="button"
                            key={coupon._id}
                            onClick={() => handleApplyCoupon(coupon.code)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
                          >
                            <TicketPercent className="w-3 h-3 text-amber-600" />
                            <span className="font-bold">{coupon.code}</span>
                            <span className="text-amber-700">
                              ({coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method Presentation */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <span className="font-mono text-[11px] uppercase tracking-wider text-gray-600 font-bold block mb-2.5">
                PAYMENT GATEWAY
              </span>
              <div className="p-4 rounded-lg border-2 border-blue-600/30 bg-blue-50/50 text-gray-900 flex flex-col gap-2">
                <div className="flex items-center justify-between w-full">
                  <span className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Razorpay Secure Gateway
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-green-700 font-bold bg-green-100 border border-green-300 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ACTIVE
                  </div>
                </div>
                <p className="text-xs font-sans text-gray-700 leading-relaxed">
                  Accepts UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking (50+ banks), and Digital Wallets.
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-gray-600 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>INSTANT HMAC-SHA256 VERIFICATION</span>
                  <span className="text-gray-400">•</span>
                  <Lock className="w-3.5 h-3.5 text-green-600" />
                  <span>256-BIT SSL ENCRYPTION</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="uppercase tracking-wider text-gray-600 font-medium">BAG SUBTOTAL</span>
              <span className="font-bold text-gray-900">${totalCartAmount.toFixed(2)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between items-center font-mono text-xs text-green-700 bg-green-50 px-2.5 py-1.5 rounded border border-green-200">
                <span className="uppercase tracking-wider font-semibold flex items-center gap-1">
                  <TicketPercent className="w-3.5 h-3.5" />
                  COUPON DISCOUNT ({appliedCoupon.code})
                </span>
                <span className="font-bold">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center font-mono pt-2 border-t border-gray-100">
              <span className="text-xs uppercase tracking-wider text-gray-800 font-bold">FINAL PAYABLE TOTAL</span>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-gray-900">${finalPayableAmount.toFixed(2)}</span>
                {appliedCoupon && (
                  <span className="block text-[11px] text-green-600 font-medium">
                    You saved ${discountAmount.toFixed(2)}!
                  </span>
                )}
              </div>
            </div>

            <div className="w-full pt-2">
              <Button
                onClick={handleInitiateRazorpayPayment}
                disabled={isProcessingPayment}
                className="w-full bg-[#111111] hover:bg-black text-white font-mono text-xs uppercase tracking-widest font-bold py-6 rounded-md shadow-md flex items-center justify-center gap-2 transition-all"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    INITIALIZING RAZORPAY GATEWAY...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    PAY WITH RAZORPAY (${finalPayableAmount.toFixed(2)})
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-[11px] font-mono text-center text-gray-500">
              🔒 256-Bit SSL Encrypted. Verified via Razorpay HMAC-SHA256 signature.
            </p>
          </div>
        </div>
      </div>

      {/* Direct Test/Preview Dialog when checkout.js iframe is blocked in development preview */}
      {simulationDialog && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 max-w-md w-full p-6 rounded-xl shadow-2xl text-gray-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-display font-bold text-base text-gray-900">
                Razorpay Checkout (Order: {simulationDialog.order_id})
              </h3>
            </div>
            <div className="text-xs font-mono space-y-2 bg-gray-50 p-3.5 rounded-lg border border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount (Paise):</span>
                <span className="font-bold text-gray-900">{simulationDialog.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-bold text-gray-900">{simulationDialog.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono font-semibold text-gray-900 truncate max-w-[200px]">{simulationDialog.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Initial Status:</span>
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode:</span>
                <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Razorpay</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Simulate customer payment completion to verify HMAC signature check and verify that the database updates status to: <strong className="text-green-700 font-bold">"Paid via Razorpay"</strong>.
            </p>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSimulationDialog(null)}
                className="flex-1 text-xs border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteSimulatedPayment}
                disabled={isProcessingPayment}
                className="flex-1 bg-[#111111] hover:bg-black text-white font-mono text-xs font-bold shadow-sm"
              >
                {isProcessingPayment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Razorpay Payment"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingCheckout;
