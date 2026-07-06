import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, ArrowRight } from 'lucide-react';
import AutocompleteInput from '../components/AutocompleteInput';
import toast from 'react-hot-toast';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sourceParam = searchParams.get('source') || '';
  const destParam = searchParams.get('destination') || '';
  const navigate = useNavigate();
  
  const [source, setSource] = useState(sourceParam);
  const [destination, setDestination] = useState(destParam);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (sourceParam && destParam) {
      handleSearch();
    }
  }, [sourceParam, destParam]);

  const handleSearch = async (e) => {
    if(e) e.preventDefault();
    if(!source || !destination) {
      toast.error('Please enter both source and destination');
      return;
    }
    
    setSearchParams({ source, destination });
    setLoading(true);
    
    try {
      const res = await axios.get(`http://localhost:5000/api/trains/search?source=${source.toUpperCase()}&destination=${destination.toUpperCase()}`);
      setTrains(res.data.data);
      setSearched(true);
      
    } catch (err) {
      toast.error('Failed to fetch trains');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
      <div className="brand-card p-6 mb-8 backdrop-blur-md">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="source" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Source Station (Code)</label>
            <AutocompleteInput 
              type="station"
              value={source}
              onChange={setSource}
              placeholder="Enter Station Code (e.g. NDLS)"
            />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="destination" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Destination Station (Code)</label>
            <AutocompleteInput 
              type="station"
              value={destination}
              onChange={setDestination}
              placeholder="Enter Station Code (e.g. HWH)"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-primary hover:bg-primary-hover disabled:bg-primary/50 transition-all shadow-md active:scale-95">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : searched ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
              <span className="text-primary">{source.toUpperCase()}</span> to <span className="text-secondary">{destination.toUpperCase()}</span>
            </h2>
            <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">
              {trains.length} trains found
            </span>
          </div>
          
          {trains.length === 0 ? (
            <div className="text-center py-16 brand-card">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-bounce-subtle" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No trains found</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search criteria or station codes.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {trains.map((train) => {
                return (
                <div 
                  key={train.trainNumber} 
                  className="brand-card relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                      
                      {/* Train Info */}
                      <div className="flex items-start gap-4 w-full xl:w-auto">
                        <div>
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full border border-primary/20">
                              {train.trainNumber}
                            </span>
                            <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">{train.trainName}</h3>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2 mt-2">
                            <span className="font-semibold">Runs On:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{train.runningDays.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Timeline */}
                      <div className="w-full xl:w-auto flex-1 flex items-center justify-between xl:justify-center gap-2 md:gap-8 bg-gray-50 dark:bg-slate-800/50 px-4 md:px-8 py-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="text-center min-w-[80px]">
                          <p className="text-2xl font-bold font-display text-primary">{train.departure}</p>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{train.source}</p>
                        </div>
                        
                        <div className="flex flex-col items-center flex-1 max-w-[200px]">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{train.duration}</span>
                          <div className="w-full flex items-center">
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                            <div className="h-0.5 flex-1 bg-gradient-to-r from-primary to-secondary"></div>
                            <div className="h-2 w-2 rounded-full bg-secondary"></div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{train.distance}</span>
                        </div>
                        
                        <div className="text-center min-w-[80px]">
                          <p className="text-2xl font-bold font-display text-secondary">{train.arrival}</p>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{train.destination}</p>
                        </div>
                      </div>
                      
                      {/* Action */}
                      <div className="w-full xl:w-auto flex-shrink-0">
                        <Link 
                          to={`/train/${train.trainNumber}`} 
                          className="flex items-center justify-center w-full px-8 py-3 bg-white dark:bg-gray-800 text-primary border-2 border-primary/20 hover:border-primary font-bold rounded-xl hover:bg-primary/5 transition-all"
                        >
                          Details
                        </Link>
                      </div>
                      
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
          
        </div>
      ) : null}
    </div>
  );
};

export default Search;
