'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
  };
}

export default function LocationSearch({ value, onChange, placeholder, required }: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update internal query if prop changes (e.g. initial load)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleSearch = async (term: string) => {
    setQuery(term);
    onChange(term); // Allow typing freely

    if (term.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      // Use OpenStreetMap Nominatim API (Free, requires User-Agent)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&format=json&addressdetails=1&limit=5&featuretype=city`,
        {
          headers: {
            'User-Agent': 'ItineraryPlannerApp/1.0'
          }
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    // Format: City, Country
    const city = result.address.city || result.address.town || result.address.village || result.name;
    const country = result.address.country || "";
    const formatted = country ? `${city}, ${country}` : city;
    
    setQuery(formatted);
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-blue-400" />
        <input
          type="text"
          placeholder={placeholder || "Search city..."}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-blue-100 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700 placeholder-blue-300"
          required={required}
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-md border border-blue-100 rounded-lg shadow-xl max-h-60 overflow-y-auto ring-1 ring-blue-50">
          {results.map((result) => (
            <li key={result.place_id}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50/50 transition-colors flex flex-col border-b border-blue-50 last:border-0"
              >
                <span className="font-semibold text-blue-900 text-sm">
                  {result.name}
                </span>
                <span className="text-xs text-blue-500/70 truncate">
                  {result.display_name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
