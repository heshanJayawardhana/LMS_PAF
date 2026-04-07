import React, { useState, useEffect } from 'react';
import { facilitiesAPI } from '../../services/mockApi';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const FacilitiesCatalogue = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFacilities();
  }, [searchTerm, filterType, filterStatus]);

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const response = await facilitiesAPI.getAll({
        search: searchTerm,
        type: filterType,
        status: filterStatus
      });
      if (response.success) {
        setFacilities(response.data);
      }
    } catch (error) {
      console.error('Failed to load facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback
  const mockFacilities = [
    {
      id: 1,
      name: 'Conference Room A',
      type: 'Meeting Room',
      capacity: 20,
      location: 'Building 1, Floor 2',
      status: 'ACTIVE',
      description: 'Modern conference room with projector and video conferencing',
      amenities: ['Projector', 'Whiteboard', 'Video Conferencing', 'WiFi'],
    },
    {
      id: 2,
      name: 'Computer Lab 301',
      type: 'Laboratory',
      capacity: 30,
      location: 'Building 3, Floor 3',
      status: 'ACTIVE',
      description: 'Computer lab with 30 workstations',
      amenities: ['Computers', 'Projector', 'WiFi', 'Air Conditioning'],
    },
    {
      id: 3,
      name: 'Lecture Hall B',
      type: 'Lecture Hall',
      capacity: 150,
      location: 'Building 2, Floor 1',
      status: 'ACTIVE',
      description: 'Large lecture hall with audio system',
      amenities: ['Projector', 'Sound System', 'Microphones', 'WiFi'],
    },
    {
      id: 4,
      name: 'Meeting Room C',
      type: 'Meeting Room',
      capacity: 8,
      location: 'Building 1, Floor 1',
      status: 'OUT_OF_SERVICE',
      description: 'Small meeting room for team discussions',
      amenities: ['Whiteboard', 'TV Screen', 'WiFi'],
    },
    {
      id: 5,
      name: 'Physics Lab 201',
      type: 'Laboratory',
      capacity: 25,
      location: 'Building 2, Floor 2',
      status: 'ACTIVE',
      description: 'Physics laboratory with experimental equipment',
      amenities: ['Lab Equipment', 'Safety Gear', 'WiFi', 'Storage'],
    },
  ];

  const types = ['all', 'Meeting Room', 'Laboratory', 'Lecture Hall', 'Equipment'];
  const statuses = ['all', 'ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];

  const displayFacilities = facilities.length > 0 ? facilities : mockFacilities;
  const filteredFacilities = displayFacilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || facility.type === filterType;
    const matchesStatus = filterStatus === 'all' || facility.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
      case 'Meeting Room':
        return '🏢';
      case 'Laboratory':
        return '🔬';
      case 'Lecture Hall':
        return '🎓';
      case 'Equipment':
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
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Facility</span>
        </button>
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
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
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
          Showing {filteredFacilities.length} of {facilities.length} facilities
        </p>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFacilities.map((facility) => (
          <div key={facility.id} className="card p-6 hover:shadow-navy-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{getTypeIcon(facility.type)}</div>
                <div>
                  <h3 className="text-lg font-semibold text-navy-900">{facility.name}</h3>
                  <p className="text-sm text-navy-600">{facility.type}</p>
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

              <p className="text-sm text-navy-700">{facility.description}</p>

              <div className="flex flex-wrap gap-2">
                {facility.amenities.map((amenity, index) => (
                  <span key={index} className="px-2 py-1 bg-navy-100 text-navy-700 text-xs rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex space-x-2">
              <button className="flex-1 btn-secondary flex items-center justify-center space-x-1">
                <EyeIcon className="h-4 w-4" />
                <span>View</span>
              </button>
              <button className="flex-1 btn-primary flex items-center justify-center space-x-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Book</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFacilities.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-navy-400" />
          <h3 className="mt-2 text-sm font-medium text-navy-900">No facilities found</h3>
          <p className="mt-1 text-sm text-navy-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Add Facility Modal (placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Add New Facility</h3>
              <p className="text-sm text-navy-600 mb-4">
                This modal would contain a form to add new facilities.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-primary"
                >
                  Add Facility
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
