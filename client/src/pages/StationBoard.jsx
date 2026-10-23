import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Map, ArrowLeft, Train, AlertCircle, Radio, Search, Clock, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import AutocompleteInput from '../components/AutocompleteInput';
import toast from 'react-hot-toast';

const StationBoard = () => {
  const { code: routeCode } = useParams();
  const navigate = useNavigate();
  
  const currentCode = (routeCode || 'NDLS').toUpperCase();
  const [activeTab, setActiveTab] = useState('scheduled'); // 'scheduled' or 'live'
  const [boardData, setBoardData] = useState(null);
  const [liveBoardData, setLiveBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [apiError, setApiError] = useState(null);

  const majorStations = [
    { code: 'NDLS', name: 'New Delhi' },
    { code: 'MMCT', name: 'Mumbai' },
    { code: 'HWH', name: 'Kolkata' },
    { code: 'MAS', name: 'Chennai' },
    { code: 'SBC', name: 'Bengaluru' },
    { code: 'PUNE', name: 'Pune' },
    { code: 'CNB', name: 'Kanpur' },
    { code: 'BSB', name: 'Varanasi' },
    { code: 'ADI', name: 'Ahmedabad' },
  ];

  useEffect(() => {
    const fetchBoards = async () => {
      setLoading(true);
      setApiError(null);
      let capturedError = null;
      try {
        const [boardRes, liveRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/stations/${encodeURIComponent(currentCode)}/trains`).catch((err) => {
            capturedError = err.response?.data?.error?.message || err.message;
            return { data: { data: null } };
          }),
          axios.get(`http://localhost:5000/api/stations/${encodeURIComponent(currentCode)}/live`).catch((err) => {
            if (!capturedError) capturedError = err.response?.data?.error?.message || err.message;
            return { data: { data: null } };
          })
        ]);
        
        const bData = boardRes?.data?.data || null;
        const lData = liveRes?.data?.data || null;
        setBoardData(bData);
        setLiveBoardData(lData);
        if (capturedError && !bData && !lData) {
          setApiError(capturedError);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBoards();
  }, [currentCode]);

  const handleSearchStation = (newCode) => {
    if (newCode && newCode.trim()) {
      navigate(`/station/${encodeURIComponent(newCode.trim())}`);
      setSearchCode('');
    }
  };

  const getStationDisplayName = () => {
    return boardData?.station?.name || liveBoardData?.station?.name || currentCode;
  };

  const getStationCode = () => {
    return boardData?.station?.code || liveBoardData?.station?.code || currentCode;
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 md:pb-24">
      
      {/* Top Search & Station Switcher Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 mb-5 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* Quick Station Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 whitespace-nowrap mr-1">
            Hubs:
          </span>
          {majorStations.map((st) => (
            <button
              key={st.code}
              type="button"
              onClick={() => navigate(`/station/${st.code}`)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                currentCode === st.code
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st.name} ({st.code})
            </button>
          ))}
        </div>

        {/* Station Autocomplete Search */}
        <div className="w-full md:w-80 bg-slate-50 border border-slate-200 rounded-2xl px-2 py-1">
          <AutocompleteInput
            type="station"
            value={searchCode}
            onChange={(val) => {
              if (val) handleSearchStation(val);
            }}
            placeholder="Search any station (e.g. Jaipur, Pune)..."
            icon={Search}
          />
        </div>

      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center min-h-[50vh] gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white animate-bounce shadow-md">
            <Train className="w-6 h-6 stroke-[2.5]" />
          </div>
          <p className="font-display font-black text-slate-700 text-base sm:text-lg">
            Loading Station Board for {currentCode}...
          </p>
        </div>
      ) : (!boardData && !liveBoardData) ? (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <Map className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mb-2">Station Board Not Found</h2>
            <p className="text-sm font-semibold text-slate-500 mb-4">
              {apiError ? `RailRadar Notice: ${apiError}` : `Could not find scheduled timetable for "${currentCode}". Please select a major station or search by name.`}
            </p>
            {apiError && (
              <div className="mb-6 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 text-left">
                <strong>Provider response:</strong> {apiError}
              </div>
            )}
            <button 
              onClick={() => navigate('/station/NDLS')} 
              className="btn-navy w-full py-3 rounded-2xl text-sm cursor-pointer shadow-sm"
            >
              View New Delhi (NDLS) Board
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top Header Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 mt-0.5 sm:mt-0"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                    {getStationCode()}
                  </span>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    {boardData?.station?.city ? `${boardData.station.city} • ` : ''}Arrival & Departure Junction
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black font-display text-slate-900 tracking-tight leading-tight">
                  {getStationDisplayName()}
                </h1>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto self-stretch sm:self-auto">
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`flex-1 sm:flex-none py-2 px-4 rounded-xl font-display font-black text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === 'scheduled'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Scheduled ({boardData?.trains?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`flex-1 sm:flex-none py-2 px-4 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'live'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Radar ({liveBoardData?.trains?.length || 0})</span>
              </button>
            </div>
          </div>

          {/* Main Board Container */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
            
            {/* SCHEDULED TAB */}
            {activeTab === 'scheduled' && (
              <div>
                <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-xs sm:text-sm font-black font-display text-slate-900 flex items-center uppercase tracking-wider gap-2">
                    <Train className="w-4 h-4 text-slate-700" /> Station Departures & Arrivals
                  </h2>
                  <span className="text-[11px] font-mono font-black bg-white text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg">
                    {boardData?.trains?.length || 0} TRAINS
                  </span>
                </div>

                {!boardData?.trains || boardData.trains.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">
                    <Train className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-bold text-slate-600">No scheduled trains found for this station.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {/* Desktop Header */}
                    <div className="hidden md:flex px-6 py-3 bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="w-24">Train No</div>
                      <div className="flex-1">Train & Route</div>
                      <div className="w-28 text-center">Arrival</div>
                      <div className="w-28 text-center">Departure</div>
                      <div className="w-24 text-center">Stop Type</div>
                      <div className="w-28 text-right">Track Radar</div>
                    </div>

                    {boardData.trains.map((item, idx) => {
                      const trainNum = item.trainNumber || item.train?.number || '--';
                      const trainName = item.trainName || item.train?.name || 'Express Train';
                      const src = item.source || item.train?.source?.name || item.train?.source?.code || 'Origin';
                      const dst = item.destination || item.train?.destination?.name || item.train?.destination?.code || 'Destination';
                      const arr = item.arrival || item.stop?.arrival || '--:--';
                      const dep = item.departure || item.stop?.departure || '--:--';
                      const stopType = item.stopType || item.stop?.stopType || 'halt';

                      return (
                        <div 
                          key={`${trainNum}-${idx}`} 
                          className="p-4 sm:px-6 sm:py-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                        >
                          {/* Train Badge & Route */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-20 sm:w-24 shrink-0 font-mono font-black text-slate-900 text-sm sm:text-base bg-slate-100 md:bg-transparent px-2 md:px-0 py-1 md:py-0 rounded-lg text-center md:text-left">
                              #{trainNum}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm sm:text-base font-black font-display text-slate-900 group-hover:text-blue-900 transition-colors truncate">
                                  {trainName}
                                </h3>
                                <span className={`md:hidden px-2 py-0.5 text-[9px] uppercase font-black rounded-md border ${
                                  stopType === 'origin' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  stopType === 'destination' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                  'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {stopType}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                                {src} ➔ {dst}
                              </p>
                            </div>
                          </div>

                          {/* Time Details & Actions */}
                          <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-6 bg-slate-50 md:bg-transparent p-2.5 md:p-0 rounded-xl border md:border-0 border-slate-200">
                            <div className="md:w-28 text-left md:text-center">
                              <span className="text-[10px] md:hidden font-black text-slate-400 uppercase tracking-wider block">Arrival</span>
                              <span className="text-sm sm:text-base font-black font-display text-slate-800">
                                {arr}
                              </span>
                            </div>

                            <div className="md:w-28 text-left md:text-center">
                              <span className="text-[10px] md:hidden font-black text-slate-400 uppercase tracking-wider block">Departure</span>
                              <span className="text-sm sm:text-base font-black font-display text-blue-900">
                                {dep}
                              </span>
                            </div>

                            <div className="hidden md:block md:w-24 md:text-center">
                              <span className={`inline-block px-2.5 py-1 text-[10px] uppercase font-black rounded-lg border ${
                                stopType === 'origin' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                stopType === 'destination' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {stopType}
                              </span>
                            </div>

                            <div className="md:w-28 text-right shrink-0">
                              <Link
                                to={`/train/${trainNum}?view=spot`}
                                className="btn-navy px-3.5 py-2 rounded-xl text-xs font-black inline-flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                              >
                                <Train className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Track Live</span>
                              </Link>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LIVE RADAR TAB */}
            {activeTab === 'live' && (
              <div>
                <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-xs sm:text-sm font-black font-display text-slate-800 flex items-center uppercase tracking-wider gap-2">
                    <Radio className="w-4 h-4 text-blue-700" /> Live Departure Radar & Platforms
                  </h2>
                  {liveBoardData && (
                    <span className="text-[11px] font-mono font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                      {liveBoardData.trains?.length || 0} TRACKED
                    </span>
                  )}
                </div>

                {!liveBoardData || !liveBoardData.trains || liveBoardData.trains.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-500" />
                    <p className="font-bold text-slate-700">No active live radar feed for this station at this moment.</p>
                    <p className="text-xs text-slate-400 mt-1">Check scheduled tab for full timetable.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {/* Desktop Header */}
                    <div className="hidden md:flex px-6 py-3 bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="w-24">Train</div>
                      <div className="flex-1">Train & Status</div>
                      <div className="w-24 text-center">Sch. Dep</div>
                      <div className="w-24 text-center">Exp. Dep</div>
                      <div className="w-24 text-center">Platform</div>
                      <div className="w-28 text-right">Radar</div>
                    </div>

                    {liveBoardData.trains.map((item, idx) => {
                      const trainNum = item.trainNumber || item.train?.number || '--';
                      const trainName = item.trainName || item.train?.name || 'Express Train';
                      const src = item.source || item.train?.source?.name || item.train?.source || 'Origin';
                      const dst = item.destination || item.train?.destination?.name || item.train?.destination || 'Destination';
                      const schDep = item.scheduledDeparture || item.stop?.departure || '--:--';
                      const expDep = item.expectedDepartureTime || item.live?.expectedDepartureTime || schDep;
                      const pf = item.platform || item.stop?.platform || item.live?.platform || '1';
                      const delay = item.delayMinutes !== undefined ? item.delayMinutes : (item.live?.delayMinutes ?? 0);
                      const isDelayed = delay > 0;

                      return (
                        <div 
                          key={`live-${trainNum}-${idx}`}
                          className="p-4 sm:px-6 sm:py-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                        >
                          {/* Train Details */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-20 sm:w-24 shrink-0 font-mono font-black text-slate-900 text-sm sm:text-base bg-slate-100 md:bg-transparent px-2 md:px-0 py-1 md:py-0 rounded-lg text-center md:text-left">
                              #{trainNum}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <h3 className="text-sm sm:text-base font-black font-display text-slate-900 group-hover:text-blue-900 transition-colors truncate">
                                  {trainName}
                                </h3>
                                {isDelayed ? (
                                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider rounded-md">
                                    Delay {delay}m
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider rounded-md">
                                    On Time
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                                {src} ➔ {dst}
                              </p>
                            </div>
                          </div>

                          {/* Timetable & Platform & Action */}
                          <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-6 bg-slate-50 md:bg-transparent p-2.5 md:p-0 rounded-xl border md:border-0 border-slate-200">
                            <div className="md:w-24 text-left md:text-center">
                              <span className="text-[10px] md:hidden font-black text-slate-400 uppercase tracking-wider block">Sch</span>
                              <span className="text-sm sm:text-base font-black font-display text-slate-400 line-through">
                                {schDep}
                              </span>
                            </div>

                            <div className="md:w-24 text-left md:text-center">
                              <span className="text-[10px] md:hidden font-black text-slate-400 uppercase tracking-wider block">Exp</span>
                              <span className="text-sm sm:text-base font-black font-display text-blue-900">
                                {expDep}
                              </span>
                            </div>

                            <div className="md:w-24 text-left md:text-center">
                              <span className="text-[10px] md:hidden font-black text-slate-400 uppercase tracking-wider block">Platform</span>
                              <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-black rounded-lg text-xs font-mono">
                                PF {pf}
                              </span>
                            </div>

                            <div className="md:w-28 text-right shrink-0">
                              <Link 
                                to={`/train/${trainNum}?view=spot`}
                                className="btn-navy px-3.5 py-2 rounded-xl text-xs font-black inline-flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                              >
                                <Radio className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Track</span>
                              </Link>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
};

export default StationBoard;
