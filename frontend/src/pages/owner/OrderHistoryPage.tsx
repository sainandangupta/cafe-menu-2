import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ordersService } from '../../services/orders';
import { Order } from '../../types';

interface OrderHistoryPageProps {
  cafeId: string;
  onViewDetails: (order: Order) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ cafeId, onViewDetails }) => {
  const [activeDateTab, setActiveDateTab] = useState<'today' | 'yesterday' | 'week'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  const dateRange = (() => {
    if (activeDateTab === 'today') {
      return [dayjs().startOf('day'), dayjs().endOf('day')];
    } else if (activeDateTab === 'yesterday') {
      return [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')];
    } else {
      return [dayjs().subtract(7, 'day').startOf('day'), dayjs().endOf('day')];
    }
  })();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['order-history', cafeId, activeDateTab],
    queryFn: () =>
      ordersService.getOrderHistory(cafeId, {
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      }),
  });

  // Calculations
  const acceptedOrders = orders.filter((o) => o.status !== 'rejected');
  const deliveredOrders = acceptedOrders.filter((o) => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrdersCount = acceptedOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Find most ordered dish
  const dishCounts: Record<string, number> = {};
  orders.forEach((order) => {
    order.order_items?.forEach((item) => {
      const name = item.dish?.name || 'Dish';
      dishCounts[name] = (dishCounts[name] || 0) + item.quantity;
    });
  });

  let mostOrderedDish = 'None';
  let maxCount = 0;
  Object.entries(dishCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostOrderedDish = name;
    }
  });

  // Filter local items
  const filteredOrders = orders.filter(o => 
    o.order_token?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.table?.table_number?.toString() === searchQuery
  );

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No orders to export in the selected range.');
      return;
    }

    const headers = ['Date', 'Order ID', 'Table Number', 'Status', 'Items', 'Total'];
    const rows = orders.map((order) => {
      const items = order.order_items?.map((i) => `${i.quantity}x ${i.dish?.name || 'Dish'}`).join('; ') || '';
      const escapedItems = items.replace(/"/g, '""');
      const dateStr = new Date(order.placed_at || order.created_at).toLocaleString().replace(/"/g, '""');
      return [
        `"${dateStr}"`,
        `"${order.order_token || order.id.substring(0, 8)}"`,
        `"${order.table?.table_number || 'N/A'}"`,
        `"${order.status}"`,
        `"${escapedItems}"`,
        order.total,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-report-${activeDateTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Date scope selector bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-gray-250 rounded-xl p-4 shadow-xs">
        <div className="flex gap-2">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'week', label: 'This Week' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveDateTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-bold text-xs border cursor-pointer transition-colors ${
                activeDateTab === tab.id
                  ? 'bg-teal-800 border-teal-800 text-white shadow-xs'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            Reporting Period: <span className="text-gray-800 font-bold">{dateRange[0].format('MMM DD, YYYY')}</span>
          </div>
          <button
            onClick={handleExportCSV}
            className="btn-primary-teal text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export to CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="kpi-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-teal-600 bg-teal-50 p-2 rounded-lg text-lg">shopping_basket</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Orders</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{totalOrdersCount}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="kpi-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-teal-600 bg-teal-50 p-2 rounded-lg text-lg">payments</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Revenue</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="kpi-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-teal-600 bg-teal-50 p-2 rounded-lg text-lg">equalizer</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Avg Order Value</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">₹{avgOrderValue}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="kpi-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-teal-600 bg-teal-50 p-2 rounded-lg text-lg">local_cafe</span>
            <span className="text-[10px] font-bold text-teal-500">Popular</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Most Ordered Dish</p>
            <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{mostOrderedDish}</p>
          </div>
        </div>
      </div>

      {/* Transaction Table Section */}
      <div className="bg-white border border-gray-250 rounded-xl overflow-hidden shadow-xs">
        {/* Search header inside table container */}
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Order Transactions</h3>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Search Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-teal-700 bg-white"
              />
            </div>
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-semibold">Generating report logs...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Table</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Time Taken</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const itemsText = order.order_items
                    ?.map((i) => `${i.quantity}x ${i.dish?.name || 'Dish'}`)
                    .join(', ') || 'No items';

                  const dateStr = new Date(order.placed_at || order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const getPrepTime = () => {
                    const startVal = order.placed_at || order.created_at;
                    if (!startVal || !order.delivered_at) return 'N/A';
                    const start = new Date(startVal).getTime();
                    const end = new Date(order.delivered_at).getTime();
                    const diffMs = end - start;
                    if (diffMs < 0) return '0 mins';
                    const diffMins = Math.round(diffMs / 60000);
                    return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
                  };

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onViewDetails(order)}
                      className="cursor-pointer"
                    >
                      <td className="text-xs text-gray-500 font-semibold">{dateStr}</td>
                      <td className="font-mono text-xs font-bold text-teal-800">
                        #{order.order_token || order.id.substring(0, 6).toUpperCase()}
                      </td>
                      <td className="text-xs font-bold text-gray-700">Table #{order.table?.table_number || 'N/A'}</td>
                      <td className="text-xs text-gray-400 font-semibold max-w-xs truncate">{itemsText}</td>
                      <td className="font-bold text-xs text-gray-900">₹{order.total}</td>
                      <td>
                        <span className={`status-badge ${
                          order.status === 'delivered'
                            ? 'status-badge-success'
                            : order.status === 'rejected'
                            ? 'status-badge-error'
                            : 'status-badge-warning'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-xs text-gray-500">{getPrepTime()}</td>
                      <td>
                        <button className="text-teal-600 hover:text-teal-800 bg-transparent border-none cursor-pointer flex items-center justify-center p-1 rounded hover:bg-gray-150">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <span className="material-symbols-outlined text-gray-300 text-5xl mb-3">history</span>
            <h3 className="font-bold text-gray-700 text-sm">No Transactions Registered</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Sales records matching the filters will populate here once completed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
