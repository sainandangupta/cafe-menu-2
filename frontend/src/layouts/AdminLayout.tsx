import React from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/menu', label: 'Menu', icon: 'restaurant_menu' },
    { path: '/admin/categories', label: 'Categories', icon: 'category' },
    { path: '/admin/tables', label: 'Tables', icon: 'table_restaurant' },
    { path: '/admin/settings', label: 'Settings', icon: 'settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-[#f8f9ff]">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="px-5 py-6">
          <h1 className="text-xl font-bold text-[#93b4ff]">QuickCafe</h1>
          <p className="text-[11px] uppercase tracking-[0.15em] text-blue-300/50 mt-1">Admin Terminal</p>
        </div>

        <nav className="flex-1 mt-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-200 truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-xs text-blue-400/50 truncate">Senior Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 ml-[240px] flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          {title && <h1 className="text-xl font-semibold text-[#0b1c30]">{title}</h1>}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Search orders, dishes, or tables..."
                className="input-field input-field-blue pl-10 py-2.5 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-xl text-gray-500 cursor-pointer relative">
              notifications
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </span>
            <span className="material-symbols-outlined text-xl text-gray-500 cursor-pointer">help</span>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-medium text-gray-800">{user?.email?.split('@')[0] || 'Admin'}</p>
                <p className="text-[10px] text-gray-400">System Admin</p>
              </div>
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

export default AdminLayout;
