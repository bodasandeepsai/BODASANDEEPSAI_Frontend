import React, { useState, useEffect } from 'react';
import { Target, Repeat, Search, Check } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import StatusFilter from './StatusFilter';
import DisplayToggle from './DisplayToggle';
import FilterButtons from './FilterButtons';

interface TrademarkResult {
  mark_identification: string;
  current_owner: string;
  registration_number: string;
  filing_date: number;
  status_type: string;
  status_date: number;
  registration_date: number;
  mark_description_description: string[];
  class_codes: string[];
  image_url?: string;
  _id: string;
  law_firm?: string;
  attorney?: string;
}

interface Bucket {
  key: string;
  doc_count: number;
}

interface Aggregations {
  current_owners?: { buckets: Bucket[] };
  law_firms?: { buckets: Bucket[] };
  attorneys?: { buckets: Bucket[] };
}

interface CombinedTrademarkSearchProps {
  searchQuery: string;
}






const CombinedTrademarkSearch: React.FC<CombinedTrademarkSearchProps> = ({ searchQuery }) => {
  const [results, setResults] = useState<TrademarkResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: '' });
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: string[] }>({
    owners: [],
    law_firms: [],
    attorneys: [],
  });
  const [aggregations, setAggregations] = useState<Aggregations>({});
  const [activeTab, setActiveTab] = useState<'Owners' | 'Law Firms' | 'Attorneys'>('Owners');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('list');








  const fetchData = async () => {
    if (!searchQuery) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://vit-tm-task.api.trademarkia.app/api/v3/us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_query: searchQuery,
          input_query_type: '',
          sort_by: 'default',
          status: filters.status ? [filters.status] : [],
          exact_match: false,
          date_query: false,
          owners: selectedItems.owners,
          attorneys: selectedItems.attorneys,
          law_firms: selectedItems.law_firms,
          mark_description_description: [],
          classes: [],
          page: 1,
          rows: 10,
          sort_order: 'desc',
          states: [],
          counties: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAggregations(data.body.aggregations);
      const extractedResults = data.body?.hits?.hits || [];

      const transformedResults: TrademarkResult[] = extractedResults.map((item: any) => ({
        mark_identification: item._source?.mark_identification || '',
        current_owner: item._source?.current_owner || '',
        registration_number: item._source?.registration_number || '',
        filing_date: item._source?.filing_date || 0,
        status_type: item._source?.status_type || '',
        status_date: item._source?.status_date || 0,
        registration_date: item._source?.registration_date || 0,
        mark_description_description: item._source?.mark_description_description || [],
        class_codes: item._source?.class_codes || [],
        image_url: item._source?.image_url || '',
        _id: item._id || '',
        law_firm: item._source?.law_firm || '',
        attorney: item._source?.attorney_name || '',
      }));


      setResults(transformedResults);
    } catch (error: any) {
      console.error(error);
      setError(`Failed to fetch data: ${error.message || 'An unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, filters.status, selectedItems]);







  const [searchParams, setSearchParams] = useSearchParams();

  const handleFilterChange = (newFilters: { status?: string }) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, ...newFilters };

      // Update the URL search params
      if (newFilters.status) {
        searchParams.set('status', newFilters.status);  // Add the new status to the URL
      } else {
        searchParams.delete('status');  // Remove status filter if not set
      }

      setSearchParams(searchParams); // Apply changes to the URL
      return updatedFilters;
    });
  };

  useEffect(() => {
    // Extract the status from the URL 
    const statusFromUrl = searchParams.get('status') || '';

    setFilters({ status: statusFromUrl });
  }, [searchParams]);






  const truncateText = (text: string, maxLines: number) => {
    const lines = text.split('\n');
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join('\n') + '...';
  };




  const getStatusColor = (statusType: string) => {
    switch (statusType.toLowerCase()) {
      case 'registered':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'abandoned':
        return 'text-red-500';
      case 'others':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };






  const tabs: ('Owners' | 'Law Firms' | 'Attorneys')[] = ['Owners', 'Law Firms', 'Attorneys'];

  const getItemsForActiveTab = (): Bucket[] => {
    switch (activeTab) {
      case 'Owners':
        return aggregations.current_owners?.buckets || [];
      case 'Law Firms':
        return aggregations.law_firms?.buckets || [];
      case 'Attorneys':
        return aggregations.attorneys?.buckets || [];
      default:
        return [];
    }
  };






  const getFilteredItems = (): Bucket[] => {
    const items = getItemsForActiveTab();
    const tabKey = activeTab.toLowerCase().replace(' ', '_') as 'owners' | 'law_firms' | 'attorneys';
    const filtered = items.filter(item =>
      item.key.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedItems[tabKey].length > 0) {
      return filtered.filter(item => selectedItems[tabKey].includes(item.key));
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();






  const Spinner = () => (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-base text-gray-700">Loading...</p>
    </div>
  );






  const handleItemClick = (itemKey: string) => {
    const tabKey = activeTab.toLowerCase().replace(' ', '_') as 'owners' | 'law_firms' | 'attorneys';
    setSelectedItems(prev => {
      const updatedItems = { ...prev };
      if (updatedItems[tabKey].includes(itemKey)) {
        updatedItems[tabKey] = updatedItems[tabKey].filter(i => i !== itemKey);
      } else {
        updatedItems[tabKey] = [...updatedItems[tabKey], itemKey];
      }
      return updatedItems;
    });

    fetchData();
  };











  const GridViewItem: React.FC<{ result: TrademarkResult }> = ({ result }) => {
    return (
      <div className="bg-white m-2 h-auto rounded-lg border border-solid border-gray-300 p-3 w-68 flex flex-col">

        <div className="flex m-2 justify-between items-start mb-4">
          <div className="w-20 h-16 flex items-center justify-center bg-gray-100 shadow-md rounded">
            <img
              src={result.image_url}
              alt={result.mark_identification}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex items-center space-x-1">
            <span
              className={`w-3 h-3 rounded-full ${getStatusColor(result.status_type)}`}
              style={{ backgroundColor: 'currentColor' }}
            ></span>

            <div className="flex flex-col ml-2 mt-4">
              <div className={`font-bold text-l ${getStatusColor(result.status_type)}`}>
                {result.status_type === 'abandoned' ? 'Dead' : 'Live'}/{result.status_type}
              </div>
              <div className="text-xs font-bold text-black-500">
                on {format(new Date(result.status_date * 1000), 'dd MMM yyyy')}
              </div>
            </div>
          </div>
        </div>

        <div className="m-2 flex-grow">
          <h3 className="font-bold text-xl text-black mb-1">{result.mark_identification}</h3>

          <p className="text-gray-700 text-sm mb-2">{result.current_owner}</p>

          <div className="flex justify-between align-items items-center text-xs mb-2">
            <p className="text-gray-600">{result._id}</p>
            <span>.</span>
            <div className="text-xs mr-3">
              {format(new Date(result.filing_date * 1000), 'dd MMM yyyy')}
            </div>
            <div className="flex items-center text-xs font-bold p-1">
              <Repeat size={15} className="mr-1 text-red-500" />
              {format(new Date(result.registration_date * 1000), 'dd MMM yyyy')}
            </div>
          </div>

          <div className="flex items-center mt-2 text-sm text-gray-500 mb-2">
            <Target size={16} className="mr-1" />
            {result.class_codes.join(', ')}
          </div>

          <div
            className="max-w-80 text-xs text-gray-700 whitespace-pre-line overflow-hidden"
            style={{
              WebkitLineClamp: 2,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {truncateText(result.mark_description_description.join(', '), 2)}
          </div>
        </div>

        <div className="m-2 mt-4">
          <button className="w-20 h-10 border border-blue-500 text-blue-600 font-bold py-2 rounded-md text-sm">
            View
          </button>
        </div>
      </div>
    );
  };




  const renderResults = () => {
    if (displayMode === 'grid') {
      return (
        <div className="mx-auto max-w-screen-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((result) => (
              <GridViewItem key={result._id} result={result} />
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div>

          <div className="flex w-full">
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left px-10">Mark</th>
                  <th className="text-left px-6 p-2">Details</th>
                  <th className="text-left px-6">Status</th>
                  <th className="text-left px-16">Class/Description</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id} className="border-b last:border-b-0">
                    <td className="p-4 px-8">
                      <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded overflow-hidden mx-auto">
                        <img
                          src={result.image_url}
                          alt={result.mark_identification}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="p-4 max-w-60">
                      <div className="font-bold text-lg">{result.mark_identification}</div>
                      <div className="text-gray-500">{result.current_owner}</div>
                      <div className="mt-4 text-sm text-500">
                        <div className="font-bold text-lg">{result._id}</div>
                        <div className="text-xs">
                          {format(new Date(result.filing_date * 1000), 'dd MMM yyyy')}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span
                          className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(result.status_type)}`}
                          style={{ backgroundColor: 'currentColor' }}
                        ></span>
                        <div className={`font-bold text-l ${getStatusColor(result.status_type)}`}>
                          {result.status_type === 'abandoned' ? 'Dead' : 'Live'}/{result.status_type}
                        </div>
                      </div>
                      <div className="mt-1 text-xs font-bold">
                        on {format(new Date(result.status_date * 1000), 'dd MMM yyyy')}
                      </div>
                      <div className="mt-12 flex items-center text-xs font-bold">
                        <Repeat size={15} className="mr-1 text-red-500" />
                        {format(new Date(result.registration_date * 1000), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="p-10">
                      <div
                        className="max-w-80 text-sm text-gray-700 whitespace-pre-line overflow-hidden"
                        style={{
                          WebkitLineClamp: 2,
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {truncateText(result.mark_description_description.join(', '), 2)}
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Target size={16} className="mr-1" />
                        Classes: {result.class_codes.join(', ')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;
  if (results.length === 0) return <div className="text-center mt-12">
    <h2 className="text-2xl font-semibold">Search for something...</h2>
    <p className="mt-4 text-gray-600">
      <br />
      Please try refine your search .
    </p>
  </div>

  return (
    <div>
      <div className="flex w-full">
        <div className="w-3/4 bg-white shadow-md rounded-lg">
          {renderResults()}
        </div>
        <div className="w-1/4 mx-1 p-1 bg-white shadow-md rounded-lg">
          <FilterButtons searchQuery={searchQuery} status={filters.status || ''} />
          <div>
            <StatusFilter onStatusChange={(status) => handleFilterChange({ status })} currentStatus={filters.status} />
          </div>
          <div className="mt-2">
            <div className="w-70 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4">
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}`}
                    className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>

                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredItems.map((item) => (
                    <li
                      key={item.key}
                      className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 rounded-md"
                      onClick={() => handleItemClick(item.key)}
                    >
                      <div className={`w-5 h-5 border rounded-md flex items-center justify-center ${selectedItems[activeTab.toLowerCase().replace(' ', '_') as 'owners' | 'law_firms' | 'attorneys'].includes(item.key) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                        }`}>
                        {selectedItems[activeTab.toLowerCase().replace(' ', '_') as 'owners' | 'law_firms' | 'attorneys'].includes(item.key) && <Check size={14} color="white" />}
                      </div>
                      <span className="text-sm">{item.key}</span>
                      <span className="text-xs text-gray-500">({item.doc_count})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <DisplayToggle
            activeView={displayMode}
            onViewChange={(view) => setDisplayMode(view as 'grid' | 'list')}
          />
        </div>
      </div>
    </div>
  );
};

export default CombinedTrademarkSearch;
