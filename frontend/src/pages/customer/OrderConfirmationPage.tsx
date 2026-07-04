import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useOrderDetails } from '../../hooks/useOrders';
import { useCart } from '../../hooks/useCart';
import CustomerLayout from '../../layouts/CustomerLayout';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { tableContext } = useCart();

  // Try to read state
  const state = location.state as {
    token?: string;
    total?: number;
    tableNumber?: number;
  } | null;

  // Fallback to fetch order details
  const { data: order, isLoading } = useOrderDetails(state?.token ? undefined : id);

  const token = state?.token || order?.order_token || 'ABC123';
  const total = state?.total || order?.total || 0;
  const tableNum = state?.tableNumber || order?.table?.table_number || tableContext.tableNumber || '5';

  const handleTrackOrder = () => {
    navigate(`/order-status/${id}`);
  };

  const handleBackToMenu = () => {
    navigate(tableContext.tableToken ? `/menu?tableToken=${tableContext.tableToken}` : '/menu');
  };

  if (isLoading && !state?.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9ff]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#006e2f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Fetching order confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <CustomerLayout hideBottomNav={true}>
      <div className="w-full max-w-md mx-auto px-4 flex flex-col items-center pt-6 pb-24">
        {/* Animation & Hero Section */}
        <div className="relative w-full flex flex-col items-center pt-8 pb-6">
          <div className="w-20 h-20 bg-[#22c55e] rounded-full flex items-center justify-center mb-4 shadow-lg animate-[scaleIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
            <span className="material-symbols-outlined text-white text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Order Placed Successfully!</h2>
          
          {/* Confirmed Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#22C55E]/10 text-[#166534] rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse"></span>
            <span className="text-xs font-semibold">Confirmed</span>
          </div>
        </div>

        {/* Order ID Bento Card */}
        <div className="w-full bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest mb-1">Order Reference</p>
          <p className="font-mono text-2xl font-bold text-center text-gray-800 select-all tracking-wider">#{token}</p>
        </div>

        {/* Order Summary Details Grid */}
        <div className="w-full grid grid-cols-2 gap-4 mb-6">
          {/* Items Detail */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[#006e2f] mb-1">shopping_basket</span>
            <span className="text-[10px] font-semibold text-gray-400">Order Amount</span>
            <span className="font-bold text-base text-gray-800">₹{total}</span>
          </div>
          {/* Table Detail */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[#006e2f] mb-1">table_restaurant</span>
            <span className="text-[10px] font-semibold text-gray-400">Table</span>
            <span className="font-bold text-base text-gray-800">#{tableNum}</span>
          </div>
          {/* Estimated Time Card (Full Width) */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#006e2f]">timer</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-gray-400">Estimated Preparation</span>
              <span className="font-bold text-sm text-[#006e2f]">~15 mins</span>
            </div>
            <div className="ml-auto">
              <div className="flex gap-1">
                <div className="w-1.5 h-5 bg-[#006e2f] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-5 bg-[#006e2f]/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-5 bg-[#006e2f]/30 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Coffee Image */}
        <div className="w-full h-36 rounded-xl overflow-hidden mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <img
            className="w-full h-full object-cover"
            alt="Warm coffee latte and croissant"
            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop"
          />
          <div className="absolute bottom-3 left-3 z-20">
            <p className="text-white font-semibold text-xs">Your order is being crafted by our team.</p>
          </div>
        </div>

        {/* Fixed Bottom Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-200 p-4 z-40 flex flex-col gap-2">
          <button onClick={handleTrackOrder} className="btn-primary-green">
            <span className="material-symbols-outlined text-lg">track_changes</span>
            Track Order
          </button>
          <button onClick={handleBackToMenu} className="btn-secondary">
            <span className="material-symbols-outlined text-lg">menu_book</span>
            Back to Menu
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default OrderConfirmationPage;
