// import { HousePlug, LogOut, Menu, ShoppingCart, UserCog } from "lucide-react";
// import {
//   Link,
//   useLocation,
//   useNavigate,
//   useSearchParams,
// } from "react-router-dom";
// import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
// import { Button } from "../ui/button";
// import { useDispatch, useSelector } from "react-redux";
// import { shoppingViewHeaderMenuItems } from "@/config";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import { Avatar, AvatarFallback } from "../ui/avatar";
// import { logoutUser } from "@/store/auth-slice";
// import UserCartWrapper from "./cart-wrapper";
// import { useEffect, useState } from "react";
// import { fetchCartItems } from "@/store/shop/cart-slice";
// import { Label } from "../ui/label";
// import { motion } from "framer-motion";

// function MenuItems() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const [isScrolled, setIsScrolled] = useState(false);

//   function handleNavigate(getCurrentMenuItem) {
//     sessionStorage.removeItem("filters");
//     const currentFilter =
//       getCurrentMenuItem.id !== "home" &&
//         getCurrentMenuItem.id !== "products" &&
//         getCurrentMenuItem.id !== "search"
//         ? {
//           category: [getCurrentMenuItem.id],
//         }
//         : null;

//     sessionStorage.setItem("filters", JSON.stringify(currentFilter));

//     location.pathname.includes("listing") && currentFilter !== null
//       ? setSearchParams(
//         new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
//       )
//       : navigate(getCurrentMenuItem.path);
//   }

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <motion.nav className={`flex lg:items-center lg:flex-row flex-col gap-6 transition-all duration-300${isScrolled
//       ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
//       : 'bg-transparent'
//       }`}
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       transition={{ type: "spring", stiffness: 300, damping: 30 }}
//     >
//       {shoppingViewHeaderMenuItems.map((menuItem) => (
//         <motion.Label
//           onClick={() => handleNavigate(menuItem)}
//           className="text-sm font-medium cursor-pointer pt-1 p-1"

//           whileTap={{ scale: 1.2 }}
//           whileHover={{ scale: 0.98 }}

//           key={menuItem.id}
//         >
//           {menuItem.label}
//         </motion.Label>
//       ))}
//     </motion.nav>
//   );
// }

// function HeaderRightContent() {
//   const { user } = useSelector((state) => state.auth);
//   const { cartItems } = useSelector((state) => state.shopCart);
//   const [openCartSheet, setOpenCartSheet] = useState(false);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   function handleLogout() {
//     dispatch(logoutUser());
//   }

//   useEffect(() => {
//     dispatch(fetchCartItems(user?.id));
//   }, [dispatch]);

//   console.log(cartItems, "sangam");

//   return (
//     <div className="flex lg:items-center lg:flex-row flex-col gap-6 p-1">
//       <motion.div whileTap={{ scale: 0.98 }}
//         whileHover={{ scale: 0.98 }}
//       >
//         <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
//           <Button
//             onClick={() => setOpenCartSheet(true)}
//             variant="outline"
//             size="icon"
//             className="relative cursor-pointer"
//           >
//             <ShoppingCart className="w-6 h-6" />
//             <span className="absolute top-[-5px] right-[2px] font-bold text-sm">
//               {cartItems?.items?.length || 0}
//             </span>
//             <span className="sr-only">User cart</span>
//           </Button>
//           <UserCartWrapper
//             setOpenCartSheet={setOpenCartSheet}
//             cartItems={
//               cartItems && cartItems.items && cartItems.items.length > 0
//                 ? cartItems.items
//                 : []
//             }
//           />
//         </Sheet>
//       </motion.div>
//       <motion.div
//         whileTap={{ scale: 0.85 }}
//         whileHover={{ scale: 0.98 }}>
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Avatar className="bg-black">
//               <AvatarFallback className="bg-black text-white font-extrabold cursor-pointer">
//                 {user?.userName[0].toUpperCase()}
//               </AvatarFallback>
//             </Avatar>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent side="right" className="w-56">
//             <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem onClick={() => navigate("/shop/account")}>
//               <UserCog className="mr-2 h-4 w-4" />
//               Account
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem onClick={handleLogout}>
//               <LogOut className="mr-2 h-4 w-4" />
//               Logout
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </motion.div>
//     </div>
//   );
// }

// function ShoppingHeader() {
//   const { isAuthenticated } = useSelector((state) => state.auth);

//   return (
//     <header className="sticky top-0 z-40 w-full border-b bg-background">
//       <div className="flex h-16 items-center justify-between px-4 md:px-6">
//         <motion.div
//          whileTap={{ scale: 1.1 }}
//         whileHover={{ scale: 0.95 }}
//         >
//         <Link to="/shop/home"
//           className="flex items-center gap-2 cursor-pointer">
//           <HousePlug className="h-6 w-6" />
//           <span className="font-bold">Ecommerce</span>
//         </Link>
//         </motion.div>
//         <Sheet>
//           <SheetTrigger asChild>
//             <Button variant="outline" size="icon" className="lg:hidden">
//               <Menu className="h-6 w-6" />
//               <span className="sr-only">Toggle header menu</span>
//             </Button>
//           </SheetTrigger>
//           <SheetContent side="left" className="w-full max-w-xs">
//             <MenuItems />
//             <HeaderRightContent />
//           </SheetContent>
//         </Sheet>
//         <div className="hidden lg:block">
//           <MenuItems />
//         </div>

//         <div className="hidden lg:block">
//           <HeaderRightContent />
//         </div>
//       </div>
//     </header>
//   );
// }

// export default ShoppingHeader;



// 'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shoppingViewHeaderMenuItems } from '@/config';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  LogOut, UserCog
} from 'lucide-react';
// import { useCart } from '../../contexts/cart-context';
import { useWishlist } from '../../contexts/wishlist-context';
import { useTheme } from '../../contexts/theme-context';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from "@/store/auth-slice";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Sheet } from "../ui/sheet";
import UserCartWrapper from "./cart-wrapper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Label } from '@radix-ui/react-dropdown-menu';

// const categories = [
//   { name: 'New', href: '/collections?category=new' },
//   { name: 'Tops', href: '/collections?category=tops' },
//   { name: 'Bottoms', href: '/collections?category=bottoms' },
//   { name: 'Hoodies', href: '/collections?category=hoodies' },
//   { name: 'Accessories', href: '/collections?category=accessories' },
// ];

export default function ShoppingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  // const { items } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  // const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // const dropdownVariants = {
  //   hidden: { 
  //     opacity: 0, 
  //     scale: 0.95, 
  //     y: -10,
  //     transition: { duration: 0.2 }
  //   },
  //   visible: { 
  //     opacity: 1, 
  //     scale: 1, 
  //     y: 0,
  //     transition: { 
  //       type: "spring", 
  //       stiffness: 300, 
  //       damping: 30 
  //     }
  //   }
  // };

  const mobileMenuVariants = {
    hidden: { x: '100%' },
    visible: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    dispatch(fetchCartItems(user?.id));
  }, [dispatch]);

  console.log(cartItems, "sangam");

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
        getCurrentMenuItem.id !== "products" &&
        getCurrentMenuItem.id !== "search"
        ? {
          category: [getCurrentMenuItem.id],
        }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
        new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
      )
      : navigate(getCurrentMenuItem.path);
  }


  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-black/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a href="/" className="text-2xl font-bold text-yellow-50">
                STORE
              </a>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {shoppingViewHeaderMenuItems.map((menuItem) => (
                  // <div
                  //   key={category.label}
                  //   className="relative"
                  // // onMouseEnter={() => setActiveDropdown(category.id)}
                  // // onMouseLeave={() => setActiveDropdown(null)}
                  // >
                  //   <motion.a
                  //     href={category.path}
                  //     className="text-gray-900 dark:text-white hover:text-pink-500 px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center"
                  //     whileHover={{ y: -2 }}
                  //   >
                  //     {category.label}
                  //     {/* <ChevronDown className="ml-1 h-4 w-4" /> */}
                  //   </motion.a>
                  // </div>

                  <div
                  // className="relative"
                  // onMouseEnter={() => setActiveDropdown(category.id)}
                  // onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Label
                      onClick={() => handleNavigate(menuItem)}
                      className="text-yellow-50  hover:text-pink-500 px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center cursor-pointer"
                      whileHover={{ y: -2 }}
                      key={menuItem.id}
                    >
                      {menuItem.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <motion.button
                className="p-2 text-yellow-50 hover:text-pink-500 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.p
                  // href="search"
                  onClick={() => navigate("/shop/search")}
                  className="text-yellow-50  hover:text-pink-500 px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center"
                  whileHover={{ y: -2 }}
                >
                  <Link to="/search">
                  <Search className="h-5 w-5" />
                  </Link>
                </motion.p>
              </motion.button>

              {/* Theme Toggle */}
              {/* <motion.button
                onClick={toggleTheme}
                className="p-2 text-gray-900 dark:text-white hover:text-pink-500 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.button> */}



              {/* Wishlist */}
              <motion.button
                className="p-2 text-yellow-50  hover:text-pink-500 transition-colors duration-200 relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className="h-5 w-5" />
                {mounted && wishlistItems.length > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {wishlistItems.length}
                  </motion.span>
                )}
              </motion.button>

              {/* Cart */}
              <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
                <motion.button
                  onClick={() => setOpenCartSheet(true)}
                  className="p-2 text-yellow-50  hover:text-pink-500 transition-colors duration-200 relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ShoppingBag className="h-5 w-5 cursor-pointer" />

                  <motion.span
                    className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {cartItems?.items?.length || 0}
                  </motion.span>
                  <span className="sr-only">User cart</span>
                </motion.button>

                <UserCartWrapper
                  setOpenCartSheet={setOpenCartSheet}
                  cartItems={
                    cartItems && cartItems.items && cartItems.items.length > 0
                      ? cartItems.items
                      : []
                  }
                />

              </Sheet>

              {/* Account */}
              <motion.button
                className="p-2 text-yellow-50  hover:text-pink-500 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="bg-black">
                      <AvatarFallback className="bg-gray-100 text-black font-extrabold cursor-pointer">
                        {user?.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" className="w-56">
                    <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <a href='/shop/account'>
                    <DropdownMenuItem >
                      <UserCog className="mr-2 h-4 w-4" />
                      Account
                    </DropdownMenuItem>
                         </a>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.button>
              {/* Mobile menu button */}
              <motion.button
                className="md:hidden p-2 text-yellow-50 hover:text-pink-500 transition-colors duration-200 "
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav >

      {/* Mobile Menu */}
      < AnimatePresence >
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed top-0 right-0 h-full w-80 bg-black shadow-xl"
              variants={mobileMenuVariants}
            >
              <div className="p-6 pt-15">
                {/* <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-900 dark:text-white hover:text-pink-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div> */}

                <div className="space-y-1">
                  {shoppingViewHeaderMenuItems.map((category, index) => (
                    <motion.a
                      key={category.label}
                      href={category.path}
                      className="block py-3 px-4 text-lg font-medium text-yellow-50 dark:text-white hover:text-black hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setIsOpen(false)}
                    >
                      {category.label}
                    </motion.a>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    <p onClick={() => navigate("/shop/account")}>
                      <button
                        className="flex items-center space-x-3 text-yellow-50  hover:text-pink-500 transition-colors duration-200 cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-5 w-5 " />
                        <span>Account</span>
                      </button>
                    </p>
                    <button className="flex items-center space-x-3 text-yellow-50 hover:text-pink-500 transition-colors duration-200">
                      <Heart className="h-5 w-5" />
                      <span>Wishlist ({mounted ? wishlistItems.length : 0})</span>
                    </button>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center space-x-3 text-yellow-50  hover:text-pink-500 transition-colors duration-200"
                    >
                      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )
        }
      </AnimatePresence >
    </>
  );
}