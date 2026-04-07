import React, { useState } from 'react';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data - replace with actual API calls
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@campus.edu',
      phone: '+1234567890',
      role: 'ADMIN',
      department: 'Computer Science',
      studentId: 'IT2021001',
      status: 'ACTIVE',
      joinDate: '2021-09-01',
      lastLogin: '2026-03-28 10:30 AM',
      bookingsCount: 24,
      ticketsCount: 3,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@campus.edu',
      phone: '+1234567891',
      role: 'USER',
      department: 'Engineering',
      studentId: 'EN2021002',
      status: 'ACTIVE',
      joinDate: '2021-09-01',
      lastLogin: '2026-03-28 09:15 AM',
      bookingsCount: 18,
      ticketsCount: 7,
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@campus.edu',
      phone: '+1234567892',
      role: 'TECHNICIAN',
      department: 'IT Support',
      studentId: 'IT2020005',
      status: 'ACTIVE',
      joinDate: '2020-08-15',
      lastLogin: '2026-03-28 11:45 AM',
      bookingsCount: 5,
      ticketsCount: 45,
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@campus.edu',
      phone: '+1234567893',
      role: 'USER',
      department: 'Business',
      studentId: 'BS2021003',
      status: 'INACTIVE',
      joinDate: '2021-09-01',
      lastLogin: '2026-03-20 02:30 PM',
      bookingsCount: 12,
      ticketsCount: 2,
    },
    {
      id: 5,
      name: 'Tom Brown',
      email: 'tom.brown@campus.edu',
      phone: '+1234567894',
      role: 'USER',
      department: 'Science',
      studentId: 'SC2021004',
      status: 'ACTIVE',
      joinDate: '2021-09-01',
      lastLogin: '2026-03-27 04:20 PM',
      bookingsCount: 31,
      ticketsCount: 8,
    },
  ];

  const roles = ['all', 'ADMIN', 'USER', 'TECHNICIAN'];
  const statuses = ['all', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];
  const departments = ['Computer Science', 'Engineering', 'Business', 'Science', 'Arts', 'IT Support'];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'TECHNICIAN':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateUser = (userData) => {
    console.log('Creating user:', userData);
    // API call would go here
    setShowCreateModal(false);
  };

  const handleEditUser = (userId) => {
    console.log('Editing user:', userId);
    // API call would go here
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      console.log('Deleting user:', userId);
      // API call would go here
    }
  };

  const handleToggleStatus = (userId) => {
    console.log('Toggling user status:', userId);
    // API call would go here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">User Management</h1>
          <p className="text-navy-600">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-navy-100 rounded-lg p-3">
              <UsersIcon className="h-6 w-6 text-navy-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-navy-600">Total Users</p>
              <p className="text-2xl font-semibold text-navy-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-navy-600">Active Users</p>
              <p className="text-2xl font-semibold text-navy-900">
                {users.filter(u => u.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3">
              <UserCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-navy-600">Admins</p>
              <p className="text-2xl font-semibold text-navy-900">
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-navy-600">Departments</p>
              <p className="text-2xl font-semibold text-navy-900">{departments.length}</p>
            </div>
          </div>
        </div>
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
                placeholder="Search users by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input-field"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role}
                </option>
              ))}
            </select>

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
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-600">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-200">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-navy-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-navy-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 bg-navy-200 rounded-full flex items-center justify-center">
                          <UserCircleIcon className="h-6 w-6 text-navy-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-navy-900">{user.name}</div>
                        <div className="text-sm text-navy-500">{user.email}</div>
                        <div className="text-xs text-navy-400">{user.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      <br />
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-900">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-navy-900">
                      <div>{user.bookingsCount} bookings</div>
                      <div>{user.ticketsCount} tickets</div>
                    </div>
                    <div className="text-xs text-navy-500">
                      Last login: {user.lastLogin}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-900">
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-navy-600 hover:text-navy-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <ShieldCheckIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-navy-400" />
          <h3 className="mt-2 text-sm font-medium text-navy-900">No users found</h3>
          <p className="mt-1 text-sm text-navy-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Create User Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Add New User</h3>
              <p className="text-sm text-navy-600 mb-4">
                This modal would contain a form to add new users with role assignment.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-primary"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
