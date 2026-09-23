import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  // 1. Root route: open directly to the storefront home page for customers
  if (location.pathname === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/shop/home" replace />;
    } else {
      if (user?.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/shop/home" replace />;
      }
    }
  }

  // 2. Authenticated user visiting login or register
  if (
    isAuthenticated &&
    (location.pathname.includes("/login") ||
      location.pathname.includes("/register"))
  ) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      // Check if user came with a redirect query parameter (e.g., checkout)
      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl && redirectUrl.startsWith("/")) {
        return <Navigate to={redirectUrl} replace />;
      }
      return <Navigate to="/shop/home" replace />;
    }
  }

  // 3. Authenticated customer trying to access admin views
  if (
    isAuthenticated &&
    user?.role !== "admin" &&
    location.pathname.includes("admin")
  ) {
    return <Navigate to="/unauth-page" replace />;
  }

  // 4. Admin trying to access regular storefront
  if (
    isAuthenticated &&
    user?.role === "admin" &&
    location.pathname.includes("shop")
  ) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 5. Unauthenticated user trying to access protected features (checkout, account/orders, admin)
  if (!isAuthenticated) {
    if (location.pathname.includes("/checkout")) {
      return <Navigate to="/auth/login?redirect=/shop/checkout" replace />;
    }
    if (
      location.pathname.includes("/account") ||
      location.pathname.includes("/orders")
    ) {
      return <Navigate to="/auth/login?redirect=/shop/account" replace />;
    }
    if (location.pathname.includes("admin")) {
      return <Navigate to="/auth/login" replace />;
    }
  }

  // 6. All other routes (home, listing, product details, search, wishlist, login, register) are public
  return <>{children}</>;
}

export default CheckAuth;