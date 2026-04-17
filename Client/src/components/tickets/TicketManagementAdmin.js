import React, { useState, useEffect } from 'react';
import {
  TicketIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  ArrowPathIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { calculateTicketAge, getTimerColor, getTimerBgColor, formatTimerDisplay } from '../../utils/serviceLevelTimer';

const TicketManagementAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Simulate admin user
  
  // Form states
  const [resource, setResource] = useState('Conference Room A');
  const [category, setCategory] = useState('Equipment');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('Equipment needs maintenance and repair');
  const [email, setEmail] = useState('user@campus.edu');
  const [phone, setPhone] = useState('+1234567890');
  
  // Comment state
  const [commentText, setCommentText] = useState('');
  
  // Assign modal state
  const [technicianEmail, setTechnicianEmail] = useState('');
  const [technicianName, setTechnicianName] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      console.log('Loading tickets from API and localStorage...');
      
      // Get user-created tickets from localStorage
      const userTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
      console.log('User tickets from localStorage:', userTickets);
      
      // Use mock data for admin since backend API has issues
      const mockAdminTickets = [
        {
          id: "admin1",
          category: "EQUIPMENT",
          description: "Server rack cooling system malfunction",
          priority: "HIGH",
          status: "IN_PROGRESS",
          resourceName: "Server Room A",
          contactEmail: "admin@campus.edu",
          contactPhone: "+1234567890",
          requestedBy: "admin001",
          requestedByName: "Admin User",
          assignedTo: "tech123",
          assignedToName: "Mike Johnson",
          assignedToEmail: "tech@campus.edu",
          createdAt: "2026-04-16T10:00:00",
          updatedAt: "2026-04-16T14:00:00",
          attachments: ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"],
          comments: [
            {
              commentId: "c1",
              message: "Technician assigned to investigate",
              authorName: "System",
              createdAt: "2026-04-16T11:00:00"
            }
          ]
        },
        {
          id: "admin2",
          category: "FACILITY",
          description: "Emergency exit door sensor malfunction",
          priority: "CRITICAL",
          status: "OPEN",
          resourceName: "Building B - Exit 3",
          contactEmail: "security@campus.edu",
          contactPhone: "+0987654321",
          requestedBy: "security001",
          requestedByName: "Security Team",
          createdAt: "2026-04-17T08:00:00",
          updatedAt: "2026-04-17T08:00:00",
          attachments: [],
          comments: []
        }
      ];
      
      // Combine admin mock data with user-created tickets
      const allTickets = [...mockAdminTickets, ...userTickets];
      console.log('All tickets combined:', allTickets);
      
      // Sort tickets by creation date (newest first)
      const sortedTickets = allTickets.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      setTickets(sortedTickets);
      console.log('Tickets set in state (sorted newest first):', sortedTickets);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      alert('Error loading tickets: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    console.log('=== ADMIN TICKET CREATION START ===');
    console.log('Form data:', { resource, category, priority, description, email, phone });
    console.log('Form validation:', {
      resource: !!resource,
      category: !!category,
      priority: !!priority,
      description: !!description && description.trim().length >= 10,
      email: !!email,
      phone: !!phone
    });
    
    setSubmitting(true);
    try {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user')) || {};
      console.log('User from localStorage:', user);
      
      const ticketData = {
        resourceId: resource,
        resourceName: resource,
        category: category.toUpperCase(),  // must be uppercase
        description: description,
        priority: priority.toUpperCase(),   // must be uppercase
        contactEmail: email,
        contactPhone: phone
      };
      
      console.log('Sending to API:', ticketData);
      
      const response = await fetch('http://localhost:8082/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || 'admin_001',
          'X-User-Name': user?.name || 'Admin User'
        },
        body: JSON.stringify(ticketData),
      });
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result && result.success) {
        alert('Ticket created successfully!');
        loadTickets();
        setShowCreateModal(false);
        resetForm();
      } else {
        alert('Failed to create ticket: ' + (result?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    setSubmittingComment(true);
    try {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user')) || {};
      
      const commentData = {
        message: commentText
      };
      
      console.log('Adding comment:', commentData);
      
      const response = await fetch(`http://localhost:8082/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || 'admin_001',
          'X-User-Name': user?.name || 'Admin User'
        },
        body: JSON.stringify(commentData),
      });
      
      const result = await response.json();
      console.log('Comment response:', result);
      
      if (result && result.success) {
        alert('Comment added successfully!');
        setCommentText('');
        loadTickets();
        // Update selected ticket with new comment
        if (result.data) {
          setSelectedTicket(result.data);
        } else {
          // Find updated ticket in the list
          setTimeout(() => {
            const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
            if (updatedTicket) {
              setSelectedTicket(updatedTicket);
            }
          }, 500);
        }
      } else {
        alert('Failed to add comment: ' + (result?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment: ' + error.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    
    if (!technicianEmail.trim() || !technicianName.trim()) {
      alert('Please enter both technician email and name');
      return;
    }
    
    try {
      console.log('Assigning technician to ticket:', selectedTicket.id);
      console.log('Technician data:', { technicianEmail, technicianName });
      
      // Update ticket in localStorage (for user tickets)
      const userTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
      const updatedUserTickets = userTickets.map(ticket => {
        if (ticket.id === selectedTicket.id) {
          return {
            ...ticket,
            assignedTo: technicianEmail,
            assignedToName: technicianName,
            assignedToEmail: technicianEmail,
            updatedAt: new Date().toISOString()
          };
        }
        return ticket;
      });
      
      // Update localStorage if user ticket was found
      const ticketUpdated = updatedUserTickets.some(t => t.id === selectedTicket.id && t.assignedTo === technicianEmail);
      if (ticketUpdated) {
        localStorage.setItem('userTickets', JSON.stringify(updatedUserTickets));
      }
      
      // Update the selected ticket in state
      const updatedTicket = {
        ...selectedTicket,
        assignedTo: technicianEmail,
        assignedToName: technicianName,
        assignedToEmail: technicianEmail,
        updatedAt: new Date().toISOString()
      };
      
      alert('Technician assigned successfully!');
      setShowAssignModal(false);
      loadTickets();
      setSelectedTicket(updatedTicket);
      setTechnicianEmail('');
      setTechnicianName('');
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Error assigning technician: ' + error.message);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus, reason = '', notes = '') => {
    try {
      console.log('Updating ticket status:', ticketId, 'to:', newStatus);
      
      // Update ticket in localStorage (for user tickets)
      const userTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
      const updatedUserTickets = userTickets.map(ticket => {
        if (ticket.id === ticketId) {
          const updatedTicket = {
            ...ticket,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
          
          // Add rejection reason if provided
          if (reason) {
            updatedTicket.rejectionReason = reason;
          }
          
          // Add resolution notes if provided
          if (notes) {
            updatedTicket.resolutionNotes = notes;
          }
          
          return updatedTicket;
        }
        return ticket;
      });
      
      // Update localStorage if ticket was found and updated
      const ticketUpdated = updatedUserTickets.some(t => t.id === ticketId && t.status === newStatus);
      if (ticketUpdated) {
        localStorage.setItem('userTickets', JSON.stringify(updatedUserTickets));
        console.log('Ticket status updated in localStorage');
      }
      
      alert(`Ticket ${newStatus.toLowerCase()} successfully!`);
      loadTickets();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8082/api/tickets/${ticketId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('Ticket deleted successfully!');
        loadTickets();
        setShowTicketModal(false);
      } else {
        alert('Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Error deleting ticket: ' + error.message);
    }
  };

  const resetForm = () => {
    setResource('Conference Room A');
    setCategory('Equipment');
    setPriority('Medium');
    setDescription('Equipment needs maintenance and repair');
    setEmail('user@campus.edu');
    setPhone('+1234567890');
  };

  const openTicketDetails = (ticket) => {
    console.log('Opening ticket details:', ticket);
    setSelectedTicket(ticket);
    setShowTicketModal(true);
    setCommentText('');
  };

  const openAssignModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowAssignModal(true);
    setTechnicianEmail('');
    setTechnicianName('');
  };

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
      case 'CRITICAL':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['Equipment', 'Facility', 'Network', 'Safety', 'Electrical', 'Plumbing'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const resources = [
    'Conference Room A',
    'Computer Lab 301',
    'Meeting Room C',
    'Lecture Hall B',
    'Physics Lab 201',
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TicketIcon className="h-8 w-8 mr-3 text-purple-600" />
            Admin Ticket Management
          </h1>
          <p className="text-gray-600 mt-1">Full control over maintenance tickets and operations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">Loading tickets...</p>
        </div>
      )}

      {/* Tickets Grid */}
      {!loading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-900">#{ticket.id?.substring(0, 8) || ticket.id}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  {/* Service-Level Timer */}
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTimerBgColor(calculateTicketAge(ticket.createdAt).totalHours, ticket.status)}`}>
                    <span className={`font-bold ${getTimerColor(calculateTicketAge(ticket.createdAt).totalHours, ticket.status)}`}>
                      {formatTimerDisplay(calculateTicketAge(ticket.createdAt))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{ticket.category}</h4>
                  <p className="text-sm text-gray-700">{ticket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Resource:</span>
                    <span className="ml-2 text-gray-900">{ticket.resourceName || ticket.resourceId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Requested by:</span>
                    <span className="ml-2 text-gray-900">{ticket.requestedByName || 'User'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Assigned to:</span>
                    <span className="ml-2 text-gray-900">
                      {ticket.assignedToName || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {ticket.comments && ticket.comments.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <ChatBubbleLeftIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {ticket.comments.length} comment(s)
                    </span>
                  </div>
                )}
              </div>

              {/* Admin Action Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => openTicketDetails(ticket)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                <button 
                  onClick={() => openAssignModal(ticket)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Assign</span>
                </button>
                
                {/* Status Update Buttons */}
                {ticket.status === 'OPEN' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      <span>In Progress</span>
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(ticket.id, 'REJECTED', 'Admin rejected this ticket')}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                
                {ticket.status === 'IN_PROGRESS' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED', '', 'Ticket resolved by admin')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Resolve</span>
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(ticket.id, 'REJECTED', 'Admin rejected this ticket')}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                
                {ticket.status === 'RESOLVED' && (
                  <button 
                    onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Close</span>
                  </button>
                )}
                
                {/* Delete Button - Always Available for Admin */}
                <button 
                  onClick={() => handleDeleteTicket(ticket.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tickets.length === 0 && (
        <div className="text-center py-12">
          <TicketIcon className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Ticket Management</h3>
          <p className="mt-2 text-sm text-gray-500">
            View, assign, and manage all system tickets. Use filters to find specific tickets.
          </p>
          
          {/* Management Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setShowStatusModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Update Status</span>
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <UserIcon className="h-4 w-4" />
              <span>Assign Technician</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Ticket Modal (same as before) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Create New Ticket</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {priorities.map(pri => (
                        <option key={pri} value={pri}>{pri}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                    <select
                      value={resource}
                      onChange={(e) => setResource(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {resources.map(res => (
                        <option key={res} value={res}>{res}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Describe the issue in detail"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="your.email@campus.edu"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                  >
                    {submitting && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                    <span>{submitting ? 'Creating...' : 'Create Ticket'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Assign Technician</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Ticket: #{selectedTicket.id?.substring(0, 8)}</p>
                <p className="text-sm font-medium text-gray-900">{selectedTicket.description}</p>
              </div>
              
              <form onSubmit={handleAssignTechnician} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Technician Email *</label>
                    <input
                      type="email"
                      value={technicianEmail}
                      onChange={(e) => setTechnicianEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="technician@campus.edu"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Technician Name *</label>
                    <input
                      type="text"
                      value={technicianName}
                      onChange={(e) => setTechnicianName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter technician full name"
                      required
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Use technician email address for assignment. The system will automatically generate the technician ID.
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    Assign Technician
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details Modal (same as before) */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Ticket Details - #{selectedTicket.id?.substring(0, 8)}</h3>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Ticket Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <p className="text-gray-900">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Priority:</span>
                    <p className="text-gray-900">{selectedTicket.priority}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Resource:</span>
                    <p className="text-gray-900">{selectedTicket.resourceName || selectedTicket.resourceId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <p className="text-gray-900">{selectedTicket.status}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <p className="text-gray-900 mt-1">{selectedTicket.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Requested by:</span>
                    <p className="text-gray-900">{selectedTicket.requestedByName || 'User'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created:</span>
                    <p className="text-gray-900">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Comments</h4>
                
                {/* Existing Comments */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    selectedTicket.comments.map((comment) => (
                      <div key={comment.commentId} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{comment.authorName}</p>
                            <p className="text-sm text-gray-700 mt-1">{comment.message}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">No comments yet</p>
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Add Comment</label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter your comment..."
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                    >
                      {submittingComment && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                      <span>{submittingComment ? 'Adding...' : 'Add Comment'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManagementAdmin;
