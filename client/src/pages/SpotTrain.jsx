import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Search, Sparkles, Clock, Calendar, ArrowRight, ShieldCheck, Zap, Navigation } from 'lucide-react';
import AutocompleteInput from '../components/AutocompleteInput';

const SpotTrain = () => {
  const navigate = useNavigate();
  const [trainNumber, setTrainNumber] = useState('');
  const [startDate, setStartDate] = useState('today');

  const handleSpot = (e) => {
    if (e) e.preventDefault();
    if (trainNumber && trainNumber.trim()) {
      navigate(`/train/${encodeURIComponent(trainNumber.trim())}?view=live`);
    }
  };

  const popularTrains = [
    { number: '12951', name: 'Mumbai Rajdhani Express', route: 'MMCT ➔ NDLS', type: 'Superfast Rajdhani' },
    { number: '12004', name: 'Lucknow Swarna Shatabdi', route: 'NDLS ➔ LJN', type: 'High Speed Shatabdi' },
    { number: '22436', name: 'Vande Bharat Express', route: 'NDLS ➔ BSB', type: 'Semi-High Speed' },
    { number: '12259', name: 'Sealdah Duronto Express', route: 'SDAH ➔ NDLS', type: 'Non-Stop AC' },
    { number: '12627', name: 'Karnataka Express', route: 'SBC ➔ NDLS', type: 'Superfast' },
    { number: '12616', name: 'Grand Trunk Express', route: 'NDLS ➔ MAS', type: 'Superfast' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-28">
      
      {/* Master Card Wrapper */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.05)] border border-slate-100 p-6 sm:p-10 lg:p-12 mb-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 font-display block mb-1">
            REAL-TIME GPS RADAR
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
            Spot Any Live Train
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-500 mt-2">
            Enter your train number or name to track its live GPS location, real-time arrival/departure timings, and delay meters across India.
          </p>
        </div>

        {/* Spot Train Search Form */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-4 sm:p-6 mb-10 shadow-sm max-w-4xl">
          <form onSubmit={handleSpot} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Input Capsule */}
            <div className="md:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Train className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Train Number or Name
                </span>
                <AutocompleteInput
                  type="train"
                  value={trainNumber}
                  onChange={setTrainNumber}
                  placeholder="e.g. Rajdhani, Vande Bharat, or 12951"
                />
              </div>
            </div>

            {/* Date Capsule */}
            <div className="md:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Calendar className="w-4 h-4 text-slate-700" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Start Day
                </span>
                <select
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full font-display font-extrabold text-xs text-slate-900 bg-transparent outline-none cursor-pointer"
                >
                  <option value="today">Today (Live)</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="tomorrow">Tomorrow</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3">
              <button
                type="submit"
                className="btn-navy w-full py-4 px-6 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Search className="w-4 h-4 stroke-[3]" />
                <span>Track Live Location</span>
              </button>
            </div>

          </form>
        </div>

        {/* Popular Trains Directory */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <h2 className="font-display font-black text-slate-900 text-lg">
                Popular Superfast Express Trains
              </h2>
              <p className="text-xs text-slate-400 font-bold">Click any train to open instant live GPS tracking</p>
            </div>
            <span className="text-xs font-black bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
              6 Featured
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTrains.map((train) => (
              <div
                key={train.number}
                onClick={() => navigate(`/train/${train.number}?view=live`)}
                className="bg-slate-50/70 hover:bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                      #{train.number}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {train.type}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-slate-900 text-base group-hover:text-blue-900 transition-colors leading-snug">
                    {train.name}
                  </h3>
                  
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    {train.route}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-black text-blue-900">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Tracked
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default SpotTrain;
