import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { ticketsAPI } from '../../services/api';
import {
  TicketIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  PaperClipIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const TicketManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailTicket, setDetailTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadTickets();
  }, [searchTerm, filterStatus, filterPriority]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketsAPI.getAll({
        search: searchTerm,
        status: filterStatus,
        priority: filterPriority
      });
      if (response.success) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayTickets = tickets.map((ticket) => ({
    ...ticket,
    resource: ticket.resource || ticket.resourceName || 'Unknown resource',
    location: ticket.location || ticket.resourceLocation || 'Unknown location',
    assignedTo: ticket.assignedToName || ticket.assignedTo || null,
    requestedByEmail: ticket.requestedByEmail || ticket.email || null,
    comments: ticket.comments || [],
    attachments: ticket.attachments || [],
    updatedAt: ticket.updatedAt || ticket.createdAt,
  }));
  const filteredTickets = displayTickets.filter(ticket => {
    const matchesSearch = ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
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
  const resources = [
    'Conference Room A',
    'Computer Lab 301',
    'Meeting Room C',
    'Lecture Hall B',
    'Physics Lab 201',
  ];

  const formatTicketId = (ticketId) => {
    if (!ticketId) {
      return 'TKT-0000';
    }

    const rawId = String(ticketId).trim();
    const shortId = rawId.length > 6 ? rawId.slice(-6).toUpperCase() : rawId.toUpperCase();
    return `TKT-${shortId}`;
  };

  const handleCreateTicket = async (data) => {
    try {
      const response = await ticketsAPI.create(data);
      if (response.success) {
        loadTickets(); // Reload tickets
        setShowCreateModal(false);
        reset();
        setAttachments([]);
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const response = await ticketsAPI.updateStatus(ticketId, newStatus);
      if (response.success) {
        loadTickets(); // Reload tickets
      }
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const handleAssignTicket = async (ticketId, assignee) => {
    try {
      const response = await ticketsAPI.assign(ticketId, assignee);
      if (response.success) {
        loadTickets(); // Reload tickets
      }
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert('Maximum 3 files allowed');
      return;
    }
    setAttachments(files);
  };

  const openCommentModal = (ticket) => {
    setSelectedTicket(ticket);
    setCommentText('');
  };

  const openTicketDetails = (ticket) => {
    setDetailTicket(ticket);
  };

  const closeTicketDetails = () => {
    setDetailTicket(null);
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
        loadTickets();
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
        onClick: () => openTicketDetails(ticket),
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

    if (user?.role === 'TECHNICIAN' && !ticket.assignedTo) {
      actions.push({
        key: 'assign',
        label: 'Assign Me',
        icon: UserIcon,
        onClick: () => handleAssignTicket(ticket.id, user?.id),
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Maintenance & Tickets</h1>
          <p className="text-navy-600">Manage maintenance requests and incident tickets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Ticket</span>
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
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
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

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="input-field"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priorities' : priority}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-600">
          Showing {filteredTickets.length} of {displayTickets.length} tickets
        </p>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-navy-900">{formatTicketId(ticket.id)}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {getPriorityIcon(ticket.priority)}
                    <span className="ml-1">{ticket.priority}</span>
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-navy-900 mb-1">{ticket.category}</h4>
                <p className="text-sm text-navy-700">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-navy-500">Resource:</span>
                  <span className="ml-2 text-navy-900">{ticket.resource}</span>
                </div>
                <div>
                  <span className="text-navy-500">Location:</span>
                  <span className="ml-2 text-navy-900">{ticket.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-navy-500">Requested by:</span>
                  <span className="ml-2 text-navy-900">{ticket.requestedBy}</span>
                </div>
                <div>
                  <span className="text-navy-500">Assigned to:</span>
                  <span className="ml-2 text-navy-900">
                    {ticket.assignedTo || 'Unassigned'}
                  </span>
                </div>
              </div>

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="flex items-center space-x-2">
                  <PaperClipIcon className="h-4 w-4 text-navy-500" />
                  <span className="text-sm text-navy-600">
                    {ticket.attachments.length} attachment(s)
                  </span>
                </div>
              )}

              {ticket.comments && ticket.comments.length > 0 && (
                <div className="flex items-center space-x-2">
                  <ChatBubbleLeftIcon className="h-4 w-4 text-navy-500" />
                  <span className="text-sm text-navy-600">
                    {ticket.comments.length} comment(s)
                  </span>
                </div>
              )}

              <div className="text-xs text-navy-500">
                Created: {ticket.createdAt} | Updated: {ticket.updatedAt}
              </div>
            </div>

            <div className="mt-6 border-t border-navy-100 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  Workflow Actions
                </span>
                <span className="text-xs text-navy-400">
                  {getTicketActions(ticket).length} available
                </span>
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

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <TicketIcon className="mx-auto h-12 w-12 text-navy-400" />
          <h3 className="mt-2 text-sm font-medium text-navy-900">No tickets found</h3>
          <p className="mt-1 text-sm text-navy-500">
            {user?.role === 'ADMIN' || user?.role === 'TECHNICIAN'
              ? 'No tickets are available yet. Create one or ask a student to submit a ticket first.'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      )}

      {detailTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative top-10 mx-auto w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-navy-900">
                  Ticket Details {formatTicketId(detailTicket.id)}
                </h3>
                <p className="mt-1 text-sm text-navy-600">
                  Review the issue, requester details, and workflow status.
                </p>
              </div>
              <button
                type="button"
                onClick={closeTicketDetails}
                className="rounded-md p-1 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-navy-100 bg-navy-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Issue</p>
                <h4 className="mt-2 text-base font-semibold text-navy-900">{detailTicket.category}</h4>
                <p className="mt-2 text-sm text-navy-700">{detailTicket.description}</p>
              </div>
              <div className="rounded-lg border border-navy-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Status</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(detailTicket.status)}`}>
                    {detailTicket.status}
                  </span>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(detailTicket.priority)}`}>
                    {detailTicket.priority}
                  </span>
                </div>
                <p className="mt-4 text-sm text-navy-600">
                  Assigned to: <span className="font-medium text-navy-900">{detailTicket.assignedTo || 'Unassigned'}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-navy-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Resource</p>
                <p className="mt-2 text-sm text-navy-900">{detailTicket.resource}</p>
                <p className="mt-1 text-sm text-navy-600">{detailTicket.location}</p>
              </div>
              <div className="rounded-lg border border-navy-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Requester</p>
                <p className="mt-2 text-sm text-navy-900">{detailTicket.requestedBy}</p>
                <p className="mt-1 text-sm text-navy-600">{detailTicket.requestedByEmail || detailTicket.email || 'No email available'}</p>
                <p className="mt-1 text-sm text-navy-600">{detailTicket.phone || 'No phone available'}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-navy-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Activity</p>
              <p className="mt-2 text-sm text-navy-600">Created: <span className="text-navy-900">{detailTicket.createdAt}</span></p>
              <p className="mt-1 text-sm text-navy-600">Updated: <span className="text-navy-900">{detailTicket.updatedAt}</span></p>
              <p className="mt-1 text-sm text-navy-600">Comments: <span className="text-navy-900">{detailTicket.comments?.length || 0}</span></p>
              <p className="mt-1 text-sm text-navy-600">Attachments: <span className="text-navy-900">{detailTicket.attachments?.length || 0}</span></p>
            </div>

            {detailTicket.comments && detailTicket.comments.length > 0 && (
              <div className="mt-4 rounded-lg border border-navy-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Latest Comments</p>
                <div className="mt-3 space-y-3">
                  {detailTicket.comments.slice().reverse().slice(0, 3).map((comment) => (
                    <div key={comment.id || comment.createdAt} className="rounded-lg bg-navy-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-navy-900">{comment.user}</span>
                        <span className="text-xs text-navy-500">{comment.createdAt}</span>
                      </div>
                      <p className="mt-1 text-sm text-navy-700">{comment.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative top-16 mx-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-navy-900">
                  Add Comment to Ticket {formatTicketId(selectedTicket.id)}
                </h3>
                <p className="mt-1 text-sm text-navy-600">
                  Share an update for {selectedTicket.resource} and notify the relevant user.
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
              <label className="mb-2 block text-sm font-medium text-navy-700">
                Comment
              </label>
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

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Create New Ticket</h3>
              
              <form onSubmit={handleSubmit(handleCreateTicket)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Category
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="input-field"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Priority
                    </label>
                    <select
                      {...register('priority', { required: 'Priority is required' })}
                      className="input-field"
                    >
                      <option value="">Select priority</option>
                      {priorities.slice(1).map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                    {errors.priority && (
                      <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Resource
                    </label>
                    <select
                      {...register('resource', { required: 'Resource is required' })}
                      className="input-field"
                    >
                      <option value="">Select resource</option>
                      {resources.map(resource => (
                        <option key={resource} value={resource}>{resource}</option>
                      ))}
                    </select>
                    {errors.resource && (
                      <p className="mt-1 text-sm text-red-600">{errors.resource.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      {...register('location', { required: 'Location is required' })}
                      className="input-field"
                      placeholder="Building and floor"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={4}
                    className="input-field"
                    placeholder="Describe the issue in detail"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      className="input-field"
                      placeholder="your.email@campus.edu"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone is required' })}
                      className="input-field"
                      placeholder="+1234567890"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Attachments (Max 3 files)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-navy-200 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-navy-400" />
                      <div className="flex text-sm text-navy-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-navy-700 hover:text-navy-900 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-navy-500"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-navy-500">
                        PNG, JPG, PDF, DOC up to 10MB each
                      </p>
                    </div>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-navy-600">Selected files:</p>
                      <ul className="text-xs text-navy-500">
                        {attachments.map((file, index) => (
                          <li key={index}>- {file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      reset();
                      setAttachments([]);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
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
