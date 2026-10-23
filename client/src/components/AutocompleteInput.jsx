import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Loader2, X, Check } from 'lucide-react';

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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const fetchSuggestions = async () => {
      const cleanQ = query.trim();
      // If query is formatted like "New Delhi (NDLS)", don't re-search
      if (!cleanQ || cleanQ.length < 1 || /\([A-Za-z0-9#\s-]+\)$/.test(cleanQ)) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const endpoint = type === 'station' ? '/api/lookup/search/stations' : '/api/lookup/search/trains';
        const res = await axios.get(`http://localhost:5000${endpoint}?q=${encodeURIComponent(cleanQ)}&limit=8`);
        setSuggestions(res.data.data || []);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Suggestion fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, type]);

  useEffect(() => {
    if (value !== undefined && value !== query && !isOpen) {
      setQuery(value);
    }
  }, [value, isOpen]);

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
    if (!item) return;
    const textValue = type === 'station' ? item.code : item.number;
    const displayText = type === 'station' ? `${item.name} (${item.code})` : `${item.name} (#${item.number})`;
    setQuery(displayText);
    onChange(textValue, item);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = selectedIndex >= 0 ? suggestions[selectedIndex] : suggestions[0];
      handleSelect(target);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required
        className={`w-full ${Icon || hasLeftElement ? 'pl-9 sm:pl-10' : 'pl-1 sm:pl-2'} pr-10 sm:pr-12 py-2 bg-transparent text-slate-900 font-extrabold focus:outline-none focus:ring-0 text-xs sm:text-sm placeholder:text-slate-400 border-0`}
      />

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {loading && (
          <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
        )}
        {query && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Clear"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 w-full min-w-[260px] sm:min-w-[320px] max-w-[90vw] mt-2 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_35px_-5px_rgba(15,23,42,0.14)] max-h-72 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
          <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 flex justify-between">
            <span>{type === 'station' ? 'Suggested Stations' : 'Suggested Trains'}</span>
            <span>Use ↑↓ keys & Enter</span>
          </div>
          {suggestions.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors group ${
                  isSelected ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50'
                }`}
              >
                {type === 'station' ? (
                  <>
                    <div className="pr-2 min-w-0 flex-1">
                      <p className="font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors text-xs sm:text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400 truncate">
                        {item.city ? item.city : ''}{item.state ? `, ${item.state}` : ''}{!item.city && !item.state ? 'Indian Railway Station' : ''}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-black bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-lg shrink-0 ml-2">
                      {item.code}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="pr-2 min-w-0 flex-1">
                      <p className="font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors text-xs sm:text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400 truncate">
                        {item.sourceName || item.source || ''} {item.destName || item.dest ? `➔ ${item.destName || item.dest}` : ''}
                        {item.type ? ` • ${item.type}` : ''}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded-lg shrink-0 ml-2">
                      #{item.number}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
