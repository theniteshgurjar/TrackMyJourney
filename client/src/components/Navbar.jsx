import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Train, Search, Compass, Radio, Ticket } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: Compass },
    { to: '/search', label: 'Find Trains', icon: Search },
    { to: '/spot', label: 'Spot Train', icon: Train },
    { to: '/station', label: 'Station Board', icon: Radio },
    { to: '/pnr', label: 'PNR Status', icon: Ticket },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="pt-3 sm:pt-6 pb-2 max-w-[1400px] mx-auto px-4 sm:px-6 w-full">
        <div className="flex items-center justify-between">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl sm:rounded-full bg-slate-900 text-white font-display font-black text-xs sm:text-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              TMJ
            </div>
            <div>
              <span className="font-display font-black text-slate-900 text-base sm:text-lg tracking-tight block leading-tight">
                TrackMyJourney
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block md:hidden">
                Indian Railways Radar
              </span>
            </div>
          </Link>

          {/* Desktop/Tablet: Floating White Pill Navigation */}
          <nav className="hidden md:flex bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-1.5 items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = item.to === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-2 px-3.5 lg:px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Live Radar Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] sm:text-xs font-black text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Radar</span>
          </div>

        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1.5 shadow-[0_-4px_25px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-blue-900 font-black'
                    : 'text-slate-500 hover:text-slate-800 font-bold'
                }`}
              >
                <div className={`p-1 rounded-xl mb-0.5 transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-900' : 'text-slate-500'
                }`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10px] tracking-tight leading-tight text-center truncate w-full">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
