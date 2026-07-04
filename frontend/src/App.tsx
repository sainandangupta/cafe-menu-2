import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useCart } from './hooks/useCart';

// Pages lazy loading for performance
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const QRScanPage = React.lazy(() => import('./pages/auth/QRScanPage'));
const MenuPage = React.lazy(() => import('./pages/customer/MenuPage'));
const DishDetailPage = React.lazy(() => import('./pages/customer/DishDetailPage'));
const CartPage = React.lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/customer/CheckoutPage'));
const OrderConfirmationPage = React.lazy(() => import('./pages/customer/OrderConfirmationPage'));
const OrderStatusPage = React.lazy(() => import('./pages/customer/OrderStatusPage'));
const OwnerDashboard = React.lazy(() => import('./pages/owner/OwnerDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30s menu cache default
    },
  },
});

// Guard for Admin/Owner roles
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: ('admin' | 'owner')[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9ff]">
        <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !allowedRoles.includes(role as any)) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'owner') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Customer routes validation guard
const CustomerRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tableContext } = useCart();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('tableToken') || searchParams.get('token');

  if (!token && !tableContext.tableToken) {
    return <Navigate to="/qr-scan" replace />;
  }

  return <>{children}</>;
};

// Main App layout integration
const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9ff]">
      <div className="flex-1 flex flex-col">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center bg-[#f9f9ff]">
              <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          <Routes>
            {/* Public Entry / Scan page */}
            <Route path="/" element={<Navigate to="/qr-scan" replace />} />
            <Route path="/qr-scan" element={<QRScanPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Customer order flow */}
            <Route
              path="/menu"
              element={
                <CustomerRouteGuard>
                  <MenuPage />
                </CustomerRouteGuard>
              }
            />
            <Route
              path="/dish/:id"
              element={
                <CustomerRouteGuard>
                  <DishDetailPage />
                </CustomerRouteGuard>
              }
            />
            <Route
              path="/cart"
              element={
                <CustomerRouteGuard>
                  <CartPage />
                </CustomerRouteGuard>
              }
            />
            <Route
              path="/checkout"
              element={
                <CustomerRouteGuard>
                  <CheckoutPage />
                </CustomerRouteGuard>
              }
            />
            <Route
              path="/order-confirmed/:id"
              element={
                <CustomerRouteGuard>
                  <OrderConfirmationPage />
                </CustomerRouteGuard>
              }
            />
            <Route
              path="/order-status/:id"
              element={
                <CustomerRouteGuard>
                  <OrderStatusPage />
                </CustomerRouteGuard>
              }
            />

            {/* Owner portal routes */}
            <Route
              path="/owner/dashboard"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin portal routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/qr-scan" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <AppLayout />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
