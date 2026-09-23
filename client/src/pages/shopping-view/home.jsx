import { Button } from "@/components/ui/button";
import { Hero } from "@/contexts/hero";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Eye,
  CheckCircle2,
  Send,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate, Link } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

// Staggered reveal animation variants with refined slow luxury easing
const staggerContainer = (staggerTime = 0.15, delayChildren = 0.1) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: staggerTime,
      delayChildren,
    },
  },
});

const fadeUpItem = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.05,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.15,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const categoriesList = [
  { id: "women", label: "Women's Fashion", count: "18 Creations", desc: "Tailored jackets, dresses & fluid silhouettes" },
  { id: "men", label: "Men's Fashion", count: "24 Creations", desc: "Structured coats, relaxed trousers & fine knits" },
  { id: "accessories", label: "Bags & Leather Goods", count: "12 Creations", desc: "Signature leather bags & luxury hardware" },
  { id: "footwear", label: "Shoes & Footwear", count: "8 Creations", desc: "Architectural heels & luxury leather sneakers" },
];

const lookbookItems = [
  {
    id: 1,
    tag: "LOOK 01 // SS26",
    title: "RAW HEM BLEACHED HOODIE",
    fabric: "480 GSM French Terry",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
    category: "men",
  },
  {
    id: 2,
    tag: "LOOK 02 // SS26",
    title: "VINTAGE WASHED OVERSIZED TEE",
    fabric: "320 GSM Single Jersey",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80",
    category: "women",
  },
  {
    id: 3,
    tag: "LOOK 03 // SS26",
    title: "DISTRESSED TACTICAL CARGO",
    fabric: "Heavyweight Cotton Twill",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
    category: "men",
  },
  {
    id: 4,
    tag: "LOOK 04 // SS26",
    title: "ACID DUST BOMBER JACKET",
    fabric: "Waxed Ripstop Nylon",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=80",
    category: "accessories",
  },
];

const manifestoPoints = [
  {
    num: "I",
    title: "HAUTE SAVOIR-FAIRE",
    desc: "Every creation embodies the pinnacle of atelier craftsmanship. We celebrate nuanced textures and artisanal finishes sculpted into enduring luxury statement pieces.",
  },
  {
    num: "II",
    title: "ARCHITECTURAL TAILORING",
    desc: "A bold balance of structural precision and effortless drape. Custom acid washes and manual hand-distressing fuse raw attitude with haute couture discipline.",
  },
  {
    num: "III",
    title: "TIMELESS ELEGANCE",
    desc: "Created for international runways, nocturnal galas, and discerning modern wardrobes. Uncompromising individuality, elevated by timeless silhouettes.",
  },
];

function EditorialLookbookCard({ look, handleNavigateToListingPage }) {
  const cardRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Screen width below 768px (Tailwind md breakpoint) is considered mobile
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // useInView dynamically detects when the card enters the mobile viewport
  const isInView = useInView(cardRef, {
    margin: "-15% 0px -15% 0px",
    amount: 0.25,
  });

  // Tap toggle for touch interaction on mobile
  const [isTapped, setIsTapped] = useState(false);

  // Active colorful state ONLY on mobile screen sizes (either scrolled into view OR tapped)
  // On laptop / desktop mode, this is strictly false so scrolling up/down never alters the image color
  const isMobileColorActive = isMobile && (isInView || isTapped);

  return (
    <motion.div
      ref={cardRef}
      variants={cardItem}
      onClick={() => {
        if (isMobile) {
          setIsTapped((prev) => !prev);
        }
      }}
      className={cn(
        "group relative bg-white dark:bg-[#121214] border flex flex-col justify-between overflow-hidden shadow-xs transition-all duration-700 select-none cursor-pointer",
        isMobile
          ? isMobileColorActive
            ? "border-[#111111] dark:border-white shadow-md -translate-y-1"
            : "border-[#E5E5E5] dark:border-[#27272A]"
          : "border-[#E5E5E5] dark:border-[#27272A] hover:border-[#111111] dark:hover:border-white hover:-translate-y-1 hover:shadow-md"
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F5] dark:bg-[#18181B]">
        <img
          src={look.image}
          alt={look.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 ease-out",
            isMobile
              ? isMobileColorActive
                ? "grayscale-0 contrast-100 scale-105"
                : "filter grayscale contrast-105"
              : "filter grayscale contrast-105 group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-105"
          )}
        />

        {/* Ambient luxury gradient overlay */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-700",
            isMobile
              ? isMobileColorActive
                ? "opacity-100 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                : "opacity-0"
              : "opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/40 via-transparent to-transparent"
          )}
        />

        {/* Tag & Mobile Active Color Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-xs text-[#111111] dark:text-[#EDEDED] font-sans text-[10px] uppercase tracking-[0.2em] font-medium shadow-xs">
            {look.tag}
          </span>
          {/* Mobile dynamic status pill */}
          <span
            className={cn(
              "md:hidden px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest transition-all duration-500 flex items-center gap-1.5 shadow-xs",
              isMobileColorActive
                ? "bg-[#111111] dark:bg-white text-white dark:text-black opacity-100 scale-100"
                : "opacity-0 scale-90 pointer-events-none"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            COLOR VIVID
          </span>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-[#121214] flex flex-col justify-between flex-1 border-t border-[#E5E5E5] dark:border-[#27272A] transition-colors">
        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#767676] dark:text-[#A1A1AA]">
              {look.fabric}
            </span>
            <span className="md:hidden text-[9px] font-mono text-[#999999] dark:text-[#71717A] uppercase tracking-wider">
              {isMobileColorActive ? "Color revealed" : "Scroll to reveal"}
            </span>
            <span className="hidden md:inline-block text-[9px] font-mono text-[#999999] dark:text-[#71717A] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              Hover to reveal
            </span>
          </div>
          <h3 className="font-display text-base tracking-[0.1em] text-[#111111] dark:text-[#EDEDED] font-normal uppercase leading-snug">
            {look.title}
          </h3>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigateToListingPage({ id: look.category });
          }}
          className={cn(
            "w-full py-2.5 border-t font-sans text-[11px] uppercase tracking-[0.2em] transition-colors flex items-center justify-between cursor-pointer",
            isMobile
              ? isMobileColorActive
                ? "border-[#111111] dark:border-white text-[#111111] dark:text-white font-medium"
                : "border-[#F0F0F0] dark:border-[#27272A] text-[#111111] dark:text-[#EDEDED] hover:text-[#767676] dark:hover:text-[#A1A1AA]"
              : "border-[#F0F0F0] dark:border-[#27272A] text-[#111111] dark:text-[#EDEDED] group-hover:border-[#111111] dark:group-hover:border-white group-hover:text-[#111111] dark:group-hover:text-white"
          )}
        >
          <span>EXPLORE LOOK</span>
          <span
            className={cn(
              "transition-transform duration-300",
              isMobile
                ? isMobileColorActive
                  ? "translate-x-1"
                  : ""
                : "group-hover:translate-x-1"
            )}
          >
            →
          </span>
        </button>
      </div>
    </motion.div>
  );
}

function ShoppingHome() {
  const { productList, productDetails } = useSelector((state) => state.shopProducts);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section = "category") {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing?${section}=${getCurrentItem.id}`);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock, chosenSize) {
    const sizeToUse = chosenSize || "M";
    let getCartItems = cartItems?.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) =>
          (item.productId === getCurrentProductId || item.productId?._id === getCurrentProductId) &&
          (item.size || "") === sizeToUse
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} items remaining in boutique stock`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    const targetProduct = productList?.find(
      (p) => String(p._id || p.id) === String(getCurrentProductId)
    );

    dispatch(
      addToCart({
        userId: user?.id || null,
        productId: getCurrentProductId,
        quantity: 1,
        size: sizeToUse,
        price: targetProduct?.price,
        salePrice: targetProduct?.salePrice,
        title: targetProduct?.title,
        image: typeof targetProduct?.image === "string" ? targetProduct.image : targetProduct?.image?.url || targetProduct?.images?.[0],
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: `Added Size ${sizeToUse} to Bag`,
          description: "Piece reserved in your personal bag.",
        });
      }
    });
  }

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      toast({
        title: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    setEmailSubmitted(true);
    toast({
      title: "WELCOME TO THE MAISON",
      description: "You are now registered for private invitations & runway previews.",
    });
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0B0B0B] text-[#111111] dark:text-[#EDEDED] transition-colors duration-300">
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. DIOR-STYLE MINIMAL LUXURY TICKER */}
      <div className="w-full bg-[#FBFBFB] dark:bg-[#121214] text-[#111111] dark:text-[#EDEDED] py-3.5 border-y border-[#E5E5E5] dark:border-[#27272A] overflow-hidden select-none transition-colors">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-8 font-sans text-xs font-light uppercase tracking-[0.25em] px-6 text-[#444444] dark:text-[#A1A1AA]">
              <span className="text-[#111111] dark:text-[#EDEDED] font-medium">DAYLIGHT MAISON</span>
              <span className="text-[#CCCCCC] dark:text-[#52525B]">•</span>
              <span>HAUTE COUTURE & READY-TO-WEAR</span>
              <span className="text-[#CCCCCC] dark:text-[#52525B]">•</span>
              <span>SUMMER 2026 RUNWAY</span>
              <span className="text-[#CCCCCC] dark:text-[#52525B]">•</span>
              <span>ATELIER SAVOIR-FAIRE</span>
              <span className="text-[#CCCCCC] dark:text-[#52525B]">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. THE COUTURE COLLECTION (CURATED PRODUCTS) */}
      <motion.section 
        id="shop-drop" 
        variants={staggerContainer(0.12, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full"
      >
        <motion.div variants={fadeUpItem} className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#767676] dark:text-[#A1A1AA]">
            READY-TO-WEAR // SS26
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#111111] dark:text-[#EDEDED] font-normal tracking-[0.15em] uppercase">
            ICONIC CREATIONS
          </h2>
          <div className="w-12 h-[1px] bg-[#111111] dark:bg-[#EDEDED] mx-auto my-4" />
          <p className="text-sm font-serif italic text-[#666666] dark:text-[#A1A1AA] leading-relaxed">
            Discover a curation of signature silhouettes, refined through modern tailoring and distressed artistry.
          </p>
        </motion.div>

        {/* Product Grid - Dior Luxury Presentation with Staggered Cards */}
        <motion.div 
          variants={staggerContainer(0.08, 0.15)}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          {productList && productList.length > 0 ? (
            productList.slice(0, 8).map((productItem, index) => (
              <motion.div
                key={`${productItem?._id || productItem?.id || "prod"}-${index}`}
                variants={cardItem}
              >
                <ShoppingProductTile
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                  showWishlist={false}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-[#767676] dark:text-[#A1A1AA] font-sans text-xs uppercase tracking-widest border border-dashed border-[#E5E5E5] dark:border-[#27272A]">
              LOADING ATELIER CREATIONS...
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUpItem} className="mt-16 text-center">
          <Link
            to="/shop/listing"
            onClick={() => {
              sessionStorage.removeItem("filters");
              sessionStorage.setItem("filters", JSON.stringify({}));
              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            }}
            className="inline-block px-10 py-4 border border-[#111111] dark:border-white text-[#111111] dark:text-white hover:bg-[#111111] dark:hover:bg-white hover:text-white dark:hover:text-black font-sans text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300"
          >
            DISCOVER ALL CREATIONS
          </Link>
        </motion.div>
      </motion.section>

      {/* 4. LOOKBOOK SECTION: DIOR EDITORIAL PRESENTATION (Same Images, Dior Feel) */}
      <motion.section 
        id="lookbook" 
        variants={staggerContainer(0.14, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="py-24 bg-[#FBFBFB] dark:bg-[#121214] border-y border-[#E5E5E5] dark:border-[#27272A] transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div variants={fadeUpItem} className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 pb-6 border-b border-[#E5E5E5] dark:border-[#27272A]">
            <div className="space-y-2">
              <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#767676] dark:text-[#A1A1AA]">
                THE CAMPAIGN
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#111111] dark:text-[#EDEDED] font-normal tracking-[0.15em] uppercase">
                EDITORIAL LOOKBOOK
              </h2>
              <p className="text-[#666666] dark:text-[#A1A1AA] font-serif italic text-base max-w-lg">
                Captured during twilight in Paris & Los Angeles. Timeless silhouettes styled with effortless modern poise.
              </p>
              <div className="md:hidden mt-2 flex items-center gap-1.5 text-[10px] font-mono text-[#767676] dark:text-[#A1A1AA] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#111111] dark:text-white" />
                <span>Scroll or tap on mobile to reveal vivid color</span>
              </div>
              <div className="hidden md:flex mt-2 items-center gap-1.5 text-[10px] font-mono text-[#767676] dark:text-[#A1A1AA] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#111111] dark:text-white" />
                <span>Hover over silhouettes to reveal true color</span>
              </div>
            </div>

            <div className="font-sans text-xs uppercase tracking-[0.2em] text-[#111111] dark:text-[#EDEDED] font-medium">
              SUMMER 2026 CAMPAIGN
            </div>
          </motion.div>

          {/* Lookbook Gallery Grid in Dior Clean Luxury Presentation */}
          <motion.div 
            variants={staggerContainer(0.1, 0.2)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {lookbookItems.map((look) => (
              <EditorialLookbookCard
                key={look.id}
                look={look}
                handleNavigateToListingPage={handleNavigateToListingPage}
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* 5. SHOP BY CATEGORY UNIVERSES (Dior Style) */}
      <motion.section 
        variants={staggerContainer(0.12, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full"
      >
        <motion.div variants={fadeUpItem} className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#767676] dark:text-[#A1A1AA]">
            THE UNIVERSES
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#111111] dark:text-[#EDEDED] font-normal tracking-[0.15em] uppercase">
            EXPLORE THE ATELIER
          </h2>
          <div className="w-12 h-[1px] bg-[#111111] dark:bg-[#EDEDED] mx-auto my-3" />
        </motion.div>

        <motion.div 
          variants={staggerContainer(0.08, 0.15)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categoriesList.map((cat, idx) => (
            <motion.div
              key={cat.id}
              variants={cardItem}
              whileHover={{ y: -4 }}
              onClick={() => handleNavigateToListingPage(cat)}
              className="p-8 bg-white dark:bg-[#121214] border border-[#E5E5E5] dark:border-[#27272A] hover:border-[#111111] dark:hover:border-white cursor-pointer transition-all duration-300 flex flex-col justify-between group space-y-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-2xl font-light text-[#999999] dark:text-[#71717A] group-hover:text-[#111111] dark:group-hover:text-white transition-colors">
                  0{idx + 1}
                </span>
                <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#767676] dark:text-[#A1A1AA]">
                  {cat.count}
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl tracking-[0.1em] text-[#111111] dark:text-[#EDEDED] group-hover:text-[#555] dark:group-hover:text-neutral-400 transition-colors uppercase">
                  {cat.label}
                </h3>
                <p className="text-xs font-sans text-[#767676] dark:text-[#A1A1AA] mt-2 leading-relaxed font-light">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F0F0F0] dark:border-[#27272A] flex items-center justify-between text-[11px] font-sans tracking-[0.2em] text-[#111111] dark:text-[#EDEDED] group-hover:text-[#666666] dark:group-hover:text-neutral-400 transition-colors uppercase">
                <span>DISCOVER</span>
                <ChevronRight className="w-4 h-4 text-[#111111] dark:text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* 6. BRAND MANIFESTO SECTION (Dior Savoir-Faire / Heritage Feel) */}
      <motion.section 
        id="manifesto" 
        variants={staggerContainer(0.14, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="py-28 bg-[#FAF9F6] dark:bg-[#0E0E11] border-t border-[#E5E5E5] dark:border-[#27272A] relative overflow-hidden transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <motion.div variants={fadeUpItem} className="max-w-3xl mb-20 space-y-4">
            <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#767676] dark:text-[#A1A1AA]">
              SAVOIR-FAIRE & HERITAGE
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#111111] dark:text-[#EDEDED] font-normal tracking-[0.12em] uppercase leading-tight">
              THE MAISON MANIFESTO
            </h2>
            <div className="w-16 h-[1px] bg-[#111111] dark:bg-[#EDEDED] my-4" />
            <p className="text-base text-[#555555] dark:text-[#A1A1AA] font-serif italic leading-relaxed">
              "True luxury lies in the purity of cut, the nobility of material, and the unwavering conviction to forge one's own signature aesthetic."
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer(0.12, 0.2)}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {manifestoPoints.map((item) => (
              <motion.div
                key={item.num}
                variants={cardItem}
                className="p-8 sm:p-10 bg-white dark:bg-[#121214] border border-[#E5E5E5] dark:border-[#27272A] space-y-6 hover:border-[#111111] dark:hover:border-white transition-all duration-300 shadow-xs"
              >
                <div className="font-serif text-4xl text-[#C5A880] font-light">
                  {item.num}
                </div>
                <h3 className="font-display text-xl tracking-[0.1em] text-[#111111] dark:text-[#EDEDED] font-normal uppercase">
                  {item.title}
                </h3>
                <p className="text-sm font-sans text-[#666666] dark:text-[#A1A1AA] leading-relaxed font-light">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* 7. DIOR-STYLE PRIVILEGE NEWSLETTER */}
      <motion.section 
        variants={staggerContainer(0.1, 0.05)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="py-24 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto w-full text-center"
      >
        <div className="space-y-6">
          <motion.span variants={fadeUpItem} className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#767676] dark:text-[#A1A1AA] block">
            NEWSLETTER
          </motion.span>

          <motion.h2 variants={fadeUpItem} className="font-display text-3xl sm:text-4xl text-[#111111] dark:text-[#EDEDED] font-normal tracking-[0.15em] uppercase">
            JOIN THE MAISON
          </motion.h2>

          <motion.p variants={fadeUpItem} className="text-sm text-[#666666] dark:text-[#A1A1AA] font-serif italic max-w-xl mx-auto leading-relaxed">
            Subscribe to receive exclusive runway invitations, bespoke collection announcements, and private atelier insights.
          </motion.p>

          {emailSubmitted ? (
            <motion.div variants={fadeUpItem} className="p-6 bg-[#F5F5F5] dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] text-[#111111] dark:text-[#EDEDED] font-sans text-xs tracking-wider max-w-md mx-auto">
              <p className="font-medium uppercase tracking-[0.2em] mb-1">PRIVILEGE ACCESS CONFIRMED</p>
              <p className="text-[#666666] dark:text-[#A1A1AA]">Welcome to the DAYLIGHT client directory.</p>
            </motion.div>
          ) : (
            <motion.form variants={fadeUpItem} onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto pt-4">
              <div className="flex border-b border-[#111111] dark:border-[#EDEDED] pb-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ENTER YOUR EMAIL ADDRESS"
                  className="flex-1 bg-transparent text-xs font-sans tracking-[0.2em] uppercase text-[#111111] dark:text-[#EDEDED] placeholder:text-[#999999] dark:placeholder:text-[#71717A] focus:outline-none"
                />
                <button
                  type="submit"
                  className="text-xs font-sans uppercase tracking-[0.25em] font-medium text-[#111111] dark:text-[#EDEDED] hover:text-[#767676] dark:hover:text-[#A1A1AA] transition-colors pl-4 cursor-pointer"
                >
                  SUBSCRIBE
                </button>
              </div>
            </motion.form>
          )}

          <motion.div variants={fadeUpItem} className="flex items-center justify-center gap-6 text-[10px] font-sans uppercase tracking-[0.2em] text-[#999999] dark:text-[#71717A] pt-4">
            <span>COMPLIMENTARY ACCESS</span>
            <span>•</span>
            <span>CONFIDENTIAL DATA</span>
            <span>•</span>
            <span>NO SPAM</span>
          </motion.div>
        </div>
      </motion.section>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;