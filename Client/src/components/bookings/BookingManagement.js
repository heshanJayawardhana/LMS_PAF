import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { bookingsAPI, facilitiesAPI } from '../../services/api';
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const BookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadBookings();
    loadFacilities();
  }, [searchTerm, filterStatus]);

  const loadFacilities = async () => {
    try {
      const response = await facilitiesAPI.getAll();
      if (response.success) {
        setFacilities(response.data);
      }
    } catch (error) {
      console.error('Failed to load facilities:', error);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingsAPI.getAll({
        search: searchTerm,
        status: filterStatus
      });
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback
  const mockBookings = [
    {
      id: 1,
      resourceName: 'Conference Room A',
      resourceType: 'Meeting Room',
      date: '2026-04-06',
      startTime: '10:00',
      endTime: '12:00',
      purpose: 'Team meeting',
      attendees: 8,
      status: 'APPROVED',
      requestedBy: 'Regular User',
      requestedAt: '2026-04-05',
      rejectionReason: null,
    },
    {
      id: 2,
      resourceName: 'Computer Lab 301',
      resourceType: 'Laboratory',
      date: '2026-04-07',
      startTime: '14:00',
      endTime: '16:00',
      purpose: 'Programming workshop',
      attendees: 25,
      status: 'PENDING',
      requestedBy: 'Regular User',
      requestedAt: '2026-04-05',
      rejectionReason: null,
    },
    {
      id: 3,
      resourceName: 'Meeting Room B',
      resourceType: 'Meeting Room',
      date: '2026-04-05',
      startTime: '09:00',
      endTime: '10:00',
      purpose: 'Client presentation',
      attendees: 5,
      status: 'APPROVED',
      requestedBy: 'Regular User',
      requestedAt: '2026-04-04',
      rejectionReason: null,
    },
    {
      id: 4,
      resourceName: 'Lecture Hall B',
      resourceType: 'Lecture Hall',
      date: '2026-04-08',
      startTime: '13:00',
      endTime: '15:00',
      purpose: 'Guest lecture',
      attendees: 120,
      status: 'PENDING',
      requestedBy: 'Regular User',
      requestedAt: '2026-04-05',
      rejectionReason: null,
    },
    {
      id: 5,
      resourceName: 'Physics Lab 201',
      resourceType: 'Laboratory',
      date: '2026-04-04',
      startTime: '10:00',
      endTime: '12:00',
      purpose: 'Physics experiment',
      attendees: 20,
      status: 'CANCELLED',
      requestedBy: 'Regular User',
      requestedAt: '2026-04-03',
      rejectionReason: null,
    },
  ];

  const displayBookings = bookings.length > 0 ? bookings : mockBookings;
  const filteredBookings = displayBookings.filter(booking => {
    const matchesSearch = booking.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'RESOLVED':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'PENDING':
      case 'OPEN':
        return <ClockIcon className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <ClockIcon className="h-4 w-4" />;
      case 'REJECTED':
        return <XMarkIcon className="h-4 w-4" />;
      case 'CANCELLED':
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const statuses = ['all', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'IN_PROGRESS', 'OPEN', 'RESOLVED'];

  const handleCreateBooking = async (data) => {
    setSubmittingCreate(true);
    setCreateError('');
    try {
      const response = await bookingsAPI.create(data);
      if (response.success) {
        await loadBookings();
        setShowCreateModal(false);
        reset();
        return;
      }

      setCreateError(response.message || 'Failed to create booking.');
    } catch (error) {
      console.error('Failed to create booking:', error);
      setCreateError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to create booking. Please check the form and try again.'
      );
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      const response = await bookingsAPI.approve(bookingId);
      if (response.success) {
        loadBookings(); // Reload bookings
      }
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      const response = await bookingsAPI.reject(bookingId, 'Rejected by admin');
      if (response.success) {
        loadBookings(); // Reload bookings
      }
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      const response = await bookingsAPI.cancel(bookingId);
      if (response.success) {
        loadBookings(); // Reload bookings
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await bookingsAPI.delete(bookingId);
        if (response.success) {
          loadBookings(); // Reload bookings
        }
      } catch (error) {
        console.error('Failed to delete booking:', error);
      }
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleUpdateBooking = async (data) => {
    try {
      const bookingData = {
        ...data,
        userId: selectedBooking.userId || '2',
        requestedBy: selectedBooking.requestedBy || 'Regular User'
      };
      
      const response = await bookingsAPI.update(selectedBooking.id, bookingData);
      if (response.success) {
        loadBookings(); // Reload bookings
        setShowEditModal(false);
        setSelectedBooking(null);
        reset();
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Booking Management</h1>
          <p className="text-navy-600">Manage facility bookings and reservations</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden">
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
                      <button 
                        onClick={() => handleEdit(booking)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        <PencilIcon className="h-6 w-6" />
                      </button>
                      <button 
                        onClick={() => handleDelete(booking.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                      {booking.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleApprove(booking.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                          >
                            <CheckCircleIcon className="h-6 w-6" />
                          </button>
                          <button 
                            onClick={() => handleReject(booking.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </>
                      )}
                      {booking.status === 'APPROVED' && (
                        <button 
                          onClick={() => handleCancel(booking.id)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"
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

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Create New Booking</h3>
              
              <form onSubmit={handleSubmit(handleCreateBooking)} className="space-y-4">
                {createError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {createError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Resource
                  </label>
                  <select
                    {...register('resource', { required: 'Resource is required' })}
                    className="input-field"
                  >
                    <option value="">Select a resource</option>
                    {facilities.map(facility => (
                      <option key={facility.id} value={facility.id}>{facility.name}</option>
                    ))}
                  </select>
                  {errors.resource && (
                    <p className="mt-1 text-sm text-red-600">{errors.resource.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className="input-field"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      {...register('startTime', { required: 'Start time is required' })}
                      className="input-field"
                    />
                    {errors.startTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      {...register('endTime', { required: 'End time is required' })}
                      className="input-field"
                    />
                    {errors.endTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Purpose
                  </label>
                  <textarea
                    {...register('purpose', { required: 'Purpose is required' })}
                    rows={3}
                    className="input-field"
                    placeholder="Describe the purpose of this booking"
                  />
                  {errors.purpose && (
                    <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Number of Attendees
                  </label>
                  <input
                    type="number"
                    {...register('attendees', { 
                      required: 'Number of attendees is required',
                      min: { value: 1, message: 'Must be at least 1' }
                    })}
                    className="input-field"
                    placeholder="Expected number of attendees"
                  />
                  {errors.attendees && (
                    <p className="mt-1 text-sm text-red-600">{errors.attendees.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateError('');
                      reset();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCreate}
                    className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingCreate ? 'Creating...' : 'Create Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Edit Booking</h3>
              
              <form onSubmit={handleSubmit(handleUpdateBooking)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Resource
                  </label>
                  <select
                    {...register('resource', { required: 'Resource is required' })}
                    className="input-field"
                    defaultValue={selectedBooking.resourceId}
                  >
                    <option value="">Select a resource</option>
                    {facilities.map(facility => (
                      <option key={facility.id} value={facility.id}>{facility.name}</option>
                    ))}
                  </select>
                  {errors.resource && (
                    <p className="mt-1 text-sm text-red-600">{errors.resource.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className="input-field"
                    defaultValue={selectedBooking.date}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      {...register('startTime', { required: 'Start time is required' })}
                      className="input-field"
                      defaultValue={selectedBooking.startTime}
                    />
                    {errors.startTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      {...register('endTime', { required: 'End time is required' })}
                      className="input-field"
                      defaultValue={selectedBooking.endTime}
                    />
                    {errors.endTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Purpose
                  </label>
                  <textarea
                    {...register('purpose', { required: 'Purpose is required' })}
                    rows={3}
                    className="input-field"
                    defaultValue={selectedBooking.purpose}
                    placeholder="Describe the purpose of this booking"
                  />
                  {errors.purpose && (
                    <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Number of Attendees
                  </label>
                  <input
                    type="number"
                    {...register('attendees', { 
                      required: 'Number of attendees is required',
                      min: { value: 1, message: 'Must be at least 1' }
                    })}
                    className="input-field"
                    defaultValue={selectedBooking.attendees}
                    placeholder="Expected number of attendees"
                  />
                  {errors.attendees && (
                    <p className="mt-1 text-sm text-red-600">{errors.attendees.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedBooking(null);
                      reset();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Update Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
