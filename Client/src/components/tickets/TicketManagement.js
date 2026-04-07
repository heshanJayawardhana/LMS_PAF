import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ticketsAPI } from '../../services/mockApi';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
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

  // Mock data for fallback
  const mockTickets = [
    {
      id: 101,
      category: 'Equipment',
      description: 'Projector not working in Conference Room A. The projector turns on but no image is displayed.',
      priority: 'HIGH',
      status: 'OPEN',
      resource: 'Conference Room A',
      location: 'Building 1, Floor 2',
      requestedBy: 'Regular User',
      email: 'user@campus.edu',
      phone: '+1234567890',
      assignedTo: null,
      createdAt: '2026-04-05',
      updatedAt: '2026-04-05',
      attachments: ['projector_error.jpg'],
      comments: [
        {
          id: 1,
          user: 'Regular User',
          message: 'This is urgent for tomorrow\'s presentation',
          createdAt: '2026-04-05 10:30',
        }
      ],
    },
    {
      id: 102,
      category: 'Facility',
      description: 'Air conditioning not working properly in Lab 301. Room temperature is too high.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      resource: 'Computer Lab 301',
      location: 'Building 3, Floor 3',
      requestedBy: 'Regular User',
      email: 'user@campus.edu',
      phone: '+1234567891',
      assignedTo: 'Technician',
      createdAt: '2026-04-04',
      updatedAt: '2026-04-05',
      attachments: [],
      comments: [
        {
          id: 1,
          user: 'Technician',
          message: 'We have scheduled maintenance for tomorrow morning',
          createdAt: '2026-04-05 09:15',
        }
      ],
    },
    {
      id: 103,
      category: 'Network',
      description: 'WiFi connectivity issues in Lecture Hall B. Students unable to connect to campus network.',
      priority: 'LOW',
      status: 'RESOLVED',
      resource: 'Lecture Hall B',
      location: 'Building 2, Floor 1',
      requestedBy: 'Regular User',
      email: 'user@campus.edu',
      phone: '+1234567892',
      assignedTo: 'Technician',
      createdAt: '2026-04-03',
      updatedAt: '2026-04-04',
      attachments: ['wifi_screenshot.png'],
      comments: [
        {
          id: 1,
          user: 'Technician',
          message: 'Router has been restarted. Issue should be resolved.',
          createdAt: '2026-04-04 14:20',
        }
      ],
    },
    {
      id: 104,
      category: 'Safety',
      description: 'Broken window in Meeting Room C. Glass is cracked and poses safety risk.',
      priority: 'HIGH',
      status: 'OPEN',
      resource: 'Meeting Room C',
      location: 'Building 1, Floor 1',
      requestedBy: 'Regular User',
      email: 'user@campus.edu',
      phone: '+1234567893',
      assignedTo: null,
      createdAt: '2026-04-05',
      updatedAt: '2026-04-05',
      attachments: ['broken_window.jpg', 'safety_concern.jpg'],
      comments: [],
    },
  ];

  const displayTickets = tickets.length > 0 ? tickets : mockTickets;
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
          Showing {filteredTickets.length} of {tickets.length} tickets
        </p>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-navy-900">#{ticket.id}</span>
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
                Created: {ticket.createdAt} • Updated: {ticket.updatedAt}
              </div>
            </div>

            <div className="mt-6 flex space-x-2">
              <button className="flex-1 btn-secondary flex items-center justify-center space-x-1">
                <EyeIcon className="h-4 w-4" />
                <span>View</span>
              </button>
              <button className="flex-1 btn-primary flex items-center justify-center space-x-1">
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span>Comment</span>
              </button>
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
            Try adjusting your search or filters
          </p>
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
                          <li key={index}>• {file.name}</li>
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
