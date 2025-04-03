import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface SearchBarProps {
  onSearch: (query: string) => void;
}




const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(query)}`);
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center w-full max-w-5xl mx-20 p-1 py-5 m-2">
      <img src="image.png" alt="Logo" className="h-6 w-auto mr-4" />
      <div className="relative flex-grow max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border p-2 pl-10 pr-4 rounded-1"
          placeholder="Search Trademark Here eg. Mickey Mouse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundPosition: '12px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '20px 20px'
          }}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white m-2 p-4 rounded-xl h-[42px] w-80px flex items-center justify-center"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
