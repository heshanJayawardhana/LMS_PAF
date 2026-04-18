import React, { useEffect, useState } from 'react';
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

const BookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    loadBookings();
    loadFacilities();
  }, [searchTerm, filterStatus]);

  const loadFacilities = async () => {
    try {
      const response = await facilitiesAPI.getAll();
      if (response.success) {
        setFacilities(response.data || []);
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
        status: filterStatus,
      });
      if (response.success) {
        setBookings(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'IN_PROGRESS':
        return <ClockIcon className="h-4 w-4" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const statuses = ['all', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

  const handleCreateBooking = async (data) => {
    try {
      const response = await bookingsAPI.create(data);
      if (response.success) {
        await loadBookings();
        setShowCreateModal(false);
        reset();
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      const response = await bookingsAPI.approve(bookingId);
      if (response.success) {
        await loadBookings();
      }
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      const response = await bookingsAPI.reject(bookingId, 'Rejected by admin');
      if (response.success) {
        await loadBookings();
      }
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      const response = await bookingsAPI.cancel(bookingId);
      if (response.success) {
        await loadBookings();
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      const response = await bookingsAPI.delete(bookingId);
      if (response.success) {
        await loadBookings();
      }
    } catch (error) {
      console.error('Failed to delete booking:', error);
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    reset({
      resource: booking.resourceId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      attendees: booking.attendees,
    });
    setShowEditModal(true);
  };

  const handleUpdateBooking = async (data) => {
    if (!selectedBooking) {
      return;
    }

    try {
      const response = await bookingsAPI.update(selectedBooking.id, data);
      if (response.success) {
        await loadBookings();
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

      <div className="card p-4">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-navy-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-200">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-200 bg-white">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-navy-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-navy-900">{booking.resourceName}</div>
                      <div className="text-sm text-navy-500">{booking.resourceType}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-navy-900">{booking.date}</div>
                    <div className="text-sm text-navy-500">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-navy-900">{booking.purpose}</div>
                    <div className="text-sm text-navy-500">{booking.attendees} attendees</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-navy-900">{booking.requestedBy}</div>
                    <div className="text-sm text-navy-500">{booking.requestedAt}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1">{booking.status}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button type="button" className="rounded p-1 text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-900">
                        <EyeIcon className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(booking)}
                        className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-900"
                      >
                        <PencilIcon className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(booking.id)}
                        className="rounded p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-900"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                      {booking.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(booking.id)}
                            className="rounded p-1 text-green-600 transition-colors hover:bg-green-50 hover:text-green-900"
                          >
                            <CheckCircleIcon className="h-6 w-6" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(booking.id)}
                            className="rounded p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-900"
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </>
                      )}
                      {booking.status === 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleCancel(booking.id)}
                          className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
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

      {!loading && filteredBookings.length === 0 && (
        <div className="py-12 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-navy-400" />
          <h3 className="mt-2 text-sm font-medium text-navy-900">No bookings found</h3>
          <p className="mt-1 text-sm text-navy-500">Try adjusting your search or filters</p>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative top-20 mx-auto w-96 rounded-lg border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <h3 className="mb-4 text-lg font-semibold text-navy-900">Create New Booking</h3>
              <form onSubmit={handleSubmit(handleCreateBooking)} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-navy-700">Resource</label>
                  <select {...register('resource', { required: 'Resource is required' })} className="input-field">
                    <option value="">Select a resource</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                  {errors.resource && <p className="mt-1 text-sm text-red-600">{errors.resource.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-navy-700">Date</label>
                  <input type="date" {...register('date', { required: 'Date is required' })} className="input-field" />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700">Start Time</label>
                    <input type="time" {...register('startTime', { required: 'Start time is required' })} className="input-field" />
                    {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700">End Time</label>
                    <input type="time" {...register('endTime', { required: 'End time is required' })} className="input-field" />
                    {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-navy-700">Purpose</label>
                  <textarea
                    {...register('purpose', { required: 'Purpose is required' })}
                    rows={3}
                    className="input-field"
                    placeholder="Describe the purpose of this booking"
                  />
                  {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-navy-700">Number of Attendees</label>
                  <input
                    type="number"
                    {...register('attendees', {
                      required: 'Number of attendees is required',
                      min: { value: 1, message: 'Must be at least 1' },
                    })}
                    className="input-field"
                    placeholder="Expected number of attendees"
                  />
                  {errors.attendees && <p className="mt-1 text-sm text-red-600">{errors.attendees.message}</p>}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      reset();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative top-20 mx-auto w-96 rounded-lg border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <h3 className="mb-4 text-lg font-semibold text-navy-900">Edit Booking</h3>
              <form onSubmit={handleSubmit(handleUpdateBooking)} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-navy-700">Resource</label>
                  <select {...register('resource', { required: 'Resource is required' })} className="input-field">
                    <option value="">Select a resource</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-navy-700">Date</label>
                  <input type="date" {...register('date', { required: 'Date is required' })} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700">Start Time</label>
                    <input type="time" {...register('startTime', { required: 'Start time is required' })} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700">End Time</label>
                    <input type="time" {...register('endTime', { required: 'End time is required' })} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-navy-700">Purpose</label>
                  <textarea {...register('purpose', { required: 'Purpose is required' })} rows={3} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-navy-700">Number of Attendees</label>
                  <input type="number" {...register('attendees', { required: 'Number of attendees is required' })} className="input-field" />
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
                  <button type="submit" className="btn-primary">
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
