import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button, Space, Badge } from 'antd';
import { LogoutOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { tableContext } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isOwnerRoute = location.pathname.startsWith('/owner');
  const isCustomerRoute = !isAdminRoute && !isOwnerRoute && location.pathname !== '/login';

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand/Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => {
            if (isAdminRoute) navigate('/admin/dashboard');
            else if (isOwnerRoute) navigate('/owner/dashboard');
            else navigate(tableContext.tableToken ? `/menu?tableToken=${tableContext.tableToken}` : '/');
          }}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg">
            Q
          </div>
          <span className="font-bold text-xl text-emerald-800 tracking-tight">QuickCafe</span>
        </div>

        {/* Dynamic Context (Table / Roles) */}
        <div className="flex items-center gap-4">
          {isCustomerRoute && tableContext.tableNumber && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <ShopOutlined className="text-emerald-700" />
              <span className="text-emerald-800 font-semibold text-sm">
                {tableContext.cafeName || 'Cafe'} — Table #{tableContext.tableNumber}
              </span>
            </div>
          )}

          {isAuthenticated ? (
            <Space size="middle">
              <div className="hidden sm:flex items-center gap-2 text-gray-600 font-medium">
                <UserOutlined />
                <span className="capitalize">{user?.role}: {user?.email.split('@')[0]}</span>
              </div>
              
              {isAdminRoute && (
                <Button 
                  type="text" 
                  onClick={() => navigate('/admin/dashboard')}
                  className="font-medium text-emerald-800"
                >
                  Dashboard
                </Button>
              )}

              {isOwnerRoute && (
                <Button 
                  type="text" 
                  onClick={() => navigate('/owner/dashboard')}
                  className="font-medium text-emerald-800"
                >
                  Orders
                </Button>
              )}

              <Button 
                danger 
                type="primary"
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                className="bg-red-500 border-red-500 hover:bg-red-600"
              >
                Logout
              </Button>
            </Space>
          ) : (
            (location.pathname === '/' || isCustomerRoute) && (
              <Button 
                type="text" 
                icon={<UserOutlined />}
                onClick={() => navigate('/login')}
                className="text-gray-600 font-medium"
              >
                Staff Login
              </Button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
