import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDishDetails, useDishes } from '../../hooks/useDishes';
import { ratingsService, DishRatingDetails } from '../../services/ratings';
import { useCart } from '../../hooks/useCart';
import CustomerLayout from '../../layouts/CustomerLayout';

export const DishDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, tableContext } = useCart();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState<number>(1);
  const [instructions, setInstructions] = useState('');
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dish details
  const { data: dish, isLoading: loadingDish } = useDishDetails(id);
  
  // Fetch other dishes in cafe for recommendations ("Goes great with")
  const { data: allDishes = [] } = useDishes(tableContext.cafeId, true);

  // Fetch ratings details (avg, count, recent reviews)
  const { data: ratingDetails } = useQuery<DishRatingDetails>({
    queryKey: ['dish-ratings', id],
    queryFn: () => ratingsService.getDishRatingDetails(id || ''),
    enabled: !!id,
  });

  const reviews = ratingDetails?.ratings || [];
  const ratingCount = ratingDetails?.rating_count || 0;
  const ratingAvg = ratingDetails?.avg_rating || 0;

  const isValidUUID = (val: any) => {
    if (typeof val !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(val);
  };

  const handleSubmitRating = async () => {
    if (userRating === 0) return;
    setIsSubmitting(true);
    try {
      await ratingsService.createRating({
        cafe_id: dish?.cafe_id || tableContext.cafeId || '',
        dish_id: id || '',
        table_id: (typeof tableContext.tableId === 'string' && isValidUUID(tableContext.tableId)) ? tableContext.tableId : undefined,
        rating: userRating,
      });
      setHasRated(true);
      setUserRating(0);
      // Invalidate caches to refresh data
      queryClient.invalidateQueries({ queryKey: ['dish', id] });
      queryClient.invalidateQueries({ queryKey: ['dish-ratings', id] });
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || 'Please try again.';
      alert(`Failed to submit rating: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (!dish) return;

    addItem({
      dish_id: dish.id,
      name: dish.name,
      price: Number(dish.price),
      image_url: dish.image_url,
      quantity,
      special_instructions: instructions.trim(),
    });
    
    navigate(tableContext.tableToken ? `/menu?tableToken=${tableContext.tableToken}` : '/menu');
  };

  const handleBack = () => {
    navigate(tableContext.tableToken ? `/menu?tableToken=${tableContext.tableToken}` : '/menu');
  };

  if (loadingDish) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9ff]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#006e2f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading dish details...</p>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9ff] p-6 text-center">
        <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">error</span>
        <h3 className="font-bold text-gray-800 text-lg mb-2">Dish Not Found</h3>
        <p className="text-sm text-gray-500 mb-6">The dish you are looking for is not available.</p>
        <button onClick={handleBack} className="btn-secondary py-2 text-sm font-semibold max-w-xs">Back to Menu</button>
      </div>
    );
  }

  // Use live rating from API
  const avgRating = ratingAvg > 0 ? ratingAvg.toFixed(1) : null;

  // Get recommendations ("Goes great with") - select first two items that aren't the current dish
  const recommendations = allDishes
    .filter(d => d.id !== dish.id && d.is_available)
    .slice(0, 2);

  return (
    <CustomerLayout hideBottomNav={true}>
      <div className="relative">
        {/* Full-bleed Hero Image with Back Button Overlay */}
        <div className="relative h-72 w-full bg-gray-150">
          {dish.image_url ? (
            <img
              src={dish.image_url}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#006e2f]/5 flex items-center justify-center text-[#006e2f] text-6xl font-bold">
              {dish.name[0]}
            </div>
          )}
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-800 shadow-sm hover:bg-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined font-bold">arrow_back</span>
          </button>
        </div>

        {/* Details Wrapper Overlay */}
        <div className="px-4 mt-[-24px] relative z-10">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
            {/* Category / Rating / Price */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold text-[#855300] uppercase tracking-wider">
                  {dish.category?.name || 'Mains'}
                </span>
                <h1 className="text-xl font-bold text-gray-900 mt-1">{dish.name}</h1>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <span className="material-symbols-outlined text-[#fea619] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-semibold text-gray-700">
                    {avgRating ? `${avgRating}/5` : 'No ratings yet'}
                  </span>
                  {ratingCount > 0 && (
                    <span className="text-gray-400">({ratingCount} review{ratingCount !== 1 ? 's' : ''})</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-[#006e2f]">₹{dish.price}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs leading-relaxed text-gray-500 mt-4 mb-5">
              {dish.description || 'Authentic dish prepared fresh with curated premium ingredients.'}
            </p>

            {/* Ingredients Accordion */}
            <div className="border border-gray-250 rounded-xl mb-5 overflow-hidden">
              <button
                onClick={() => setIngredientsOpen(!ingredientsOpen)}
                className="w-full px-4 py-3.5 bg-gray-50 flex items-center justify-between font-semibold text-xs text-gray-700"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-500 text-lg">restaurant_menu</span>
                  <span>Ingredients</span>
                </div>
                <span className="material-symbols-outlined text-gray-400">
                  {ingredientsOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {ingredientsOpen && (
                <div className="px-4 py-3 bg-white border-t border-gray-200">
                  {dish.ingredients && dish.ingredients.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {dish.ingredients.map((ing, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2.5 py-1 rounded">
                          {ing}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Fresh home-style recipe ingredients.</p>
                  )}
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Special instructions
              </label>
              <textarea
                placeholder="Add instructions (less spicy, no onions, etc.)"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] resize-none"
              />
            </div>

            {/* Quantity Selector */}
            <div className="bg-[#f0f3ff] rounded-xl p-3 flex items-center justify-between mb-5">
              <span className="text-xs font-semibold text-gray-700 pl-1">Quantity</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-600 text-lg font-bold"
                >
                  -
                </button>
                <span className="font-bold text-sm text-gray-800 w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-600 text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className="space-y-2">
              <button onClick={handleAddToCart} className="btn-primary-green">
                <span className="material-symbols-outlined text-lg">shopping_cart</span>
                Add to Cart
              </button>
              <button onClick={handleBack} className="btn-secondary">
                Back to Menu
              </button>
            </div>
          </div>
        </div>

        {/* Rate this Dish Card */}
        <section className="px-4 mt-6">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-3">Rate this Dish</h3>
            {hasRated ? (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-xl text-xs font-semibold">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>Thank you! Your rating has been submitted.</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-amber-400 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-2xl" style={{
                          fontVariationSettings: (hoverRating || userRating) >= star ? "'FILL' 1" : "'FILL' 0"
                        }}>
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                  {(hoverRating || userRating) > 0 && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full">
                      {hoverRating || userRating} / 5
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSubmitRating}
                  disabled={userRating === 0 || isSubmitting}
                  className="bg-[#006e2f] hover:bg-[#006e2f]/90 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-xs font-bold px-5 py-2 transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Goes great with Section */}
        {recommendations.length > 0 && (
          <section className="px-4 mt-8 pb-10">
            <h2 className="text-sm font-bold text-gray-950 mb-3">Goes great with</h2>
            <div className="flex gap-4">
              {recommendations.map(rec => (
                <div
                  key={rec.id}
                  onClick={() => navigate(`/dish/${rec.id}`)}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden p-2.5 flex-1 cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="h-28 w-full bg-gray-50 rounded-xl overflow-hidden mb-2">
                    {rec.image_url ? (
                      <img src={rec.image_url} alt={rec.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#006e2f]/5 text-[#006e2f] text-lg font-bold">
                        {rec.name[0]}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-xs text-gray-800 line-clamp-1">{rec.name}</h3>
                  <p className="text-[#006e2f] font-bold text-xs mt-0.5">₹{rec.price}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </CustomerLayout>
  );
};

export default DishDetailPage;
