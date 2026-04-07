import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { notificationsAPI } from '../../services/mockApi';
import {
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  CalendarIcon,
  TicketIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_approved':
      case 'booking_rejected':
        return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case 'ticket_comment':
      case 'ticket_assigned':
      case 'ticket_resolved':
        return <TicketIcon className="h-5 w-5 text-yellow-500" />;
      case 'system_alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_approved':
        return 'bg-green-50 border-green-200';
      case 'booking_rejected':
        return 'bg-red-50 border-red-200';
      case 'ticket_comment':
        return 'bg-blue-50 border-blue-200';
      case 'ticket_assigned':
        return 'bg-yellow-50 border-yellow-200';
      case 'ticket_resolved':
        return 'bg-green-50 border-green-200';
      case 'system_alert':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleDelete = (notificationId) => {
    deleteNotification(notificationId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Notifications</h1>
          <p className="text-navy-600">
            Stay updated with your campus activities
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-secondary flex items-center space-x-2"
          >
            <CheckCircleIcon className="h-5 w-5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-navy-100 rounded-lg p-3">
              <BellIcon className="h-6 w-6 text-navy-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-navy-600">Total Notifications</p>
              <p className="text-2xl font-semibold text-navy-900">{notifications.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-lg p-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-navy-600">Unread</p>
              <p className="text-2xl font-semibold text-navy-900">{unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-navy-600">Read</p>
              <p className="text-2xl font-semibold text-navy-900">
                {notifications.length - unreadCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card p-2">
        <div className="flex space-x-1">
          {['all', 'unread', 'read'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filter === tab
                  ? 'bg-navy-700 text-white'
                  : 'text-navy-600 hover:bg-navy-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'unread' && unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-navy-400" />
            <h3 className="mt-2 text-sm font-medium text-navy-900">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 
               'No notifications'}
            </h3>
            <p className="mt-1 text-sm text-navy-500">
              {filter === 'unread' ? 'All notifications have been read' : 
               filter === 'read' ? 'No notifications have been read yet' : 
               'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`card p-4 border-l-4 transition-all duration-200 ${
                notification.isRead 
                  ? 'bg-white border-navy-200' 
                  : `${getNotificationColor(notification.type)} border-navy-500`
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm ${
                        notification.isRead ? 'text-navy-700' : 'text-navy-900 font-medium'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-navy-500">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-navy-400 hover:text-navy-600 transition-colors duration-200"
                          title="Mark as read"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-navy-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete notification"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unread indicator */}
              {!notification.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-navy-500 rounded-l-lg"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Notification Settings (Future Enhancement) */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Notification Preferences</h3>
        <p className="text-sm text-navy-600 mb-4">
          Customize how you receive notifications (Coming soon)
        </p>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-navy-300 rounded"
                defaultChecked
                disabled
              />
              <span className="ml-3 text-sm text-navy-700">Booking updates</span>
            </div>
            <span className="text-xs text-navy-500">Email • In-app</span>
          </label>

          <label className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-navy-300 rounded"
                defaultChecked
                disabled
              />
              <span className="ml-3 text-sm text-navy-700">Ticket updates</span>
            </div>
            <span className="text-xs text-navy-500">Email • In-app</span>
          </label>

          <label className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-navy-300 rounded"
                defaultChecked
                disabled
              />
              <span className="ml-3 text-sm text-navy-700">System alerts</span>
            </div>
            <span className="text-xs text-navy-500">In-app only</span>
          </label>
        </div>

        <div className="mt-6 p-3 bg-navy-50 rounded-lg">
          <p className="text-xs text-navy-600">
            <strong>Note:</strong> Notification preferences will be available in a future update.
            Currently, all notifications are enabled by default.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
