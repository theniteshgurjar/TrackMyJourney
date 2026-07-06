import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

const AutocompleteInput = ({ 
  type = 'station', // 'station' or 'train'
  value, 
  onChange, 
  placeholder,
  icon: Icon,
  hasLeftElement
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const endpoint = type === 'station' ? '/api/trains/search-stations' : '/api/trains/search-trains';
        const res = await axios.get(`http://localhost:5000${endpoint}?q=${query}`);
        setSuggestions(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      // Only search if user is actively typing
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, type]);

  useEffect(() => {
    // Sync external value changes (like swapping stations)
    if (value && value !== query && !isOpen) {
      setQuery(value);
    }
  }, [value, isOpen, query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    const textValue = type === 'station' ? item.code : item.number;
    const displayText = type === 'station' ? `${item.name} (${item.code})` : `${item.name} (${item.number})`;
    setQuery(displayText);
    onChange(textValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value); // In case they want to just type and submit
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        required
        className={`w-full ${Icon || hasLeftElement ? 'pl-12' : 'pl-4'} pr-4 py-4 border border-slate-700 rounded-xl bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-white font-medium transition-all relative z-0 placeholder-slate-500`}
      />
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(item)}
              className="px-4 py-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between border-b border-slate-800 last:border-0 transition-colors"
            >
              {type === 'station' ? (
                <>
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.city}, {item.state}</p>
                  </div>
                  <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2 py-1 rounded">
                    {item.code}
                  </span>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.type}</p>
                  </div>
                  <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2 py-1 rounded">
                    {item.number}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
