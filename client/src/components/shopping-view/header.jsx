import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { Search, ShoppingBag, Heart, User, LogOut, UserCog, Menu, X, ChevronRight, ArrowRight, Sparkles, Sun, Moon } from "lucide-react";
import { Sheet } from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import { fetchCartItems, resetCart } from "@/store/shop/cart-slice";
import UserCartWrapper from "./cart-wrapper";
import { useWishlist } from "@/contexts/wishlist-context";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ShoppingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const searchInputRef = useRef(null);
  
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { items: wishlistItems } = useWishlist();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleLogout() {
    dispatch(logoutUser());
    dispatch(resetCart());
    setIsOpen(false);
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user?.id));
    } else {
      dispatch(fetchCartItems(null));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showQuickSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showQuickSearch]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setIsOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  function handleNavigate(menuItem) {
    setIsOpen(false);
    setShowQuickSearch(false);
    if (menuItem.id === "home") {
      navigate("/shop/home");
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } else if (menuItem.id === "products" || menuItem.id === "shop" || menuItem.id === "all") {
      sessionStorage.removeItem("filters");
      sessionStorage.setItem("filters", JSON.stringify({}));
      if (location.pathname.includes("listing")) {
        setSearchParams(new URLSearchParams(""));
      } else {
        navigate("/shop/listing");
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } else if (menuItem.id === "lookbook") {
      if (location.pathname !== "/shop/home") {
        navigate("/shop/home#lookbook");
      } else {
        const el = document.getElementById("lookbook");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else if (menuItem.id === "manifesto") {
      if (location.pathname !== "/shop/home") {
        navigate("/shop/home#manifesto");
      } else {
        const el = document.getElementById("manifesto");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else if (menuItem.id === "search") {
      navigate("/shop/search");
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } else {
      const currentFilter = {
        category: [menuItem.id],
      };
      sessionStorage.setItem("filters", JSON.stringify(currentFilter));
      if (location.pathname.includes("listing")) {
        setSearchParams(new URLSearchParams(`category=${menuItem.id}`));
      } else {
        navigate(`/shop/listing?category=${menuItem.id}`);
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setShowQuickSearch(false);
      setIsOpen(false);
    }
  }

  const fashionCategories = [
    { id: "gifts", targetId: "accessories", label: "Gifts" },
    { id: "new", targetId: "all", label: "What's New" },
    { id: "women", targetId: "women", label: "Women's Fashion" },
    { id: "men", targetId: "men", label: "Men's Fashion" },
    { id: "bags", targetId: "accessories", label: "Bags" },
    { id: "jewelry", targetId: "accessories", label: "Jewelry & Timepieces" },
    { id: "couture", targetId: "all", label: "Haute Couture" },
    { id: "world", targetId: "lookbook", label: "Daylight World & Fashion Shows" },
  ];

  const primaryCategories = [
    { id: "women", label: "Women's Fashion" },
    { id: "men", label: "Men's Fashion" },
    { id: "accessories", label: "Bags & Accessories" },
    { id: "footwear", label: "Footwear" },
    { id: "lookbook", label: "Lookbook" },
    { id: "manifesto", label: "The Maison" },
  ];

  const quickSearchTags = ["Jackets", "Dresses", "Bags", "Men", "Footwear", "Leather"];

  const totalCartCount =
    cartItems?.items?.reduce((sum, item) => sum + (item?.quantity || 1), 0) || 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        {/* Dior Top Announcement Bar */}
        <div className="w-full bg-[#111111] text-[#FFFFFF] py-1 sm:py-1.5 px-3 text-center text-[9px] sm:text-[10px] font-sans tracking-[0.14em] sm:tracking-[0.18em] transition-all duration-300">
          <span>Complimentary Express Shipping & Signature Packaging</span>
        </div>

        {/* Dior Main Header */}
        <div
          className={`w-full transition-all duration-300 ${
            isScrolled
              ? "bg-white/95 dark:bg-[#0B0B0B]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#27272A] shadow-xs py-1 sm:py-1.5 lg:py-1"
              : "bg-white dark:bg-[#0B0B0B] border-b border-[#EFEFEF] dark:border-[#27272A] py-1.5 sm:py-2 lg:py-1.5"
          }`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Left: Dior 2-line Menu & Desktop Search */}
            <div className="flex items-center gap-2 sm:gap-3.5 lg:gap-4 min-w-0">
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 sm:gap-2.5 text-[#111111] dark:text-[#EDEDED] p-1 sm:py-0.5 group focus:outline-none shrink-0 cursor-pointer select-none"
                aria-label="Open navigation menu"
              >
                {/* Dior signature 2-bar menu icon */}
                <div className="flex flex-col justify-center gap-[5px] w-[18px] py-1">
                  <span className="w-full h-[1.25px] bg-[#111111] dark:bg-[#EDEDED] transition-all duration-200 group-hover:w-[15px]" />
                  <span className="w-full h-[1.25px] bg-[#111111] dark:bg-[#EDEDED] transition-all duration-200 group-hover:w-[18px]" />
                </div>
                <span className="hidden sm:inline font-sans text-[12px] tracking-[0.06em] font-normal relative">
                  Menu
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#111111] dark:bg-[#EDEDED] transition-all duration-500 ease-[0.25,0.1,0.25,1] group-hover:w-full" />
                </span>
              </button>

              <button
                onClick={() => setShowQuickSearch(!showQuickSearch)}
                className="hidden md:flex items-center gap-1.5 text-[#111111] dark:text-[#EDEDED] hover:text-[#767676] dark:hover:text-[#A1A1AA] transition-colors py-0.5 focus:outline-none cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="font-sans text-[11px] tracking-[0.12em] font-normal text-[#555555] dark:text-[#A1A1AA]">
                  Search
                </span>
              </button>
            </div>

            {/* Center: Brand Wordmark (Literature font) */}
            <div className="text-center px-1">
              <Link
                to="/shop/home"
                aria-label="Daylight Home"
                className="inline-block font-literature text-lg sm:text-xl md:text-[24px] lg:text-[26px] tracking-[0.18em] sm:tracking-[0.22em] font-normal text-[#111111] dark:text-[#EDEDED] hover:opacity-85 transition-opacity leading-none select-none"
              >
                DAYLIGHT
              </Link>
            </div>

            {/* Right: Search, Wishlist, Account, Shopping Bag */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5 shrink-0">
              {/* Search trigger on mobile/tablet */}
              <button
                onClick={() => {
                  navigate("/shop/search");
                }}
                className="p-1 sm:p-1.5 text-[#111111] dark:text-[#EDEDED] hover:text-[#767676] dark:hover:text-[#A1A1AA] transition-colors focus:outline-none cursor-pointer"
                title="Search Products"
                aria-label="Search Creations"
              >
                <Search className="w-4 h-4 sm:w-[17px] sm:h-[17px] stroke-[1.5]" />
              </button>

              {/* Dedicated Wishlist Icon */}
              <button
                onClick={() => {
                  navigate("/shop/wishlist");
                }}
                className="relative p-1 sm:p-1.5 text-[#111111] dark:text-[#EDEDED] hover:text-[#767676] dark:hover:text-[#A1A1AA] transition-colors focus:outline-none cursor-pointer"
                title={`Saved Wishlist (${wishlistItems?.length || 0})`}
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 sm:w-[17px] sm:h-[17px] stroke-[1.5] transition-transform duration-200 active:scale-125 ${
                    wishlistItems && wishlistItems.length > 0
                      ? "fill-red-500 text-red-500"
                      : "text-[#111111] dark:text-[#EDEDED]"
                  }`}
                />
                {wishlistItems && wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-sans rounded-full min-w-[14px] h-[14px] px-0.5 flex items-center justify-center font-semibold shadow-xs">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              {/* Theme Toggle (Light / Dark / Auto System) */}
              <ThemeToggle className="text-[#111111] dark:text-[#EDEDED]" />

              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 sm:p-1.5 text-[#111111] dark:text-[#EDEDED] hover:text-[#767676] dark:hover:text-[#A1A1AA] transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                    aria-label="User Account"
                    title={user?.userName ? `Account: ${user.userName}` : "Client Account"}
                  >
                    {user?.userName ? (
                      <Avatar className="h-5 w-5 sm:h-5.5 sm:w-5.5 border border-[#111111]/30 dark:border-white/30">
                        <AvatarFallback className="bg-[#111111] dark:bg-[#EDEDED] text-white dark:text-[#111111] font-sans text-[9px] sm:text-[10px] font-semibold tracking-wider">
                          {user.userName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <User className="w-4 h-4 sm:w-[17px] sm:h-[17px] stroke-[1.5]" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  className="w-60 bg-white dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] text-[#111111] dark:text-[#EDEDED] shadow-2xl p-2 rounded-none z-[60]"
                >
                  <DropdownMenuLabel className="text-[#767676] dark:text-[#A1A1AA] font-sans text-[10px] tracking-[0.2em] uppercase py-1.5">
                    {user?.userName ? `MAISON CLIENT // ${user.userName}` : "MAISON CLIENT SPACE"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#E5E5E5] dark:bg-[#27272A]" />
                  <DropdownMenuItem
                    onClick={() => navigate("/shop/account")}
                    className="cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#27272A] py-2.5 font-sans text-xs tracking-[0.05em] flex items-center gap-2.5 rounded-none"
                  >
                    <UserCog className="h-4 w-4 text-[#111111] dark:text-[#EDEDED]" />
                    <span>My Account & Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/shop/wishlist")}
                    className="cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#27272A] py-2.5 font-sans text-xs tracking-[0.05em] flex items-center gap-2.5 rounded-none"
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    <span>My Wishlist ({wishlistItems?.length || 0})</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/shop/listing")}
                    className="cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#27272A] py-2.5 font-sans text-xs tracking-[0.05em] flex items-center gap-2.5 rounded-none"
                  >
                    <ShoppingBag className="h-4 w-4 text-[#111111] dark:text-[#EDEDED]" />
                    <span>Haute Couture Collection</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#E5E5E5] dark:bg-[#27272A]" />
                  {user?.id ? (
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer hover:bg-[#FAF0F0] dark:hover:bg-red-950/40 text-[#990000] dark:text-red-400 py-2.5 font-sans text-xs tracking-[0.05em] flex items-center gap-2.5 rounded-none"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => navigate("/auth/login")}
                      className="cursor-pointer hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-black bg-[#F9F9F9] dark:bg-[#27272A] py-2.5 font-sans text-xs tracking-[0.08em] uppercase font-medium flex items-center gap-2.5 rounded-none transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>Client Sign In / Register</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Shopping Bag Trigger */}
              <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
                <button
                  onClick={() => setOpenCartSheet(true)}
                  className="flex items-center gap-1 text-[#111111] dark:text-[#EDEDED] hover:text-[#767676] dark:hover:text-[#A1A1AA] transition-colors p-1 sm:p-1.5 focus:outline-none cursor-pointer"
                  aria-label="Shopping Bag"
                  title="Shopping Bag"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-[17px] sm:h-[17px] stroke-[1.5]" />
                  <span className="font-sans text-[10px] sm:text-[11px] tracking-wider font-medium text-[#111111] dark:text-[#EDEDED]">
                    ({totalCartCount})
                  </span>
                </button>

                <UserCartWrapper
                  setOpenCartSheet={setOpenCartSheet}
                  cartItems={
                    cartItems && cartItems.items && cartItems.items.length > 0
                      ? cartItems.items
                      : []
                  }
                />
              </Sheet>
            </div>
          </div>

          {/* Dior Sub-Nav Links - refined compact spacing with 1st letter capital */}
          <div className="hidden lg:flex items-center justify-center gap-5 xl:gap-6 mt-1 pt-1 border-t border-[#F0F0F0] dark:border-[#27272A] transition-colors">
            {primaryCategories.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item)}
                className="font-sans text-[11px] tracking-[0.1em] text-[#444444] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white transition-colors relative py-0.5 group cursor-pointer font-medium"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#111111] dark:bg-white transition-all duration-500 ease-[0.25,0.1,0.25,1] group-hover:w-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Search Slide-Down Bar */}
        <AnimatePresence>
          {showQuickSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#121214] border-b border-[#E5E5E5] dark:border-[#27272A] shadow-lg overflow-hidden transition-colors"
            >
              <div className="max-w-3xl mx-auto px-4 py-2 sm:py-2.5">
                <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-[#111111] dark:border-[#EDEDED] pb-1.5">
                  <Search className="w-3.5 h-3.5 text-[#767676] dark:text-[#A1A1AA] mr-2.5" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search creations, collections, runways, products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs font-sans tracking-[0.05em] placeholder:text-[#999999] dark:placeholder:text-[#71717A] focus:outline-none text-[#111111] dark:text-[#EDEDED]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-[#999999] dark:text-[#71717A] hover:text-[#111111] dark:hover:text-white mr-2 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="text-[11px] font-sans tracking-[0.12em] font-medium text-[#111111] dark:text-[#EDEDED] hover:text-[#767676] dark:hover:text-[#A1A1AA] pl-2 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </form>

                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
                  <span className="font-sans text-[10px] tracking-[0.1em] text-[#999999] dark:text-[#71717A] shrink-0 font-medium">
                    Suggestions:
                  </span>
                  {quickSearchTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        navigate(`/shop/search?keyword=${encodeURIComponent(tag.toLowerCase())}`);
                        setShowQuickSearch(false);
                      }}
                      className="px-2.5 py-0.5 bg-[#F5F5F5] dark:bg-[#1C1C1F] hover:bg-[#111111] dark:hover:bg-white hover:text-white dark:hover:text-black font-sans text-[10px] tracking-[0.08em] text-[#444444] dark:text-[#EDEDED] transition-colors shrink-0 cursor-pointer rounded-none"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Dior Full Screen / Slide Navigation Drawer with exact Dior animation & smooth blur */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dior Backdrop with smooth laptop Gaussian blur and atmospheric veil */}
            <motion.div
              key="dior-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{
                willChange: "opacity",
                transform: "translateZ(0)",
              }}
              className="fixed inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-md sm:backdrop-blur-lg md:backdrop-blur-xl lg:backdrop-blur-2xl z-50 cursor-pointer"
              onClick={() => setIsOpen(false)}
            />

            {/* Dior Haute Couture Navigation Drawer Container */}
            <motion.aside
              key="dior-drawer-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.38,
                ease: [0.16, 1, 0.3, 1], // Dior signature smooth deceleration curve
              }}
              style={{
                willChange: "transform",
                transform: "translateZ(0)",
                WebkitBackfaceVisibility: "hidden",
              }}
              className="fixed top-0 left-0 bottom-0 w-full sm:w-[380px] md:w-[410px] lg:w-[430px] bg-white dark:bg-[#121214] sm:rounded-r-2xl border-r border-[#E8E8E8] dark:border-[#27272A] shadow-[12px_0_48px_rgba(0,0,0,0.14)] overflow-y-auto text-[#111111] dark:text-[#EDEDED] z-50 select-none overscroll-contain flex flex-col justify-between"
            >
              <div className="p-5 sm:p-6 flex flex-col justify-between min-h-full">
                <div>
                  {/* Dior Top Header Bar: '✕ Close' on left, brand & theme toggle on right */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0] dark:border-[#27272A]">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-2 py-1 text-[#111111] dark:text-[#EDEDED] cursor-pointer focus:outline-none select-none"
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4 stroke-[1.5] transition-transform duration-300 group-hover:scale-110" />
                      <span className="font-sans text-[13px] tracking-[0.03em] font-normal relative">
                        Close
                        <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#111111] dark:bg-[#EDEDED] transition-all duration-500 ease-[0.25,0.1,0.25,1] group-hover:w-full" />
                      </span>
                    </button>

                    <div className="flex items-center gap-2.5">
                      <span className="font-literature text-lg tracking-[0.2em] font-normal text-[#111111] dark:text-[#EDEDED]">
                        DAYLIGHT
                      </span>
                      <ThemeToggle compact className="border border-[#E5E5E5] dark:border-[#27272A]" />
                    </div>
                  </div>

                  {/* Compact Search Bar in Drawer */}
                  <form
                    onSubmit={handleSearchSubmit}
                    className="my-3 border border-[#E5E5E5] dark:border-[#27272A] bg-[#FAF9F6] dark:bg-[#18181B] px-2.5 py-1.5 flex items-center"
                  >
                    <Search className="w-3.5 h-3.5 text-[#767676] dark:text-[#A1A1AA] mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search creations, runways..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs font-sans tracking-[0.03em] placeholder:text-[#999999] dark:placeholder:text-[#71717A] focus:outline-none text-[#111111] dark:text-[#EDEDED]"
                    />
                    <button
                      type="submit"
                      className="p-1 text-[#111111] dark:text-[#EDEDED] hover:text-[#555555] transition-colors shrink-0 ml-1 cursor-pointer"
                      aria-label="Submit search"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </form>

                  {/* Dior Categories List */}
                  <nav className="divide-y divide-[#F5F5F5] dark:divide-[#222225] pt-1">
                    {fashionCategories.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          handleNavigate({ id: item.targetId || item.id, label: item.label });
                        }}
                        className="group flex items-center justify-between py-2 sm:py-2.5 px-1 cursor-pointer select-none"
                      >
                        {/* Dior exact text-only underline on hover without moving text */}
                        <span className="font-sans text-[14px] sm:text-[15px] font-normal tracking-[0.01em] text-[#111111] dark:text-[#EDEDED] relative">
                          <span className="inline-block relative">
                            {item.label}
                            <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#111111] dark:bg-[#EDEDED] transition-all duration-500 ease-[0.25,0.1,0.25,1] group-hover:w-full" />
                          </span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#999999] dark:text-[#71717A] stroke-[1.25] shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </nav>

                  {/* Secondary items matching Dior reference */}
                  <div className="pt-4 mt-2 border-t border-[#F0F0F0] dark:border-[#27272A] space-y-2">
                    {/* Log in / Account */}
                    {user?.userName ? (
                      <div className="space-y-1">
                        <div
                          onClick={() => {
                            navigate("/shop/account");
                            setIsOpen(false);
                          }}
                          className="group flex items-center justify-between py-1 px-1 cursor-pointer"
                        >
                          <span className="font-sans text-[13px] text-[#111111] dark:text-[#EDEDED] relative">
                            <span className="inline-block relative">
                              Maison Client ({user.userName})
                              <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#111111] dark:bg-[#EDEDED] transition-all duration-500 ease-[0.25,0.1,0.25,1] group-hover:w-full" />
                            </span>
                          </span>
                          <span className="text-[10px] text-[#888888] dark:text-[#A1A1AA] font-sans">Orders & Profile</span>
                        </div>
                        <div
                          onClick={handleLogout}
                          className="py-1 px-1 text-[11px] text-[#990000] dark:text-red-400 font-sans cursor-pointer hover:underline"
                        >
                          Sign Out
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          navigate("/auth/login");
                          setIsOpen(false);
                        }}
                        className="group flex items-center justify-between py-1 px-1 cursor-pointer"
                      >
                        <span className="font-sans text-[13px] text-[#111111] dark:text-[#EDEDED] relative">
                          <span className="inline-block relative">
                            Log in
                            <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#111111] dark:bg-[#EDEDED] transition-all duration-500 ease-[0.25,0.1,0.25,1] group-hover:w-full" />
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Wishlist */}
                    <div
                      onClick={() => {
                        navigate("/shop/wishlist");
                        setIsOpen(false);
                      }}
                      className="group flex items-center justify-between py-1 px-1 cursor-pointer"
                    >
                      <span className="font-sans text-[13px] text-[#111111] dark:text-[#EDEDED] relative">
                        <span className="inline-block relative">
                          Wishlist {wishlistItems?.length ? `(${wishlistItems.length})` : ""}
                          <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#111111] dark:bg-[#EDEDED] transition-all duration-500 ease-[0.25,0.1,0.25,1] group-hover:w-full" />
                        </span>
                      </span>
                    </div>

                    {/* Contact */}
                    <div
                      onClick={() => {
                        navigate("/shop/account");
                        setIsOpen(false);
                      }}
                      className="group flex items-center justify-between py-1 px-1 cursor-pointer"
                    >
                      <span className="font-sans text-[13px] text-[#111111] dark:text-[#EDEDED] relative">
                        <span className="inline-block relative">
                          Contact
                          <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#111111] dark:bg-[#EDEDED] transition-all duration-500 ease-[0.25,0.1,0.25,1] group-hover:w-full" />
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Maison subtle signature */}
                <div className="pt-4 mt-auto border-t border-[#F0F0F0] dark:border-[#27272A] text-center">
                  <p className="text-[10px] text-[#999999] dark:text-[#71717A] tracking-[0.14em] font-sans">
                    DAYLIGHT MAISON DE HAUTE COUTURE PARIS
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}