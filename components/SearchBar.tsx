import React, { useState, useEffect } from 'react';
import { Search, Map, Loader2, Locate } from 'lucide-react';

interface Props {
  initialAddress: string;
  initialRadius: number;
  isLoading: boolean;
  onSearch: (address: string, radius: number) => void;
  onLocateMe: () => void;
}

const SearchBar: React.FC<Props> = ({ initialAddress, initialRadius, isLoading, onSearch, onLocateMe }) => {
  const [address, setAddress] = useState(initialAddress);
  const [radius, setRadius] = useState(initialRadius);

  // Update local state if the parent updates the address (e.g. via geolocation)
  useEffect(() => {
    setAddress(initialAddress);
  }, [initialAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onSearch(address, radius);
    }
  };

  return (
    <div className="bg-white border-b sticky top-0 z-20 px-4 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          
          {/* Address Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm shadow-sm hover:shadow-md transition-shadow"
              placeholder="Où souhaitez-vous manger ? (ex: Tour Eiffel, Paris)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {/* Locate Me Icon inside Input */}
            <div 
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-black transition-colors"
              onClick={onLocateMe}
              title="Utiliser ma position actuelle"
            >
              <Locate className="h-5 w-5" />
            </div>
          </div>

          {/* Controls Container */}
          <div className="flex items-center gap-3">
            {/* Radius Selector */}
            <div className="relative">
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="appearance-none block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-full leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm cursor-pointer hover:bg-gray-50 shadow-sm"
              >
                <option value={0.5}>0.5 km</option>
                <option value={1}>1 km</option>
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <Map className="h-4 w-4" />
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-shrink-0 bg-[#FF385C] text-white px-6 py-3 rounded-full font-bold text-sm shadow-sm hover:bg-[#D90B3E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Recherche...
                </span>
              ) : (
                'Rechercher'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;