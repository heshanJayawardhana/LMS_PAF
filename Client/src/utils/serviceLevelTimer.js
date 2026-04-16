// Service-Level Timer utility for ticket management

export const calculateTicketAge = (createdAt) => {
  if (!createdAt) return { hours: 0, days: 0, totalHours: 0 };
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now - created;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = Math.floor(diffHours % 24);
  
  return {
    hours: remainingHours,
    days: diffDays,
    totalHours: diffHours
  };
};

export const getTimerColor = (totalHours, status) => {
  if (status === 'CLOSED' || status === 'RESOLVED') {
    return 'text-gray-600'; // Gray for completed tickets
  }
  
  if (totalHours <= 2) {
    return 'text-green-600'; // Green - on time
  } else if (totalHours <= 8) {
    return 'text-yellow-600'; // Yellow - warning
  } else if (totalHours <= 24) {
    return 'text-orange-600'; // Orange - urgent
  } else {
    return 'text-red-600'; // Red - overdue
  }
};

export const getTimerBgColor = (totalHours, status) => {
  if (status === 'CLOSED' || status === 'RESOLVED') {
    return 'bg-gray-100'; // Gray for completed tickets
  }
  
  if (totalHours <= 2) {
    return 'bg-green-100'; // Green - on time
  } else if (totalHours <= 8) {
    return 'bg-yellow-100'; // Yellow - warning
  } else if (totalHours <= 24) {
    return 'bg-orange-100'; // Orange - urgent
  } else {
    return 'bg-red-100'; // Red - overdue
  }
};

export const getServiceLevelStatus = (totalHours, status) => {
  if (status === 'CLOSED' || status === 'RESOLVED') {
    return 'Completed';
  }
  
  if (totalHours <= 2) {
    return 'On Time';
  } else if (totalHours <= 8) {
    return 'Warning';
  } else if (totalHours <= 24) {
    return 'Urgent';
  } else {
    return 'Overdue';
  }
};

export const formatTimerDisplay = (age) => {
  if (age.days > 0) {
    return `${age.days}d ${age.hours}h`;
  } else if (age.hours > 0) {
    return `${age.hours}h`;
  } else {
    return '< 1h';
  }
};

export const ServiceLevelTimer = ({ createdAt, status, showFullDetails = false }) => {
  const age = calculateTicketAge(createdAt);
  const timerColor = getTimerColor(age.totalHours, status);
  const bgColor = getTimerBgColor(age.totalHours, status);
  const statusText = getServiceLevelStatus(age.totalHours, status);
  const timeDisplay = formatTimerDisplay(age);
  
  return (
    <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
      <span className={`font-bold ${timerColor}`}>
        {timeDisplay}
      </span>
      {showFullDetails && (
        <span className={timerColor}>
          ({statusText})
        </span>
      )}
    </div>
  );
};

export default ServiceLevelTimer;
