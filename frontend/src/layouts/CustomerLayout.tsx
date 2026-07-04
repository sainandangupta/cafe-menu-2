import React from 'react';
import { Link, useLocation } from 'react-router';
import { useCart } from '../hooks/useCart';

interface CustomerLayoutProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  showCartFab?: boolean;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children, hideBottomNav = false, showCartFab = false }) => {
  const location = useLocation();
  const { items, totals, tableContext } = useCart();
  const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col max-w-[480px] mx-auto relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006e2f] text-2xl">restaurant</span>
          <span className="text-xl font-bold text-[#006e2f]">Bucks Cafe</span>
        </div>
        <div className="flex items-center gap-3">
          {tableContext.tableNumber && (
            <span className="bg-[#006e2f]/10 text-[#006e2f] text-xs font-semibold px-3 py-1.5 rounded-full">
              Table #{tableContext.tableNumber}
            </span>
          )}
          <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-full object-cover border border-gray-100" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Cart FAB - only when items exist and page wants it */}
      {showCartFab && totalItems > 0 && (
        <Link to="/cart" className="cart-fab">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[#006e2f] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-80">{totalItems} ITEMS ADDED</div>
              <div className="text-base font-bold">View Cart</div>
            </div>
          </div>
          <span className="text-xl font-bold">₹{totals.total}</span>
        </Link>
      )}

      {/* Bottom Navigation */}
      {!hideBottomNav && (
        <nav className="customer-bottom-nav">
          <Link to="/menu" className={isActive('/menu') ? 'active' : ''}>
            <span className="material-symbols-outlined text-xl">menu_book</span>
            <span>Menu</span>
          </Link>
          <Link to="/cart" className={isActive('/cart') ? 'active' : ''}>
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            <span>Cart</span>
          </Link>
        </nav>
      )}
    </div>
  );
};

export default CustomerLayout;
