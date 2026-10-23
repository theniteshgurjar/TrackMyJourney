import React from 'react';
import { Train, Heart, ShieldCheck, Zap, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/80 backdrop-blur-md pt-10 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black">
                TMJ
              </div>
              <span className="font-display font-black text-lg tracking-tight text-slate-900">
                TrackMyJourney
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm max-w-sm font-medium leading-relaxed">
              Real-time Indian Railways radar tracking, live station departures, and visual route maps designed with friendly simplicity.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-bold">
                <Zap className="w-3.5 h-3.5 text-blue-600" /> Fast Live Radar
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Free
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs font-bold text-slate-600">
              <li>
                <Link to="/" className="hover:text-blue-900 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-400" /> Search Trains
                </Link>
              </li>
              <li>
                <Link to="/search?source=NDLS&destination=BCT" className="hover:text-blue-900 transition-colors">
                  Delhi ➔ Mumbai Trains
                </Link>
              </li>
              <li>
                <Link to="/station/NDLS" className="hover:text-blue-900 transition-colors">
                  New Delhi (NDLS) Board
                </Link>
              </li>
              <li>
                <Link to="/train/12951?view=live" className="hover:text-blue-900 transition-colors">
                  Rajdhani Express (12951)
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Hubs */}
          <div>
            <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider mb-3">
              Major Hubs
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['NDLS', 'BCT', 'HWH', 'MAS', 'SBC', 'PUNE', 'CNB', 'GKP'].map((code) => (
                <Link
                  key={code}
                  to={`/station/${code}`}
                  className="px-2.5 py-1 text-xs font-black font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                >
                  {code}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} TrackMyJourney. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for smart travelers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
