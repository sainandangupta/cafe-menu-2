import React from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../../hooks/useCart';
import CustomerLayout from '../../layouts/CustomerLayout';

export const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, totals, tableContext } = useCart();
  const navigate = useNavigate();

  const handleBackToMenu = () => {
    navigate(tableContext.tableToken ? `/menu?tableToken=${tableContext.tableToken}` : '/menu');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <CustomerLayout>
      <div className="px-4 py-4 max-w-xl mx-auto">
        {/* Header Section */}
        <section className="flex items-baseline justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900">Your Order</h1>
          <button
            onClick={handleBackToMenu}
            className="text-xs font-semibold text-[#006e2f] hover:underline flex items-center gap-1 bg-none border-none cursor-pointer"
          >
            Continue Shopping
          </button>
        </section>

        {items.length > 0 ? (
          <div>
            {/* Cart Items List */}
            <div className="space-y-3 mb-6">
              {items.map((item, idx) => (
                <div
                  key={`${item.dish_id}-${idx}`}
                  className="bg-white border border-gray-200 rounded-xl p-3 flex gap-4 items-start active:bg-gray-50/50 transition-colors duration-200"
                >
                  <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#006e2f]/5 text-[#006e2f] text-lg font-bold">
                        {item.name[0]}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.dish_id)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors active:scale-90"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    
                    <p className="text-xs font-bold text-gray-500 mt-0.5">₹{item.price}</p>
                    
                    {item.special_instructions && (
                      <div className="mt-1.5 text-[10px] bg-amber-50 border border-amber-100 px-2 py-1 rounded text-amber-800 font-medium">
                        <span className="font-bold">Note: </span>
                        {item.special_instructions}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.dish_id, Math.max(0, item.quantity - 1))}
                          className="p-1 px-2 text-[#006e2f] hover:bg-gray-50 active:scale-90 transition-transform font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-700 min-w-[24px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.dish_id, item.quantity + 1)}
                          className="p-1 px-2 text-[#006e2f] hover:bg-gray-50 active:scale-90 transition-transform font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Summary Section */}
            <section className="flex flex-col items-end space-y-2 mb-8">
              <div className="flex justify-between w-full max-w-[220px] text-xs text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-700">₹{totals.subtotal}</span>
              </div>
              <div className="flex justify-between w-full max-w-[220px] text-xs text-gray-500">
                <span>{totals.gstPercentage}% GST</span>
                <span className="font-semibold text-gray-700">₹{totals.gstAmount}</span>
              </div>
              <div className="flex justify-between w-full max-w-[220px] pt-2 border-t border-dashed border-gray-300">
                <span className="text-sm font-bold text-gray-800">Total</span>
                <span className="text-base font-bold text-[#006e2f]">₹{totals.total}</span>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col gap-3 sticky bottom-4 bg-[#f9f9ff]/80 backdrop-blur-md pt-2">
              <button onClick={handleCheckout} className="btn-primary-green">
                Proceed to Checkout
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <button onClick={handleBackToMenu} className="btn-secondary">
                Keep Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-3">shopping_basket</span>
            <h3 className="font-bold text-gray-700 text-sm mb-1">Your Cart is Empty</h3>
            <p className="text-xs text-gray-400 mb-6 max-w-xs mx-auto">
              Add delicious food items from our catalog to submit your orders.
            </p>
            <button onClick={handleBackToMenu} className="btn-primary-green max-w-xs mx-auto text-sm py-2 px-6">
              Browse Dishes
            </button>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CartPage;
