import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { usersAPI } from '../../services/api';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  role: 'USER',
  department: 'Computer Science',
  studentId: '',
  status: 'ACTIVE',
};

const roles = ['all', 'ADMIN', 'USER', 'TECHNICIAN'];
const statuses = ['all', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];
const departments = ['Computer Science', 'Engineering', 'Business', 'Science', 'Arts', 'IT Support'];

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.studentId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const userStats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.status === 'ACTIVE').length,
      admins: users.filter((user) => user.role === 'ADMIN').length,
      departments: new Set(users.map((user) => user.department)).size,
    }),
    [users]
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'TECHNICIAN':
        return 'bg-blue-100 text-blue-800';
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

  const openCreateModal = () => {
    setSelectedUser(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowUserModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'USER',
      department: user.department || 'Computer Science',
      studentId: user.studentId || '',
      status: user.status || 'ACTIVE',
    });
    setFormErrors({});
    setShowUserModal(true);
  };

  const closeModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setFormData(emptyForm);
    setFormErrors({});
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!formData.department) nextErrors.department = 'Department is required';
    if (!formData.studentId.trim()) nextErrors.studentId = 'User ID is required';

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveUser = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      studentId: formData.studentId.trim(),
    };

    const response = selectedUser
      ? await usersAPI.update(selectedUser.id, payload)
      : await usersAPI.create(payload);

    if (!response.success) {
      toast.error(response.message || 'Failed to save user');
      return;
    }

    toast.success(selectedUser ? 'User updated successfully' : 'User created successfully');
    closeModal();
    loadUsers();
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    const response = await usersAPI.delete(userId);
    if (!response.success) {
      toast.error(response.message || 'Failed to delete user');
      return;
    }

    toast.success('User deleted successfully');
    loadUsers();
  };

  const handleToggleStatus = async (userId) => {
    const response = await usersAPI.toggleStatus(userId);
    if (!response.success) {
      toast.error(response.message || 'Failed to update user status');
      return;
    }

    toast.success(`User is now ${response.data.status.toLowerCase()}`);
    loadUsers();
  };

  const handleViewUser = (user) => {
    toast.success(`${user.name} | ${user.role} | ${user.email}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">User Management</h1>
          <p className="text-navy-600">Manage user accounts, roles, and account status</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-navy-100 rounded-lg p-3">
              <UsersIcon className="h-6 w-6 text-navy-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-navy-600">Total Users</p>
              <p className="text-2xl font-semibold text-navy-900">{userStats.total}</p>
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
              <p className="text-2xl font-semibold text-navy-900">{userStats.active}</p>
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
              <p className="text-2xl font-semibold text-navy-900">{userStats.admins}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-navy-600">Departments</p>
              <p className="text-2xl font-semibold text-navy-900">{userStats.departments}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="input-field">
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role}
                </option>
              ))}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field">
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-600">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        {loading && <p className="text-sm text-navy-500">Loading users...</p>}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-200">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">Role & Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-navy-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-200 bg-white">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-navy-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-navy-200 flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-navy-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-navy-900">{user.name}</div>
                        <div className="text-sm text-navy-500">{user.email}</div>
                        <div className="text-xs text-navy-400">{user.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      <br />
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-navy-900">{user.department}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-navy-900">
                      <div>{user.bookingsCount || 0} bookings</div>
                      <div>{user.ticketsCount || 0} tickets</div>
                    </div>
                    <div className="text-xs text-navy-500">Last login: {user.lastLogin || 'Never'}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-navy-900">{user.joinDate}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => handleViewUser(user)} className="text-navy-600 hover:text-navy-900" type="button">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-900" type="button">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleToggleStatus(user.id)} className="text-yellow-600 hover:text-yellow-900" type="button">
                        <ShieldCheckIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900" type="button">
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

      {filteredUsers.length === 0 && !loading && (
        <div className="py-12 text-center">
          <UsersIcon className="mx-auto h-12 w-12 text-navy-400" />
          <h3 className="mt-2 text-sm font-medium text-navy-900">No users found</h3>
          <p className="mt-1 text-sm text-navy-500">Try adjusting your search or filters</p>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative top-12 mx-auto w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-navy-900">
                  {selectedUser ? 'Edit User' : 'Add New User'}
                </h3>
                <p className="mt-1 text-sm text-navy-600">
                  Manage account details, role assignment, and activation status.
                </p>
              </div>
              <button onClick={closeModal} type="button" className="rounded-md p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-navy-700">Full name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Enter full name"
                />
                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-navy-700">Email</label>
                <input
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="user@campus.edu"
                />
                {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-navy-700">Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                  placeholder="+94 77 123 4567"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-navy-700">User ID</label>
                <input
                  value={formData.studentId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value }))}
                  className="input-field"
                  placeholder="IT2021001"
                />
                {formErrors.studentId && <p className="mt-1 text-sm text-red-600">{formErrors.studentId}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-navy-700">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  className="input-field"
                >
                  {roles.slice(1).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-navy-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                >
                  {statuses.slice(1).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-navy-700">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  className="input-field"
                >
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                {formErrors.department && <p className="mt-1 text-sm text-red-600">{formErrors.department}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onClick={closeModal} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleSaveUser} className="btn-primary">
                {selectedUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
