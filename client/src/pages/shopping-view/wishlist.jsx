import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useWishlist } from "@/contexts/wishlist-context";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { useToast } from "@/components/ui/use-toast";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Eye,
  Check,
  Package,
} from "lucide-react";

export default function ShoppingWishlist() {
  const { items, itemCount, isLoading, removeItem, clearWishlist } = useWishlist();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productDetails } = useSelector((state) => state.shopProducts);
  
  const [selectedSizes, setSelectedSizes] = useState({});
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [isAddingAll, setIsAddingAll] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const handleAddToCart = (item) => {
    const chosenSize = selectedSizes[item.id] || "M";
    const currentStock = item.totalStock ?? 10;

    const existingCartList = cartItems?.items || [];
    const itemInCart = existingCartList.find(
      (c) =>
        (c.productId === item.id || c.productId?._id === item.id) &&
        (c.size || "M") === chosenSize
    );

    if (itemInCart && itemInCart.quantity + 1 > currentStock) {
      toast({
        title: `Maximum quantity (${currentStock}) reached in bag for Size ${chosenSize}`,
        variant: "destructive",
      });
      return;
    }

    setAddingToCartId(item.id);

    dispatch(
      addToCart({
        userId: user?.id || null,
        productId: item.id,
        quantity: 1,
        size: chosenSize,
        price: item.price,
        salePrice: item.salePrice,
        title: item.name || item.title,
        image: item.image,
      })
    ).then((res) => {
      setAddingToCartId(null);
      if (res?.payload?.success) {
        toast({
          title: "Added to Shopping Bag",
          description: `${item.name} (Size ${chosenSize}) added to your bag.`,
        });
      } else {
        toast({
          title: "Unable to add to bag",
          description: res?.payload?.message || "Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleAddAllToCart = async () => {
    if (items.length === 0) return;

    setIsAddingAll(true);
    let addedCount = 0;

    for (const item of items) {
      const chosenSize = selectedSizes[item.id] || "M";
      try {
        const res = await dispatch(
          addToCart({
            userId: user?.id || null,
            productId: item.id,
            quantity: 1,
            size: chosenSize,
            price: item.price,
            salePrice: item.salePrice,
            title: item.name || item.title,
            image: item.image,
          })
        );
        if (res?.payload?.success) {
          addedCount++;
        }
      } catch (err) {
        console.error("Failed adding item:", item.name, err);
      }
    }

    setIsAddingAll(false);
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }

    toast({
      title: "All Items Added to Bag",
      description: `Successfully added ${addedCount} creation${addedCount !== 1 ? "s" : ""} to your shopping bag.`,
    });
  };

  const handleOpenDetails = (productId) => {
    dispatch(fetchProductDetails(productId));
    setOpenDetailsDialog(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B] text-[#111111] dark:text-[#EDEDED] pb-24 transition-colors duration-300">
      {/* Editorial Header Banner */}
      <section className="border-b border-[#EBEBEB] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#121214] pt-20 sm:pt-24 md:pt-28 pb-8 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.3em] text-[#767676] dark:text-[#A1A1AA]">
              <span>Maison Daylight</span>
              <span>•</span>
              <span className="text-[#111111] dark:text-white font-semibold">Client Wardrobe Curation</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#111111] dark:text-[#EDEDED]">
              Saved Pieces & Wishlist
            </h1>
            <p className="font-sans text-xs text-[#666666] dark:text-[#A1A1AA] max-w-xl leading-relaxed tracking-wide">
              Your personalized atelier selections, runway desires, and bespoke pieces reserved for your wardrobe consultation.
            </p>
          </div>

          {itemCount > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={clearWishlist}
                className="px-4 py-2.5 border border-[#D4D4D4] dark:border-[#3F3F46] text-[#111111] dark:text-[#EDEDED] hover:border-black dark:hover:border-white font-sans text-xs uppercase tracking-[0.15em] transition-colors cursor-pointer"
              >
                Clear Wishlist
              </button>
              <button
                type="button"
                onClick={handleAddAllToCart}
                disabled={isAddingAll}
                className="px-5 py-2.5 bg-[#111111] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {isAddingAll ? "Adding All..." : `Add All to Bag (${itemCount})`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-10">
        {isLoading && itemCount === 0 ? (
          /* Loading State while fetching from MongoDB */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="border border-[#EBEBEB] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#121214] p-4 space-y-4">
                <div className="aspect-3/4 bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-3/4" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 w-1/2" />
                <div className="h-8 bg-neutral-200 dark:bg-neutral-800 w-full" />
              </div>
            ))}
          </div>
        ) : itemCount === 0 ? (
          /* Empty Wishlist State */
          <div className="py-20 text-center max-w-lg mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#FAFAFA] dark:bg-[#18181B] border border-[#EBEBEB] dark:border-[#27272A] flex items-center justify-center">
              <Heart className="w-8 h-8 text-[#999999] dark:text-[#71717A] stroke-[1.2]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#888888] dark:text-[#A1A1AA]">
                Empty Collection
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#111111] dark:text-[#EDEDED] font-light">
                Your Wishlist is Currently Empty
              </h2>
              <p className="text-xs font-sans text-[#666666] dark:text-[#A1A1AA] leading-relaxed">
                You haven't saved any creations yet. Discover our latest ready-to-wear silhouettes, bespoke tailoring, and accessories to start curating your look.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate("/shop/listing")}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-md cursor-pointer"
              >
                <span>Explore The Boutique</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Universe Jump Buttons */}
            <div className="pt-10 border-t border-[#EBEBEB] dark:border-[#27272A] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-sans uppercase tracking-widest text-[#555555] dark:text-[#A1A1AA]">
              <Link
                to="/shop/listing"
                className="p-3 border border-[#EBEBEB] dark:border-[#27272A] hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
              >
                Women's
              </Link>
              <Link
                to="/shop/listing"
                className="p-3 border border-[#EBEBEB] dark:border-[#27272A] hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
              >
                Men's
              </Link>
              <Link
                to="/shop/listing"
                className="p-3 border border-[#EBEBEB] dark:border-[#27272A] hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
              >
                Bags
              </Link>
              <Link
                to="/shop/listing"
                className="p-3 border border-[#EBEBEB] dark:border-[#27272A] hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
              >
                Footwear
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBEBEB] dark:border-[#27272A]">
              <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#767676] dark:text-[#A1A1AA]">
                {itemCount} {itemCount === 1 ? "Creation" : "Creations"} Saved
              </span>
              <button
                onClick={() => navigate("/shop/listing")}
                className="text-xs font-sans uppercase tracking-[0.15em] text-[#111111] dark:text-[#EDEDED] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, index) => {
                const currentStock = item.totalStock ?? 10;
                const isOutOfStock = currentStock === 0;
                const chosenSize = selectedSizes[item.id] || "M";
                const isItemAdding = addingToCartId === item.id;

                return (
                  <div
                    key={`${item.id || "wish"}-${index}`}
                    className="group bg-white dark:bg-[#121214] border border-[#E5E5E5] dark:border-[#27272A] hover:border-[#111111] dark:hover:border-white transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] bg-[#F7F7F7] dark:bg-[#1C1C1F] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Remove from Wishlist Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.name)}
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black text-rose-600 border border-gray-200 dark:border-neutral-700 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                        title="Remove from Wishlist"
                        aria-label={`Remove ${item.name} from wishlist`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Sale or Limited Badge */}
                      {isOutOfStock ? (
                        <span className="absolute top-3 left-3 bg-[#111111]/90 dark:bg-white/90 text-white dark:text-black font-sans text-[9px] uppercase tracking-[0.2em] px-2.5 py-1">
                          SOLD OUT
                        </span>
                      ) : item.salePrice && item.salePrice < item.price ? (
                        <span className="absolute top-3 left-3 bg-[#111111] dark:bg-white text-white dark:text-black font-sans text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 font-medium">
                          PRIVILEGE
                        </span>
                      ) : null}

                      {/* Quick View Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(item.id)}
                        className="absolute inset-x-3 bottom-3 py-2 bg-white/95 dark:bg-[#18181B]/95 hover:bg-white dark:hover:bg-black text-[#111111] dark:text-white border border-[#111111] dark:border-white font-sans text-[10px] uppercase tracking-[0.2em] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Quick View
                      </button>
                    </div>

                    {/* Details Container */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {item.category && (
                          <span className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#767676] dark:text-[#A1A1AA] block mb-1">
                            {item.category}
                          </span>
                        )}
                        <h3
                          onClick={() => handleOpenDetails(item.id)}
                          className="font-serif text-sm font-normal text-[#111111] dark:text-[#EDEDED] line-clamp-1 cursor-pointer hover:underline"
                        >
                          {item.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center gap-2 mt-1 font-sans text-xs">
                          {item.salePrice && item.salePrice < item.price ? (
                            <>
                              <span className="font-semibold text-[#111111] dark:text-white">
                                ${item.salePrice}
                              </span>
                              <span className="line-through text-[#999999] dark:text-[#71717A]">
                                ${item.price}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-[#111111] dark:text-white">
                              ${item.price}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Size Selector */}
                      <div className="pt-2 border-t border-[#F0F0F0] dark:border-[#27272A] space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-sans text-[#767676] dark:text-[#A1A1AA] uppercase tracking-wider">
                          <span>Size:</span>
                          <span className="font-semibold text-[#111111] dark:text-white">{chosenSize}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {["XS", "S", "M", "L", "XL"].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSizeChange(item.id, sz)}
                              className={`flex-1 py-1 text-[10px] font-mono border transition-colors cursor-pointer ${
                                chosenSize === sz
                                  ? "border-[#111111] dark:border-white bg-[#111111] dark:bg-white text-white dark:text-black font-semibold"
                                  : "border-[#E5E5E5] dark:border-[#27272A] text-[#555555] dark:text-[#A1A1AA] hover:border-[#999999] dark:hover:border-neutral-500"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Add to Bag CTA */}
                      <button
                        type="button"
                        disabled={isOutOfStock || isItemAdding}
                        onClick={() => handleAddToCart(item)}
                        className={`w-full py-2.5 font-sans text-xs uppercase tracking-[0.15em] font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                          isOutOfStock
                            ? "bg-[#EBEBEB] dark:bg-[#27272A] text-[#999999] dark:text-[#71717A] cursor-not-allowed"
                            : "bg-[#111111] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black active:scale-[0.99]"
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {isOutOfStock
                          ? "Sold Out"
                          : isItemAdding
                          ? "Adding..."
                          : "Move to Bag"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}
