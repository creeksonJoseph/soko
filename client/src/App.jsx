import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import ErrorBoundary from "./Components/ErrorBoundary";
import LoadingSpinner from "./Components/LoadingSpinner";
import ProtectedRoute from "./Components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./hooks/useCart.jsx";
import { quickHealthCheck } from "./utils/apiTest";

// Lazy load components for better performance
const Navbar = lazy(() => import("./Components/Layout/Navbar"));
const Footer = lazy(() => import("./Components/Layout/Footer"));
const HomePage = lazy(() => import("./Pages/HomePage"));
const AboutPage = lazy(() => import("./Pages/AboutPage"));
const LoginPage = lazy(() => import("./Pages/LoginPage"));
const RegisterPage = lazy(() => import("./Pages/RegisterPage"));
const ResetPasswordPage = lazy(() => import("./Pages/ResetPasswordPage"));
const ExplorePage = lazy(() => import("./Pages/ExplorePage"));
const ProductDetailPage = lazy(() => import("./Pages/ProductDetailPage"));
const CartPage = lazy(() => import("./Pages/CartPage"));
const CheckoutPage = lazy(() => import("./Pages/CheckoutPage"));
const CollectionPage = lazy(() => import("./Pages/CollectionPage"));
const MessagesPage = lazy(() => import("./Pages/MessagesPage"));
const BuyerDashboard = lazy(() => import("./Pages/BuyerDashboard"));
const ArtisanDashboard = lazy(() => import("./Pages/ArtisanDashboard"));
const ArtisanProfilePage = lazy(() => import("./Pages/ArtisanProfilePage"));

// Loading spinner for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

// Fallback UI for major errors
const ErrorFallback = ({ error, retry }) => (
  <div className="min-h-screen flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Error</h2>
      <p className="text-gray-600 mb-6">
        Something went wrong while loading this page. Please try again.
      </p>
      <button
        onClick={retry}
        className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

function App() {
  // Development health check
  useEffect(() => {
    if (import.meta.env.VITE_APP_ENV === "development") {
      setTimeout(() => {
        quickHealthCheck();
      }, 2000);
    }
  }, []);

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ErrorBoundary>
                        <HomePage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <ErrorBoundary>
                        <AboutPage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <ErrorBoundary>
                        <LoginPage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <ErrorBoundary>
                        <RegisterPage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <ErrorBoundary>
                        <ResetPasswordPage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/explore"
                    element={
                      <ErrorBoundary>
                        <ExplorePage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/product/:id"
                    element={
                      <ErrorBoundary>
                        <ProductDetailPage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <CartPage />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/collection"
                    element={
                      <ErrorBoundary>
                        <CollectionPage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/collection/:id"
                    element={
                      <ErrorBoundary>
                        <CollectionPage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <MessagesPage />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/messages/:id"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <MessagesPage />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/artisan/:id"
                    element={
                      <ErrorBoundary>
                        <ArtisanProfilePage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/buyer-dashboard"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute requiredRole="buyer">
                          <BuyerDashboard />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/artisan-dashboard"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute requiredRole="artisan">
                          <ArtisanDashboard />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/artisan-profile"
                    element={
                      <ErrorBoundary>
                        <ArtisanProfilePage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <ErrorBoundary>
                        <HomePage />
                      </ErrorBoundary>
                    }
                  />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
