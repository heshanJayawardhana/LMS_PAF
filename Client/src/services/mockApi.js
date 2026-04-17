// Mock API Service - Complete Frontend Implementation
// This service provides all data and functionality without backend dependencies

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getCurrentMockUser = () => {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    return null;
  }
};

// Mock Data Storage
let mockData = {
  users: [
    { id: 1, name: 'Admin User', email: 'admin@campus.edu', password: 'admin123', role: 'ADMIN', department: 'IT', status: 'ACTIVE', joinDate: '2021-09-01', lastLogin: '2026-04-05 10:30 AM' },
    { id: 2, name: 'Regular User', email: 'user@campus.edu', password: 'user123', role: 'USER', department: 'Computer Science', status: 'ACTIVE', joinDate: '2021-09-01', lastLogin: '2026-04-05 09:15 AM' },
    { id: 3, name: 'Technician', email: 'tech@campus.edu', password: 'tech123', role: 'TECHNICIAN', department: 'IT Support', status: 'ACTIVE', joinDate: '2020-08-15', lastLogin: '2026-04-05 11:45 AM' },
  ],
  facilities: [
    { id: 1, name: 'Conference Room A', type: 'Meeting Room', capacity: 20, location: 'Building 1, Floor 2', status: 'ACTIVE', description: 'Modern conference room with projector', amenities: ['Projector', 'Whiteboard', 'Video Conferencing'] },
    { id: 2, name: 'Computer Lab 301', type: 'Laboratory', capacity: 30, location: 'Building 3, Floor 3', status: 'ACTIVE', description: 'Computer lab with 30 workstations', amenities: ['Computers', 'Projector', 'WiFi'] },
    { id: 3, name: 'Lecture Hall B', type: 'Lecture Hall', capacity: 150, location: 'Building 2, Floor 1', status: 'ACTIVE', description: 'Large lecture hall with audio system', amenities: ['Projector', 'Sound System'] },
    { id: 4, name: 'Meeting Room C', type: 'Meeting Room', capacity: 8, location: 'Building 1, Floor 1', status: 'OUT_OF_SERVICE', description: 'Small meeting room', amenities: ['Whiteboard', 'TV'] },
  ],
  bookings: [
    { id: 1, user_id: 2, resource_id: 1, date: '2026-04-06', startTime: '10:00', endTime: '12:00', purpose: 'Team meeting', attendees: 8, status: 'APPROVED', requestedBy: 'Regular User', createdAt: '2026-04-05' },
    { id: 2, user_id: 2, resource_id: 2, date: '2026-04-07', startTime: '14:00', endTime: '16:00', purpose: 'Programming workshop', attendees: 25, status: 'PENDING', requestedBy: 'Regular User', createdAt: '2026-04-05' },
    { id: 3, user_id: 2, resource_id: 3, date: '2026-04-05', startTime: '09:00', endTime: '10:00', purpose: 'Client presentation', attendees: 5, status: 'APPROVED', requestedBy: 'Regular User', createdAt: '2026-04-04' },
  ],
  tickets: [
    { id: 101, user_id: 2, resource_id: 1, category: 'Equipment', description: 'Projector not working in Conference Room A', priority: 'HIGH', status: 'OPEN', assignedTo: null, requestedBy: 'Regular User', createdAt: '2026-04-05' },
    { id: 102, user_id: 2, resource_id: 2, category: 'Facility', description: 'Air conditioning issue in Lab 301', priority: 'MEDIUM', status: 'IN_PROGRESS', assignedTo: 3, requestedBy: 'Regular User', createdAt: '2026-04-04' },
    { id: 103, user_id: 2, resource_id: 3, category: 'Network', description: 'WiFi connectivity problems', priority: 'LOW', status: 'RESOLVED', assignedTo: 3, requestedBy: 'Regular User', createdAt: '2026-04-03' },
  ],
  notifications: [
    { id: 1, user_id: 2, message: 'Your booking for Conference Room A has been approved', type: 'booking_approved', isRead: false, createdAt: '2026-04-05' },
    { id: 2, user_id: 2, message: 'New comment on your ticket #101', type: 'ticket_comment', isRead: false, createdAt: '2026-04-05' },
    { id: 3, user_id: 2, message: 'Ticket #102 has been updated', type: 'ticket_resolved', isRead: true, createdAt: '2026-04-04' },
  ],
};

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    await delay(1000);
    const user = mockData.users.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );
    
    if (user) {
      return {
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
        token: `mock-token-${user.id}`
      };
    }
    
    return {
      success: false,
      message: 'Invalid email or password'
    };
  },

  register: async (userData) => {
    await delay(1000);

    const existingUser = mockData.users.find(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (existingUser) {
      return {
        success: false,
        message: 'Email is already registered',
      };
    }

    const allowedRoles = ['USER', 'ADMIN', 'TECHNICIAN'];
    const normalizedRole = allowedRoles.includes(userData.role) ? userData.role : 'USER';

    const newUser = {
      id: mockData.users.length + 1,
      ...userData,
      role: normalizedRole,
      department: userData.faculty || userData.department || 'General',
      status: 'ACTIVE',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: null
    };
    mockData.users.push(newUser);
    
    return {
      success: true,
      message: 'Registration successful'
    };
  },

  getCurrentUser: async () => {
    await delay(500);
    const token = localStorage.getItem('token');
    if (token) {
      const userId = parseInt(token.split('-')[2]);
      const user = mockData.users.find(u => u.id === userId);
      if (user) {
        return {
          success: true,
          user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }
        };
      }
    }
    return { success: false, message: 'User not found' };
  },
};

// Facilities API
export const facilitiesAPI = {
  getAll: async (filters = {}) => {
    await delay(800);
    let facilities = [...mockData.facilities];
    
    if (filters.type && filters.type !== 'all') {
      facilities = facilities.filter(f => f.type === filters.type);
    }
    if (filters.status && filters.status !== 'all') {
      facilities = facilities.filter(f => f.status === filters.status);
    }
    if (filters.search) {
      facilities = facilities.filter(f => 
        f.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        f.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    return {
      success: true,
      data: facilities
    };
  },

  getById: async (id) => {
    await delay(500);
    const facility = mockData.facilities.find(f => f.id === parseInt(id));
    return {
      success: true,
      data: facility
    };
  },

  create: async (facilityData) => {
    await delay(1000);
    const newFacility = {
      id: mockData.facilities.length + 1,
      ...facilityData,
      status: 'ACTIVE'
    };
    mockData.facilities.push(newFacility);
    
    return {
      success: true,
      data: newFacility
    };
  },

  update: async (id, facilityData) => {
    await delay(1000);
    const index = mockData.facilities.findIndex(f => f.id === parseInt(id));
    if (index !== -1) {
      mockData.facilities[index] = { ...mockData.facilities[index], ...facilityData };
      return {
        success: true,
        data: mockData.facilities[index]
      };
    }
    return { success: false, message: 'Facility not found' };
  },

  delete: async (id) => {
    await delay(1000);
    const index = mockData.facilities.findIndex(f => f.id === parseInt(id));
    if (index !== -1) {
      mockData.facilities.splice(index, 1);
      return { success: true };
    }
    return { success: false, message: 'Facility not found' };
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async (filters = {}) => {
    await delay(800);
    let bookings = [...mockData.bookings];
    
    // Add resource details
    bookings = bookings.map(booking => {
      const resource = mockData.facilities.find(f => f.id === booking.resource_id);
      const requester = mockData.users.find(u => u.id === booking.user_id);
      return {
        ...booking,
        resourceName: resource?.name || 'Unknown',
        resourceType: resource?.type || 'Unknown',
        resourceLocation: resource?.location || 'Unknown',
        requestedBy: booking.requestedBy || requester?.name || 'Unknown User',
        requestedByEmail: requester?.email || null,
      };
    });
    
    if (filters.status && filters.status !== 'all') {
      bookings = bookings.filter(b => b.status === filters.status);
    }
    if (filters.search) {
      bookings = bookings.filter(b => 
        b.resourceName.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.purpose.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    return {
      success: true,
      data: bookings
    };
  },

  getById: async (id) => {
    await delay(500);
    const booking = mockData.bookings.find(b => b.id === parseInt(id));
    return {
      success: true,
      data: booking
    };
  },

  create: async (bookingData) => {
    await delay(1000);
    const newBooking = {
      id: mockData.bookings.length + 1,
      user_id: 2, // Mock user
      ...bookingData,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    };
    mockData.bookings.push(newBooking);
    
    return {
      success: true,
      data: newBooking
    };
  },

  approve: async (id) => {
    await delay(800);
    const booking = mockData.bookings.find(b => b.id === parseInt(id));
    if (booking) {
      booking.status = 'APPROVED';
      return { success: true, data: booking };
    }
    return { success: false, message: 'Booking not found' };
  },

  reject: async (id, reason) => {
    await delay(800);
    const booking = mockData.bookings.find(b => b.id === parseInt(id));
    if (booking) {
      booking.status = 'REJECTED';
      booking.rejectionReason = reason;
      return { success: true, data: booking };
    }
    return { success: false, message: 'Booking not found' };
  },

  cancel: async (id) => {
    await delay(800);
    const booking = mockData.bookings.find(b => b.id === parseInt(id));
    if (booking) {
      booking.status = 'CANCELLED';
      return { success: true, data: booking };
    }
    return { success: false, message: 'Booking not found' };
  },
};

// Tickets API
export const ticketsAPI = {
  getAll: async (filters = {}) => {
    await delay(800);
    let tickets = [...mockData.tickets];
    
    // Add resource details
    tickets = tickets.map(ticket => {
      const resource = mockData.facilities.find(f => f.id === ticket.resource_id);
      const assignedUser = ticket.assignedTo ? mockData.users.find(u => u.id === ticket.assignedTo) : null;
      const requester = mockData.users.find(u => u.id === ticket.user_id);
      return {
        ...ticket,
        resourceName: resource?.name || 'Unknown',
        resourceLocation: resource?.location || 'Unknown',
        assignedToName: assignedUser?.name || 'Unassigned',
        assignedToEmail: assignedUser?.email || null,
        requestedBy: ticket.requestedBy || requester?.name || 'Unknown User',
        requestedByEmail: requester?.email || ticket.email || null,
        comments: ticket.comments || [],
        attachments: ticket.attachments || [],
      };
    });
    
    if (filters.status && filters.status !== 'all') {
      tickets = tickets.filter(t => t.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      tickets = tickets.filter(t => t.priority === filters.priority);
    }
    if (filters.search) {
      tickets = tickets.filter(t => 
        t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.resourceName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    return {
      success: true,
      data: tickets
    };
  },

  getById: async (id) => {
    await delay(500);
    const ticket = mockData.tickets.find(t => t.id === parseInt(id));
    return {
      success: true,
      data: ticket
    };
  },

  create: async (ticketData) => {
    await delay(1000);
    const currentUser = getCurrentMockUser();
    const newTicket = {
      id: mockData.tickets.length + 1,
      user_id: currentUser?.id || 2,
      ...ticketData,
      status: 'OPEN',
      assignedTo: null,
      requestedBy: currentUser?.name || 'Regular User',
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    mockData.tickets.push(newTicket);
    
    return {
      success: true,
      data: newTicket
    };
  },

  updateStatus: async (id, status) => {
    await delay(800);
    const ticket = mockData.tickets.find(t => t.id === parseInt(id));
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString().split('T')[0];
      return { success: true, data: ticket };
    }
    return { success: false, message: 'Ticket not found' };
  },

  assign: async (id, assignedTo) => {
    await delay(800);
    const ticket = mockData.tickets.find(t => t.id === parseInt(id));
    if (ticket) {
      ticket.assignedTo = assignedTo;
      ticket.updatedAt = new Date().toISOString().split('T')[0];
      return { success: true, data: ticket };
    }
    return { success: false, message: 'Ticket not found' };
  },

  addComment: async (id, comment) => {
    await delay(500);
    const ticket = mockData.tickets.find(t => t.id === parseInt(id));
    const currentUser = getCurrentMockUser();

    if (ticket) {
      const nextComment = {
        id: (ticket.comments?.length || 0) + 1,
        user: currentUser?.name || 'Current User',
        message: comment,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      ticket.comments = [...(ticket.comments || []), nextComment];
      ticket.updatedAt = new Date().toISOString().split('T')[0];
      return { success: true, data: ticket };
    }

    return { success: false, message: 'Ticket not found' };
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (filters = {}) => {
    await delay(500);
    let notifications = [...mockData.notifications];
    
    if (filters.unread === true) {
      notifications = notifications.filter(n => !n.isRead);
    }
    
    return {
      success: true,
      data: notifications
    };
  },

  markAsRead: async (id) => {
    await delay(300);
    const notification = mockData.notifications.find(n => n.id === parseInt(id));
    if (notification) {
      notification.isRead = true;
      return { success: true };
    }
    return { success: false, message: 'Notification not found' };
  },

  markAllAsRead: async () => {
    await delay(500);
    mockData.notifications.forEach(n => n.isRead = true);
    return { success: true };
  },

  delete: async (id) => {
    await delay(300);
    const index = mockData.notifications.findIndex(n => n.id === parseInt(id));
    if (index !== -1) {
      mockData.notifications.splice(index, 1);
      return { success: true };
    }
    return { success: false, message: 'Notification not found' };
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    await delay(800);
    return {
      success: true,
      data: {
        totalUsers: mockData.users.length,
        activeBookings: mockData.bookings.filter(b => b.status === 'APPROVED').length,
        openTickets: mockData.tickets.filter(t => t.status === 'OPEN').length,
        utilization: '78%'
      }
    };
  },

  getRecentActivity: async () => {
    await delay(500);
    return {
      success: true,
      data: [
        { id: 1, user: 'Regular User', action: 'Created booking', details: 'Conference Room A', timestamp: '5 minutes ago', type: 'booking' },
        { id: 2, user: 'Regular User', action: 'Submitted ticket', details: 'Equipment issue', timestamp: '15 minutes ago', type: 'ticket' },
        { id: 3, user: 'Admin User', action: 'Approved booking', details: 'Meeting Room C', timestamp: '1 hour ago', type: 'booking' },
      ]
    };
  },

  getTopFacilities: async () => {
    await delay(600);
    return {
      success: true,
      data: [
        { name: 'Conference Room A', bookings: 45, utilization: 85 },
        { name: 'Computer Lab 301', bookings: 38, utilization: 92 },
        { name: 'Lecture Hall B', bookings: 28, utilization: 76 },
      ]
    };
  },

  getDepartmentStats: async () => {
    await delay(600);
    return {
      success: true,
      data: [
        { name: 'Computer Science', users: 423, bookings: 156 },
        { name: 'Engineering', users: 312, bookings: 134 },
        { name: 'Business', users: 289, bookings: 98 },
      ]
    };
  },
};

// Users API (Admin only)
export const usersAPI = {
  getAll: async (filters = {}) => {
    await delay(800);
    let users = [...mockData.users];
    
    if (filters.role && filters.role !== 'all') {
      users = users.filter(u => u.role === filters.role);
    }
    if (filters.status && filters.status !== 'all') {
      users = users.filter(u => u.status === filters.status);
    }
    if (filters.search) {
      users = users.filter(u => 
        u.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    return {
      success: true,
      data: users
    };
  },

  toggleStatus: async (id) => {
    await delay(800);
    const user = mockData.users.find(u => u.id === parseInt(id));
    if (user) {
      user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return { success: true, data: user };
    }
    return { success: false, message: 'User not found' };
  },
};

export default {
  authAPI,
  facilitiesAPI,
  bookingsAPI,
  ticketsAPI,
  notificationsAPI,
  adminAPI,
  usersAPI,
};
