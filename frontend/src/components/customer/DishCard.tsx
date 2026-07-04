import React from 'react';
import { Card, Tag, Button } from 'antd';
import { PlusOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import { Dish } from '../../types';
import { PriceDisplay } from '../shared/PriceDisplay';
import { useCart } from '../../hooks/useCart';

interface DishCardProps {
  dish: Dish;
  onClick: (dishId: string) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onClick }) => {
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid navigating to details
    addItem({
      dish_id: dish.id,
      name: dish.name,
      price: dish.price,
      image_url: dish.image_url,
      quantity: 1,
      special_instructions: '',
    });
  };

  return (
    <Card
      hoverable
      onClick={() => dish.is_available && onClick(dish.id)}
      className={`overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all duration-300 relative flex flex-col h-full ${
        !dish.is_available ? 'opacity-65 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-md'
      }`}
      bodyStyle={{ padding: '12px', flex: '1', display: 'flex', flexDirection: 'column' }}
      cover={
        <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
          {dish.image_url ? (
            <img
              src={dish.image_url}
              alt={dish.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-emerald-50 text-emerald-800 font-semibold">
              {dish.name[0]}
            </div>
          )}
          
          {/* Availability badge */}
          {!dish.is_available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold tracking-wider px-3 py-1.5 rounded-lg border border-white/40 uppercase bg-black/20 backdrop-blur-xs">
                SOLD OUT
              </span>
            </div>
          )}

          {/* Labels layer */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {dish.is_veg ? (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-emerald-500 uppercase">
                Veg
              </span>
            ) : (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-red-500 uppercase">
                Non-Veg
              </span>
            )}
            {dish.is_bestseller && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                <StarOutlined /> BEST
              </span>
            )}
            {dish.is_spicy && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                <FireOutlined /> SPICY
              </span>
            )}
          </div>
        </div>
      }
    >
      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-base text-gray-900 line-clamp-1 mb-1" title={dish.name}>
          {dish.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
          {dish.description || 'No description available.'}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <PriceDisplay price={dish.price} size="md" />
          {dish.is_available && (
            <Button
              type="primary"
              size="small"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={handleQuickAdd}
              className="bg-emerald-700 border-emerald-700 hover:bg-emerald-800 flex items-center justify-center shadow-md shadow-emerald-700/10"
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default DishCard;
