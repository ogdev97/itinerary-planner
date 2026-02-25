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
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          placeholder={placeholder || "Search city..."}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-neutral-900 bg-white"
          required={required}
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result) => (
            <li key={result.place_id}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-2 hover:bg-neutral-100 transition-colors flex flex-col"
              >
                <span className="font-medium text-neutral-900 text-sm">
                  {result.name}
                </span>
                <span className="text-xs text-neutral-500 truncate">
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
