import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Package, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    try {
      const storedId = sessionStorage.getItem("currentOrderId");
      if (storedId) {
        setOrderId(JSON.parse(storedId));
      }
    } catch {
      // ignore JSON parse error
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] pt-28 sm:pt-36 md:pt-40 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white border border-[#E5E5E5] p-8 sm:p-12 shadow-sm text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#111111] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
        </div>

        {/* Eyebrow */}
        <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#767676] block mb-2 font-medium">
          MAISON DAYLIGHT // ORDER CONFIRMED
        </span>

        {/* Heading */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-[0.12em] font-normal text-[#111111] mb-3">
          PAYMENT SUCCESSFUL
        </h1>

        <p className="font-serif italic text-[#666666] text-xs sm:text-sm mb-6 max-w-md mx-auto leading-relaxed">
          Thank you for your acquisition. Your order has been registered, and our master artisans are curating your pieces with signature atelier packaging.
        </p>

        {/* Order ID Receipt Card */}
        {orderId && (
          <div className="bg-[#FAF9F6] border border-[#E5E5E5] p-3.5 mb-8 rounded flex flex-col sm:flex-row items-center justify-between gap-2 max-w-md mx-auto text-left">
            <span className="font-sans text-[11px] uppercase tracking-wider text-[#767676]">
              RECEIPT REFERENCE:
            </span>
            <span className="font-mono text-xs font-bold text-[#111111] bg-white px-2.5 py-1 border border-[#E0E0E0] rounded">
              #{orderId}
            </span>
          </div>
        )}

        {/* Security & Shipping Notes */}
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-sans tracking-wider text-[#767676] mb-8">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Complimentary Express Shipping Included</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <Button
            onClick={() => navigate("/shop/account")}
            className="w-full sm:w-auto flex-1 py-3 px-6 bg-[#111111] hover:bg-black text-white font-sans text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-2 rounded-none cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>View Orders</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/shop/listing")}
            className="w-full sm:w-auto flex-1 py-3 px-6 bg-white hover:bg-[#F5F5F5] text-[#111111] border border-[#111111] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-2 rounded-none cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;