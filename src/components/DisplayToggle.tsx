import React from 'react';

interface DisplayToggleProps {
  activeView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}




const DisplayToggle: React.FC<DisplayToggleProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="font-sans m-8">
      <h2 className="text-xl font-bold mb-4">Display</h2>
      <div className="inline-flex rounded-md bg-gray-200 p-2 shadow-sm" role="group">
        <button
          type="button"
          className={`px-6 py-2 text-sm font-medium rounded-md ${activeView === 'grid'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-700 hover:bg-gray-200'
            }`}
          onClick={() => onViewChange('grid')}
        >
          Grid View
        </button>
        <button
          type="button"
          className={`px-6 py-2 text-sm font-medium rounded-md ${activeView === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-700 hover:bg-gray-200'
            }`}
          onClick={() => onViewChange('list')}
        >
          List View
        </button>
      </div>
    </div>
  );
};

export default DisplayToggle;