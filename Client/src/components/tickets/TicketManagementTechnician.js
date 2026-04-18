import React, { useState, useEffect } from 'react';
import {
  TicketIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { calculateTicketAge, getTimerColor, getTimerBgColor, formatTimerDisplay } from '../../utils/serviceLevelTimer';
import { useAuth } from '../../contexts/AuthContext';

const TicketManagementTechnician = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Comment state
  const [commentText, setCommentText] = useState('');
  
  // Technician info from auth context
  const technicianEmail = user?.email || 'technician@campus.edu';
  const technicianName = user?.name || 'Mike Johnson';

  useEffect(() => {
    loadTickets();
    // Set up interval for real-time updates
    const interval = setInterval(() => {
      loadTickets();
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      // Fetch tickets assigned to this technician using the new endpoint
      const response = await fetch(`http://localhost:8082/api/tickets/technician/${technicianEmail}`);
      const data = await response.json();

      if (data && data.success) {
        // Sort tickets by creation date (newest first)
        const sortedTickets = (data.data || []).sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Newest first
        });
        setTickets(sortedTickets);
      } else {
        console.error('API Error:', data);
        alert('Failed to load tickets: ' + (data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      alert('Error loading tickets: ' + error.message);
    } finally {
      setLoading(false);
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
      // Get user from localStorage (technician)
      const user = JSON.parse(localStorage.getItem('user')) || {
        id: 'tech_001',
        name: technicianName,
        email: technicianEmail
      };
      
      const commentData = {
        message: commentText
      };
      
      const response = await fetch(`http://localhost:8082/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || 'tech_001',
          'X-User-Name': user?.name || technicianName,
          'X-User-Email': user?.email || technicianEmail
        },
        body: JSON.stringify(commentData),
      });
      
      const result = await response.json();
      
      if (result && result.success) {
        alert('Comment added successfully!');
        setCommentText('');
        loadTickets();
        // Update selected ticket with new comment
        if (result.data && result.data.comments) {
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

  const openTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
    setCommentText('');
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const statusData = {
        status: newStatus
      };
      
      const response = await fetch(`http://localhost:8082/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });
      
      const result = await response.json();
      
      if (result && result.success) {
        alert(`Ticket status updated to ${newStatus}!`);
        loadTickets();
        setSelectedTicket(result.data);
      } else {
        alert('Failed to update status: ' + (result?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    }
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

  const formatTicketId = (ticketId) => {
    if (!ticketId) {
      return 'TKT-0000';
    }

    const rawId = String(ticketId).trim();
    const shortId = rawId.length > 6 ? rawId.slice(-6).toUpperCase() : rawId.toUpperCase();
    return `TKT-${shortId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TicketIcon className="h-8 w-8 mr-3 text-blue-600" />
            My Assigned Tickets
          </h1>
          <p className="text-gray-600 mt-1">Manage tickets assigned to {technicianName}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Technician
          </span>
          <span>{technicianEmail}</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">Loading your assigned tickets...</p>
        </div>
      )}

      {/* Tickets Grid */}
      {!loading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-900">{formatTicketId(ticket.id)}</span>
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
                  <p className="text-sm text-gray-700 line-clamp-2">{ticket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Resource:</span>
                    <span className="ml-2 text-gray-900">{ticket.resourceName || ticket.resourceId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Priority:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Requested by:</span>
                    <span className="ml-2 text-gray-900">{ticket.requestedByName || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Contact:</span>
                    <span className="ml-2 text-gray-900">{ticket.contactEmail || 'N/A'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Age:</span>
                    <span className={`ml-2 font-medium ${getTimerColor(calculateTicketAge(ticket.createdAt).totalHours, ticket.status)}`}>
                      {formatTimerDisplay(calculateTicketAge(ticket.createdAt))}
                    </span>
                  </div>
                </div>

                {/* Image Attachments */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div>
                    <span className="text-gray-500 font-medium text-sm">Attachments:</span>
                    <div className="mt-1 flex space-x-2">
                      {ticket.attachments.slice(0, 3).map((attachment, index) => (
                        <div key={index} className="relative">
                          <img
                            src={attachment}
                            alt={`Attachment ${index + 1}`}
                            className="w-12 h-12 object-cover rounded border border-gray-200"
                          />
                        </div>
                      ))}
                      {ticket.attachments.length > 3 && (
                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{ticket.attachments.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {ticket.comments && ticket.comments.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <ChatBubbleLeftIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {ticket.comments.length} comment(s)
                    </span>
                  </div>
                )}
              </div>

              {/* Technician Action Buttons */}
              <div className="mt-6 space-y-2">
                <button 
                  onClick={() => openTicketDetails(ticket)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm font-medium w-full transition-colors duration-200"
                >
                  <EyeIcon className="h-4 w-4 flex-shrink-0" />
                  <span>View Details & Add Comment</span>
                </button>
                
                {/* Status Update Buttons */}
                {ticket.status === 'OPEN' && (
                  <button 
                    onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm font-medium w-full transition-colors duration-200"
                  >
                    <ArrowPathIcon className="h-4 w-4 flex-shrink-0" />
                    <span>Start Working</span>
                  </button>
                )}
                
                {ticket.status === 'IN_PROGRESS' && (
                  <button 
                    onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm font-medium w-full transition-colors duration-200"
                  >
                    <span>Mark as Resolved</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tickets.length === 0 && (
        <div className="text-center py-12">
          <TicketIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets assigned to you</h3>
          <p className="text-gray-600">You haven't been assigned any tickets yet. Check back later for new assignments.</p>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Ticket Details - {formatTicketId(selectedTicket.id)}</h3>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                  <p className="text-gray-900">{selectedTicket.requestedByName || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Contact:</span>
                  <p className="text-gray-900">{selectedTicket.contactEmail}</p>
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    {submittingComment && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                    <span>{submittingComment ? 'Adding...' : 'Add Comment'}</span>
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

export default TicketManagementTechnician;
