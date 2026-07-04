import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../../hooks/useCart';
import { useCreateOrder } from '../../hooks/useOrders';
import CustomerLayout from '../../layouts/CustomerLayout';

export const CheckoutPage: React.FC = () => {
  const { items, totals, tableContext, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrderMutation = useCreateOrder();

  const [notes, setNotes] = useState('');
  const [notifyStaff, setNotifyStaff] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBackToCart = () => {
    navigate('/cart');
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setErrorMsg('Your cart is empty. Cannot place order.');
      return;
    }

    if (!tableContext.tableId || !tableContext.cafeId) {
      setErrorMsg('Invalid table scanning details. Please scan QR again.');
      navigate('/qr-scan');
      return;
    }

    const finalNotes = [
      notes.trim(),
      notifyStaff ? '[Notify staff when ready]' : '',
    ]
      .filter((s) => s.length > 0)
      .join(' ');

    const payload = {
        table_id: tableContext.tableId,
        items: items.map((item) => ({
          dish_id: item.dish_id,
          quantity: item.quantity,
          special_instructions: item.special_instructions || undefined,
        })),
        customer_notes: finalNotes || undefined,
      };

    try {
      setErrorMsg('');
      const response = await createOrderMutation.mutateAsync(payload);
      clearCart();

      // Redirect to Order Confirmation screen passing order details
      navigate(`/order-confirmed/${response.id}`, {
        state: {
          token: response.order_token,
          total: response.total,
          tableNumber: tableContext.tableNumber,
        },
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">shopping_cart</span>
        <h3 className="font-bold text-gray-800 text-lg mb-2">No Items for Checkout</h3>
        <button
          onClick={() => navigate(tableContext.tableToken ? `/menu?tableToken=${tableContext.tableToken}` : '/menu')}
          className="btn-primary-green max-w-xs mt-4"
        >
          Go to Menu
        </button>
      </div>
    );
  }

  return (
    <CustomerLayout hideBottomNav={true}>
      <div className="px-4 py-4 max-w-xl mx-auto space-y-6">
        {/* Order Header */}
        <section>
          <h1 className="text-xl font-bold text-gray-900 mb-0.5">Review Order</h1>
          <p className="text-xs text-gray-500">Confirm your items and special requests.</p>
        </section>

        {/* Order Summary Card */}
        <section className="bg-white border border-gray-250 rounded-xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item Summary</h2>
            <span className="text-[10px] font-bold text-[#006e2f]">{items.reduce((sum, item) => sum + item.quantity, 0)} ITEMS</span>
          </div>
          
          <div className="divide-y divide-gray-150">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#006e2f]/5 text-[#006e2f] text-sm font-bold">
                        {item.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-xs text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400">Quantity: {item.quantity}</p>
                    {item.special_instructions && (
                      <p className="text-[10px] text-amber-700 italic">"{item.special_instructions}"</p>
                    )}
                  </div>
                </div>
                <p className="font-semibold text-xs text-gray-800">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          {/* Total Section */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
              <span>Subtotal</span>
              <span>₹{totals.subtotal}</span>
            </div>
            <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
              <span>GST ({totals.gstPercentage}%)</span>
              <span>₹{totals.gstAmount}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-800">Total Amount</span>
              <span className="text-base font-bold text-[#006e2f]">₹{totals.total}</span>
            </div>
          </div>
        </section>

        {/* Customer Notes */}
        <section className="space-y-1">
          <label className="text-xs font-semibold text-gray-700" htmlFor="notes">Customer Notes</label>
          <textarea
            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] placeholder:text-gray-400 resize-none"
            id="notes"
            placeholder="Any special requests? (e.g., extra spicy, no onions)"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        {/* Payment & Notifications */}
        <section className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#855300] text-xl">payments</span>
              <span className="text-xs font-semibold text-gray-700">Payment Method</span>
            </div>
            <span className="bg-[#855300]/10 text-[#855300] px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-[#fea619]/25 uppercase">
              Payment at counter
            </span>
          </div>

          <div
            onClick={() => setNotifyStaff(!notifyStaff)}
            className="flex items-start gap-3 cursor-pointer select-none"
          >
            <div className="relative mt-0.5">
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                notifyStaff ? 'bg-[#006e2f] border-[#006e2f]' : 'border-gray-300'
              }`}>
                {notifyStaff && (
                  <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                )}
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-xs font-bold text-gray-800">Notify staff when order arrives</p>
              <p className="text-[10px] text-gray-400">We'll alert the floor manager to prioritize your table.</p>
            </div>
          </div>
        </section>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePlaceOrder}
            disabled={createOrderMutation.isPending}
            className="btn-primary-green h-12"
          >
            {createOrderMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Place Order
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </button>
          <button onClick={handleBackToCart} className="btn-secondary h-12">
            Edit Cart
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CheckoutPage;
