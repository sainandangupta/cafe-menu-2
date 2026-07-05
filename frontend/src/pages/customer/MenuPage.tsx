import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { tablesService } from '../../services/tables';
import { useCart } from '../../hooks/useCart';
import { useCategories, useDishes } from '../../hooks/useDishes';
import CustomerLayout from '../../layouts/CustomerLayout';

export const MenuPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tableContext, setTableContext, addItem } = useCart();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [validating, setValidating] = useState(false);

  const tokenParam = searchParams.get('tableToken') || searchParams.get('token');

  // Verify and load table context if not matching or missing
  useEffect(() => {
    const checkTableToken = async () => {
      if (!tokenParam) {
        if (!tableContext.tableToken) {
          navigate('/qr-scan');
        }
        return;
      }

      if (tableContext.tableToken !== tokenParam) {
        setValidating(true);
        try {
          const data = await tablesService.validateToken(tokenParam);
          setTableContext({
            tableId: data.table_id,
            tableNumber: data.table_number,
            cafeId: data.cafe_id,
            cafeName: data.cafe_name,
            tableToken: tokenParam,
          });
        } catch (err) {
          console.error(err);
          navigate('/qr-scan');
        } finally {
          setValidating(false);
        }
      }
    };

    checkTableToken();
  }, [tokenParam, tableContext.tableToken, navigate, setTableContext]);

  const cafeId = tableContext.cafeId;

  // React Query calls
  const { data: categories = [], isLoading: loadingCategories } = useCategories(cafeId);
  const { data: dishes = [], isLoading: loadingDishes } = useDishes(cafeId, true);

  // Real-time listener for dishes table updates
  useEffect(() => {
    if (!cafeId) return;

    const channel = supabase
      .channel(`menu-dishes-${cafeId}-${Math.random().toString(36).substring(7)}`) // avoid channel collision
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dishes',
          filter: `cafe_id=eq.${cafeId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dishes', cafeId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId, queryClient]);

  if (validating || loadingCategories || loadingDishes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9ff]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#006e2f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading cafe menu...</p>
        </div>
      </div>
    );
  }

  if (!cafeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9ff] p-4 text-center">
        <div className="max-w-xs mx-auto">
          <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">error</span>
          <h3 className="font-bold text-gray-700 mb-1">No Active Table Context</h3>
          <p className="text-sm text-gray-400">
            Please scan a table QR code to start ordering.
          </p>
        </div>
      </div>
    );
  }

  // Filtering
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategoryId === null || dish.category_id === selectedCategoryId;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dish.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (e: React.MouseEvent, dish: any) => {
    e.stopPropagation();
    addItem({
      dish_id: dish.id,
      name: dish.name,
      price: dish.price,
      image_url: dish.image_url,
      quantity: 1,
      special_instructions: '',
    });
  };

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <CustomerLayout showCartFab={true}>
      <div className="px-4 py-4">
        {/* Search Bar */}
        <section className="mb-5">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006e2f] focus:border-[#006e2f] transition-all outline-none text-sm text-gray-800"
            />
          </div>
        </section>

        {/* Categories Horizontal Scroll */}
        <section className="mb-6 -mx-4 overflow-x-auto no-scrollbar flex px-4 gap-2 items-center">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`flex-none px-5 py-2 rounded-full font-semibold text-xs border whitespace-nowrap transition-all duration-200 active:scale-95 ${
              selectedCategoryId === null
                ? 'bg-[#006e2f] border-[#006e2f] text-white'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            All Menu
          </button>
          {activeCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`flex-none px-5 py-2 rounded-full font-semibold text-xs border whitespace-nowrap transition-all duration-200 active:scale-95 ${
                selectedCategoryId === category.id
                  ? 'bg-[#006e2f] border-[#006e2f] text-white'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </section>

        {/* Grid of Dish Cards */}
        {filteredDishes.length > 0 ? (
          <section className="grid grid-cols-2 gap-4">
            {filteredDishes.map((dish) => {
              const label = dish.is_bestseller
                ? { text: 'Chef Special', bg: 'bg-[#fea619] text-[#684000]' }
                : dish.is_spicy
                ? { text: 'Spicy', bg: 'bg-[#b91a24] text-white' }
                : dish.is_veg
                ? { text: 'Popular', bg: 'bg-[#006e2f] text-white' }
                : null;

              return (
                <div
                  key={dish.id}
                  onClick={() => dish.is_available && navigate(`/dish/${dish.id}`)}
                  className={`bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col active:scale-[0.98] transition-transform duration-200 cursor-pointer ${
                    !dish.is_available ? 'opacity-70' : ''
                  }`}
                >
                  <div className="h-32 w-full relative bg-gray-50">
                    {dish.image_url ? (
                      <img
                        src={dish.image_url}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#006e2f]/5 text-[#006e2f] text-xl font-bold">
                        {dish.name[0]}
                      </div>
                    )}
                    {label && (
                      <div className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${label.bg}`}>
                        {label.text}
                      </div>
                    )}
                    {!dish.is_available && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white/90 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-300 uppercase shadow-xs">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1 mb-1">
                        <h3 className="font-semibold text-sm leading-tight text-gray-800 line-clamp-1">
                          {dish.name}
                        </h3>
                        {dish.is_available && (
                          <span className="material-symbols-outlined text-[#006e2f] text-lg font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[#006e2f] font-bold text-sm">₹{dish.price}</p>
                        {(dish as any).rating_avg > 0 ? (
                          <div className="flex items-center gap-0.5 text-[10px] text-gray-500">
                            <span className="material-symbols-outlined text-[#fea619] text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="font-bold text-gray-700">{(dish as any).rating_avg}</span>
                            <span className="text-gray-400">({(dish as any).rating_count})</span>
                          </div>
                        ) : (
                          <span className="text-[9px] bg-gray-50 text-gray-400 font-semibold px-1.5 py-0.5 rounded">New</span>
                        )}
                      </div>
                    </div>

                    {dish.is_available ? (
                      <button
                        onClick={(e) => handleQuickAdd(e, dish)}
                        className="mt-3 w-full py-2 bg-[#006e2f] hover:bg-[#006e2f]/90 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">add</span> Add
                      </button>
                    ) : (
                      <button
                        disabled
                        className="mt-3 w-full py-2 bg-gray-100 text-gray-400 rounded-lg font-semibold text-xs cursor-not-allowed"
                      >
                        Unavailable
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2">sentiment_dissatisfied</span>
            <p className="text-sm">No dishes match your selection.</p>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default MenuPage;
