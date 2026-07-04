import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { useCategories, useDishes } from '../../hooks/useDishes';
import { useQuery } from '@tanstack/react-query';
import { tablesService } from '../../services/tables';
import MenuManagementPage from './MenuManagementPage';
import CategoryManagementPage from './CategoryManagementPage';
import TableQRManagementPage from './TableQRManagementPage';
import SettingsPage from './SettingsPage';

export const AdminDashboard: React.FC = () => {
  const { user, logout, cafeId } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'categories' | 'tables' | 'settings'>('home');

  // Queries for stats
  const { data: categories = [] } = useCategories(cafeId);
  const { data: dishes = [] } = useDishes(cafeId);
  const { data: tables = [] } = useQuery({
    queryKey: ['tables', cafeId],
    queryFn: () => tablesService.getTables(cafeId || ''),
    enabled: !!cafeId,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickAction = (tab: 'menu' | 'categories' | 'tables') => {
    setActiveTab(tab);
  };

  if (!cafeId) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-gray-250 rounded-2xl shadow-sm max-w-sm w-full p-8 space-y-6">
          <span className="material-symbols-outlined text-blue-600 text-6xl">admin_panel_settings</span>
          <h3 className="font-bold text-gray-800 text-lg">No Cafe Assigned</h3>
          <p className="text-xs text-gray-500">
            Your admin account is not linked to any active cafe in the system. Please request support.
          </p>
          <button onClick={handleLogout} className="btn-primary-blue w-full">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-gray-800">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="px-5 py-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-500">restaurant</span>
            QuickCafe
          </h1>
          <p className="text-[10px] uppercase tracking-wider text-blue-300/50 font-bold mt-1">Admin Terminal</p>
        </div>

        <nav className="flex-1 mt-2">
          {[
            { id: 'home', label: 'Dashboard', icon: 'dashboard' },
            { id: 'menu', label: 'Menu', icon: 'restaurant_menu' },
            { id: 'categories', label: 'Categories', icon: 'category' },
            { id: 'tables', label: 'Tables', icon: 'table_restaurant' },
            { id: 'settings', label: 'Settings', icon: 'settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-[calc(100%-24px)] text-left admin-nav-item border-none bg-transparent cursor-pointer ${
                activeTab === tab.id ? 'active' : ''
              }`}
            >
              <span className="material-symbols-outlined text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* User profile / logout at bottom */}
        <div className="px-5 py-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-[10px] text-blue-400/50 truncate">Senior Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left py-2 px-3 hover:bg-red-500/10 text-red-300 hover:text-red-200 text-xs font-bold rounded-lg border-none bg-transparent flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-[240px] flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-150 px-6 py-3 flex justify-between items-center sticky top-0 z-30">
          <h1 className="text-base font-bold text-gray-900 tracking-wide uppercase">
            {activeTab === 'home' && 'Admin Dashboard'}
            {activeTab === 'menu' && 'Manage Dishes'}
            {activeTab === 'categories' && 'Manage Categories'}
            {activeTab === 'tables' && 'Manage Tables & QR Codes'}
            {activeTab === 'settings' && 'Cafe Settings'}
          </h1>
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                placeholder="Search orders, dishes, or tables..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-250 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-xl text-gray-500 hover:text-gray-700 cursor-pointer relative">
              notifications
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </span>
            <span className="material-symbols-outlined text-xl text-gray-500 hover:text-gray-700 cursor-pointer">help</span>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-6">
          {activeTab === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Analytics & Quick Actions (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                {/* 4 KPI cards grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="kpi-card bg-white border border-gray-250 rounded-xl p-4 flex flex-col justify-between shadow-xs">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span className="material-symbols-outlined text-blue-500">restaurant_menu</span>
                      <span className="text-[10px] font-bold text-green-500">+12%</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Active Dishes</p>
                      <p className="text-xl font-bold text-gray-800 mt-0.5">{dishes.length || 42}</p>
                    </div>
                  </div>

                  <div className="kpi-card bg-white border border-gray-250 rounded-xl p-4 flex flex-col justify-between shadow-xs">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span className="material-symbols-outlined text-blue-500">category</span>
                      <span className="text-[10px] font-bold text-gray-500">Stable</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Categories</p>
                      <p className="text-xl font-bold text-gray-800 mt-0.5">{categories.length || 8}</p>
                    </div>
                  </div>

                  <div className="kpi-card bg-white border border-gray-250 rounded-xl p-4 flex flex-col justify-between shadow-xs">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span className="material-symbols-outlined text-blue-500">table_restaurant</span>
                      <span className="text-[10px] font-bold text-blue-500">Full</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Tables</p>
                      <p className="text-xl font-bold text-gray-800 mt-0.5">{tables.length || 15}</p>
                    </div>
                  </div>

                  <div className="kpi-card bg-white border border-gray-250 rounded-xl p-4 flex flex-col justify-between shadow-xs">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span className="material-symbols-outlined text-amber-500">star</span>
                      <span className="text-[10px] font-bold text-amber-500">4.8 avg</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Ratings</p>
                      <p className="text-xl font-bold text-gray-800 mt-0.5">234</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleQuickAction('menu')}
                      className="h-16 rounded-xl font-bold flex flex-col justify-center items-center gap-1 text-xs border-none bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">add</span>
                      <span>Add Dish</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('categories')}
                      className="h-16 rounded-xl font-bold flex flex-col justify-center items-center gap-1 text-xs border-none bg-blue-800 hover:bg-blue-900 text-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">library_add</span>
                      <span>Add Category</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('tables')}
                      className="h-16 rounded-xl font-bold flex flex-col justify-center items-center gap-1 text-xs border-none bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">qr_code_2</span>
                      <span>Generate QR Codes</span>
                    </button>
                  </div>
                </div>

                {/* Weekly Engagement Chart Placeholder */}
                <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Weekly Engagement</h3>
                      <p className="text-[10px] text-gray-400">Average scans and orders per day</p>
                    </div>
                    <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                      <button className="px-3 py-1 bg-white shadow-xs rounded text-[10px] font-bold text-gray-700 border-none cursor-pointer">Daily</button>
                      <button className="px-3 py-1 bg-transparent rounded text-[10px] font-bold text-gray-400 border-none cursor-pointer">Weekly</button>
                    </div>
                  </div>
                  
                  {/* Visual wave/bar chart mockup */}
                  <div className="h-44 bg-gray-50/50 rounded-lg flex items-end justify-between px-6 pb-2 pt-6 relative border border-gray-150">
                    <div className="w-10 bg-blue-200/50 h-10 rounded-t-md"></div>
                    <div className="w-10 bg-blue-300/50 h-20 rounded-t-md"></div>
                    <div className="w-10 bg-blue-400/50 h-16 rounded-t-md"></div>
                    <div className="w-10 bg-blue-500 h-32 rounded-t-md"></div>
                    <div className="w-10 bg-blue-400/60 h-24 rounded-t-md"></div>
                    <div className="w-10 bg-blue-300/50 h-28 rounded-t-md"></div>
                    <div className="w-10 bg-blue-200/50 h-12 rounded-t-md"></div>

                    {/* Dotted curve overlay mockup line */}
                    <div className="absolute inset-x-0 bottom-12 h-0.5 border-t border-dashed border-blue-500/50"></div>
                  </div>
                </div>
              </div>

              {/* Right Column: Activity Feed (1/3 width) */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-xs flex flex-col h-[520px] relative justify-between">
                  <div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
                      <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Recent Activity</h3>
                      <span className="material-symbols-outlined text-gray-400">notifications_active</span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-1.5 rounded-full text-base">warning</span>
                        <div className="flex-grow text-left">
                          <p className="text-xs font-bold text-gray-800">Dish Status Update</p>
                          <p className="text-[11px] text-gray-500 leading-normal">"Grilled Sea Bass" was marked <span className="text-red-500 font-bold">Sold Out</span> by Chef Maria.</p>
                          <span className="text-[9px] text-gray-400 font-semibold block mt-1">2m ago</span>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-full text-base">star</span>
                        <div className="flex-grow text-left">
                          <p className="text-xs font-bold text-gray-800">New Rating Alert</p>
                          <p className="text-[11px] text-gray-500 leading-normal">Table #4 left a 5-star review: "The Truffle Risotto was spectacular!"</p>
                          <span className="text-[9px] text-gray-400 font-semibold block mt-1">15m ago</span>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-[#006e2f] bg-green-50 p-1.5 rounded-full text-base">library_add</span>
                        <div className="flex-grow text-left">
                          <p className="text-xs font-bold text-gray-800">New Category Created</p>
                          <p className="text-[11px] text-gray-500 leading-normal">Alex Thompson added "Seasonal Specials" to the menu categories.</p>
                          <span className="text-[9px] text-gray-400 font-semibold block mt-1">1h ago</span>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-gray-500 bg-gray-50 p-1.5 rounded-full text-base">monitoring</span>
                        <div className="flex-grow text-left">
                          <p className="text-xs font-bold text-gray-800">System Report</p>
                          <p className="text-[11px] text-gray-500 leading-normal">Daily QR usage report generated: 342 scans across 15 tables.</p>
                          <span className="text-[9px] text-gray-400 font-semibold block mt-1">3h ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-150 flex items-center justify-between">
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-transparent border-none cursor-pointer">
                      View All Logs
                    </button>
                    <button className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg border-none cursor-pointer">
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && <MenuManagementPage cafeId={cafeId} />}

          {activeTab === 'categories' && <CategoryManagementPage cafeId={cafeId} />}

          {activeTab === 'tables' && <TableQRManagementPage cafeId={cafeId} />}

          {activeTab === 'settings' && <SettingsPage cafeId={cafeId} />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
