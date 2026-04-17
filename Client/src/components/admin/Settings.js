import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { adminSettingsAPI } from '../../services/api';

const defaultSettings = {
  appName: 'SmartEdu Portal',
  systemEmail: 'admin@smartedu.edu',
  timeZone: 'UTC+05:30 - India Standard Time',
  emailNotifications: true,
  bookingReminders: true,
  ticketUpdates: false,
  passwordPolicy: 'Medium (8 characters, 1 uppercase, 1 number)',
  sessionTimeout: '30 minutes',
  twoFactorAdmin: false,
  defaultUserRole: 'User',
  maxUsersPerDepartment: '100',
  autoApproveUsers: false,
};

const Toggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-navy-600' : 'bg-gray-200'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

const Settings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [savedSettings, setSavedSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const response = await adminSettingsAPI.get();
        const nextSettings = response.success && response.data ? { ...defaultSettings, ...response.data } : defaultSettings;
        setSettings(nextSettings);
        setSavedSettings(nextSettings);
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  const handleSave = async () => {
    try {
      const response = await adminSettingsAPI.update(settings);
      if (!response.success) {
        toast.error(response.message || 'Failed to save settings');
        return;
      }

      const nextSettings = { ...defaultSettings, ...response.data };
      setSettings(nextSettings);
      setSavedSettings(nextSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleReset = () => {
    setSettings(savedSettings);
    toast.success('Unsaved changes were cleared');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
          <p className="text-navy-600">Manage system configuration, security preferences, and user defaults</p>
        </div>
        <div className="rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-700">
          {loading ? 'Loading settings...' : hasChanges ? 'Unsaved changes' : 'All changes saved'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center">
            <CogIcon className="mr-3 h-6 w-6 text-navy-600" />
            <h2 className="text-lg font-semibold text-navy-900">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700">Application Name</label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => updateSetting('appName', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700">System Email</label>
              <input
                type="email"
                value={settings.systemEmail}
                onChange={(e) => updateSetting('systemEmail', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700">Time Zone</label>
              <select
                value={settings.timeZone}
                onChange={(e) => updateSetting('timeZone', e.target.value)}
                className="input-field"
              >
                <option>UTC+05:30 - India Standard Time</option>
                <option>UTC+00:00 - Greenwich Mean Time</option>
                <option>UTC-05:00 - Eastern Standard Time</option>
                <option>UTC-08:00 - Pacific Standard Time</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center">
            <BellIcon className="mr-3 h-6 w-6 text-navy-600" />
            <h2 className="text-lg font-semibold text-navy-900">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy-700">Email Notifications</p>
                <p className="text-xs text-navy-500">Receive email alerts for important updates</p>
              </div>
              <Toggle enabled={settings.emailNotifications} onChange={() => updateSetting('emailNotifications', !settings.emailNotifications)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy-700">Booking Reminders</p>
                <p className="text-xs text-navy-500">Get notified before bookings start</p>
              </div>
              <Toggle enabled={settings.bookingReminders} onChange={() => updateSetting('bookingReminders', !settings.bookingReminders)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy-700">Ticket Updates</p>
                <p className="text-xs text-navy-500">Notifications for ticket status changes</p>
              </div>
              <Toggle enabled={settings.ticketUpdates} onChange={() => updateSetting('ticketUpdates', !settings.ticketUpdates)} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center">
            <ShieldCheckIcon className="mr-3 h-6 w-6 text-navy-600" />
            <h2 className="text-lg font-semibold text-navy-900">Security Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700">Password Policy</label>
              <select
                value={settings.passwordPolicy}
                onChange={(e) => updateSetting('passwordPolicy', e.target.value)}
                className="input-field"
              >
                <option>Medium (8 characters, 1 uppercase, 1 number)</option>
                <option>Strong (12 characters, 1 uppercase, 1 number, 1 special)</option>
                <option>Very Strong (16 characters, mixed case, numbers, special)</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700">Session Timeout</label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                className="input-field"
              >
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
              <Toggle enabled={settings.twoFactorAdmin} onChange={() => updateSetting('twoFactorAdmin', !settings.twoFactorAdmin)} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center">
            <UserGroupIcon className="mr-3 h-6 w-6 text-navy-600" />
            <h2 className="text-lg font-semibold text-navy-900">User Management Defaults</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700">Default User Role</label>
              <select
                value={settings.defaultUserRole}
                onChange={(e) => updateSetting('defaultUserRole', e.target.value)}
                className="input-field"
              >
                <option>User</option>
                <option>Technician</option>
                <option>Admin (Not Recommended)</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700">Maximum Users per Department</label>
              <input
                type="number"
                value={settings.maxUsersPerDepartment}
                onChange={(e) => updateSetting('maxUsersPerDepartment', e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy-700">Auto-approve New Users</p>
                <p className="text-xs text-navy-500">Automatically approve user registrations</p>
              </div>
              <Toggle enabled={settings.autoApproveUsers} onChange={() => updateSetting('autoApproveUsers', !settings.autoApproveUsers)} />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center">
          <ComputerDesktopIcon className="mr-3 h-6 w-6 text-navy-600" />
          <h2 className="text-lg font-semibold text-navy-900">System Information</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-navy-500">Version</p>
            <p className="font-medium text-navy-900">{process.env.REACT_APP_VERSION || '1.0.0'}</p>
          </div>
          <div>
            <p className="text-sm text-navy-500">Application</p>
            <p className="font-medium text-navy-900">{settings.appName}</p>
          </div>
          <div>
            <p className="text-sm text-navy-500">Environment</p>
            <p className="font-medium text-navy-900">Local Development</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={handleReset} className="btn-secondary" disabled={!hasChanges}>
          Reset
        </button>
        <button type="button" onClick={handleSave} className="btn-primary" disabled={!hasChanges}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
