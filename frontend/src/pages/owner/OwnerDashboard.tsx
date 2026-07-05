import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { Order } from '../../types';
import { useOrders, useUpdateOrderStatus } from '../../hooks/useOrders';
import LiveOrderBoard from './LiveOrderBoard';
import OrderHistoryPage from './OrderHistoryPage';
import DishAvailabilityPage from './DishAvailabilityPage';
import OrderDetailModal from './OrderDetailModal';

export const OwnerDashboard: React.FC = () => {
  const { user, logout, cafeId } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'availability'>('live');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch count of active orders for notification badge
  const { data: activeOrders = [] } = useOrders(cafeId, ['confirmed', 'preparing', 'prepared']);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleLogout = () => {
    logout();
    navigate('/login?role=owner');
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: any) => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  if (!cafeId) {
    return (
      <div className="min-h-screen bg-[#f0fdfa] flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-sm w-full p-8 space-y-6">
          <span className="material-symbols-outlined text-[#14b8a6] text-6xl">storefront</span>
          <h3 className="font-bold text-gray-800 text-lg">No Cafe Assigned</h3>
          <p className="text-xs text-gray-500">
            Your owner account is not linked to any active cafe in the system. Please request support.
          </p>
          <button onClick={handleLogout} className="btn-primary-teal w-full">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f0fdfa] text-gray-800">
      {/* Sidebar Navigation */}
      <aside className="owner-sidebar">
        <div className="px-5 py-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#5eead4]">restaurant</span>
            Bucks Cafe
          </h1>
          <h2 className="text-sm font-semibold text-[#5eead4] uppercase tracking-wider mt-1">Owner Portal</h2>
          <p className="text-[10px] text-teal-300/40 tracking-wider">Operational Hub</p>
        </div>

        <nav className="flex-1 mt-4">
          <button
            onClick={() => setActiveTab('live')}
            className={`w-full text-left owner-nav-item border-none bg-transparent cursor-pointer ${
              activeTab === 'live' ? 'active' : ''
            }`}
          >
            <span className="material-symbols-outlined text-xl">notifications_active</span>
            <span className="flex-grow">Live Orders</span>
            {activeOrders.length > 0 && (
              <span className="bg-[#5eead4] text-[#0d3d3d] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full text-left owner-nav-item border-none bg-transparent cursor-pointer ${
              activeTab === 'history' ? 'active' : ''
            }`}
          >
            <span className="material-symbols-outlined text-xl">history</span>
            <span>Sales History</span>
          </button>

          <button
            onClick={() => setActiveTab('availability')}
            className={`w-full text-left owner-nav-item border-none bg-transparent cursor-pointer ${
              activeTab === 'availability' ? 'active' : ''
            }`}
          >
            <span className="material-symbols-outlined text-xl">restaurant_menu</span>
            <span>Menu Management</span>
          </button>
        </nav>

        {/* User profile / Log out at bottom */}
        <div className="px-5 py-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'O'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.email?.split('@')[0] || 'Owner'}</p>
              <p className="text-[10px] text-teal-300/60 truncate">Admin Account</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left py-2 px-3 hover:bg-red-500/10 text-red-300 hover:text-red-200 text-xs font-bold rounded-lg border-none bg-transparent flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[240px] flex flex-col">
        {/* Top Header */}
        <header className="owner-header">
          <h1 className="text-lg font-bold text-white tracking-wide">
            {activeTab === 'live' && 'Live Order Dashboard'}
            {activeTab === 'history' && 'Order History & Reports'}
            {activeTab === 'availability' && 'Manage Availability'}
          </h1>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-6">
          {activeTab === 'live' && (
            <LiveOrderBoard cafeId={cafeId} onViewDetails={handleViewOrderDetails} />
          )}

          {activeTab === 'history' && (
            <OrderHistoryPage cafeId={cafeId} onViewDetails={handleViewOrderDetails} />
          )}

          {activeTab === 'availability' && (
            <DishAvailabilityPage cafeId={cafeId} />
          )}
        </main>
      </div>

      {/* Expanded Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        visible={isDetailOpen}
        onClose={() => {
          setSelectedOrder(null);
          setIsDetailOpen(false);
        }}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default OwnerDashboard;
