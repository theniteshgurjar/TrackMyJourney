import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Map, ArrowLeft, Clock, Train, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StationBoard = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('scheduled');
  
  const [boardData, setBoardData] = useState(null);
  const [liveBoardData, setLiveBoardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const [boardRes, liveRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/trains/station/${code}`),
          axios.get(`http://localhost:5000/api/trains/station/${code}/live`).catch(() => ({ data: { data: null } }))
        ]);
        
        setBoardData(boardRes.data.data);
        setLiveBoardData(liveRes.data.data);
      } catch (err) {
        toast.error('Failed to fetch station board');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (code) fetchBoards();
  }, [code]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!boardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Map className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Station not found</h3>
          <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">Go back home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{boardData.station.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">{boardData.station.code}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100/50 dark:bg-slate-800/50 p-1 rounded-xl mb-6 max-w-sm mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'scheduled'
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg transition-all flex items-center justify-center ${
            activeTab === 'live'
              ? 'bg-white dark:bg-slate-700 text-secondary shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-secondary mr-2 animate-pulse"></span> Live Board
        </button>
      </div>

      <div className="brand-card overflow-hidden">
        
        {activeTab === 'scheduled' && (
          <>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/30 flex justify-between items-center">
              <h2 className="text-lg font-bold font-display text-gray-900 dark:text-white flex items-center uppercase tracking-wider">
                <Train className="w-5 h-5 mr-3 text-primary" /> Departure Board
              </h2>
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{boardData.trains.length} Trains</span>
            </div>
            
            {boardData.trains.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <Train className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No upcoming scheduled trains available.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* Board Header Row - Desktop Only */}
                <div className="hidden md:flex px-6 py-3 bg-gray-50 dark:bg-slate-800/80 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  <div className="w-24">Train</div>
                  <div className="flex-1">Destination</div>
                  <div className="w-24 text-center">Arr</div>
                  <div className="w-24 text-center">Dep</div>
                  <div className="w-28 text-center">Status</div>
                  <div className="w-24"></div>
                </div>
                
                {boardData.trains.map((train, idx) => (
                  <div key={`${train.trainNumber}-${idx}`} className="px-6 py-4 hover:bg-primary/5 dark:hover:bg-slate-800/50 transition flex flex-col md:flex-row md:items-center gap-4 group">
                    <div className="w-24 font-bold text-primary dark:text-primary font-display text-lg">
                      {train.trainNumber}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{train.trainName}</h3>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {train.source} → {train.destination}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 md:gap-0 mt-2 md:mt-0 bg-gray-50 dark:bg-slate-800 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-lg">
                      <div className="md:w-24 md:text-center">
                        <p className="text-[10px] md:hidden font-bold text-gray-400 uppercase tracking-widest mb-1">Arr</p>
                        <p className="text-lg font-bold font-display text-gray-900 dark:text-white">{train.arrival || '--:--'}</p>
                      </div>
                      <div className="md:w-24 md:text-center">
                        <p className="text-[10px] md:hidden font-bold text-gray-400 uppercase tracking-widest mb-1">Dep</p>
                        <p className="text-lg font-bold font-display text-primary">{train.departure || '--:--'}</p>
                      </div>
                      <div className="md:w-28 md:text-center flex-1 text-right md:text-center">
                        <span className={`inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full ${
                          train.stopType === 'origin' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                          train.stopType === 'destination' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {train.stopType}
                        </span>
                      </div>
                      <div className="md:w-24 text-right">
                        <Link 
                          to={`/train/${train.trainNumber}`}
                          className="inline-block px-4 py-2 border-2 border-primary/20 hover:border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary/5 transition uppercase tracking-wider"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'live' && (
          <>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/30 flex justify-between items-center">
              <h2 className="text-lg font-bold font-display text-gray-900 dark:text-white flex items-center uppercase tracking-wider">
                <AlertCircle className="w-5 h-5 mr-3 text-secondary animate-pulse" /> Live Board
              </h2>
              {liveBoardData && (
                <span className="text-xs font-bold bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                  {liveBoardData.trains.length} Live
                </span>
              )}
            </div>

            {!liveBoardData || liveBoardData.trains.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No live board data currently available.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* Board Header Row - Desktop Only */}
                <div className="hidden md:flex px-6 py-3 bg-gray-50 dark:bg-slate-800/80 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  <div className="w-24">Train</div>
                  <div className="flex-1">Destination</div>
                  <div className="w-24 text-center">Sch. Dep</div>
                  <div className="w-24 text-center">Exp. Dep</div>
                  <div className="w-20 text-center">Plat</div>
                  <div className="w-24"></div>
                </div>

                {liveBoardData.trains.map((train, idx) => {
                  const isDelayed = train.delayMinutes > 0;
                  return (
                    <div key={`live-${train.trainNumber}-${idx}`} className="px-6 py-4 hover:bg-secondary/5 dark:hover:bg-slate-800/50 transition flex flex-col md:flex-row md:items-center gap-4 group">
                      <div className="w-24 font-bold text-secondary dark:text-secondary font-display text-lg">
                        {train.trainNumber}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-secondary transition-colors">{train.trainName}</h3>
                          {isDelayed ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded">
                              Delay {train.delayMinutes}m
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded">
                              On Time
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {train.source} → {train.destination}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 md:gap-0 mt-2 md:mt-0 bg-gray-50 dark:bg-slate-800 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-lg">
                        <div className="md:w-24 md:text-center">
                          <p className="text-[10px] md:hidden font-bold text-gray-400 uppercase tracking-widest mb-1">Sch. Dep</p>
                          <p className="text-lg font-bold font-display text-gray-500 dark:text-gray-400 line-through decoration-rose-500/50">
                            {train.scheduledDeparture || '--:--'}
                          </p>
                        </div>
                        <div className="md:w-24 md:text-center">
                          <p className="text-[10px] md:hidden font-bold text-secondary uppercase tracking-widest mb-1">Exp. Dep</p>
                          <p className="text-lg font-bold font-display text-secondary">
                            {train.expectedDepartureTime ? new Date(train.expectedDepartureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : '--:--'}
                          </p>
                        </div>
                        <div className="md:w-20 md:text-center flex-1 text-right md:text-center">
                          <p className="text-[10px] md:hidden font-bold text-gray-400 uppercase tracking-widest mb-1">Platform</p>
                          <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-bold rounded-lg text-sm">
                            {train.platform || 'TBD'}
                          </span>
                        </div>
                        <div className="md:w-24 text-right">
                          <Link 
                            to={`/train/${train.trainNumber}?view=live`}
                            className="inline-block px-4 py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/20 transition uppercase tracking-wider"
                          >
                            Track
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default StationBoard;
