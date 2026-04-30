import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';
import { nearbyService } from '../services/nearby.service';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = 'Search location...',
  className = '',
  error,
  icon,
}) => {
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(value);

  // Sync input value with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const fetchSuggestions = async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await nearbyService.getSuggestions(query);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (_error) {
        console.error(_error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (inputValue && inputValue.length >= 3 && inputValue !== value) {
        fetchSuggestions(inputValue);
      } else if (!inputValue) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [inputValue, value]);

  const handleSelect = (suggestion: { display_name: string; lat: string; lon: string }) => {
    const selectedValue = suggestion.display_name;
    setInputValue(selectedValue);
    onChange(selectedValue);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon || <MapPin size={18} />}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            // We don't call onChange here yet, we wait for selection or blur
            // but if user clears it, we should notify
            if (!e.target.value) onChange('');
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          className={`w-full pl-12 pr-10 py-4 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-100'
            } rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${className}`}
          placeholder={placeholder}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-indigo-500" size={16} />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="max-h-60 overflow-y-auto">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(s)}
                className="px-5 py-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3 border-b border-slate-50 last:border-0 transition-colors"
              >
                <Search className="text-slate-300 mt-0.5 shrink-0" size={14} />
                <span className="text-xs text-slate-600 line-clamp-2">{s.display_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
