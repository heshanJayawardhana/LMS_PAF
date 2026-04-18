import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { ticketsAPI } from '../../services/api';
import {
  TicketIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const TicketManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    loadTickets();
  }, [searchTerm, filterStatus, filterPriority]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketsAPI.getAll({
        search: searchTerm,
        status: filterStatus,
        priority: filterPriority,
      });
      if (response.success) {
        setTickets(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTicketId = (ticketId) => {
    if (!ticketId) {
      return 'TKT-0000';
    }
    const rawId = String(ticketId).trim();
    const shortId = rawId.length > 6 ? rawId.slice(-6).toUpperCase() : rawId.toUpperCase();
    return `TKT-${shortId}`;
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'MEDIUM':
        return <ClockIcon className="h-4 w-4" />;
      case 'LOW':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <TicketIcon className="h-4 w-4" />;
    }
  };

  const statuses = ['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
  const priorities = ['all', 'HIGH', 'MEDIUM', 'LOW'];
  const categories = ['Equipment', 'Facility', 'Network', 'Safety', 'Electrical', 'Plumbing'];
  const resources = ['Conference Room A', 'Computer Lab 301', 'Meeting Room C', 'Lecture Hall B', 'Physics Lab 201'];

  const handleCreateTicket = async (data) => {
    try {
      const response = await ticketsAPI.create(data);
      if (response.success) {
        await loadTickets();
        setShowCreateModal(false);
        reset();
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const response = await ticketsAPI.updateStatus(ticketId, newStatus);
      if (response.success) {
        await loadTickets();
      }
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const handleAssignTicket = async (ticketId) => {
    try {
      const response = await ticketsAPI.assign(ticketId, user?.id);
      if (response.success) {
        await loadTickets();
      }
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    }
  };

  const openCommentModal = (ticket) => {
    setSelectedTicket(ticket);
    setCommentText('');
  };

  const closeCommentModal = () => {
    if (commentSubmitting) {
      return;
    }
    setSelectedTicket(null);
    setCommentText('');
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !commentText.trim()) {
      return;
    }

    setCommentSubmitting(true);
    try {
      const response = await ticketsAPI.addComment(selectedTicket.id, commentText.trim());
      if (response.success) {
        closeCommentModal();
        await loadTickets();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const getTicketActions = (ticket) => {
    const actions = [
      {
        key: 'view',
        label: 'View',
        icon: EyeIcon,
        className: 'border border-navy-200 bg-white text-navy-700 hover:border-navy-300 hover:bg-navy-50',
      },
      {
        key: 'comment',
        label: 'Comment',
        icon: ChatBubbleLeftIcon,
        onClick: () => openCommentModal(ticket),
        className: 'bg-navy-900 text-white hover:bg-navy-800',
      },
    ];

    if (user?.role === 'TECHNICIAN' && !ticket.assignedTo && !ticket.assignedToName) {
      actions.push({
        key: 'assign',
        label: 'Assign Me',
        icon: UserIcon,
        onClick: () => handleAssignTicket(ticket.id),
        className: 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
      });
    }

    if ((user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && ticket.status === 'OPEN') {
      actions.push({
        key: 'start',
        label: 'Start Work',
        icon: ClockIcon,
        onClick: () => handleStatusUpdate(ticket.id, 'IN_PROGRESS'),
        className: 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
      });
    }

    if ((user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && ticket.status === 'IN_PROGRESS') {
      actions.push({
        key: 'resolve',
        label: 'Resolve',
        icon: CheckCircleIcon,
        onClick: () => handleStatusUpdate(ticket.id, 'RESOLVED'),
        className: 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      });
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Maintenance & Tickets</h1>
          <p className="text-navy-600">Manage maintenance requests and incident tickets</p>
        </div>
        <button type="button" onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Create Ticket</span>
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-navy-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field">
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="input-field">
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priorities' : priority}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-600">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-navy-900">{formatTicketId(ticket.id)}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {getPriorityIcon(ticket.priority)}
                    <span className="ml-1">{ticket.priority}</span>
                  </span>
                </div>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="mb-1 font-medium text-navy-900">{ticket.category}</h4>
                <p className="text-sm text-navy-700">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-navy-500">Resource:</span>
                  <span className="ml-2 text-navy-900">{ticket.resource || ticket.resourceName}</span>
                </div>
                <div>
                  <span className="text-navy-500">Location:</span>
                  <span className="ml-2 text-navy-900">{ticket.location || ticket.resourceLocation}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-navy-500">Requested by:</span>
                  <span className="ml-2 text-navy-900">{ticket.requestedBy}</span>
                </div>
                <div>
                  <span className="text-navy-500">Assigned to:</span>
                  <span className="ml-2 text-navy-900">{ticket.assignedToName || ticket.assignedTo || 'Unassigned'}</span>
                </div>
              </div>

              {ticket.comments && ticket.comments.length > 0 && (
                <div className="flex items-center space-x-2">
                  <ChatBubbleLeftIcon className="h-4 w-4 text-navy-500" />
                  <span className="text-sm text-navy-600">{ticket.comments.length} comment(s)</span>
                </div>
              )}

              <div className="text-xs text-navy-500">
                Created: {ticket.createdAt} | Updated: {ticket.updatedAt}
              </div>
            </div>

            <div className="mt-6 border-t border-navy-100 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">Workflow Actions</span>
                <span className="text-xs text-navy-400">{getTicketActions(ticket).length} available</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {getTicketActions(ticket).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.key}
                      type="button"
                      onClick={action.onClick}
                      className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${action.className}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredTickets.length === 0 && (
        <div className="py-12 text-center">
          <TicketIcon className="mx-auto h-12 w-12 text-navy-400" />
          <h3 className="mt-2 text-sm font-medium text-navy-900">No tickets found</h3>
          <p className="mt-1 text-sm text-navy-500">Try adjusting your search or filters</p>
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative top-16 mx-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-navy-900">Add Comment to Ticket {formatTicketId(selectedTicket.id)}</h3>
                <p className="mt-1 text-sm text-navy-600">
                  Share an update for {selectedTicket.resource || selectedTicket.resourceName} and notify the relevant user.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCommentModal}
                className="rounded-md p-1 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-navy-100 bg-navy-50 p-3 text-sm text-navy-700">
              <p className="font-medium text-navy-900">{selectedTicket.category}</p>
              <p className="mt-1">{selectedTicket.description}</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700">Comment</label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                placeholder="Add a useful update, request, or resolution note..."
                className="input-field min-h-[120px] resize-none"
              />
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCommentModal}
                className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!commentText.trim() || commentSubmitting}
                className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-navy-300"
              >
                {commentSubmitting ? 'Sending...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative top-10 mx-auto w-full max-w-2xl rounded-lg border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <h3 className="mb-4 text-lg font-semibold text-navy-900">Create New Ticket</h3>
              <form onSubmit={handleSubmit(handleCreateTicket)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700">Category</label>
                    <select {...register('category', { required: 'Category is required' })} className="input-field">
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700">Priority</label>
                    <select {...register('priority', { required: 'Priority is required' })} className="input-field">
                      <option value="">Select priority</option>
                      {priorities.slice(1).map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                    {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700">Resource</label>
                    <select {...register('resource', { required: 'Resource is required' })} className="input-field">
                      <option value="">Select resource</option>
                      {resources.map((resource) => (
                        <option key={resource} value={resource}>
                          {resource}
                        </option>
                      ))}
                    </select>
                    {errors.resource && <p className="mt-1 text-sm text-red-600">{errors.resource.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700">Location</label>
                    <input
                      type="text"
                      {...register('location', { required: 'Location is required' })}
                      className="input-field"
                      placeholder="Building and floor"
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-navy-700">Description</label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={4}
                    className="input-field"
                    placeholder="Describe the issue in detail"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700">Contact Email</label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      className="input-field"
                      placeholder="your.email@campus.edu"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700">Contact Phone</label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone is required' })}
                      className="input-field"
                      placeholder="+1234567890"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                  </div>
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
                    Create Ticket
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

export default TicketManagement;
