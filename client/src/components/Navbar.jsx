import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../context/themeStore';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  return (
    <div className="sticky top-4 z-50 max-w-5xl mx-auto px-4 w-full">
      <nav className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300 rounded-2xl shadow-lg shadow-black/5 px-4 sm:px-6">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img src="/logo.png?v=3" alt="Logo" className="h-8 w-8 md:h-10 md:w-10 object-cover rounded-full group-hover:scale-110 transition-transform mr-3 shadow-lg shadow-primary/20" />
              <span className="font-display font-bold text-xl tracking-wide text-white">TrackMyJourney</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
