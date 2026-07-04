import React, { useState } from 'react';
import { useDishes, useUpdateDish } from '../../hooks/useDishes';
import { Dish } from '../../types';

interface DishAvailabilityPageProps {
  cafeId: string;
}

export const DishAvailabilityPage: React.FC<DishAvailabilityPageProps> = ({ cafeId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showToast, setShowToast] = useState(false);

  // Fetch ALL dishes
  const { data: dishes = [], isLoading } = useDishes(cafeId);
  const updateDishMutation = useUpdateDish();

  const handleToggleAvailability = async (id: string, currentAvailable: boolean) => {
    try {
      await updateDishMutation.mutateAsync({
        id,
        data: { is_available: !currentAvailable },
      });
      // Show confirmation toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {
      alert('Failed to update dish availability.');
    }
  };

  const filteredDishes = dishes.filter(
    (dish) =>
      (selectedCategory === 'all' || dish.category?.name === selectedCategory) &&
      (dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Extract unique categories from dishes list
  const categoriesList = Array.from(new Set(dishes.map(d => d.category?.name).filter(Boolean)));

  return (
    <div className="space-y-6 relative pb-16">
      {/* Search & Filter Header Bar */}
      <div className="bg-white border border-gray-250 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder="Search dishes, categories, or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-teal-700 bg-white"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Dishes Cards */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-semibold">Loading items database...</p>
        </div>
      ) : filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDishes.map((dish) => {
            const hasLabels = dish.is_bestseller || dish.is_spicy || !dish.is_available;

            return (
              <div
                key={dish.id}
                className="bg-white border border-gray-250 rounded-xl p-4 flex gap-4 items-center shadow-xs hover:shadow-sm transition-all"
              >
                <div className="w-20 h-20 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 relative">
                  {dish.image_url ? (
                    <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-800 text-lg font-bold">
                      {dish.name[0]}
                    </div>
                  )}
                  {!dish.is_available && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white uppercase tracking-wider bg-red-600/80 px-1 py-0.5 rounded">
                        Out of stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{dish.name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">
                        {dish.category?.name || 'Mains'} • ₹{dish.price}
                      </p>
                    </div>

                    {/* Switch Toggle */}
                    <div
                      onClick={() => handleToggleAvailability(dish.id, dish.is_available)}
                      className={`toggle-switch ${dish.is_available ? 'active' : ''}`}
                    ></div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {dish.is_bestseller && (
                      <span className="text-[9px] bg-amber-50 text-[#92400e] border border-amber-200/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        BESTSELLER
                      </span>
                    )}
                    {dish.is_spicy && (
                      <span className="text-[9px] bg-red-50 text-red-700 border border-red-200/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        SPICY
                      </span>
                    )}
                    {!dish.is_available && (
                      <span className="text-[9px] bg-gray-50 text-gray-500 border border-gray-250 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        UNAVAILABLE
                      </span>
                    )}
                    {dish.is_available && (
                      <span className="text-[9px] bg-green-50 text-green-700 border border-green-200/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        IN STOCK
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 bg-white border border-gray-250 rounded-xl text-center shadow-xs">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-3">fastfood</span>
          <h3 className="font-bold text-gray-700 text-sm">No Dishes Matching Search</h3>
          <p className="text-xs text-gray-400 mt-1">Try refining search parameters or category filter.</p>
        </div>
      )}

      {/* Auto Saved Changes Toast Banner */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 text-xs font-semibold border border-slate-700 animate-bounce">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          All changes saved automatically
        </div>
      )}
    </div>
  );
};

export default DishAvailabilityPage;
