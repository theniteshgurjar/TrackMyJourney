import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Heart, Map as MapIcon, Train as TrainIcon, Clock, ArrowLeft, CloudRain, Sun, Cloud, Info, CalendarDays, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TrainDetails = () => {
  const { trainNumber } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialView = searchParams.get('view') === 'route' ? 'route' : 'spot';
  const [activeTab, setActiveTab] = useState(initialView);
  const [startDate, setStartDate] = useState('today');
  const [expandedGaps, setExpandedGaps] = useState({});

  const toggleGap = (id) => {
    setExpandedGaps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [train, setTrain] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [liveStatus, setLiveStatus] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const getDateString = (dayStr) => {
        const date = new Date();
        if (dayStr === 'yesterday') {
          date.setDate(date.getDate() - 1);
        } else if (dayStr === 'tomorrow') {
          date.setDate(date.getDate() + 1);
        }
        return date.toISOString().split('T')[0];
      };
      
      const dateParam = getDateString(startDate);

      try {
        const [trainRes, scheduleRes, statusRes, routeRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/trains/${trainNumber}`),
          axios.get(`http://localhost:5000/api/trains/schedule/${trainNumber}`),
          axios.get(`http://localhost:5000/api/trains/live/${trainNumber}?date=${dateParam}`).catch(() => ({ data: { data: null } })),
          axios.get(`http://localhost:5000/api/trains/route/${trainNumber}`).catch(() => ({ data: { data: null } }))
        ]);
        
        setTrain(trainRes.data.data);
        setSchedule(scheduleRes.data.data);
        setLiveStatus(statusRes.data.data);
        setRouteGeometry(routeRes.data.data);
      } catch (err) {
        toast.error('Failed to fetch train details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [trainNumber, startDate]);

  const polylineCoords = useMemo(() => {
    return routeGeometry?.geojson?.geometry?.coordinates?.map(c => [c[1], c[0]]) || [];
  }, [routeGeometry]);
  
  const mapCenter = polylineCoords.length > 0 ? polylineCoords[Math.floor(polylineCoords.length / 2)] : [22.72, 75.86];

  // Helper to determine if a station is the current location
  const getCurrentStationIndex = () => {
    if (liveStatus && liveStatus.route && liveStatus.route.length > 0) {
      let lastActiveIndex = -1;
      for (let i = 0; i < liveStatus.route.length; i++) {
        const status = liveStatus.route[i].status;
        if (['passed', 'departed', 'arrived', 'at-station'].includes(status)) {
          lastActiveIndex = i;
        }
      }
      if (lastActiveIndex !== -1) return lastActiveIndex;
    }

    if (!liveStatus || !liveStatus.currentStation) return -1;
    // We try to match by name, but APIs vary. We will just do a simple substring match for demo
    return schedule.findIndex(s => 
      liveStatus.currentStation.toLowerCase().includes(s.station.toLowerCase()) || 
      s.station.toLowerCase().includes(liveStatus.currentStation.toLowerCase())
    );
  };

  const currentIndex = getCurrentStationIndex();

  const renderStation = (stop, index, isHalting) => {
    const liveStop = liveStatus?.route?.[index];
    const stationName = liveStop?.stationName || stop.station;
    
    let isCurrent = currentIndex === index;
    let hasPassed = currentIndex !== -1 && index <= currentIndex;
    let statusText = 'Upcoming';
    
    if (liveStop && liveStop.status) {
      if (['passed', 'departed', 'arrived', 'at-station'].includes(liveStop.status)) {
        hasPassed = true;
      } else {
        hasPassed = false;
      }
    }
    
    if (isCurrent) statusText = 'Current';
    else if (hasPassed) statusText = 'Passed';
    
    const formatTime = (isoString) => {
      if (!isoString) return null;
      const date = new Date(isoString);
      if (isNaN(date)) return isoString;
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
    };
    
    const actualArrival = formatTime(liveStop?.actualArrival);
    const actualDeparture = formatTime(liveStop?.actualDeparture);
    const scheduledArrival = formatTime(stop.arrival) || 'Start';
    const scheduledDeparture = formatTime(stop.departure) || 'End';
    
    return (
      <div key={index} className={`flex gap-4 ${!isHalting ? 'opacity-80 scale-95 origin-left transition-transform mt-2' : ''}`}>
        {/* Timeline Node */}
        <div className="flex flex-col items-center">
          <div className={`rounded-full border-4 z-10 flex-shrink-0 ${!isHalting ? 'w-3 h-3 border-2' : 'w-4 h-4'} ${
            isCurrent 
              ? 'border-primary bg-white dark:bg-slate-900 shadow-[0_0_10px_rgba(139,92,246,0.5)]' 
              : hasPassed 
                ? 'border-primary bg-primary' 
                : 'border-gray-300 dark:border-gray-600 bg-gray-300 dark:bg-gray-600'
          }`}></div>
          {index !== schedule.length - 1 && (
            <div className={`w-0.5 h-full min-h-[3rem] -my-1 ${
              hasPassed && !isCurrent ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'
            }`}></div>
          )}
        </div>
        
        {/* Station Data */}
        <div className={`flex-1 pb-4 ${hasPassed && !isCurrent ? 'opacity-70' : ''}`}>
          <div className={`p-3 rounded-xl shadow-sm border transition-all duration-300 ${
            isCurrent 
              ? 'bg-primary/10 border-primary shadow-[0_4px_20px_rgba(139,92,246,0.15)] dark:bg-primary/20 dark:border-primary/50' 
              : hasPassed
                ? 'bg-gray-100 border-gray-200 dark:bg-gray-800/80 dark:border-gray-700'
                : !isHalting
                  ? 'bg-amber-50/50 border-amber-200/60 border-dashed dark:bg-amber-900/10 dark:border-amber-700/30'
                  : 'bg-white border-blue-100 dark:bg-slate-800 dark:border-slate-700'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`font-bold ${isHalting ? 'text-base sm:text-lg' : 'text-sm'} ${isCurrent ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                {stationName}
              </span>
              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {stop.distance} km
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-[11px] sm:text-xs">
              <div>
                <span className="text-gray-500 block mb-0.5">Arrival</span>
                <div className="flex flex-col">
                  {actualArrival && actualArrival !== scheduledArrival ? (
                    <>
                      <span className="text-rose-500 line-through">{scheduledArrival}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{actualArrival}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{scheduledArrival}</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Departure</span>
                <div className="flex flex-col">
                  {actualDeparture && actualDeparture !== scheduledDeparture ? (
                    <>
                      <span className="text-rose-500 line-through">{scheduledDeparture}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{actualDeparture}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{scheduledDeparture}</span>
                  )}
                </div>
              </div>
              {stop.halt !== '-' && (
                <div className="ml-auto text-right">
                  <span className="text-gray-500 block mb-0.5">Status</span>
                  <span className={`font-semibold ${isCurrent ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>
                    {statusText}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!train) {
    return (
      <div className="text-center py-20 text-gray-500">
        <h2 className="text-xl font-bold">Train not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-32 pt-4">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header Card */}
        <div className="brand-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-primary">{train.trainNumber}</span>
                  {train.trainName}
                </h1>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{train.source} → {train.destination}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600 dark:text-gray-300">
                  {train.runningDays && (
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <span>Runs on: {train.runningDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</span>
                    </div>
                  )}
                  {train.duration && train.duration !== 'N/A' && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{train.duration}</span>
                    </div>
                  )}
                  {train.distance && train.distance !== 'N/A' && (
                    <div className="flex items-center gap-1">
                      <Navigation className="w-4 h-4 text-primary" />
                      <span>{train.distance}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
          
          {/* Live Status Summary Bar */}
          {liveStatus && (
            <div className="mt-6 bg-gradient-to-r from-primary to-secondary p-4 rounded-xl text-white flex justify-between items-center shadow-lg shadow-primary/20">
              <div>
                <span className="opacity-80 block text-xs font-bold uppercase tracking-wider mb-1">Current Status</span>
                <span className="font-bold text-lg">{liveStatus.currentLocation}</span>
              </div>
              <div className="text-right">
                <span className="opacity-80 block text-xs font-bold uppercase tracking-wider mb-1">Delay</span>
                <span className={`font-bold text-lg ${liveStatus.delay === 'On time' ? 'text-green-300' : 'text-red-200'}`}>
                  {liveStatus.delay}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Controls (Since we removed the page-specific bottom nav to not conflict with global BottomNav) */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('spot')}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'spot' ? 'bg-primary text-white shadow-md shadow-primary/30' : 'brand-card text-gray-600 dark:text-gray-400 hover:text-primary'
            }`}
          >
            <TrainIcon className="w-5 h-5" /> Live Spotting
          </button>
          <button
            onClick={() => setActiveTab('route')}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'route' ? 'bg-primary text-white shadow-md shadow-primary/30' : 'brand-card text-gray-600 dark:text-gray-400 hover:text-primary'
            }`}
          >
            <MapIcon className="w-5 h-5" /> Route Map
          </button>
        </div>

        {activeTab === 'spot' && (
          <div className="brand-card p-4 sm:p-6 mb-6">
            
            {/* Start Date Selector */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="font-bold font-display text-gray-900 dark:text-white flex items-center">
                <CalendarDays className="w-5 h-5 mr-2 text-primary" /> Start Date
              </h2>
              <select 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none cursor-pointer shadow-sm"
              >
                <option value="yesterday">Yesterday</option>
                <option value="today">Today (Current)</option>
                <option value="tomorrow">Tomorrow</option>
              </select>
            </div>

            <div className="space-y-0 py-4 px-2">
              {(() => {
                const renderItems = [];
                let currentGap = [];

                schedule.forEach((stop, index) => {
                  const isHalting = index === 0 || index === schedule.length - 1 || stop.arrival !== stop.departure;
                  
                  if (isHalting) {
                    if (currentGap.length > 0) {
                      renderItems.push({ type: 'gap', stations: currentGap, id: `gap-${index}` });
                      currentGap = [];
                    }
                    renderItems.push({ type: 'stop', stop, index, isHalting: true });
                  } else {
                    currentGap.push({ stop, index, isHalting: false });
                  }
                });

                return renderItems.map((item) => {
                  if (item.type === 'gap') {
                    const isExpanded = expandedGaps[item.id];
                    return (
                      <React.Fragment key={item.id}>
                        <div className="flex gap-4 items-center mb-2 -mt-4">
                           <div className="w-4 flex justify-center ml-0.5">
                             <div className="w-0.5 h-8 border-l-2 border-dashed border-gray-300 dark:border-slate-600"></div>
                           </div>
                           <div className="flex-1 pb-2 pt-2">
                             <button 
                                onClick={() => toggleGap(item.id)}
                                className="text-xs font-bold text-primary hover:text-primary/80 flex items-center bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors border border-primary/20"
                             >
                                {isExpanded ? 'Hide' : 'Show'} {item.stations.length} pass-through stations
                             </button>
                           </div>
                        </div>
                        {isExpanded && item.stations.map(stationItem => renderStation(stationItem.stop, stationItem.index, stationItem.isHalting))}
                      </React.Fragment>
                    );
                  } else {
                    return renderStation(item.stop, item.index, item.isHalting);
                  }
                });
              })()}
            </div>
          </div>
        )}

        {activeTab === 'route' && (
          <div className="brand-card h-[60vh] relative overflow-hidden rounded-xl border-4 border-white/50 dark:border-slate-800/50">
            {routeGeometry && polylineCoords.length > 0 ? (
              <MapContainer center={mapCenter} zoom={6} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <Polyline positions={polylineCoords} color="#8B5CF6" weight={5} opacity={0.9} />
                {routeGeometry.stops.map(stop => (
                  <Marker key={stop.sequence} position={[stop.lat, stop.lng]}>
                    <Popup className="font-sans">
                      <div className="font-bold">{stop.name}</div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-slate-800/50">
                <MapIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Route map unavailable.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainDetails;
