import { Route, Routes, Navigate } from "react-router-dom";
import AuthLayout from "./components/auth/layout.jsx";
import AuthLogin from "./pages/auth/login.jsx";
import AuthRegister from "./pages/auth/register.jsx";
import AdminLayout from "./components/admin-view/layout.jsx";
import AdminDashboard from "./pages/admin-view/dashboard.jsx";
import AdminProducts from "./pages/admin-view/products.jsx";
import AdminOrders from "./pages/admin-view/orders.jsx";
import AdminFeatures from "./pages/admin-view/features.jsx";
import AdminCoupons from "./pages/admin-view/coupons.jsx";
import ShoppingLayout from "./components/shopping-view/layout.jsx";
import NotFound from "./pages/not-found/index.jsx";
import ShoppingHome from "./pages/shopping-view/home.jsx";
import ShoppingListing from "./pages/shopping-view/listing.jsx";
import ShoppingCheckout from "./pages/shopping-view/checkout.jsx";
import ShoppingAccount from "./pages/shopping-view/account.jsx";
import CheckAuth from "./components/common/check-auth.jsx";
import UnauthPage from "./pages/unauth-page/index.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { checkAuth } from "./store/auth-slice/index.js";
import { Skeleton } from "./components/ui/skeleton.jsx";
import PaymentSuccessPage from "./pages/shopping-view/payment-success.jsx";
import SearchProducts from "./pages/shopping-view/search.jsx";
import ShoppingWishlist from "./pages/shopping-view/wishlist.jsx";
import ProductDetailsDialog from "./components/shopping-view/product-details.jsx";
import SiteLoader from "./components/common/site-loader.jsx";
import AmbientBackground from "./components/common/ambient-background.jsx";
import ScrollToTop from "./components/common/scroll-to-top.jsx";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return <Skeleton className="w-full bg-[#1B242A] h-screen" />;

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-[#1B242A] text-[#F5E4C8] relative">
      {/* Cinematic Site Load Animation */}
      {showInitialLoader && (
        <SiteLoader onComplete={() => setShowInitialLoader(false)} />
      )}

      {/* Ambient Lighting & Particle Halo */}
      <AmbientBackground />

      {/* Global Scroll Restoration on Route Navigation */}
      <ScrollToTop />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Routes>
          <Route
            path="/"
            element={
              <CheckAuth
                isAuthenticated={isAuthenticated}
                user={user}
              ></CheckAuth>
            }
          />
          <Route
            path="/auth"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <AuthLayout />
              </CheckAuth>
            }
          >
            <Route path="login" element={<AuthLogin />} />
            <Route path="register" element={<AuthRegister />} />
          </Route>

          <Route
            path="/admin"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <AdminLayout />
              </CheckAuth>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>

          <Route
            path="/shop"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <ShoppingLayout />
              </CheckAuth>
            }
          >
            <Route path="home" element={<ShoppingHome />} />
            <Route path="listing" element={<ShoppingListing />} />
            <Route path="checkout" element={<ShoppingCheckout />} />
            <Route path="account" element={<ShoppingAccount />} />
            <Route path="orders" element={<ShoppingAccount />} />
            <Route path="payment-success" element={<PaymentSuccessPage />} />
            <Route path="search" element={<SearchProducts />} />
            <Route path="wishlist" element={<ShoppingWishlist />} />
          </Route>

          <Route path="/wishlist" element={<Navigate to="/shop/wishlist" replace />} />
          <Route path="/orders" element={<Navigate to="/shop/account" replace />} />
          <Route path="/account" element={<Navigate to="/shop/account" replace />} />
          <Route path="/payment-success" element={<Navigate to="/shop/payment-success" replace />} />

          <Route
            path="/product/:productId"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <ShoppingLayout />
              </CheckAuth>
            }
          >
            <Route index element={<ProductDetailsDialog />} />
          </Route>
          <Route path="/unauth-page" element={<UnauthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}
export default App;
