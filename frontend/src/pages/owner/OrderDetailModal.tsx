import React from 'react';
import { Order, OrderStatus } from '../../types';
import { InvoiceModal } from './InvoiceModal';

interface OrderDetailModalProps {
  order: Order | null;
  visible: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  isUpdating?: boolean;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  visible,
  onClose,
  onUpdateStatus,
  isUpdating = false,
}) => {
  const [invoiceVisible, setInvoiceVisible] = React.useState(false);

  if (!order || !visible) return null;

  const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-6">
      <div className="bg-[#f0fdfa] rounded-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col border border-teal-800/10 shadow-2xl">
        {/* Header */}
        <header className="bg-teal-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">Order #{order.order_token || order.id.substring(0, 6)}</h2>
            <span className="bg-teal-700 text-[#5eead4] text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-600">
              Table #{order.table?.table_number || '5'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white bg-transparent border-none cursor-pointer flex items-center p-1 rounded-full hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </header>

        {/* Modal body wrapper */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Workflow Status Stepper */}
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Workflow Status</h3>
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {[
                { label: 'Confirmed', key: 'confirmed', icon: 'check_circle' },
                { label: 'Preparing', key: 'preparing', icon: 'restaurant' },
                { label: 'Prepared', key: 'prepared', icon: 'restaurant_menu' },
                { label: 'Delivered', key: 'delivered', icon: 'check_circle' }
              ].map((step, idx, arr) => {
                const statusHierarchy = ['confirmed', 'preparing', 'prepared', 'delivered'];
                const currentIdx = statusHierarchy.indexOf(order.status.toLowerCase());
                
                const isDone = currentIdx >= idx;
                const isActive = currentIdx === idx;

                return (
                  <React.Fragment key={step.key}>
                    <button
                      onClick={() => !isUpdating && onUpdateStatus(order.id, step.key as OrderStatus)}
                      disabled={isUpdating}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-bold text-xs transition-all ${
                        isActive
                          ? 'bg-teal-800 border-teal-800 text-white shadow-xs'
                          : isDone
                          ? 'bg-[#22c55e]/10 border-[#22c55e]/20 text-[#166534]'
                          : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{step.icon}</span>
                      <span>{step.label}</span>
                    </button>
                    {idx < arr.length - 1 && (
                      <span className="material-symbols-outlined text-gray-300 text-lg">arrow_forward</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* Details columns grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Items & History (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items Table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Items</h3>
                  <span className="text-[10px] font-bold text-[#006e2f] bg-[#006e2f]/10 px-2 py-0.5 rounded">
                    {totalItems} Items Total
                  </span>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Dish Name</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items?.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                              {item.dish?.image_url ? (
                                <img src={item.dish.image_url} alt={item.dish.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#006e2f]/5 text-[#006e2f] font-bold text-sm">
                                  {item.dish?.name[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-gray-800">{item.dish?.name}</p>
                              {item.special_instructions && (
                                <p className="text-[10px] text-red-600 font-medium italic mt-0.5 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[10px]">warning</span>
                                  {item.special_instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-gray-600 font-semibold text-xs">x{item.quantity}</td>
                        <td className="text-gray-600 font-semibold text-xs">₹{item.price}</td>
                        <td className="font-bold text-xs text-gray-800">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Staff Call History timeline */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <span className="material-symbols-outlined text-teal-600 text-lg">history</span>
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Staff Call History</h3>
                </div>
                <div className="space-y-4 pl-2 border-l border-gray-150 ml-3">
                  <div className="relative pl-6">
                    <div className="absolute -left-[17px] top-0 w-2.5 h-2.5 bg-teal-600 rounded-full border-2 border-white"></div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-gray-800">Server Dispatched</span>
                      <span className="text-[9px] text-gray-400">12:58 PM</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Called for order clarification. Checked allergy details for Table #{order.table?.table_number || '5'}.</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[17px] top-0 w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-gray-600">Order Placed</span>
                      <span className="text-[9px] text-gray-400">12:50 PM</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Order ticket submitted to kitchen queue.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Billing & Meta (1/3 width) */}
            <div className="space-y-6">
              {/* Billing Summary */}
              <div className="bg-[#1e293b] text-white border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Billing Summary</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>GST ({order.gst_amount > 0 ? Math.round((order.gst_amount / order.subtotal) * 100) : 5}%)</span>
                    <span>₹{order.gst_amount}</span>
                  </div>
                  <div className="pt-2 border-t border-dashed border-slate-700 flex justify-between items-baseline">
                    <span className="text-sm font-bold">Total Amount</span>
                    <span className="text-xl font-bold text-teal-400">₹{order.total}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-teal-900/50 p-2.5 rounded-lg border border-teal-800/40 text-[10px] uppercase font-bold text-teal-300">
                  <span>Status</span>
                  <span>UNPAID</span>
                </div>

                <button
                  onClick={() => setInvoiceVisible(true)}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">receipt</span>
                  Generate Invoice
                </button>
              </div>

              {/* Customer Notes */}
              {order.customer_notes && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Customer Notes</h3>
                  <div className="p-3 bg-amber-50 border border-amber-100 text-amber-900 rounded-lg text-xs font-semibold leading-relaxed">
                    "{order.customer_notes}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <InvoiceModal
        order={order}
        visible={invoiceVisible}
        onClose={() => setInvoiceVisible(false)}
      />
    </div>
  );
};

export default OrderDetailModal;
