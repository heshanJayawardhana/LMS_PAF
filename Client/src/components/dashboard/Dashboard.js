import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { adminAPI } from '../../services/mockApi';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  TicketIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [stats, setStats] = useState([
    {
      name: 'Total Facilities',
      value: '24',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      change: '+2 from last month',
      changeType: 'positive',
    },
    {
      name: 'Active Bookings',
      value: '12',
      icon: CalendarIcon,
      color: 'bg-green-500',
      change: '+4 from last week',
      changeType: 'positive',
    },
    {
      name: 'Open Tickets',
      value: '8',
      icon: TicketIcon,
      color: 'bg-yellow-500',
      change: '-3 from yesterday',
      changeType: 'positive',
    },
    {
      name: 'Unread Notifications',
      value: notifications.filter(n => !n.isRead).length.toString(),
      icon: BellIcon,
      color: 'bg-red-500',
      change: 'New alerts',
      changeType: 'neutral',
    },
  ]);

  useEffect(() => {
    // Load real stats from API if user is admin
    if (user?.role === 'ADMIN') {
      loadAdminStats();
    }
  }, [user]);

  const loadAdminStats = async () => {
    try {
      const adminStats = await adminAPI.getStats();
      if (adminStats.success) {
        setStats([
          {
            name: 'Total Users',
            value: adminStats.data.totalUsers || '1,234',
            icon: BuildingOfficeIcon,
            color: 'bg-blue-500',
            change: '+12%',
            changeType: 'positive',
          },
          {
            name: 'Active Bookings',
            value: adminStats.data.activeBookings || '89',
            icon: CalendarIcon,
            color: 'bg-green-500',
            change: '+5%',
            changeType: 'positive',
          },
          {
            name: 'Open Tickets',
            value: adminStats.data.openTickets || '23',
            icon: TicketIcon,
            color: 'bg-yellow-500',
            change: '-8%',
            changeType: 'positive',
          },
          {
            name: 'Facilities Utilization',
            value: adminStats.data.utilization || '78%',
            icon: BellIcon,
            color: 'bg-purple-500',
            change: '+3%',
            changeType: 'positive',
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      // Keep default stats if API fails
    }
  };

  const recentBookings = [
    {
      id: 1,
      resource: 'Conference Room A',
      date: '2026-03-29',
      time: '10:00 AM - 12:00 PM',
      status: 'APPROVED',
    },
    {
      id: 2,
      resource: 'Lab 301',
      date: '2026-03-30',
      time: '2:00 PM - 4:00 PM',
      status: 'PENDING',
    },
    {
      id: 3,
      resource: 'Meeting Room B',
      date: '2026-03-28',
      time: '9:00 AM - 10:00 AM',
      status: 'APPROVED',
    },
  ];

  const recentTickets = [
    {
      id: 101,
      category: 'Equipment',
      description: 'Projector not working in Conference Room A',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: '2026-03-28',
    },
    {
      id: 102,
      category: 'Facility',
      description: 'Air conditioning issue in Lab 301',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdAt: '2026-03-27',
    },
    {
      id: 103,
      category: 'Network',
      description: 'WiFi connectivity problems',
      priority: 'LOW',
      status: 'RESOLVED',
      createdAt: '2026-03-26',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-navy-700 to-navy-900 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-navy-200">
          Here's what's happening with your campus operations today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-navy-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-navy-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className={`text-sm ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 'text-navy-500'
              }`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Recent Bookings</h3>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                <div>
                  <p className="font-medium text-navy-900">{booking.resource}</p>
                  <p className="text-sm text-navy-600">
                    {booking.date} • {booking.time}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Recent Tickets</h3>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="p-3 bg-navy-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-navy-900">#{ticket.id}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-navy-700 mb-1">{ticket.description}</p>
                <p className="text-xs text-navy-500">{ticket.category} • {ticket.createdAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="p-4 bg-navy-50 hover:bg-navy-100 rounded-lg text-center transition-colors duration-200">
            <CalendarIcon className="h-8 w-8 text-navy-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy-900">New Booking</p>
          </button>
          <button className="p-4 bg-navy-50 hover:bg-navy-100 rounded-lg text-center transition-colors duration-200">
            <TicketIcon className="h-8 w-8 text-navy-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy-900">Create Ticket</p>
          </button>
          <button className="p-4 bg-navy-50 hover:bg-navy-100 rounded-lg text-center transition-colors duration-200">
            <BuildingOfficeIcon className="h-8 w-8 text-navy-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy-900">Browse Facilities</p>
          </button>
          <button className="p-4 bg-navy-50 hover:bg-navy-100 rounded-lg text-center transition-colors duration-200">
            <BellIcon className="h-8 w-8 text-navy-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy-900">View Notifications</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
