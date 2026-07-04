import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useOrderDetails, useCallStaff } from '../../hooks/useOrders';
import { ratingsService } from '../../services/ratings';
import { useCart } from '../../hooks/useCart';
import { useSocket } from '../../hooks/useSocket';
import CustomerLayout from '../../layouts/CustomerLayout';

export const OrderStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tableContext } = useCart();
  const callStaffMutation = useCallStaff();

  const { data: order, isLoading } = useOrderDetails(id);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [staffCalledText, setStaffCalledText] = useState('');

  const [ratedDishes, setRatedDishes] = useState<Record<string, number>>({});
  const [ratedComments, setRatedComments] = useState<Record<string, string>>({});
  const [submittedRatings, setSubmittedRatings] = useState<Record<string, boolean>>({});

  // Connect to Socket.IO and join the table room for real-time status updates
  const tableId = order?.table_id || tableContext.tableId || null;
  const socket = useSocket({ tableId });

  // Real-time listener for order status changes via Socket.IO
  useEffect(() => {
    if (!id) return;

    const handleStatusChanged = (data: any) => {
      if (data?.order_id === id) {
        queryClient.invalidateQueries({ queryKey: ['order', id] });
      }
    };

    socket.on('orderStatusChanged', handleStatusChanged);

    return () => {
      socket.off('orderStatusChanged', handleStatusChanged);
    };
  }, [id, socket, queryClient]);

  const handleCallStaff = async () => {
    if (!id) return;
    try {
      await callStaffMutation.mutateAsync(id);
      setStaffCalledText('Staff notified. Someone will be with you shortly!');
      setTimeout(() => setStaffCalledText(''), 5000);
    } catch {
      setStaffCalledText('Failed to notify staff. Please try again.');
    }
  };

  const handleBackToMenu = () => {
    navigate(tableContext.tableToken ? `/menu?tableToken=${tableContext.tableToken}` : '/menu');
  };

  const submitRating = async (dishId: string) => {
    const stars = ratedDishes[dishId];
    if (!stars) {
      alert('Please select a star rating first.');
      return;
    }

    try {
      await ratingsService.createRating({
        cafe_id: order!.cafe_id,
        dish_id: dishId,
        order_id: order!.id,
        table_id: order!.table_id,
        rating: stars,
        comment: ratedComments[dishId] || '',
      });
      setSubmittedRatings((prev) => ({ ...prev, [dishId]: true }));
    } catch {
      alert('Failed to submit rating. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9ff]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#006e2f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading status...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9ff] p-4 text-center">
        <div>
          <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">receipt_long</span>
          <h3 className="font-bold text-gray-700 mb-1">Order Not Found</h3>
          <p className="text-sm text-gray-400 mb-6">Please scan the table QR code again.</p>
          <button onClick={handleBackToMenu} className="btn-primary-green text-sm max-w-xs py-2 px-6">Go to Menu</button>
        </div>
      </div>
    );
  }

  // Calculate estimated minutes remaining based on (created_at + 15 mins)
  const createdTime = order.created_at ? new Date(order.created_at).getTime() : NaN;
  const targetTime = !isNaN(createdTime) ? createdTime + 15 * 60 * 1000 : NaN;
  const now = new Date().getTime();
  const rawMinsRemaining = !isNaN(targetTime) ? Math.max(0, Math.ceil((targetTime - now) / 60000)) : 15;
  const minsRemaining = isNaN(rawMinsRemaining) ? 15 : rawMinsRemaining;

  // Determine active steps based on status
  // Status stages: confirmed -> preparing -> prepared -> delivered
  const statusHierarchy = ['confirmed', 'preparing', 'prepared', 'delivered'];
  const currentStepIndex = statusHierarchy.indexOf(order.status.toLowerCase());

  const getStepState = (stepIndex: number) => {
    if (currentStepIndex > stepIndex) return 'completed';
    if (currentStepIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <CustomerLayout>
      <div className="px-4 py-4 max-w-xl mx-auto space-y-6">
        {/* Status Hero Card */}
        <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#006e2f] mb-1">
                {order.status === 'delivered' ? 'Order Delivered!' : `Prepared in ${minsRemaining || 15} mins`}
              </h2>
              <div className="flex items-center gap-2 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-[#006e2f] animate-pulse"></span>
                <span className="text-[10px] font-semibold">Auto-refreshing live status...</span>
              </div>
            </div>
            <div className="bg-[#006e2f]/10 p-2 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#006e2f] text-2xl">timer</span>
            </div>
          </div>

          {/* Timeline Visualization */}
          <div className="space-y-6 relative pb-2 pl-2">
            {/* Step 1: Confirmed */}
            <div className="flex gap-4 relative">
              <div className={`timeline-line ${getStepState(0) === 'completed' || getStepState(0) === 'active' ? 'bg-[#006e2f]' : 'bg-gray-200'}`}></div>
              <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                getStepState(0) === 'completed' || getStepState(0) === 'active'
                  ? 'bg-[#006e2f] text-white'
                  : 'bg-white border-2 border-gray-300 text-gray-300'
              }`}>
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Order Confirmed</p>
                <p className="text-[10px] text-gray-400">
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Step 2: Preparing */}
            <div className="flex gap-4 relative">
              <div className={`timeline-line ${getStepState(1) === 'completed' || getStepState(1) === 'active' ? 'bg-[#006e2f]' : 'bg-gray-200'}`}></div>
              <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                getStepState(1) === 'completed'
                  ? 'bg-[#006e2f] text-white'
                  : getStepState(1) === 'active'
                  ? 'bg-[#fea619] text-[#684000]'
                  : 'bg-white border-2 border-gray-300 text-gray-300'
              }`}>
                <span className="material-symbols-outlined text-sm font-bold">
                  {getStepState(1) === 'completed' ? 'check' : 'schedule'}
                </span>
              </div>
              <div>
                <p className={`text-xs font-bold ${getStepState(1) === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>
                  Preparing your meal
                </p>
                <p className="text-[10px] text-gray-400">
                  {getStepState(1) === 'active' ? 'In progress' : getStepState(1) === 'completed' ? 'Completed' : 'Waiting...'}
                </p>
              </div>
            </div>

            {/* Step 3: Prepared */}
            <div className="flex gap-4 relative">
              <div className={`timeline-line ${getStepState(2) === 'completed' || getStepState(2) === 'active' ? 'bg-[#006e2f]' : 'bg-gray-200'}`}></div>
              <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                getStepState(2) === 'completed'
                  ? 'bg-[#006e2f] text-white'
                  : getStepState(2) === 'active'
                  ? 'bg-[#fea619] text-[#684000] border-[#fea619]'
                  : 'bg-white border-2 border-gray-300 text-gray-300'
              }`}>
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </div>
              <div>
                <p className={`text-xs font-bold ${getStepState(2) === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>
                  Order Prepared
                </p>
                <p className="text-[10px] text-gray-400">
                  {getStepState(2) === 'active' ? 'Ready for pickup' : getStepState(2) === 'completed' ? 'Completed' : 'Waiting...'}
                </p>
              </div>
            </div>

            {/* Step 4: Delivered */}
            <div className="flex gap-4">
              <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                getStepState(3) === 'completed' || getStepState(3) === 'active'
                  ? 'bg-[#006e2f] text-white'
                  : 'bg-white border-2 border-gray-300 text-gray-300'
              }`}>
                <span className="material-symbols-outlined text-sm font-bold">delivery_dining</span>
              </div>
              <div>
                <p className={`text-xs font-bold ${getStepState(3) === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>
                  Delivered to Table #{order.table?.table_number || tableContext.tableNumber}
                </p>
                <p className="text-[10px] text-gray-400">
                  {getStepState(3) === 'completed' || getStepState(3) === 'active' ? 'Enjoy your meal!' : 'Final step'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Collapsible Order Details */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="w-full px-4 py-3.5 flex justify-between items-center bg-gray-50 hover:bg-gray-100/50 transition-colors"
          >
            <span className="font-semibold text-xs text-gray-800">Order Details</span>
            <span className={`material-symbols-outlined transition-transform duration-300 text-gray-400 ${
              detailsOpen ? 'rotate-180' : ''
            }`}>
              expand_more
            </span>
          </button>
          {detailsOpen && (
            <div className="px-4 py-4 space-y-4 border-t border-gray-200">
              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-xs font-semibold">
                    <div>
                      <p className="text-gray-800">{item.quantity}x {item.dish?.name}</p>
                      {item.special_instructions && (
                        <p className="text-[10px] text-amber-700 italic">"{item.special_instructions}"</p>
                      )}
                    </div>
                    <p className="text-gray-500">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-dashed border-gray-250 space-y-2">
                <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                  <span>Table Number</span>
                  <span className="font-bold text-gray-700">#{order.table?.table_number}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[#006e2f] pt-1">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rating widget (post delivery) */}
        {order.status === 'delivered' && order.order_items && (
          <div className="bg-white border border-gray-250 rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider pb-1 border-b border-gray-100">Rate your Meal!</h3>
            <div className="space-y-4">
              {order.order_items.map((item) => {
                const dish = item.dish;
                if (!dish) return null;
                const submitted = submittedRatings[dish.id];

                return (
                  <div key={item.id} className="border-b border-gray-50 last:border-b-0 pb-3 last:pb-0 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-gray-700">{dish.name}</span>
                      {submitted && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          ✓ Rated
                        </span>
                      )}
                    </div>

                    {!submitted ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRatedDishes((prev) => ({ ...prev, [dish.id]: star }))}
                                className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-lg" style={{
                                  fontVariationSettings: ratedDishes[dish.id] >= star ? "'FILL' 1" : "'FILL' 0"
                                }}>
                                  star
                                </span>
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => submitRating(dish.id)}
                            className="bg-[#006e2f] hover:bg-[#006e2f]/90 text-white rounded-lg text-[10px] font-bold px-3 py-1.5 transition-colors active:scale-95"
                          >
                            Submit
                          </button>
                        </div>
                        <input
                          placeholder="Optional comment (e.g. delicious, too salty...)"
                          value={ratedComments[dish.id] || ''}
                          onChange={(e) => setRatedComments((prev) => ({ ...prev, [dish.id]: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-lg text-xs outline-none focus:bg-white"
                        />
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic">Thank you for helping us improve!</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Atmospheric Visual Card */}
        <div className="relative h-44 rounded-xl overflow-hidden border border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <div className="absolute bottom-3 left-3 z-20 text-white">
            <p className="text-[10px] uppercase tracking-wider opacity-85">Brewing fresh</p>
            <h3 className="text-sm font-bold">High-altitude Arabica</h3>
          </div>
          <img
            className="w-full h-full object-cover"
            alt="Espresso machine dripping"
            src="https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?q=80&w=600&auto=format&fit=crop"
          />
        </div>
      </div>
    </CustomerLayout>
  );
};

export default OrderStatusPage;
