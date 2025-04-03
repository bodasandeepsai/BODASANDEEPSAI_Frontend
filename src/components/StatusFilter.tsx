import React from 'react';

interface StatusFilterProps {
  onStatusChange: (status: string) => void;
  currentStatus: string;
}





const StatusFilter: React.FC<StatusFilterProps> = ({ onStatusChange, currentStatus }) => {
  const statuses = [
    { label: 'All', value: '' },
    { label: 'Registered', value: 'registered' },
    { label: 'Pending', value: 'pending' },
    { label: 'Abandoned', value: 'abandoned' },
    { label: 'Others', value: 'others' },
  ];

  const getStatusDotColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'registered':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'abandoned':
        return 'bg-red-500';
      case 'others':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h3 className="font-bold text-lg mb-4">Status</h3>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={`py-2 px-2 border border-blue-500 rounded-lg flex items-center gap-2 ${currentStatus === status.value ? 'bg-blue-100' : 'bg-white'} cursor-pointer`}
          >
            <span className={`w-3 h-3 rounded-full ${getStatusDotColor(status.value)}`}></span>
            <span className={`text-black ${currentStatus === status.value ? 'text-blue-500' : ''}`}>
              {status.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
