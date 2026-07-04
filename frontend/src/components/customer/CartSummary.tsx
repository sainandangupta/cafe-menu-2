import React from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCartOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useCart } from '../../hooks/useCart';
import { PriceDisplay } from '../shared/PriceDisplay';

export const CartSummary: React.FC = () => {
  const { items, totals } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-[0_-4px_15px_rgba(0,0,0,0.06)] z-40 transition-all duration-300">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 relative">
            <ShoppingCartOutlined className="text-xl" />
            <span className="absolute -top-1.5 -right-1.5 bg-emerald-700 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center border border-white">
              {totalCount}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Your Cart</p>
            <PriceDisplay price={totals.total} size="lg" className="text-emerald-950 font-bold" />
          </div>
        </div>
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-800/10 hover:shadow-emerald-900/20 cursor-pointer"
        >
          <span>Review Order</span>
          <ArrowRightOutlined className="text-xs animate-pulse" />
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
