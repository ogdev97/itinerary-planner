'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, ArrowRight, Loader2, Plus, Trash2 } from 'lucide-react';
import { useItineraryStore } from '@/store/useItineraryStore';
import LocationSearch from '@/components/LocationSearch';
import { format, differenceInHours } from 'date-fns';

interface CityInput {
  name: string;
  startDate: string;
  endDate: string;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Generating Plan...");
  
  // Selectors
  const addCity = useItineraryStore((state) => state.addCity);
  const addItem = useItineraryStore((state) => state.addItem);
  const setTripName = useItineraryStore((state) => state.setTripName);
  const cities = useItineraryStore((state) => state.cities); // To check for existing

  // Auto-Clear Old Itineraries (24h)
  useEffect(() => {
    useItineraryStore.persist.rehydrate();
    
    // Check if we have a stored trip
    const storedState = localStorage.getItem('itinerary-storage');
    if (storedState) {
      try {
        const { state } = JSON.parse(storedState);
        // If cities exist, check the last update time (or just check start date of first city)
        // Since we don't store "updatedAt", let's assume if the first city's end date is in the past > 24h?
        // Or better: Just check if the user is visiting "/" (Start fresh).
        // Let's explicitly clear if the user clicks "Generate" later.
      } catch (e) {
        console.error("Storage parse error", e);
      }
    }
  }, []);

  const [citiesList, setCitiesList] = useState<CityInput[]>([
    { name: '', startDate: '', endDate: '' }
  ]);
  const [vibe, setVibe] = useState('');

  const handleCityChange = (index: number, field: keyof CityInput, value: string) => {
    const newCities = [...citiesList];
    newCities[index] = { ...newCities[index], [field]: value };
    setCitiesList(newCities);
  };

  const addCityInput = () => {
    setCitiesList([...citiesList, { name: '', startDate: '', endDate: '' }]);
  };

  const removeCityInput = (index: number) => {
    if (citiesList.length > 1) {
      const newCities = citiesList.filter((_, i) => i !== index);
      setCitiesList(newCities);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const validCities = citiesList.filter(c => c.name.trim() !== '' && c.startDate && c.endDate);
    if (validCities.length === 0) {
      alert("Please enter at least one city with valid dates.");
      return;
    }

    // Clear old data before generating new one
    useItineraryStore.setState({ cities: [], items: [], tripName: '' });

    setLoading(true);
    setLoadingText("Calculating Routes..."); 

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cities: validCities, // Send full objects now
          vibe 
        }),
      });

      if (!res.ok) throw new Error('Failed to generate');

      setLoadingText("Finalizing Itinerary...");
      const data = await res.json();
      
      setTripName(data.tripName || `Trip to ${validCities[0].name}`);

      if (data.cities) {
        data.cities.forEach((cityData: any) => {
          const cityId = addCity({
            name: cityData.name,
            startDate: cityData.startDate,
            endDate: cityData.endDate,
          });

          if (cityData.days) {
            cityData.days.forEach((day: any, dayIndex: number) => {
              if (day.activities) {
                day.activities.forEach((activity: any) => {
                  addItem({
                    cityId,
                    dayIndex,
                    type: activity.type,
                    title: activity.title,
                    time: activity.time, // Add time (Morning/Lunch/etc)
                    notes: activity.notes
                  });
                });
              }
            });
          }
        });
      }

      router.push('/planner');
      
    } catch (err) {
      console.error(err);
      alert("Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-100 text-slate-900">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 rounded-full bg-blue-100 mb-2 animate-bounce">
            <span className="text-4xl">🌊</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-blue-950 drop-shadow-sm">
            Smart Travel Agent
          </h1>
          <p className="text-lg text-blue-600/80 font-medium">
            Your personal ocean of travel possibilities. 
            <br className="hidden sm:block"/> 
            Tell us where, when, and your vibe.
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-6 bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 ring-1 ring-blue-100 transition-all hover:shadow-2xl hover:bg-white/90">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-blue-900 uppercase tracking-wider">Destinations & Dates</label>
              
              {citiesList.map((city, index) => (
                <div key={index} className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm space-y-3 relative group transition-all hover:border-blue-300">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-blue-400 mb-1 uppercase">City</label>
                      <LocationSearch
                        value={city.name}
                        onChange={(val) => handleCityChange(index, 'name', val)}
                        placeholder="e.g. Santorini, Greece"
                        required={true}
                      />
                    </div>
                    {citiesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCityInput(index)}
                        className="mt-6 p-2 text-blue-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-blue-400 mb-1 uppercase">From</label>
                      <input
                        type="date"
                        value={city.startDate}
                        onChange={(e) => handleCityChange(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-100 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-700 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-400 mb-1 uppercase">To</label>
                      <input
                        type="date"
                        value={city.endDate}
                        onChange={(e) => handleCityChange(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-100 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-700 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addCityInput}
                className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-sm font-bold text-blue-500 hover:text-blue-700 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Another City
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Vibe / Interests</label>
              <textarea
                placeholder="e.g. Relaxing beach days, seafood dinners, sunset boat tours..."
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full p-4 border border-blue-100 bg-blue-50/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-28 resize-none text-slate-700 placeholder-blue-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg shadow-blue-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> {loadingText}
              </>
            ) : (
              <>
                Generate Ocean Escape <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
