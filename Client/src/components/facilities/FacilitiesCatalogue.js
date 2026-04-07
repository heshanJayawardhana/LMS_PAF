import React, { useState, useEffect } from 'react';
import { facilitiesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const typeOptions = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LAB', label: 'Lab' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'EQUIPMENT', label: 'Equipment' },
];

const statusOptions = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];

const defaultForm = {
  name: '',
  type: 'MEETING_ROOM',
  capacity: 1,
  location: '',
  availabilityWindow: '',
  status: 'ACTIVE',
  description: '',
  amenities: '',
};

const FacilitiesCatalogue = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadFacilities();
  }, [searchTerm, filterType, filterStatus, filterLocation, minCapacity]);

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        type: filterType === 'all' ? undefined : filterType,
        status: filterStatus === 'all' ? undefined : filterStatus,
        location: filterLocation || undefined,
        minCapacity: minCapacity ? Number(minCapacity) : undefined,
      };
      const response = await facilitiesAPI.getAll({
        ...params,
      });
      if (response.success) {
        setFacilities(response.data);
      }
    } catch (error) {
      console.error('Failed to load facilities:', error);
      toast.error('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingFacility(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name || '',
      type: facility.type || 'MEETING_ROOM',
      capacity: facility.capacity || 1,
      location: facility.location || '',
      availabilityWindow: facility.availabilityWindow || '',
      status: facility.status || 'ACTIVE',
      description: facility.description || '',
      amenities: Array.isArray(facility.amenities) ? facility.amenities.join(', ') : '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFacility(null);
    setFormData(defaultForm);
  };

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveFacility = async () => {
    if (!formData.name.trim() || !formData.location.trim() || !formData.availabilityWindow.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        capacity: Number(formData.capacity),
        location: formData.location.trim(),
        availabilityWindow: formData.availabilityWindow.trim(),
        status: formData.status,
        description: formData.description.trim(),
        amenities: formData.amenities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (editingFacility?.id) {
        await facilitiesAPI.update(editingFacility.id, payload);
        toast.success('Facility updated successfully');
      } else {
        await facilitiesAPI.create(payload);
        toast.success('Facility created successfully');
      }
      closeModal();
      await loadFacilities();
    } catch (error) {
      console.error('Failed to save facility:', error);
      toast.error('Failed to save facility');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) {
      return;
    }
    try {
      await facilitiesAPI.delete(id);
      toast.success('Facility deleted successfully');
      await loadFacilities();
    } catch (error) {
      console.error('Failed to delete facility:', error);
      toast.error('Failed to delete facility');
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const response = await facilitiesAPI.downloadReport();
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'facilities-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Facilities report downloaded');
    } catch (error) {
      toast.error('Failed to download facilities report');
    } finally {
      setDownloading(false);
    }
  };

  const formatType = (type) => {
    switch (type) {
      case 'MEETING_ROOM':
        return 'Meeting Room';
      case 'LECTURE_HALL':
        return 'Lecture Hall';
      case 'LAB':
        return 'Lab';
      case 'EQUIPMENT':
        return 'Equipment';
      default:
        return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'OUT_OF_SERVICE':
        return 'bg-red-100 text-red-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'MEETING_ROOM':
        return '🏢';
      case 'LAB':
        return '🔬';
      case 'LECTURE_HALL':
        return '🎓';
      case 'EQUIPMENT':
        return '⚙️';
      default:
        return '🏛️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Facilities & Assets</h1>
          <p className="text-navy-600">Browse and manage campus facilities and equipment</p>
        </div>
        {isAdmin && (
          <div className="flex space-x-3">
            <button
              onClick={handleDownloadPdf}
              className="btn-secondary flex items-center space-x-2"
              disabled={downloading}
            >
              <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button onClick={openCreateModal} className="btn-primary flex items-center space-x-2">
              <PlusIcon className="h-5 w-5" />
              <span>Add Facility</span>
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>

          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field">
            <option value="all">All Types</option>
            {typeOptions.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field">
            <option value="all">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            placeholder="Min capacity"
            className="input-field"
          />
          <input
            type="text"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            placeholder="Location filter"
            className="input-field lg:col-span-2"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-600">
          Showing {facilities.length} facilities
        </p>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility) => (
          <div key={facility.id} className="card p-6 hover:shadow-navy-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{getTypeIcon(facility.type)}</div>
                <div>
                  <h3 className="text-lg font-semibold text-navy-900">{facility.name}</h3>
                  <p className="text-sm text-navy-600">{formatType(facility.type)}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(facility.status)}`}>
                {facility.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-navy-600">
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                {facility.location}
              </div>
              
              <div className="flex items-center text-sm text-navy-600">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Capacity: {facility.capacity} people
              </div>

              <div className="text-sm text-navy-600">
                Availability: {facility.availabilityWindow || 'N/A'}
              </div>

              <p className="text-sm text-navy-700">{facility.description}</p>

              <div className="flex flex-wrap gap-2">
                {(facility.amenities || []).map((amenity, index) => (
                  <span key={index} className="px-2 py-1 bg-navy-100 text-navy-700 text-xs rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {isAdmin && (
              <div className="mt-6 flex space-x-2">
                <button
                  className="flex-1 btn-secondary flex items-center justify-center space-x-1"
                  onClick={() => openEditModal(facility)}
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-1"
                  onClick={() => handleDeleteFacility(facility.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && facilities.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-navy-400" />
          <h3 className="mt-2 text-sm font-medium text-navy-900">No facilities found</h3>
          <p className="mt-1 text-sm text-navy-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center text-navy-600 py-4">Loading facilities...</div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[700px] shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">
                {editingFacility ? 'Update Facility' : 'Add New Facility'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Facility name *"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                />
                <select
                  className="input-field"
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  {typeOptions.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  placeholder="Capacity *"
                  value={formData.capacity}
                  onChange={(e) => handleFormChange('capacity', e.target.value)}
                />
                <select
                  className="input-field"
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <input
                  type="text"
                  className="input-field md:col-span-2"
                  placeholder="Location *"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                />
                <input
                  type="text"
                  className="input-field md:col-span-2"
                  placeholder="Availability window (e.g. Mon-Fri 08:00-18:00) *"
                  value={formData.availabilityWindow}
                  onChange={(e) => handleFormChange('availabilityWindow', e.target.value)}
                />
                <input
                  type="text"
                  className="input-field md:col-span-2"
                  placeholder="Amenities (comma separated)"
                  value={formData.amenities}
                  onChange={(e) => handleFormChange('amenities', e.target.value)}
                />
                <textarea
                  className="input-field md:col-span-2"
                  placeholder="Description"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFacility}
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingFacility ? 'Update Facility' : 'Add Facility'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitiesCatalogue;
