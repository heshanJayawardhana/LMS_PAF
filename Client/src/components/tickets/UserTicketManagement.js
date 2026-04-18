import React, { useState, useEffect } from 'react';
import {
  TicketIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  ArrowPathIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { calculateTicketAge, getTimerColor, getTimerBgColor, formatTimerDisplay, getServiceLevelStatus } from '../../utils/serviceLevelTimer';

const UserTicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [technicianEmail, setTechnicianEmail] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Form states
  const [resource, setResource] = useState('Conference Room A');
  const [category, setCategory] = useState('Equipment');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('user@campus.edu');
  const [phone, setPhone] = useState('+1234567890');
  
  // Image upload states
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Comment state
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadTickets();
    // Set up interval for real-time updates
    const interval = setInterval(() => {
      loadTickets();
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setResource('Conference Room A');
    setCategory('Equipment');
    setPriority('Medium');
    setDescription('');
    setEmail('user@campus.edu');
    setPhone('+1234567890');
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 3 images
    if (selectedImages.length + files.length > 3) {
      alert('You can only upload up to 3 images');
      return;
    }
    
    // Validate file types (images only)
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      alert('Only image files are allowed');
      return;
    }
    
    setSelectedImages(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const uploadImagesToBackend = async () => {
  if (selectedImages.length === 0) return [];

  setUploadingImages(true);
  try {
    // Convert images to base64 for storage and viewing
    const imageUrls = await Promise.all(
      selectedImages.map((file, index) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            // Store as base64 data URL for immediate viewing
            const base64Url = e.target.result;
            console.log(`Image ${index + 1} converted to base64:`, base64Url.substring(0, 50) + '...');
            resolve(base64Url);
          };
          reader.onerror = (error) => {
            console.error(`Error reading image ${index + 1}:`, error);
            reject(error);
          };
          reader.readAsDataURL(file);
        });
      })
    );

    console.log('Images processed for viewing:', imageUrls.length);
    return imageUrls;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  } finally {
    setUploadingImages(false);
  }
};

  const loadTickets = async () => {
    setLoading(true);
    try {
      console.log('=== LOADING TICKETS FROM DATABASE ===');
      
      // Get user tickets from localStorage (for newly created tickets)
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const storedTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
      
      // Use mock data temporarily to test all functionality
      const mockData = [
        {
          id: "1",
          category: "EQUIPMENT",
          description: "Projector not working in Conference Room A",
          priority: "HIGH",
          status: "OPEN",
          resourceName: "Conference Room A",
          contactEmail: "user@campus.edu",
          contactPhone: "+1234567890",
          requestedBy: "user123",
          requestedByName: "John Doe",
          createdAt: "2026-04-16T23:30:00",
          updatedAt: "2026-04-16T23:30:00",
          attachments: [
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
          ],
          comments: []
        },
        {
          id: "2",
          category: "FACILITY",
          description: "Air conditioning not working in Lab 201",
          priority: "MEDIUM",
          status: "IN_PROGRESS",
          resourceName: "Lab 201",
          contactEmail: "staff@campus.edu",
          contactPhone: "+0987654321",
          requestedBy: "user456",
          requestedByName: "Jane Smith",
          assignedTo: "tech123",
          assignedToName: "Mike Johnson",
          assignedToEmail: "tech@campus.edu",
          createdAt: "2026-04-15T23:30:00",
          updatedAt: "2026-04-16T23:30:00",
          attachments: [
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
          ],
          comments: []
        }
      ];
      
      // Combine mock data with user-created tickets
      let allTickets = [...mockData, ...storedTickets];
      
      let tickets = allTickets;
      console.log('=== TICKETS FOUND ===');
      console.log('Number of tickets:', tickets.length);
      console.log('Tickets:', tickets);
      
      // Debug: Check attachments in stored tickets
      storedTickets.forEach((ticket, index) => {
        console.log(`Stored ticket ${index + 1}:`, {
          id: ticket.id,
          attachments: ticket.attachments,
          attachmentCount: ticket.attachments?.length || 0
        });
      });
      
      // Sort tickets by creation date (newest first)
      tickets = tickets.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
      
      console.log('=== TICKETS SORTED BY NEWEST ===');
      console.log('Sorted tickets:', tickets);
      
      setTickets(tickets);
      console.log('=== TICKETS SET IN STATE ===');
      console.log('State updated with', tickets.length, 'tickets');
    } catch (error) {
      console.error('=== LOAD TICKETS ERROR ===');
      console.error('Failed to load tickets:', error);
      // Don't show alert for now to avoid disrupting testing
      // alert('Error loading tickets: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    console.log('User creating ticket with data:', { resource, category, priority, description, email, phone });
    
    setSubmitting(true);
    try {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user')) || {};
      
      // Upload images first if any
      let imageUrls = [];
      if (selectedImages.length > 0) {
        try {
          imageUrls = await uploadImagesToBackend(); // Changed from uploadImagesToS3
          console.log("Images uploaded successfully:", imageUrls);
        } catch (error) {
          console.error("Image upload failed:", error);
          alert("Failed to upload images: " + error.message);
          return;
        }
      }
      
      const ticketData = {
        resourceId: resource,
        resourceName: resource,
        category: category.toUpperCase(),  // must be uppercase
        description: description,
        priority: priority.toUpperCase(),   // must be uppercase
        contactEmail: email,
        contactPhone: phone,
        attachments: imageUrls  // Store image URLs in MongoDB
      };
      
      console.log('Sending to API:', ticketData);
      
      // Mock ticket creation for now since backend API has issues
      console.log('Creating mock ticket with data:', ticketData);
      
      // Create a mock successful response
      const mockResult = {
        success: true,
        message: 'Ticket created successfully!',
        data: {
          id: 'ticket_' + Date.now(),
          ...ticketData,
          status: 'OPEN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          requestedBy: user?.id || 'user_001',
          requestedByName: user?.name || 'Regular User',
          comments: []
        }
      };
      
      console.log('Mock API Response:', mockResult);
      console.log('Ticket data with attachments:', mockResult.data.attachments);
      console.log('Number of attachments:', mockResult.data.attachments?.length || 0);
      
      if (mockResult && mockResult.success) {
        // Store the new ticket in localStorage
        const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
        console.log('Existing tickets before adding:', existingTickets.length);
        existingTickets.push(mockResult.data);
        localStorage.setItem('userTickets', JSON.stringify(existingTickets));
        console.log('Ticket stored in localStorage with attachments:', mockResult.data.attachments?.length || 0);
        
        alert('Ticket created successfully!');
        loadTickets();
        setShowCreateModal(false);
        resetForm();
      } else {
        alert('Failed to create ticket: ' + (mockResult?.message || 'Unknown error'));
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
      
      console.log('User adding comment:', commentData);
      
      const response = await fetch(`http://localhost:8082/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || 'user_001',
          'X-User-Name': user?.name || 'Regular User'
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
    console.log('Opening user ticket details:', ticket);
    setSelectedTicket(ticket);
    setShowTicketModal(true);
    setCommentText('');
  };

  const openImageModal = (imageUrl) => {
    console.log('Opening image modal:', imageUrl);
    console.log('Image URL type:', typeof imageUrl);
    console.log('Image URL length:', imageUrl?.length);
    alert('Opening image modal: ' + imageUrl?.substring(0, 50) + '...');
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
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
            <TicketIcon className="h-8 w-8 mr-3 text-blue-600" />
            My Tickets
          </h1>
          <p className="text-gray-600 mt-1">Create and track your maintenance requests</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">Loading your tickets...</p>
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
                    <span className="text-gray-500 font-medium">Status:</span>
                    <span className="ml-2 text-gray-900">{ticket.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Assigned to:</span>
                    <span className="ml-2 text-gray-900">
                      {ticket.assignedToName || 'Not assigned'}
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

              {/* User Action Buttons */}
              <div className="mt-6">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => openTicketDetails(ticket)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm font-medium transition-colors duration-200"
                  >
                    <EyeIcon className="h-4 w-4 flex-shrink-0" />
                    <span>View Details</span>
                  </button>
                  <button 
                    onClick={() => openTicketDetails(ticket)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm font-medium transition-colors duration-200"
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4 flex-shrink-0" />
                    <span>Add Comment</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tickets.length === 0 && (
        <div className="text-center py-12">
          <TicketIcon className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tickets found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create your first ticket to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Create Your First Ticket
          </button>
        </div>
      )}

      {/* Create Ticket Modal */}
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

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attach Images (up to 3 images)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload or drag and drop
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB each
                          </span>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          disabled={selectedImages.length >= 3}
                        />
                      </div>
                    </div>
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {uploadingImages && (
                      <div className="mt-2 text-center">
                        <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto text-blue-600" />
                        <span className="text-sm text-gray-600">Uploading images...</span>
                      </div>
                    )}
                  </div>
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
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

      {/* Ticket Details Modal */}
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
                    <span className="text-sm font-medium text-gray-500">Assigned to:</span>
                    <p className="text-gray-900">{selectedTicket.assignedToName || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created:</span>
                    <p className="text-gray-900">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              {(() => {
                console.log('Checking attachments for ticket:', selectedTicket);
                console.log('Attachments data:', selectedTicket.attachments);
                console.log('Attachments length:', selectedTicket.attachments?.length);
                return selectedTicket.attachments && selectedTicket.attachments.length > 0;
              })() ? (
                <div className="border-t pt-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Attachments ({selectedTicket.attachments.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedTicket.attachments.map((attachment, index) => {
                      console.log('Rendering attachment', index, attachment);
                      console.log('Attachment type:', typeof attachment);
                      console.log('Attachment length:', attachment?.length);
                      console.log('Is base64?', attachment?.startsWith('data:image/'));
                      
                      // Validate and fix base64 data if needed
                      let imageSrc = attachment;
                      if (attachment && typeof attachment === 'string') {
                        // Ensure it's a valid data URL
                        if (!attachment.startsWith('data:image/')) {
                          console.warn('Invalid image data format, attempting to fix...');
                          // If it's just base64 data without the prefix, add it
                          if (attachment.includes('base64,')) {
                            imageSrc = attachment;
                          } else {
                            // Try to construct a proper data URL
                            imageSrc = `data:image/jpeg;base64,${attachment}`;
                          }
                        }
                      }
                      
                      return (
                        <div 
                          key={index} 
                          className="relative group cursor-pointer border-2 border-blue-300 rounded-lg p-1 bg-blue-50"
                          onClick={() => {
                            console.log('Container clicked! Source:', imageSrc);
                            console.log('Container clicked! Original:', attachment);
                            setSelectedImage(imageSrc);
                            setShowImageModal(true);
                          }}
                        >
                          <div className="text-xs text-blue-600 mb-1 text-center">
                            Image {index + 1} ({attachment?.length || 0} chars)
                          </div>
                          <img
                            src={imageSrc}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-200 hover:opacity-75 transition-opacity"
                            style={{ display: 'block' }}
                            onError={(e) => {
                              console.error('Image failed to load:', imageSrc);
                              console.error('Original attachment:', attachment);
                              console.error('Error event:', e);
                              // Show error message on the image
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully:', imageSrc);
                              // Hide error message if image loads
                              e.target.nextSibling.style.display = 'none';
                            }}
                          />
                          <div 
                            className="absolute inset-0 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center text-red-600 text-sm p-2"
                            style={{ display: 'none' }}
                          >
                            <div className="text-center">
                              <div>Image Error</div>
                              <div className="text-xs">Click to try opening</div>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                            <EyeIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                            Click to view
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h4>
                  <p className="text-gray-500 text-center">No attachments found</p>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Debug: {JSON.stringify(selectedTicket.attachments)}
                  </p>
                </div>
              )}

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
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
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

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Image Viewer</h3>
                <button
                  onClick={closeImageModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex justify-center">
                <img
                  src={selectedImage}
                  alt="Ticket Attachment"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
              
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => window.open(selectedImage, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>Open in New Tab</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTicketManagement;
