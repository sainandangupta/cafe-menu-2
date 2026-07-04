import React, { useState } from 'react';
import { useOrders, useUpdateOrderStatus } from '../../hooks/useOrders';
import { Order, OrderStatus } from '../../types';

interface LiveOrderBoardProps {
  cafeId: string;
  onViewDetails: (order: Order) => void;
}

export const LiveOrderBoard: React.FC<LiveOrderBoardProps> = ({ cafeId, onViewDetails }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [alertEnabled, setAlertEnabled] = useState(true);

  // Query active orders (confirmed, preparing, prepared, delivered)
  const activeStatuses: OrderStatus[] = ['confirmed', 'preparing', 'prepared', 'delivered'];
  const { data: orders = [], isLoading } = useOrders(cafeId, activeStatuses);
  const updateStatusMutation = useUpdateOrderStatus();

  // Filter orders locally
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const handleUpdateStatus = async (id: string, nextStatus: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: nextStatus });
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };

  const handleArchiveOrder = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: 'delivered' });
    } catch {
      alert('Failed to close order.');
    }
  };

  // Counts for top bar tabs
  const countAll = orders.length;
  const countConfirmed = orders.filter(o => o.status === 'confirmed').length;
  const countPreparing = orders.filter(o => o.status === 'preparing').length;
  const countPrepared = orders.filter(o => o.status === 'prepared').length;
  const countDelivered = orders.filter(o => o.status === 'delivered').length;

  // Filter for today's orders (local date context)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaysOrders = orders.filter((order) => {
    const placedTimeStr = order.placed_at || order.created_at;
    return new Date(placedTimeStr) >= todayStart;
  });

  const todaysCountAll = todaysOrders.length;
  const todaysCountPrepared = todaysOrders.filter(o => o.status === 'prepared').length;
  const todaysCountDelivered = todaysOrders.filter(o => o.status === 'delivered').length;

  const totalRevenue = todaysOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const averageTicket = todaysCountAll > 0 ? Math.round(totalRevenue / todaysCountAll) : 0;
  const efficiency = todaysCountAll > 0 ? Math.round(((todaysCountPrepared + todaysCountDelivered) / todaysCountAll) * 100) : 100;

  return (
    <div className="flex gap-6 items-start">
      {/* Left Main Dashboard */}
      <div className="flex-1 space-y-6">
        {/* Status Filters Bar */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Orders', count: countAll },
            { id: 'confirmed', label: 'Confirmed', count: countConfirmed },
            { id: 'preparing', label: 'Preparing', count: countPreparing },
            { id: 'prepared', label: 'Prepared', count: countPrepared },
            { id: 'delivered', label: 'Delivered', count: countDelivered },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-bold text-xs border whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
                statusFilter === tab.id
                  ? 'bg-teal-800 border-teal-800 text-white shadow-xs'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.label.toUpperCase()} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders Card Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-semibold">Syncing kitchen order board...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredOrders.map((order) => {
              const itemsText = order.order_items
                ?.map((item) => `${item.quantity}x ${item.dish?.name || 'Dish'}`)
                .join(', ') || 'No items';

              // Format date/placed_at
              const placedTimeStr = order.placed_at || order.created_at;
              const formattedTime = new Date(placedTimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const minutesAgo = Math.max(0, Math.round((new Date().getTime() - new Date(placedTimeStr).getTime()) / 60000));
              const timeLabel = minutesAgo === 0 ? 'Just now' : `${minutesAgo} mins ago`;

              return (
                <div
                  key={order.id}
                  onClick={() => onViewDetails(order)}
                  className={`bg-white border border-gray-250 rounded-xl p-5 flex flex-col justify-between shadow-xs border-l-4 cursor-pointer hover:shadow-sm transition-all ${
                    order.status === 'confirmed'
                      ? 'border-l-blue-500'
                      : order.status === 'preparing'
                      ? 'border-l-amber-500'
                      : order.status === 'prepared'
                      ? 'border-l-green-500'
                      : 'border-l-gray-400'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">Table {order.table?.table_number || order.table_number || 'N/A'}</h3>
                        <p className="text-[10px] text-gray-400 font-medium">
                          Order #{order.order_token || order.id.substring(0, 4)} • {timeLabel}
                        </p>
                      </div>
                      <span className={`status-badge ${
                        order.status === 'confirmed'
                          ? 'status-badge-info'
                          : order.status === 'preparing'
                          ? 'status-badge-warning'
                          : order.status === 'prepared'
                          ? 'status-badge-success'
                          : 'status-badge-gray'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-2 py-3 border-t border-b border-gray-100 my-3">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs font-semibold text-gray-700">
                          <span>{item.quantity}x {item.dish?.name}</span>
                          <span className="text-gray-400">
                            {item.special_instructions ? `[${item.special_instructions}]` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-1">
                    <div className="text-xs font-semibold text-gray-400">
                      Items: <span className="text-gray-800 font-bold">{order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0} Total</span>
                    </div>

                    {/* Actions button */}
                    <div onClick={(e) => e.stopPropagation()}>
                      {order.status === 'confirmed' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'rejected')}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'preparing')}
                            className="bg-teal-800 hover:bg-teal-900 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            Start Preparing
                          </button>
                        </div>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'prepared')}
                          className="bg-green-700 hover:bg-green-800 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          Mark As Prepared
                        </button>
                      )}
                      {order.status === 'prepared' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="bg-teal-800 hover:bg-teal-900 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          Out for Delivery
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2 bg-gray-100 rounded-lg">
                          Order Closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 bg-white border border-gray-250 rounded-2xl text-center shadow-xs">
            <span className="material-symbols-outlined text-gray-300 text-5xl mb-3">inbox</span>
            <h3 className="font-bold text-gray-700 text-sm">No Orders Found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Active table orders matching the selection will load here in real time.
            </p>
          </div>
        )}
      </div>

      {/* Right Stats / Notifications Sidebar Panel */}
      <div className="w-[320px] space-y-6 flex-shrink-0 hidden lg:block">
        {/* Notification Center */}
        <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Notification Center</h3>
            <span className="material-symbols-outlined text-gray-400">notifications_active</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
            Get audio-visual alerts for new incoming orders from tables.
          </p>
          <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-xl">
            <span className="text-xs font-semibold text-gray-700">Alert on new order</span>
            <div
              onClick={() => setAlertEnabled(!alertEnabled)}
              className={`toggle-switch ${alertEnabled ? 'active' : ''}`}
            ></div>
          </div>
        </div>

        {/* Today's Performance */}
        <div className="bg-[#1e293b] text-white border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Today's Performance</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time performance index</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-400">Total Revenue</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}.00</span>
              <span className="text-[10px] font-bold text-green-400">↗ 12%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-[10px] text-slate-400">Orders</p>
              <p className="text-sm font-bold mt-0.5">{todaysCountAll}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Avg. Ticket</p>
              <p className="text-sm font-bold mt-0.5">₹{averageTicket}</p>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
              <span>Kitchen Efficiency</span>
              <span className="font-bold text-teal-400">{efficiency}%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: `${efficiency}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveOrderBoard;
