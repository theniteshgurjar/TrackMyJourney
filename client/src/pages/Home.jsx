import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Train, Calendar, ArrowRight, ArrowDownUp, Compass, Clock, ChevronRight, MapPin } from 'lucide-react';
import AutocompleteInput from '../components/AutocompleteInput';

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'spot' | 'station'
  
  // Search Form State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [stationCode, setStationCode] = useState('');
  const [journeyDate, setJourneyDate] = useState('today');

  const handleSearchTrains = (e) => {
    if (e) e.preventDefault();
    if (source && destination) {
      navigate(`/search?source=${encodeURIComponent(source.trim())}&destination=${encodeURIComponent(destination.trim())}`);
    }
  };

  const handleSpotTrain = (e) => {
    if (e) e.preventDefault();
    if (trainNumber && trainNumber.trim()) {
      navigate(`/train/${encodeURIComponent(trainNumber.trim())}?view=live`);
    }
  };

  const handleStationBoard = (e) => {
    if (e) e.preventDefault();
    if (stationCode && stationCode.trim()) {
      navigate(`/station/${encodeURIComponent(stationCode.trim())}`);
    }
  };

  const handleSwapStations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const quickRoutes = [
    { from: 'NDLS', to: 'BCT', label: 'Delhi ➔ Mumbai', time: '16h 45m', color: 'bg-blue-50 text-blue-800' },
    { from: 'BCT', to: 'NDLS', label: 'Mumbai ➔ Delhi', time: '16h 50m', color: 'bg-indigo-50 text-indigo-800' },
    { from: 'SBC', to: 'MAS', label: 'Bangalore ➔ Chennai', time: '12h 20m', color: 'bg-slate-100 text-slate-800' },
    { from: 'HWH', to: 'NDLS', label: 'Kolkata ➔ Delhi', time: '22h 10m', color: 'bg-emerald-50 text-emerald-800' },
  ];

  const popularTrains = [
    { number: '12951', name: 'Rajdhani Express', type: 'Fastest', color: 'bg-blue-50 text-blue-900' },
    { number: '12004', name: 'Shatabdi Express', type: 'Premium', color: 'bg-slate-100 text-slate-900' },
    { number: '12259', name: 'Duronto Express', type: 'Non Stop', color: 'bg-amber-50 text-amber-900' },
    { number: '22436', name: 'Vande Bharat', type: 'High Speed', color: 'bg-emerald-50 text-emerald-900' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4">
      
      {/* MASTER DASHBOARD CONTAINER - Exactly as in Reference Image */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.75rem] shadow-[0_20px_50px_rgba(15,23,42,0.05)] border border-slate-100 p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        
        {/* HERO SECTION WITH TRAIN RENDER (No duplicate header) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-8">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 font-display block">
              INDIAN RAILWAYS LIVE RADAR
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-slate-900 tracking-tight leading-[1.08]">
              Live Train <br />
              <span className="text-slate-900">Route & GPS Radar</span>
            </h1>

            <p className="text-sm sm:text-base font-bold text-slate-400 flex items-center gap-2 pt-1">
              <span>Real-Time GPS</span>
              <span className="text-slate-300">•</span>
              <span>Delay Alerts</span>
              <span className="text-slate-300">•</span>
              <span>Live Station Boards</span>
            </p>
          </div>

          {/* Right Hero Image (Vande Bharat Train Render from Reference) */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-[660px]">
              <img
                src="/vande_bharat.jpg"
                alt="Vande Bharat Express Train"
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </div>

        </div>

        {/* JOURNEY CONTROL CONSOLE BAR (SEARCH STRIP) */}
        <div className="mb-10">
          <div className="bg-white border border-slate-200/90 rounded-[1.75rem] p-3 sm:p-4 shadow-[0_4px_25px_rgba(15,23,42,0.04)]">
            
            {/* Mode Switch Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 px-1 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab('plan')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'plan' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Find Route Trains</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('spot')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'spot' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Train className="w-3.5 h-3.5" />
                <span>Spot Live Train</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('station')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'station' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Live Station Board</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/pnr')}
                className="px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>PNR Status</span>
              </button>
            </div>

            {/* PLAN ROUTE FORM */}
            {activeTab === 'plan' && (
              <form onSubmit={handleSearchTrains} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* 1. From ➔ To Combined Capsule */}
                <div className="md:col-span-6 bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 relative">
                  
                  {/* From */}
                  <div className="w-full sm:flex-1 flex items-center gap-2 pl-1 sm:pl-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="w-full">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">From Station</span>
                      <AutocompleteInput
                        type="station"
                        value={source}
                        onChange={setSource}
                        placeholder="e.g. New Delhi (NDLS)"
                      />
                    </div>
                  </div>

                  {/* Swap Button */}
                  <button
                    type="button"
                    onClick={handleSwapStations}
                    className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-transform hover:rotate-180 shrink-0 shadow-sm z-10 -my-1 sm:my-0 cursor-pointer active:scale-95"
                    title="Swap Stations"
                  >
                    <ArrowDownUp className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  {/* To */}
                  <div className="w-full sm:flex-1 flex items-center gap-2 pl-1 sm:pl-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="w-full">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">To Station</span>
                      <AutocompleteInput
                        type="station"
                        value={destination}
                        onChange={setDestination}
                        placeholder="e.g. Mumbai (MMCT)"
                      />
                    </div>
                  </div>

                </div>

                {/* 2. Journey Day Capsule */}
                <div className="md:col-span-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <Calendar className="w-4 h-4 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Journey Schedule</span>
                    <select
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      className="w-full font-display font-extrabold text-xs text-slate-900 bg-transparent outline-none cursor-pointer"
                    >
                      <option value="today">Today (Live Tracking)</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="yesterday">Yesterday</option>
                    </select>
                  </div>
                </div>

                {/* 3. Deep Navy Search Button */}
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="btn-navy w-full py-3.5 sm:py-4 px-5 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                  >
                    <Search className="w-4 h-4 stroke-[3]" />
                    <span>Search Direct Trains</span>
                  </button>
                </div>

              </form>
            )}

            {/* SPOT TRAIN FORM */}
            {activeTab === 'spot' && (
              <form onSubmit={handleSpotTrain} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                <div className="md:col-span-9 bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Train className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Enter 5-digit Train Number or Name
                    </span>
                    <AutocompleteInput
                      type="train"
                      value={trainNumber}
                      onChange={setTrainNumber}
                      placeholder="e.g. 12951 (Mumbai Rajdhani) or 22436 (Vande Bharat)"
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="btn-navy w-full py-4 px-5 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Train className="w-4 h-4 stroke-[2.5]" />
                    <span>Spot Live Train</span>
                  </button>
                </div>

              </form>
            )}

            {/* LIVE STATION FORM */}
            {activeTab === 'station' && (
              <form onSubmit={handleStationBoard} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                <div className="md:col-span-9 bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Station Name or Code
                    </span>
                    <AutocompleteInput
                      type="station"
                      value={stationCode}
                      onChange={setStationCode}
                      placeholder="e.g. New Delhi, Howrah, or NDLS"
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="btn-navy w-full py-4 px-5 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4 stroke-[3]" />
                    <span>View Board</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>

        {/* BOTTOM CONTENT GRID - Exactly matching the Reference Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SCENIC BANNER CARD (Identical to "Explore India" in Reference) */}
          <div className="lg:col-span-4 relative rounded-3xl overflow-hidden min-h-[310px] flex flex-col justify-between p-7 text-white shadow-md group">
            
            <img
              src="/scenic_banner.jpg"
              alt="Explore India by Train"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-slate-900/20"></div>

            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                EXPLORE INDIA
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white mt-3 leading-tight">
                More Routes. <br />
                More Destinations.
              </h3>
            </div>

            <div className="relative z-10 pt-4 flex items-end justify-between">
              <p className="text-xs font-semibold text-slate-200 max-w-[210px] leading-relaxed">
                Discover the beauty of India by train.
              </p>
              
              <button
                type="button"
                onClick={() => navigate('/search?source=NDLS&destination=BCT')}
                className="w-10 h-10 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-lg hover:bg-slate-900 hover:text-white transition-all shrink-0 cursor-pointer"
                title="Explore More Routes"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </div>

          {/* RIGHT SECTIONS: QUICK SELECT & POPULAR TRAINS */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            
            {/* 1. Quick Select Section (2x2 Grid from Reference) */}
            <div>
              <div className="mb-2.5 px-1">
                <h4 className="font-display font-black text-slate-900 text-sm">
                  Quick Select
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickRoutes.map((route, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSource(route.from);
                      setDestination(route.to);
                      navigate(`/search?source=${route.from}&destination=${route.to}`);
                    }}
                    className="bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-3 flex items-center justify-between transition-all hover:shadow-sm cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${route.color} flex items-center justify-center shrink-0`}>
                        <Train className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <span className="font-display font-black text-xs sm:text-sm text-slate-900 group-hover:text-blue-900 transition-colors block">
                          {route.label}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {route.time}
                        </span>
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Popular Trains Section (2x2 Grid from Reference) */}
            <div>
              <div className="mb-2.5 px-1">
                <h4 className="font-display font-black text-slate-900 text-sm">
                  Popular Trains
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularTrains.map((train, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/train/${train.number}?view=live`)}
                    className="bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-3 flex items-center justify-between transition-all hover:shadow-sm cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200/70 text-slate-800 flex items-center justify-center shrink-0">
                        <Train className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <span className="font-display font-black text-xs sm:text-sm text-slate-900 group-hover:text-blue-900 transition-colors block">
                          {train.name}
                        </span>
                        <span className="text-[11px] font-extrabold text-slate-400">
                          {train.type} • #{train.number}
                        </span>
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Home;
