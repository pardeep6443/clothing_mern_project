import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) =>
            item.productId === getCartItem?.productId &&
            (item.size || "") === (getCartItem?.size || "")
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        const getTotalStock = getCurrentProductIndex > -1 ? (productList[getCurrentProductIndex]?.totalStock || 999) : 999;

        console.log(getTotalStock)
        console.log(getCurrentProductIndex, getTotalStock, "getTotalStock");

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getQuantity} quantity can be added for this item`,
              variant: "destructive",
            });

            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
        size: getCartItem?.size || "",
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId: getCartItem?.productId,
        size: getCartItem?.size || "",
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  }

  return (
    <div className="group relative flex gap-3.5 sm:gap-4 p-3.5 sm:p-4 bg-[#FAF9F6] dark:bg-[#18181B] border border-[#EBEBEB] dark:border-[#27272A] rounded-xl sm:rounded-lg shadow-2xs hover:border-[#111111]/30 dark:hover:border-white/30 transition-all duration-200">
      <div className="w-20 h-24 sm:w-18 sm:h-22 rounded-lg sm:rounded-md overflow-hidden border border-[#E5E5E5] dark:border-[#27272A] bg-white dark:bg-[#121214] shrink-0 relative">
        <img
          src={cartItem?.image}
          alt={cartItem?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-medium text-xs sm:text-xs uppercase tracking-wider text-[#111111] dark:text-[#EDEDED] leading-snug line-clamp-2">
              {cartItem?.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#111111] dark:bg-white text-white dark:text-black rounded">
                Size: {cartItem?.size || "M"}
              </span>
              {cartItem?.isPreOrder && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-amber-600 text-white rounded">
                  Pre-Order
                </span>
              )}
              <span className="text-xs text-[#767676] dark:text-[#A1A1AA] font-sans">
                ${cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price} each
              </span>
            </div>
            {cartItem?.isPreOrder && cartItem?.preOrderReleaseDate && (
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-mono mt-1">
                Est. release: {cartItem.preOrderReleaseDate}
              </p>
            )}
          </div>

          <button
            onClick={() => handleCartItemDelete(cartItem)}
            className="text-[#999999] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 -mr-1 -mt-1 rounded-full transition-colors shrink-0 cursor-pointer"
            aria-label="Remove item"
          >
            <Trash size={15} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#EBEBEB]/80 dark:border-[#27272A] sm:border-0 sm:pt-0 sm:mt-2">
          <div className="flex items-center bg-white dark:bg-[#121214] rounded-md p-0.5 border border-[#E5E5E5] dark:border-[#27272A] shadow-2xs">
            <Button
              variant="ghost"
              className="h-7 w-7 sm:h-6 sm:w-6 rounded-xs hover:bg-[#111111] dark:hover:bg-white hover:text-white dark:hover:text-black text-[#111111] dark:text-[#EDEDED] p-0 disabled:opacity-30 transition-all active:scale-95"
              size="icon"
              disabled={cartItem?.quantity === 1}
              onClick={() => handleUpdateQuantity(cartItem, "minus")}
            >
              <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              <span className="sr-only">Decrease</span>
            </Button>
            <span className="font-mono text-xs font-semibold text-[#111111] dark:text-[#EDEDED] px-2.5 text-center min-w-[28px]">
              {cartItem?.quantity}
            </span>
            <Button
              variant="ghost"
              className="h-7 w-7 sm:h-6 sm:w-6 rounded-xs hover:bg-[#111111] dark:hover:bg-white hover:text-white dark:hover:text-black text-[#111111] dark:text-[#EDEDED] p-0 transition-all active:scale-95"
              size="icon"
              onClick={() => handleUpdateQuantity(cartItem, "plus")}
            >
              <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              <span className="sr-only">Increase</span>
            </Button>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#767676] dark:text-[#A1A1AA] block sm:hidden">
              Total
            </span>
            <p className="font-sans font-semibold text-sm sm:text-xs text-[#111111] dark:text-[#EDEDED]">
              $
              {(
                (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
                cartItem?.quantity
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCartItemsContent;