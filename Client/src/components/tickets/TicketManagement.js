import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserTicketManagement from './UserTicketManagement';
import TicketManagementTechnician from './TicketManagementTechnician';
import TicketManagementAdmin from './TicketManagementAdmin';

const TicketManagement = () => {
  const { user } = useAuth();

  // Route to appropriate component based on user role
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  switch (user.role) {
    case 'USER':
      return <UserTicketManagement />;
    
    case 'TECHNICIAN':
      return <TicketManagementTechnician />;
    
    case 'ADMIN':
      return <TicketManagementAdmin />;
    
    default:
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Invalid user role: {user.role}</p>
            <p className="text-gray-600 mt-2">Please contact administrator.</p>
          </div>
        </div>
      );
  }
};

export default TicketManagement;
