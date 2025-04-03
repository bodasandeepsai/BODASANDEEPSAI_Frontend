import React from 'react';
import { Filter, Share2, Menu } from 'lucide-react';

interface FilterButtonsProps {
  searchQuery: string;
  status: string; // New prop for status
  onFilterClick?: () => void;
  onMenuClick?: () => void;
}





const FilterButtons: React.FC<FilterButtonsProps> = ({ searchQuery, status, onFilterClick, onMenuClick }) => {
  const handleShareClick = () => {
    const searchURL = `${window.location.origin}/search?query=${encodeURIComponent(searchQuery)}&status=${encodeURIComponent(status)}`;

    if (navigator.share) {
      // Use the Web Share API for mobile and supported devices
      navigator.share({
        title: 'Trademark Search Results',
        text: 'Check out these trademark search results!',
        url: searchURL,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback: Copy the URL to the clipboard
      navigator.clipboard.writeText(searchURL).then(() => {
        alert('Link copied to clipboard!');
      }).catch((error) => console.error('Error copying to clipboard:', error));
    }
  };





  return (
    <div className="ml-6 flex items-center space-x-8">
      <button
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={onFilterClick}
        aria-label="Open filters"
      >
        <Filter className="mr-2 h-4 w-4" />
        Filter
      </button>
      <button
        className="p-2 text-gray-400 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={handleShareClick}
        aria-label="Share search results"
      >
        <Share2 className="h-4 w-4" />
      </button>
      <button
        className="p-2 text-gray-400 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
};

export default FilterButtons;
