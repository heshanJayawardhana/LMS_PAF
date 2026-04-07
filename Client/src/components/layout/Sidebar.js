import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  TicketIcon,
  BellIcon,
  UserIcon,
  CogIcon,
  ChartBarIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { name: 'Facilities', href: '/facilities', icon: BuildingOfficeIcon, roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { name: 'Bookings', href: '/bookings', icon: CalendarIcon, roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { name: 'Tickets', href: '/tickets', icon: TicketIcon, roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { name: 'Notifications', href: '/notifications', icon: BellIcon, roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { name: 'Profile', href: '/profile', icon: UserIcon, roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: ChartBarIcon, roles: ['ADMIN'] },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon, roles: ['ADMIN'] },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon, roles: ['ADMIN'] },
];

const Sidebar = ({ open, onClose, currentPath, userRole }) => {
  const location = useLocation();

  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole));
  const filteredAdminNavigation = adminNavigation.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
        <div className="flex items-center justify-between h-16 px-4 bg-navy-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-navy-900 font-bold text-sm">SC</span>
              </div>
            </div>
            <span className="ml-3 text-white text-lg font-semibold">SmartEdu Portal</span>
          </div>
          <button
            onClick={onClose}
            className="text-navy-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-navy-800 text-white'
                      : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {filteredAdminNavigation.length > 0 && (
            <>
              <div className="mt-8">
                <h3 className="px-2 text-xs font-semibold text-navy-400 uppercase tracking-wide">
                  Admin
                </h3>
                <div className="mt-3 space-y-1">
                  {filteredAdminNavigation.map((item) => {
                    const isActive = currentPath === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-navy-800 text-white'
                            : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                        }`}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-navy-900 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-navy-900 font-bold text-sm">SC</span>
            </div>
            <span className="ml-3 text-white text-lg font-semibold">SmartEdu Portal</span>
          </div>
          
          <nav className="mt-5 flex-1 px-2">
            <div className="space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-navy-800 text-white'
                        : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            {filteredAdminNavigation.length > 0 && (
              <>
                <div className="mt-8">
                  <h3 className="px-2 text-xs font-semibold text-navy-400 uppercase tracking-wide">
                    Admin
                  </h3>
                  <div className="mt-3 space-y-1">
                    {filteredAdminNavigation.map((item) => {
                      const isActive = currentPath === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            isActive
                              ? 'bg-navy-800 text-white'
                              : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                          }`}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
