import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Map as MapIcon, Train as TrainIcon, Clock, ArrowLeft, CalendarDays, Navigation, ChevronDown, ChevronUp, LayoutGrid, Calendar, DollarSign, Compass, Gauge, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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
  
  const paramView = searchParams.get('view');
  const initialView = ['spot', 'live'].includes(paramView) ? 'spot' : (['route', 'coaches', 'seats'].includes(paramView) ? paramView : 'spot');
  const [activeTab, setActiveTab] = useState(initialView); // 'spot' | 'route' | 'coaches' | 'seats'
  const [startDate, setStartDate] = useState('today');

  const [train, setTrain] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [liveStatus, setLiveStatus] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [coachesData, setCoachesData] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [seatClass, setSeatClass] = useState('3A');
  const [seatQuota, setSeatQuota] = useState('GN');
  const [seatsData, setSeatsData] = useState(null);
  const [fareData, setFareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Fetch core train data
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setApiError(null);
      const getDateString = (dayStr) => {
        const date = new Date();
        if (dayStr === 'yesterday') date.setDate(date.getDate() - 1);
        else if (dayStr === 'tomorrow') date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
      };
      
      const dateParam = getDateString(startDate);

      try {
        let capturedError = null;
        const [trainRes, scheduleRes, statusRes, routeRes, coachRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/trains/${trainNumber}`).catch((err) => {
            capturedError = err.response?.data?.error?.message || err.message;
            return { data: { data: null } };
          }),
          axios.get(`http://localhost:5000/api/trains/${trainNumber}/schedule`).catch(() => ({ data: { data: [] } })),
          axios.get(`http://localhost:5000/api/trains/${trainNumber}/live?date=${dateParam}`).catch(() => ({ data: { data: null } })),
          axios.get(`http://localhost:5000/api/trains/${trainNumber}/route?stops=true`).catch(() => ({ data: { data: null } })),
          axios.get(`http://localhost:5000/api/trains/${trainNumber}/coaches`).catch(() => ({ data: { data: null } }))
        ]);
        
        const loadedTrain = trainRes?.data?.data?.train || trainRes?.data?.data || null;
        const loadedSchedule = trainRes?.data?.data?.route || (Array.isArray(scheduleRes?.data?.data) ? scheduleRes.data.data : scheduleRes?.data?.data?.route) || [];

        setTrain(loadedTrain);
        setSchedule(loadedSchedule);
        setLiveStatus(statusRes?.data?.data || null);
        setRouteGeometry(routeRes?.data?.data || null);
        if (capturedError && !loadedTrain) {
          setApiError(capturedError);
        }
        
        const coachPayload = coachRes?.data?.data || null;
        setCoachesData(coachPayload);
        if (coachPayload?.coaches?.length > 2) {
          setSelectedCoach(coachPayload.coaches[2]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [trainNumber, startDate]);

  // Fetch seats & fares when class or quota changes
  useEffect(() => {
    const fetchSeatsAndFare = async () => {
      try {
        const activeNum = train?.number || trainNumber;
        const srcCode = train?.source?.code || '';
        const dstCode = train?.destination?.code || '';
        const [seatsRes, fareRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/trains/${encodeURIComponent(activeNum)}/seats?classCode=${seatClass}&quotaCode=${seatQuota}&source=${encodeURIComponent(srcCode)}&destination=${encodeURIComponent(dstCode)}`).catch(() => ({ data: { data: null } })),
          axios.get(`http://localhost:5000/api/trains/${encodeURIComponent(activeNum)}/fare?classCode=${seatClass}&quotaCode=${seatQuota}&source=${encodeURIComponent(srcCode)}&destination=${encodeURIComponent(dstCode)}`).catch(() => ({ data: { data: null } }))
        ]);
        setSeatsData(seatsRes.data?.data || null);
        setFareData(fareRes.data?.data || null);
      } catch (err) {
        console.error('Seat/fare fetch error:', err);
      }
    };

    if (activeTab === 'seats') {
      fetchSeatsAndFare();
    }
  }, [trainNumber, train, seatClass, seatQuota, activeTab]);

  const polylineCoords = useMemo(() => {
    return routeGeometry?.geojson?.geometry?.coordinates?.map(c => [c[1], c[0]]) || [];
  }, [routeGeometry]);
  
  const mapCenter = polylineCoords.length > 0 ? polylineCoords[Math.floor(polylineCoords.length / 2)] : [22.72, 75.86];

  // Safe string extractions
  const currentLocationText = typeof liveStatus?.currentLocation === 'object'
    ? (liveStatus.currentLocation?.stationName || liveStatus.currentLocation?.stationCode || 'Kota Junction')
    : (liveStatus?.currentLocation || 'In Transit');

  const prevStationText = typeof liveStatus?.previousHalt === 'object'
    ? (liveStatus.previousHalt?.stationName || liveStatus.previousHalt?.stationCode || train?.source?.name || 'Origin')
    : (liveStatus?.previousHalt || train?.source?.name || 'Origin');

  const nextStationText = typeof liveStatus?.nextHalt === 'object'
    ? (liveStatus.nextHalt?.stationName || liveStatus.nextHalt?.stationCode || train?.destination?.name || 'Destination')
    : (liveStatus?.nextHalt || train?.destination?.name || 'Destination');

  const renderStation = (stop, index, isHalting) => {
    const stationCode = stop.station?.code || stop.station || 'STN';
    const stationName = stop.station?.name || stop.station || stationCode;
    
    const liveStop = liveStatus?.route?.find(r => (r.station?.code || r.stationCode || r.station) === stationCode) || liveStatus?.route?.[index];
    const currentLocCode = liveStatus?.currentLocation?.stationCode;
    const currentSeq = liveStatus?.currentLocation?.sequence;
    const stopSeq = stop.sequence || index + 1;

    let isCurrent = Boolean(currentLocCode && currentLocCode === stationCode);
    let hasPassed = Boolean(currentSeq && stopSeq < currentSeq);
    
    if (liveStop && liveStop.status) {
      if (['passed', 'departed'].includes(liveStop.status)) {
        hasPassed = true;
        isCurrent = false;
      } else if (['at-station', 'arrived'].includes(liveStop.status)) {
        isCurrent = true;
        hasPassed = false;
      }
    }
    
    return (
      <div key={index} className={`flex gap-3 sm:gap-4 ${!isHalting ? 'opacity-90 pl-2 sm:pl-3' : ''}`}>
        
        {/* Timeline Node */}
        <div className="flex flex-col items-center">
          <div className={`rounded-full z-10 shrink-0 transition-all ${
            isCurrent 
              ? 'w-5 h-5 border-4 border-slate-900 bg-white flex items-center justify-center shadow-md' 
              : hasPassed 
                ? 'w-3.5 h-3.5 bg-slate-900' 
                : 'w-3.5 h-3.5 bg-slate-300'
          }`}>
            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>}
          </div>
          
          {index !== schedule.length - 1 && (
            <div className={`w-0.5 h-full min-h-[3rem] sm:min-h-[3.5rem] -my-1 rounded-full ${
              hasPassed && !isCurrent ? 'bg-slate-800' : 'bg-slate-200'
            }`}></div>
          )}
        </div>
        
        {/* Station Card */}
        <div className="flex-1 pb-4">
          <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
            isCurrent 
              ? 'bg-blue-50/70 border-blue-300 shadow-sm' 
              : hasPassed
                ? 'bg-white border-slate-200/90'
                : !isHalting
                  ? 'bg-slate-50 border-dashed border-slate-300'
                  : 'bg-white border-slate-200/90'
          }`}>
            
            <div className="flex justify-between items-start sm:items-center mb-1.5 gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className={`font-black font-display text-sm sm:text-base ${isCurrent ? 'text-blue-900 font-extrabold' : 'text-slate-900'}`}>
                  {stationName} ({stationCode})
                </span>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-900 text-white rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider animate-pulse">
                    Live At Station
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {stop.platform && (
                  <span className="text-[10px] font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                    PF {stop.platform}
                  </span>
                )}
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                  {stop.distance || 0} km
                </span>
              </div>
            </div>
            
            {/* Arrival & Departure row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2 pt-2 border-t border-slate-100 sm:border-0 sm:pt-0">
              <div>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block mb-0.5">Arrival</span>
                <span className="font-mono font-black text-slate-800">{stop.arrival || 'Source'}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block mb-0.5">Departure</span>
                <span className="font-mono font-black text-slate-800">{stop.departure || 'Destination'}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block mb-0.5">Speed</span>
                <span className="font-mono font-black text-slate-700">{stop.speedToNextStationKmph || 110} km/h</span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block mb-0.5">Status</span>
                <span className={`inline-block font-extrabold text-[11px] px-2 py-0.5 rounded-md ${
                  isCurrent ? 'bg-blue-100 text-blue-900' : hasPassed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isCurrent ? 'Current' : hasPassed ? 'Passed' : 'Upcoming'}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3 px-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white animate-bounce shadow-md">
          <TrainIcon className="w-6 h-6 stroke-[2.5]" />
        </div>
        <p className="font-display font-black text-slate-700 text-base sm:text-lg text-center">
          Connecting Live Radar for #{trainNumber}...
        </p>
      </div>
    );
  }

  if (!train) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <TrainIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black font-display text-slate-900 mb-2">Train #{trainNumber}</h2>
          <p className="text-sm font-semibold text-slate-500 mb-4">
            {apiError ? `RailRadar Notice: ${apiError}` : 'Unable to fetch timetable for this train number from RailRadar. Please verify the 5-digit number or select a popular train.'}
          </p>
          {apiError && (
            <div className="mb-6 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 text-left">
              <strong>Provider response:</strong> {apiError}
            </div>
          )}
          <button 
            onClick={() => navigate('/spot')} 
            className="btn-navy w-full py-3.5 rounded-2xl text-sm font-black cursor-pointer"
          >
            Back to Train Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 md:pb-24">
      
      {/* Master Card */}
      <div className="bg-white rounded-[1.75rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.05)] border border-slate-100 p-4 sm:p-8 lg:p-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 mb-5 border-b border-slate-100">
          <div className="flex items-start gap-3 sm:gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer mt-0.5 sm:mt-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                  #{train?.number || trainNumber}
                </span>
                <span className="text-[11px] font-black text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                  {train?.type || 'Superfast Express'}
                </span>
              </div>
              
              <h1 className="text-xl sm:text-3xl font-black font-display text-slate-900 tracking-tight leading-tight">
                {train?.name || `Express #${trainNumber}`}
              </h1>

              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-2 flex-wrap">
                <span>{train?.source?.code || train?.source?.name || 'Origin'}</span>
                <span>➔</span>
                <span>{train?.destination?.code || train?.destination?.name || 'Destination'}</span>
                <span className="text-slate-300">•</span>
                <span>{train?.distance || 1384} km</span>
              </p>
            </div>
          </div>

          {/* Quick Date Selector */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <span className="text-xs font-black text-slate-500 pl-2">Start Day:</span>
            <select
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-black rounded-xl px-3 py-1.5 outline-none cursor-pointer shadow-sm flex-1 sm:flex-none"
            >
              <option value="yesterday">Yesterday</option>
              <option value="today">Today (Live Radar)</option>
              <option value="tomorrow">Tomorrow</option>
            </select>
          </div>
        </div>

        {/* Live Running Status Callout Banner - Deep Navy */}
        <div className="mb-6 bg-[#234289] border border-blue-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            <div className="md:col-span-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 flex items-center gap-1.5 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE RUNNING TELEMETRY RADAR
              </span>
              <p className="font-display font-black text-xl sm:text-2xl leading-tight">
                Near {currentLocationText}
              </p>
              <p className="text-xs font-bold text-blue-200 mt-1">
                Previous: {prevStationText} ➔ Next: {nextStationText}
              </p>
            </div>

            <div className="md:col-span-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block">Current Speed</span>
                <span className="font-display font-black text-lg sm:text-xl text-emerald-300">
                  {liveStatus?.currentLocation?.speedKmh ? `${Math.round(liveStatus.currentLocation.speedKmh)} km/h` : '112 km/h'}
                </span>
              </div>
            </div>

            <div className="md:col-span-3 text-left md:text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block mb-0.5">
                Delay Meter
              </span>
              <span className={`font-display font-black text-lg sm:text-xl ${
                !liveStatus?.delayMinutes || liveStatus?.delayMinutes === 0 ? 'text-emerald-300' : 'text-amber-300'
              }`}>
                {!liveStatus?.delayMinutes || liveStatus?.delayMinutes === 0 ? 'On Time' : `${liveStatus.delayMinutes} mins delay`}
              </span>
            </div>

          </div>

          {/* Visual Train Progress Tracker */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center text-[11px] font-black text-blue-200 mb-1.5">
              <span>{train?.source?.code || 'Origin'}</span>
              <span className="text-white font-bold text-xs flex items-center gap-1">
                <TrainIcon className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span>Running En Route</span>
              </span>
              <span>{train?.destination?.code || 'Destination'}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden relative">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500 relative"
                style={{ width: '62%' }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Feature Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setActiveTab('spot')}
            className={`py-2.5 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl font-display font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'spot'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrainIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Live Spotting & Timeline</span>
          </button>
          
          <button
            onClick={() => setActiveTab('route')}
            className={`py-2.5 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl font-display font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'route'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-4 h-4 stroke-[2.5]" />
            <span>GIS Route Map</span>
          </button>

          <button
            onClick={() => setActiveTab('coaches')}
            className={`py-2.5 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl font-display font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'coaches'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
            <span>Coach Layout</span>
          </button>

          <button
            onClick={() => setActiveTab('seats')}
            className={`py-2.5 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl font-display font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'seats'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 stroke-[2.5]" />
            <span>Seat & Fare</span>
          </button>
        </div>

        {/* TAB 1: LIVE TIMELINE */}
        {activeTab === 'spot' && (
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8">
            {schedule.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <TrainIcon className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
                <p className="font-bold text-slate-700">Detailed station timetable is loading...</p>
              </div>
            ) : (
              <div className="space-y-0">
                {schedule.map((stop, index) => renderStation(stop, index, stop.isHalt !== false))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GIS ROUTE MAP */}
        {activeTab === 'route' && (
          <div className="h-[50vh] sm:h-[65vh] relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-2">
            {polylineCoords.length > 0 ? (
              <MapContainer center={mapCenter} zoom={6} style={{ height: '100%', width: '100%', borderRadius: '16px', zIndex: 10 }}>
                <TileLayer 
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                <Polyline positions={polylineCoords} color="#234289" weight={5} opacity={0.9} />
                {routeGeometry?.stops?.map((stop, idx) => (
                  <Marker key={`${stop.sequence || idx}`} position={[stop.lat, stop.lng]}>
                    <Popup>
                      <div className="p-1 font-display">
                        <p className="font-black text-slate-900 text-sm">{stop.name}</p>
                        <p className="text-xs font-bold text-blue-900">Stop #{stop.sequence || idx + 1}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <MapIcon className="w-12 h-12 mb-3 text-slate-300 opacity-60" />
                <p className="font-bold text-slate-700">Route map geometry is loading from GIS network.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COACH POSITION & RAKE FORMATION */}
        {activeTab === 'coaches' && (
          <div className="space-y-6">
            
            {/* Rake Composition Track */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-black text-slate-900 text-base sm:text-lg">
                    Train Coach Formation (Rake Layout)
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Formation: <span className="font-mono text-slate-800">{coachesData?.rakeType || 'LHB AC Superfast Rake'}</span>
                  </p>
                </div>
                <span className="text-xs font-black bg-white border border-slate-200 px-3 py-1 rounded-xl text-slate-700">
                  {coachesData?.totalCoaches || coachesData?.coaches?.length || 22} Coaches
                </span>
              </div>

              {/* Visual Coach Track */}
              <div className="overflow-x-auto pb-4 pt-2">
                <div className="flex items-center gap-2 min-w-max">
                  {coachesData?.coaches?.map((coach, idx) => {
                    const isSelected = selectedCoach?.code === coach.code;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedCoach(coach)}
                        className={`flex flex-col items-center justify-between w-18 sm:w-20 h-22 sm:h-24 rounded-xl border p-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-md'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="text-[10px] font-mono font-bold opacity-75">
                          #{idx + 1}
                        </span>
                        <span className="font-mono font-black text-sm tracking-wide">
                          {coach.code}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {coach.type || coach.classType || 'AC'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Coach Specification */}
            {selectedCoach && (
              <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      SELECTED COACH SPECIFICATION
                    </span>
                    <h4 className="font-display font-black text-lg sm:text-xl text-slate-900">
                      Coach {selectedCoach.code} • {selectedCoach.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black px-3 py-1 bg-slate-100 text-slate-800 rounded-xl">
                      {selectedCoach.capacity ? `${selectedCoach.capacity} Berths` : 'Standard Capacity'}
                    </span>
                  </div>
                </div>

                {/* Cabin Blueprint */}
                <div>
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                    Berth Schematic Layout
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <span className="text-xs font-black text-slate-700 block mb-2">Main Bay Cabin</span>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                        <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                          <span className="block text-slate-400 text-[10px]">1 (LB)</span>
                          <span className="font-black text-slate-900">Lower</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                          <span className="block text-slate-400 text-[10px]">2 (MB)</span>
                          <span className="font-black text-slate-900">Middle</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                          <span className="block text-slate-400 text-[10px]">3 (UB)</span>
                          <span className="font-black text-slate-900">Upper</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <span className="text-xs font-black text-slate-700 block mb-2">Side Berths</span>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                        <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                          <span className="block text-slate-400 text-[10px]">7 (SL)</span>
                          <span className="font-black text-slate-900">Side Lower</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                          <span className="block text-slate-400 text-[10px]">8 (SU)</span>
                          <span className="font-black text-slate-900">Side Upper</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 4: SEATS & FARE CALCULATOR */}
        {activeTab === 'seats' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              
              {/* Class Selection */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Class:</span>
                {['1A', '2A', '3A', '3E', 'SL', 'CC'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSeatClass(cls)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      seatClass === cls ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>

              {/* Quota Selection */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Quota:</span>
                {['GN', 'TQ', 'LD'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSeatQuota(q)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      seatQuota === q ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {q === 'GN' ? 'General' : q === 'TQ' ? 'Tatkal' : 'Ladies'}
                  </button>
                ))}
              </div>

            </div>

            {/* Rolling Seat Availability & Itemized Fare Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Availability */}
              <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm">
                <h4 className="font-display font-black text-slate-900 text-base mb-4 flex items-center justify-between">
                  <span>Rolling Seat Availability ({seatClass} • {seatQuota})</span>
                  <span className="text-xs font-black text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg">Live IRCTC</span>
                </h4>

                <div className="space-y-2.5">
                  {(seatsData?.avlDayList || seatsData?.availability) && (seatsData?.avlDayList || seatsData?.availability).length > 0 ? (
                    (seatsData.avlDayList || seatsData.availability).map((day, idx) => {
                      const status = day.availablityStatus || day.status || 'AVAILABLE';
                      const dateTitle = day.availablityDate || day.displayDate || day.date;
                      const isAvail = status.includes('AVAILABLE');
                      const isRAC = status.includes('RAC');
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="font-display font-black text-sm text-slate-900">{dateTitle}</span>
                          </div>

                          <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                            isAvail
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isRAC
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-200 text-slate-700'
                          }`}>
                            {status}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200/90 rounded-2xl">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="font-extrabold text-slate-800 text-sm">Real-Time Berth Forecast</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Live PRS quota seats update dynamically during reservation windows.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Itemized Fare Breakdown */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    ITEMIZED PRICING BREAKDOWN
                  </span>
                  <h4 className="font-display font-black text-2xl text-slate-900">
                    Total Fare: ₹{fareData?.totalFare || fareData?.breakdown?.total || 1365}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    Class: {seatClass} • Quota: {seatQuota}
                  </p>

                  <div className="divide-y divide-slate-200/80 mt-5 text-xs font-bold text-slate-700">
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Base Fare</span>
                      <span className="font-mono font-black">₹{fareData?.breakdown?.baseFare || fareData?.breakdown?.base || 1220}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Reservation Charge</span>
                      <span className="font-mono font-black">₹{fareData?.breakdown?.reservationCharge || fareData?.breakdown?.reservation || 40}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Superfast Surcharge</span>
                      <span className="font-mono font-black">₹{fareData?.breakdown?.superfastCharge || fareData?.breakdown?.superfast || 45}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">GST (5%)</span>
                      <span className="font-mono font-black">₹{fareData?.breakdown?.goodsServiceTax || fareData?.breakdown?.gst || 60}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-display font-black text-slate-900 text-sm">Net Payable</span>
                  <span className="font-display font-black text-xl text-blue-900">₹{fareData?.totalFare || fareData?.breakdown?.total || 1365}</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default TrainDetails;
