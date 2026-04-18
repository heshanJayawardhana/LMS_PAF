import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const AdminBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingsAPI.getAll();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      const response = await bookingsAPI.approve(bookingId);
      if (response.success) {
        loadBookings();
      }
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleReject = async (bookingId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        const response = await bookingsAPI.reject(bookingId, reason);
        if (response.success) {
          loadBookings();
        }
      } catch (error) {
        console.error('Failed to reject booking:', error);
      }
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      const response = await bookingsAPI.cancel(bookingId);
      if (response.success) {
        loadBookings();
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XMarkIcon className="h-4 w-4" />;
      case 'PENDING':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-navy-900">Booking Management</h2>
          <p className="text-navy-600">Approve, reject, and manage booking requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-200">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-navy-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-navy-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-navy-900">{booking.resourceName}</div>
                      <div className="text-sm text-navy-500">{booking.resourceType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-navy-900">{booking.date}</div>
                    <div className="text-sm text-navy-500">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-navy-900">{booking.purpose}</div>
                    <div className="text-sm text-navy-500">{booking.attendees} attendees</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-navy-900">{booking.requestedBy}</div>
                    <div className="text-sm text-navy-500">{booking.requestedAt}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1">{booking.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-navy-600 hover:text-navy-900 p-1 rounded hover:bg-navy-50 transition-colors">
                        <EyeIcon className="h-6 w-6" />
                      </button>
                      {booking.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleApprove(booking.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-6 w-6" />
                          </button>
                          <button 
                            onClick={() => handleReject(booking.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Reject"
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </>
                      )}
                      {booking.status === 'APPROVED' && (
                        <button 
                          onClick={() => handleCancel(booking.id)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"
                          title="Cancel"
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-navy-400" />
          <h3 className="mt-2 text-sm font-medium text-navy-900">No bookings found</h3>
          <p className="mt-1 text-sm text-navy-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminBookingManagement;
