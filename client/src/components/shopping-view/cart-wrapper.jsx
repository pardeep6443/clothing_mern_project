import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { ArrowRight, Lock } from "lucide-react";
import { useToast } from "../ui/use-toast";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const { toast } = useToast();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  const totalItemsCount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce((sum, currentItem) => sum + (currentItem?.quantity || 1), 0)
      : 0;

  return (
    <SheetContent className="w-[94vw] max-w-[460px] sm:max-w-md p-4 sm:p-6 bg-white dark:bg-[#121214] border-l border-[#E5E5E5] dark:border-[#27272A] text-[#111111] dark:text-[#EDEDED] flex flex-col justify-between overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        <SheetHeader className="pb-3 sm:pb-4 border-b border-[#E5E5E5] dark:border-[#27272A]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-[#111111] dark:text-[#EDEDED] font-display text-lg sm:text-xl tracking-[0.2em] uppercase font-normal flex items-center gap-2">
              <span>SHOPPING BAG</span>
              {totalItemsCount > 0 && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-full">
                  {totalItemsCount}
                </span>
              )}
            </SheetTitle>
          </div>
          <p className="text-[11px] font-sans text-[#767676] dark:text-[#A1A1AA] tracking-[0.12em] mt-0.5">
            Maison Daylight Atelier
          </p>

          <div className="mt-2.5 px-3 py-1.5 bg-[#FAF9F6] dark:bg-[#18181B] border border-[#EBEBEB] dark:border-[#27272A] rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#111111] dark:text-[#EDEDED] font-medium">
                Complimentary Boutique Delivery
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase">
              FREE
            </span>
          </div>
        </SheetHeader>

        <div className="mt-3.5 sm:mt-4 space-y-3.5 sm:space-y-4 flex-1 overflow-y-auto pr-1">
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <UserCartItemsContent
                key={`${item?.productId || item?._id || index}_${item?.size || "M"}_${index}`}
                cartItem={item}
              />
            ))
          ) : (
            <div className="py-16 text-center text-[#767676] dark:text-[#A1A1AA] font-sans text-xs uppercase tracking-widest border border-dashed border-[#E5E5E5] dark:border-[#27272A] rounded-lg">
              <p className="mb-4">YOUR SHOPPING BAG IS EMPTY</p>
              <button
                type="button"
                onClick={() => setOpenCartSheet(false)}
                className="px-4 py-2 bg-[#111111] dark:bg-white text-white dark:text-black text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                EXPLORE ATELIER
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 sm:pt-5 border-t border-[#E5E5E5] dark:border-[#27272A] space-y-3.5">
        <div className="space-y-1.5 font-sans">
          <div className="flex justify-between items-center text-xs text-[#767676] dark:text-[#A1A1AA]">
            <span className="uppercase tracking-[0.15em]">Subtotal</span>
            <span className="font-medium text-[#111111] dark:text-[#EDEDED]">${totalCartAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-[#767676] dark:text-[#A1A1AA]">
            <span className="uppercase tracking-[0.15em]">Boutique Packaging</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">COMPLIMENTARY</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[#F0F0F0] dark:border-[#27272A]">
            <span className="text-xs uppercase tracking-[0.2em] text-[#111111] dark:text-[#EDEDED] font-medium">ESTIMATED TOTAL</span>
            <span className="text-xl font-medium text-[#111111] dark:text-[#EDEDED]">${totalCartAmount.toFixed(2)}</span>
          </div>
        </div>

        {!user?.id && cartItems && cartItems.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-800 dark:text-amber-300 font-sans tracking-wide bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1.5 border border-amber-200 dark:border-amber-900/50 rounded">
            <Lock className="w-3 h-3 shrink-0" />
            <span>Bag will be saved and waiting when you sign in at checkout</span>
          </div>
        )}

        <p className="text-[10px] font-sans text-[#767676] dark:text-[#A1A1AA] tracking-wider uppercase leading-relaxed">
          Complimentary boutique shipping and luxury art of gifting included.
        </p>

        <button
          disabled={!cartItems || cartItems.length === 0}
          onClick={() => {
            setOpenCartSheet(false);
            if (!user?.id) {
              toast({
                title: "Please Sign In to Complete Order",
                description: "Your bag is saved. Please sign in or register to complete your order.",
              });
              navigate("/auth/login?redirect=/shop/checkout");
              return;
            }
            navigate("/shop/checkout");
          }}
          className="w-full bg-[#111111] dark:bg-white hover:bg-[#2b2b2b] dark:hover:bg-neutral-200 active:scale-[0.99] text-white dark:text-black font-sans text-xs uppercase tracking-[0.25em] font-medium py-3.5 sm:py-4 transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-xs cursor-pointer"
        >
          <span>PROCEED TO ORDER</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setOpenCartSheet(false)}
          className="w-full text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#767676] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white py-1 transition-colors cursor-pointer"
        >
          CONTINUE BROWSING
        </button>
      </div>
    </SheetContent>
  );
}

export default UserCartWrapper;