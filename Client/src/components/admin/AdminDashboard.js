import React from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  TicketIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import AdminBookingManagement from './AdminBookingManagement';

const AdminDashboard = () => {
  // Mock data - replace with actual API calls
  const stats = [
    {
      name: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Bookings',
      value: '89',
      change: '+5%',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Open Tickets',
      value: '23',
      change: '-8%',
      changeType: 'positive',
      icon: TicketIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Facilities Utilization',
      value: '78%',
      change: '+3%',
      changeType: 'positive',
      icon: BuildingOfficeIcon,
      color: 'bg-purple-500',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'John Doe',
      action: 'Created booking',
      details: 'Conference Room A - March 29, 10:00 AM',
      timestamp: '5 minutes ago',
      type: 'booking',
    },
    {
      id: 2,
      user: 'Jane Smith',
      action: 'Submitted ticket',
      details: 'Equipment issue in Lab 301',
      timestamp: '15 minutes ago',
      type: 'ticket',
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'Registered',
      details: 'New user from Computer Science department',
      timestamp: '1 hour ago',
      type: 'user',
    },
    {
      id: 4,
      user: 'Sarah Wilson',
      action: 'Booking approved',
      details: 'Lecture Hall B - March 30, 2:00 PM',
      timestamp: '2 hours ago',
      type: 'booking',
    },
  ];

  const topFacilities = [
    { name: 'Conference Room A', bookings: 45, utilization: 85 },
    { name: 'Computer Lab 301', bookings: 38, utilization: 92 },
    { name: 'Lecture Hall B', bookings: 28, utilization: 76 },
    { name: 'Meeting Room C', bookings: 22, utilization: 68 },
    { name: 'Physics Lab 201', bookings: 19, utilization: 71 },
  ];

  const departmentStats = [
    { name: 'Computer Science', users: 423, bookings: 156 },
    { name: 'Engineering', users: 312, bookings: 134 },
    { name: 'Business', users: 289, bookings: 98 },
    { name: 'Arts', users: 156, bookings: 67 },
    { name: 'Science', users: 234, bookings: 89 },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking':
        return <CalendarIcon className="h-4 w-4 text-blue-500" />;
      case 'ticket':
        return <TicketIcon className="h-4 w-4 text-yellow-500" />;
      case 'user':
        return <UsersIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ChartBarIcon className="h-4 w-4 text-navy-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
          <p className="text-navy-600">Overview of campus operations and system metrics</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            Export Report
          </button>
          <button className="btn-primary">
            Generate Analytics
          </button>
        </div>
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
            <div className="mt-4 flex items-center">
              {stat.changeType === 'positive' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <p className={`text-sm ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} from last month
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Facilities */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Top Facilities by Usage</h3>
          <div className="space-y-4">
            {topFacilities.map((facility, index) => (
              <div key={facility.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-navy-700">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-900">{facility.name}</p>
                    <p className="text-xs text-navy-500">{facility.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-navy-900">{facility.utilization}%</p>
                  <div className="w-16 bg-navy-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-navy-600 h-2 rounded-full" 
                      style={{ width: `${facility.utilization}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Statistics */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Department Statistics</h3>
          <div className="space-y-4">
            {departmentStats.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-navy-900">{dept.name}</p>
                  <p className="text-xs text-navy-500">{dept.users} users</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-navy-900">{dept.bookings}</p>
                  <p className="text-xs text-navy-500">bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy-900">Recent System Activity</h3>
          <button className="text-sm text-navy-600 hover:text-navy-900">
            View All Activity
          </button>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-navy-50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-navy-900">
                    {activity.user} • {activity.action}
                  </p>
                  <p className="text-xs text-navy-500">{activity.timestamp}</p>
                </div>
                <p className="text-sm text-navy-600">{activity.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="p-4 bg-navy-50 hover:bg-navy-100 rounded-lg text-center transition-colors duration-200">
            <UsersIcon className="h-8 w-8 text-navy-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy-900">Manage Users</p>
          </button>
          <button className="p-4 bg-navy-50 hover:bg-navy-100 rounded-lg text-center transition-colors duration-200">
            <BuildingOfficeIcon className="h-8 w-8 text-navy-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy-900">Add Facility</p>
          </button>
          <button className="p-4 bg-navy-50 hover:bg-navy-100 rounded-lg text-center transition-colors duration-200">
            <TicketIcon className="h-8 w-8 text-navy-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy-900">Review Tickets</p>
          </button>
          <button className="p-4 bg-navy-50 hover:bg-navy-100 rounded-lg text-center transition-colors duration-200">
            <ChartBarIcon className="h-8 w-8 text-navy-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy-900">Generate Report</p>
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h4 className="text-sm font-medium text-navy-900 mb-2">System Status</h4>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-navy-700">All systems operational</span>
          </div>
          <p className="text-xs text-navy-500 mt-1">Last checked: 2 minutes ago</p>
        </div>

        <div className="card p-6">
          <h4 className="text-sm font-medium text-navy-900 mb-2">Database</h4>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-navy-700">Healthy</span>
          </div>
          <p className="text-xs text-navy-500 mt-1">Response time: 45ms</p>
        </div>

        <div className="card p-6">
          <h4 className="text-sm font-medium text-navy-900 mb-2">API Services</h4>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-navy-700">Running normally</span>
          </div>
          <p className="text-xs text-navy-500 mt-1">Uptime: 99.9%</p>
        </div>
      </div>

      {/* Admin Booking Management */}
      <AdminBookingManagement />
    </div>
  );
};

export default AdminDashboard;
