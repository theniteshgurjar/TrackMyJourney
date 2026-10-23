import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, ArrowRight, Train, Clock, ArrowDownUp, Calendar, Compass } from 'lucide-react';
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
  const [fromStation, setFromStation] = useState(null);
  const [toStation, setToStation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (sourceParam && destParam) {
      setSource(sourceParam);
      setDestination(destParam);
      performSearch(sourceParam, destParam);
    }
  }, [sourceParam, destParam]);

  const performSearch = async (fromVal, toVal) => {
    const src = fromVal || source;
    const dst = toVal || destination;

    if (!src || !dst) {
      toast.error('Please enter both source and destination stations');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/trains/search?source=${encodeURIComponent(src)}&destination=${encodeURIComponent(dst)}`
      );
      
      const payload = res.data?.data;
      const trainList = Array.isArray(payload) ? payload : (payload?.trains || []);
      
      setTrains(trainList);
      setFromStation(payload?.from || null);
      setToStation(payload?.to || null);
      setSearched(true);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to search trains');
      console.error(err);
      setTrains([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!source || !destination) {
      toast.error('Please enter both source and destination');
      return;
    }
    setSearchParams({ source, destination });
    performSearch(source, destination);
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-28">
      
      {/* Top Search Filter Box */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 mb-6 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-end">
          
          {/* Source */}
          <div className="flex-1 w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Origin Station (Name or Code)
            </label>
            <AutocompleteInput 
              type="station"
              value={source}
              onChange={setSource}
              placeholder="e.g. New Delhi or NDLS"
            />
          </div>

          {/* Swap */}
          <div className="self-center -my-2 lg:my-0 lg:self-end pb-1 z-10">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 sm:p-3 rounded-full lg:rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Swap Stations"
            >
              <ArrowDownUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Destination */}
          <div className="flex-1 w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> Destination Station (Name or Code)
            </label>
            <AutocompleteInput 
              type="station"
              value={destination}
              onChange={setDestination}
              placeholder="e.g. Mumbai Central or MMCT"
            />
          </div>

          {/* Search Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="btn-navy w-full lg:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md active:scale-95"
          >
            <span>{loading ? 'Searching...' : 'Search Trains'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white animate-bounce shadow-md">
            <Train className="w-6 h-6 stroke-[2.5]" />
          </div>
          <p className="font-display font-black text-slate-700 text-lg">Finding direct trains...</p>
        </div>
      ) : searched ? (
        <div>
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-display">Route Results</span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 flex items-center gap-2 flex-wrap">
                <span>{fromStation ? `${fromStation.name} (${fromStation.code})` : source}</span>
                <span className="text-slate-400">➔</span>
                <span>{toStation ? `${toStation.name} (${toStation.code})` : destination}</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-slate-100 text-slate-800 border border-slate-200 px-3.5 py-1.5 rounded-full">
                {trains.length} {trains.length === 1 ? 'train' : 'trains'} available
              </span>
            </div>
          </div>
          
          {/* Results List */}
          {trains.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-800 font-display">No direct trains found</h3>
              <p className="mt-2 text-sm text-slate-500 font-medium max-w-sm mx-auto">
                No direct trains were found between these stations. Try searching major junctions like New Delhi (NDLS), Mumbai Central (MMCT), Howrah (HWH), or Bangalore (SBC).
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {trains.map((item, idx) => {
                const trainNum = item.trainNumber || item.train?.number || item.number;
                const trainName = item.trainName || item.train?.name || item.name;
                const trainType = item.type || item.train?.type || 'Superfast Express';
                const runDays = item.runningDays || item.train?.runDays || [];
                const depTime = item.departure || item.from?.departure || '--:--';
                const arrTime = item.arrival || item.to?.arrival || '--:--';
                const srcCode = item.source || item.from?.code || '';
                const dstCode = item.destination || item.to?.code || '';
                const dur = item.duration || '--';
                const dist = item.distance || '';

                return (
                  <div 
                    key={`${trainNum}-${idx}`} 
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      
                      {/* Left: Train Meta */}
                      <div className="w-full lg:w-1/3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-slate-900 text-white">
                            #{trainNum}
                          </span>
                          <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                            {trainType}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-black font-display text-slate-900 leading-snug">
                          {trainName}
                        </h3>
                        
                        <div className="flex items-center text-xs font-bold text-slate-500 gap-1.5 mt-2 flex-wrap">
                          <span>Runs on:</span>
                          <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px]">
                            {Array.isArray(runDays) && runDays.length > 0 ? runDays.join(', ') : 'All Days'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Center: Journey Timeline */}
                      <div className="w-full lg:flex-1 bg-slate-50 border border-slate-200/80 px-6 py-4 rounded-2xl flex items-center justify-between gap-4">
                        
                        {/* Departure */}
                        <div className="text-center min-w-[70px]">
                          <p className="text-2xl font-black font-display text-slate-900 tracking-tight">{depTime}</p>
                          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mt-0.5">{srcCode}</p>
                        </div>
                        
                        {/* Visual Line */}
                        <div className="flex flex-col items-center flex-1 max-w-[220px]">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" /> {dur}
                          </span>
                          
                          <div className="w-full flex items-center relative">
                            <div className="h-2.5 w-2.5 rounded-full bg-slate-900 shrink-0"></div>
                            <div className="h-0.5 flex-1 bg-slate-300 rounded-full mx-1"></div>
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-700 shrink-0"></div>
                          </div>

                          {dist && (
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                              {dist}
                            </span>
                          )}
                        </div>
                        
                        {/* Arrival */}
                        <div className="text-center min-w-[70px]">
                          <p className="text-2xl font-black font-display text-slate-900 tracking-tight">{arrTime}</p>
                          <p className="text-xs font-black text-blue-900 uppercase tracking-wider mt-0.5">{dstCode}</p>
                        </div>
                      </div>
                      
                      {/* Right: Actions */}
                      <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2">
                        <Link 
                          to={`/train/${trainNum}?view=live`} 
                          className="btn-navy px-6 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 text-center"
                        >
                          <Train className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>SPOT LIVE</span>
                        </Link>
                        
                        <Link 
                          to={`/train/${trainNum}?view=seats`} 
                          className="btn-secondary-clean px-6 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 text-center"
                        >
                          <span>SEATS & FARE</span>
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm">
          <div className="mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-display block">
              POPULAR DIRECT TRAVEL CORRIDORS
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
              Top Indian Railway Routes
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
              Select any corridor below to instantly find direct express trains and schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { from: 'NDLS', to: 'MMCT', label: 'Delhi ➔ Mumbai', time: '16h 45m', trains: 'Rajdhani / SF' },
              { from: 'MMCT', to: 'NDLS', label: 'Mumbai ➔ Delhi', time: '16h 50m', trains: 'Tejas / Exp' },
              { from: 'SBC', to: 'MAS', label: 'Bangalore ➔ Chennai', time: '12h 20m', trains: 'Shatabdi / Exp' },
              { from: 'HWH', to: 'NDLS', label: 'Kolkata ➔ Delhi', time: '22h 10m', trains: 'Duronto / Rajdhani' },
              { from: 'NDLS', to: 'BSB', label: 'Delhi ➔ Varanasi', time: '8h 00m', trains: 'Vande Bharat' },
              { from: 'PUNE', to: 'CSMT', label: 'Pune ➔ Mumbai', time: '3h 15m', trains: 'Deccan Queen' },
              { from: 'MAS', to: 'SBC', label: 'Chennai ➔ Bangalore', time: '5h 00m', trains: 'Vande Bharat' },
              { from: 'NDLS', to: 'LJN', label: 'Delhi ➔ Lucknow', time: '6h 30m', trains: 'Swarna Shatabdi' },
            ].map((r, i) => (
              <div
                key={i}
                onClick={() => {
                  setSource(r.from);
                  setDestination(r.to);
                  setSearchParams({ source: r.from, destination: r.to });
                  performSearch(r.from, r.to);
                }}
                className="bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-black text-slate-400 mb-2">
                    <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                      {r.from} ➔ {r.to}
                    </span>
                    <span>{r.time}</span>
                  </div>
                  <h4 className="font-display font-black text-base text-slate-900 group-hover:text-blue-900 transition-colors">
                    {r.label}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">
                    {r.trains}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-black text-blue-900">
                  <span>View Trains</span>
                  <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Search;
