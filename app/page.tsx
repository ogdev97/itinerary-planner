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
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-neutral-50 text-neutral-900">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">AI Travel Agent</h1>
          <p className="text-neutral-500">Plan multi-city trips with precise dates. We'll handle the rest.</p>
        </div>

        <form onSubmit={handleStart} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-neutral-700">Destinations & Dates</label>
              
              {citiesList.map((city, index) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3 relative group">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-neutral-500 mb-1">City</label>
                      <LocationSearch
                        value={city.name}
                        onChange={(val) => handleCityChange(index, 'name', val)}
                        placeholder="e.g. Tokyo"
                        required={true}
                      />
                    </div>
                    {citiesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCityInput(index)}
                        className="mt-6 p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">From</label>
                      <input
                        type="date"
                        value={city.startDate}
                        onChange={(e) => handleCityChange(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">To</label>
                      <input
                        type="date"
                        value={city.endDate}
                        onChange={(e) => handleCityChange(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black outline-none text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addCityInput}
                className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-sm font-medium text-neutral-600 hover:text-black hover:border-neutral-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Another City
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Vibe / Interests</label>
              <textarea
                placeholder="e.g. Foodie trip, want to try famous ramen spots, visit historical temples..."
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all h-24 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-neutral-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> {loadingText}
              </>
            ) : (
              <>
                Generate Trip <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
