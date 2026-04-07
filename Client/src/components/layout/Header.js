import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Header = ({ onMenuClick, user, unreadCount, onNotificationClick }) => {
  const { logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-navy-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-navy-600 hover:text-navy-900 hover:bg-navy-50"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Center - Page title */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <h1 className="text-xl font-semibold text-navy-900">
              SmartEdu Portal
            </h1>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              onClick={onNotificationClick}
              className="relative p-2 rounded-full text-navy-600 hover:text-navy-900 hover:bg-navy-50 transition-colors duration-200"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-navy-50 transition-colors duration-200"
              >
                <div className="h-8 w-8 bg-navy-600 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-navy-900">{user?.name}</p>
                  <p className="text-xs text-navy-500">{user?.role}</p>
                </div>
              </button>

              {/* Profile dropdown menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-navy-lg border border-navy-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-navy-100">
                    <p className="text-sm font-medium text-navy-900">{user?.name}</p>
                    <p className="text-xs text-navy-500">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
