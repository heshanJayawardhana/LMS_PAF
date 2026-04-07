import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  PencilIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Mock user data - replace with actual API calls
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@campus.edu',
    phone: '+1234567890',
    department: 'Computer Science',
    studentId: 'IT2021001',
    role: user?.role || 'USER',
    joinDate: '2021-09-01',
    lastLogin: '2026-03-28 10:30 AM',
  });

  const stats = [
    {
      label: 'Total Bookings',
      value: '24',
      icon: '📅',
    },
    {
      label: 'Active Tickets',
      value: '3',
      icon: '🎫',
    },
    {
      label: 'Completed Tasks',
      value: '18',
      icon: '✅',
    },
    {
      label: 'Campus Points',
      value: '450',
      icon: '🏆',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Created booking',
      details: 'Conference Room A - March 29, 10:00 AM',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      action: 'Submitted ticket',
      details: 'Equipment issue in Lab 301',
      timestamp: '1 day ago',
    },
    {
      id: 3,
      action: 'Booking approved',
      details: 'Meeting Room B - March 28, 2:00 PM',
      timestamp: '2 days ago',
    },
    {
      id: 4,
      action: 'Ticket resolved',
      details: 'Network connectivity issue',
      timestamp: '3 days ago',
    },
  ];

  const handleUpdateProfile = async (data) => {
    console.log('Updating profile:', data);
    // API call would go here
    setProfileData(prev => ({ ...prev, ...data }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    reset(profileData);
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Profile</h1>
          <p className="text-navy-600">Manage your personal information and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PencilIcon className="h-5 w-5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center">
              {/* Profile Picture */}
              <div className="relative inline-block">
                <div className="h-24 w-24 bg-navy-600 rounded-full mx-auto flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 bg-navy-700 rounded-full p-1 text-white hover:bg-navy-800 transition-colors duration-200">
                  <CameraIcon className="h-4 w-4" />
                </button>
              </div>

              {/* User Info */}
              <h2 className="mt-4 text-xl font-semibold text-navy-900">{profileData.name}</h2>
              <p className="text-sm text-navy-600">{profileData.email}</p>
              
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(profileData.role)}`}>
                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                  {profileData.role}
                </span>
              </div>

              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center text-sm">
                  <EnvelopeIcon className="h-4 w-4 text-navy-400 mr-3" />
                  <span className="text-navy-700">{profileData.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <PhoneIcon className="h-4 w-4 text-navy-400 mr-3" />
                  <span className="text-navy-700">{profileData.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <AcademicCapIcon className="h-4 w-4 text-navy-400 mr-3" />
                  <span className="text-navy-700">{profileData.department}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 space-y-3">
            {stats.map((stat, index) => (
              <div key={index} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-sm font-medium text-navy-700">{stat.label}</span>
                  </div>
                  <span className="text-lg font-semibold text-navy-900">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Profile Information</h3>
            
            {isEditing ? (
              <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Full Name
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      defaultValue={profileData.name}
                      className="input-field"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Email
                    </label>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      defaultValue={profileData.email}
                      type="email"
                      className="input-field"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Phone
                    </label>
                    <input
                      {...register('phone', { required: 'Phone is required' })}
                      defaultValue={profileData.phone}
                      className="input-field"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Department
                    </label>
                    <select
                      {...register('department', { required: 'Department is required' })}
                      defaultValue={profileData.department}
                      className="input-field"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Business">Business</option>
                      <option value="Arts">Arts</option>
                      <option value="Science">Science</option>
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-navy-500">Full Name</label>
                  <p className="mt-1 text-sm text-navy-900">{profileData.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-500">Email</label>
                  <p className="mt-1 text-sm text-navy-900">{profileData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-500">Phone</label>
                  <p className="mt-1 text-sm text-navy-900">{profileData.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-500">Department</label>
                  <p className="mt-1 text-sm text-navy-900">{profileData.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-500">Student ID</label>
                  <p className="mt-1 text-sm text-navy-900">{profileData.studentId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-500">Join Date</label>
                  <p className="mt-1 text-sm text-navy-900">{profileData.joinDate}</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Recent Activity</h3>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-navy-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-navy-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-navy-700">
                        {activity.action.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900">{activity.action}</p>
                    <p className="text-sm text-navy-600">{activity.details}</p>
                    <p className="text-xs text-navy-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Settings */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Account Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-navy-900">Email Notifications</p>
                  <p className="text-xs text-navy-600">Receive email updates about your bookings and tickets</p>
                </div>
                <button className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer bg-navy-600 transition-colors ease-in-out duration-200 focus:outline-none">
                  <span className="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-navy-900">Two-Factor Authentication</p>
                  <p className="text-xs text-navy-600">Add an extra layer of security to your account</p>
                </div>
                <button className="btn-secondary text-sm">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-navy-900">Password</p>
                  <p className="text-xs text-navy-600">Last changed 3 months ago</p>
                </div>
                <button className="btn-secondary text-sm">
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
