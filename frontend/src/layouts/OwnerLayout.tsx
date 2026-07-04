import React from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface OwnerLayoutProps {
  children: React.ReactNode;
  title: string;
  headerRight?: React.ReactNode;
}

const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children, title, headerRight }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/owner/dashboard', label: 'Live Orders', icon: 'order_approve' },
    { path: '/owner/history', label: 'History', icon: 'history' },
    { path: '/owner/availability', label: 'Menu Management', icon: 'restaurant_menu' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-[#f0fdfa]">
      {/* Sidebar */}
      <aside className="owner-sidebar">
        <div className="px-5 py-6">
          <h1 className="text-xl font-bold text-white">QuickCafe</h1>
          <h2 className="text-lg font-bold text-[#5eead4]">Owner</h2>
          <p className="text-xs text-teal-300/60 mt-1">Operational Hub</p>
        </div>

        <nav className="flex-1 mt-4">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`owner-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'CO'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Cafe Owner</p>
              <p className="text-xs text-teal-300/60 truncate">Admin Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 ml-[240px] flex flex-col">
        {/* Top Header */}
        <header className="owner-header">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="flex items-center gap-4">
            {headerRight}
            <span className="material-symbols-outlined text-xl cursor-pointer">notifications</span>
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
              {user?.email?.charAt(0).toUpperCase() || 'O'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
