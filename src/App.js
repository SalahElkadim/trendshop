import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { observer } from "mobx-react-lite";

// Stores
import authStore from "./stores/authStore";
import cartStore from "./stores/cartStore";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Pages
import HomePage from "./pages/Home/HomePage";
import ProductListPage from "./pages/Product/ProductListPage";
import ProductDetailPage from "./pages/Product/ProductDetailPage";
import CartPage from "./pages/Cart/CartPage";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import OrderSuccessPage from "./pages/Orders/OrderSuccessPage";
import MyOrdersPage from "./pages/Orders/MyOrdersPage";
import OrderDetailPage from "./pages/Orders/OrderDetailPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import AccountPage from "./pages/Account/AccountPage";
import NotFoundPage from "./pages/NotFoundPage";
import AboutUs from "./pages/AboutUs";

import { initPixel, pageView } from "./utils/pixel"; // ← جديد


// ← كومبوننت مسؤول عن تتبع تغيير الصفحات
const PixelPageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    pageView();
  }, [location.pathname]);

  return null;
};
// Protected Route للصفحات اللي تحتاج login
const ProtectedRoute = observer(({ children }) => {
  if (!authStore.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
});

// Guest Route (login/register) → لو مسجل روّح للـ home
const GuestRoute = observer(({ children }) => {
  if (authStore.isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
});

const App = observer(() => {
  useEffect(() => {
    cartStore.fetchCart();
    initPixel(); // ← تشغيل الـ Pixel مرة واحدة عند بدء التطبيق
  }, []);

  return (
    <BrowserRouter>
      <PixelPageTracker />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Public */}
          <Route index element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />

          {/* Checkout (Guest + User) */}
          <Route path="checkout" element={<CheckoutPage />} />
          <Route
            path="order-success/:orderNumber"
            element={<OrderSuccessPage />}
          />

          {/* Order tracking (Guest بـ order number) */}
          <Route path="orders/:orderNumber" element={<OrderDetailPage />} />

          {/* Protected */}
          <Route
            path="my-orders"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />

          {/* Auth */}
          <Route
            path="login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
});

export default App;
