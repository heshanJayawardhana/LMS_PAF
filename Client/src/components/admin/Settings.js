import React from 'react';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

const Settings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="text-navy-600">Manage system configuration and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <CogIcon className="h-6 w-6 text-navy-600 mr-3" />
            <h2 className="text-lg font-semibold text-navy-900">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Application Name
              </label>
              <input
                type="text"
                defaultValue="SmartEdu Portal"
                className="w-full px-3 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                System Email
              </label>
              <input
                type="email"
                defaultValue="admin@smartedu.edu"
                className="w-full px-3 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Time Zone
              </label>
              <select className="w-full px-3 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent">
                <option>UTC+05:30 - India Standard Time</option>
                <option>UTC+00:00 - Greenwich Mean Time</option>
                <option>UTC-05:00 - Eastern Standard Time</option>
                <option>UTC-08:00 - Pacific Standard Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="h-6 w-6 text-navy-600 mr-3" />
            <h2 className="text-lg font-semibold text-navy-900">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy-700">Email Notifications</p>
                <p className="text-xs text-navy-500">Receive email alerts for important updates</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-navy-600">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy-700">Booking Reminders</p>
                <p className="text-xs text-navy-500">Get notified before bookings start</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-navy-600">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy-700">Ticket Updates</p>
                <p className="text-xs text-navy-500">Notifications for ticket status changes</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-navy-600 mr-3" />
            <h2 className="text-lg font-semibold text-navy-900">Security Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Password Policy
              </label>
              <select className="w-full px-3 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent">
                <option>Medium (8 characters, 1 uppercase, 1 number)</option>
                <option>Strong (12 characters, 1 uppercase, 1 number, 1 special)</option>
                <option>Very Strong (16 characters, mixed case, numbers, special)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Session Timeout
              </label>
              <select className="w-full px-3 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>4 hours</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy-700">Two-Factor Authentication</p>
                <p className="text-xs text-navy-500">Require 2FA for admin accounts</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* User Management Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="h-6 w-6 text-navy-600 mr-3" />
            <h2 className="text-lg font-semibold text-navy-900">User Management</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Default User Role
              </label>
              <select className="w-full px-3 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent">
                <option>User</option>
                <option>Technician</option>
                <option>Admin (Not Recommended)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Maximum Users per Department
              </label>
              <input
                type="number"
                defaultValue="100"
                className="w-full px-3 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy-700">Auto-approve New Users</p>
                <p className="text-xs text-navy-500">Automatically approve user registrations</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <ComputerDesktopIcon className="h-6 w-6 text-navy-600 mr-3" />
          <h2 className="text-lg font-semibold text-navy-900">System Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-navy-500">Version</p>
            <p className="font-medium text-navy-900">1.0.0</p>
          </div>
          <div>
            <p className="text-sm text-navy-500">Last Updated</p>
            <p className="font-medium text-navy-900">April 6, 2026</p>
          </div>
          <div>
            <p className="text-sm text-navy-500">Environment</p>
            <p className="font-medium text-navy-900">Development</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button className="px-4 py-2 border border-navy-200 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors">
          Cancel
        </button>
        <button className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
