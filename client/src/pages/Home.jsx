import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowDownUp, Train, Map } from 'lucide-react';
import AutocompleteInput from '../components/AutocompleteInput';

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plan'); // 'plan', 'spot', 'station'
  
  // Find Trains Form
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  
  // Spot Train Form
  const [trainNumber, setTrainNumber] = useState('');
  
  // Live Station Form
  const [stationCode, setStationCode] = useState('');

  const handleSearchTrains = (e) => {
    e.preventDefault();
    if(source && destination) {
      navigate(`/search?source=${source}&destination=${destination}`);
    }
  };

  const handleSpotTrain = (e) => {
    e.preventDefault();
    if(trainNumber) {
      navigate(`/train/${trainNumber}?view=live`);
    }
  };

  const handleLiveStation = (e) => {
    e.preventDefault();
    if (stationCode) {
      navigate(`/station/${stationCode.toUpperCase()}`);
    }
  };

  const handleSwapStations = () => {
    setSource(destination);
    setDestination(source);
  };

  const tabs = [
    { id: 'plan', label: 'Plan Journey', icon: MapPin },
    { id: 'spot', label: 'Spot Train', icon: Train },
    { id: 'station', label: 'Live Station', icon: Search }
  ];

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-8 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-indigo-950 to-slate-900 text-white overflow-hidden rounded-b-[2rem] shadow-2xl shrink-0">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>
        <div className="relative max-w-2xl mx-auto text-center z-10">
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold mb-2 tracking-tight drop-shadow-md">Your Journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Simplified.</span></h1>
          <p className="text-base sm:text-lg text-indigo-100/90 max-w-xl mx-auto font-medium">Track live trains, plan your route, and check station boards.</p>
        </div>
      </div>

      {/* Main Content - Overlapping Hero */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 -mt-12 relative z-20 pb-4 flex flex-col">
        <div className="brand-card flex-1 flex flex-col overflow-hidden backdrop-blur-2xl bg-slate-900/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-700/50 rounded-3xl">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-800 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 flex flex-col items-center justify-center space-y-1.5 transition-all relative ${
                  activeTab === tab.id 
                    ? 'text-amber-400 bg-slate-800/40' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-bounce-subtle text-amber-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 rounded-t-full shadow-[0_-2px_10px_rgba(251,191,36,0.5)]"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center">
            {activeTab === 'plan' && (
              <div className="animate-fade-in">
                <form onSubmit={handleSearchTrains}>
                  <div className="relative flex flex-col space-y-3">
                    <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-4 flex items-center justify-center z-10 pointer-events-none">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                      </div>
                      <AutocompleteInput
                        type="station"
                        value={source}
                        onChange={setSource}
                        placeholder="Enter Station Code (e.g. NDLS)"
                        hasLeftElement={true}
                      />
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={handleSwapStations}
                      className="absolute right-4 top-[42px] -translate-y-1/2 bg-slate-800 border border-slate-600 rounded-full p-2 shadow-lg hover:bg-slate-700 z-10 transition-transform hover:rotate-180 group"
                    >
                      <ArrowDownUp className="h-4 w-4 text-amber-400 group-hover:text-amber-300" />
                    </button>

                    <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-4 flex items-center justify-center z-10 pointer-events-none">
                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div>
                      </div>
                      <AutocompleteInput
                        type="station"
                        value={destination}
                        onChange={setDestination}
                        placeholder="Enter Station Code (e.g. BCT)"
                        hasLeftElement={true}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-extrabold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    SEARCH DIRECT TRAINS
                  </button>
                  
                </form>
              </div>
            )}

            {activeTab === 'spot' && (
              <div className="animate-fade-in">
                <form onSubmit={handleSpotTrain} className="flex flex-col space-y-5">
                  <div className="relative">
                    <AutocompleteInput
                      type="train"
                      value={trainNumber}
                      onChange={setTrainNumber}
                      placeholder="Enter Train Number (e.g. 12951)"
                      icon={Train}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 font-extrabold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    SPOT LIVE TRAIN
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'station' && (
              <div className="animate-fade-in">
                <form onSubmit={handleLiveStation} className="flex flex-col space-y-5">
                  <div className="relative">
                    <AutocompleteInput
                      type="station"
                      value={stationCode}
                      onChange={setStationCode}
                      placeholder="Enter Station Code (e.g. NDLS)"
                      icon={Search}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 border-2 border-indigo-500 text-indigo-400 font-bold rounded-xl hover:bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all active:scale-[0.98]"
                  >
                    GET LIVE STATION BOARD
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
