'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, ArrowRight, Loader2, Plus, Trash2 } from 'lucide-react';
import { useItineraryStore } from '@/store/useItineraryStore';
import { format } from 'date-fns';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Generating Plan...");
  
  // Selectors
  const addCity = useItineraryStore((state) => state.addCity);
  const addItem = useItineraryStore((state) => state.addItem);
  const setTripName = useItineraryStore((state) => state.setTripName);

  // Ensure hydration
  useEffect(() => {
    useItineraryStore.persist.rehydrate();
  }, []);

  const [citiesList, setCitiesList] = useState<string[]>(['']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vibe, setVibe] = useState('');

  const handleCityChange = (index: number, value: string) => {
    const newCities = [...citiesList];
    newCities[index] = value;
    setCitiesList(newCities);
  };

  const addCityInput = () => {
    setCitiesList([...citiesList, '']);
  };

  const removeCityInput = (index: number) => {
    if (citiesList.length > 1) {
      const newCities = citiesList.filter((_, i) => i !== index);
      setCitiesList(newCities);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate inputs
    const validCities = citiesList.filter(c => c.trim() !== '');
    if (validCities.length === 0 || !startDate || !endDate) return;

    setLoading(true);
    setLoadingText("Calculating Routes..."); // Updated text

    try {
      // Call our API to generate the plan
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cities: validCities.join(', '), 
          startDate, 
          endDate, 
          vibe 
        }),
      });

      if (!res.ok) throw new Error('Failed to generate');

      setLoadingText("Finalizing Itinerary...");
      const data = await res.json();
      
      // Populate Store with AI Data
      setTripName(data.tripName || `Trip to ${validCities[0]}`);

      if (data.cities) {
        data.cities.forEach((cityData: any) => {
          // 1. Add City and get ID
          const cityId = addCity({
            name: cityData.name,
            startDate: cityData.startDate || startDate,
            endDate: cityData.endDate || endDate,
          });

          // 2. Add Activities
          if (cityData.days) {
            cityData.days.forEach((day: any, dayIndex: number) => {
              if (day.activities) {
                day.activities.forEach((activity: any) => {
                  addItem({
                    cityId,
                    dayIndex,
                    type: activity.type,
                    title: activity.title,
                    cost: activity.cost || 0,
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
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">AI Travel Agent</h1>
          <p className="text-neutral-500">Tell us where, when, and your vibe. We'll do the rest.</p>
        </div>

        <form onSubmit={handleStart} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Destinations</label>
              <div className="space-y-2">
                {citiesList.map((city, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="e.g. Tokyo"
                        value={city}
                        onChange={(e) => handleCityChange(index, e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                        required={index === 0} // Only first is strictly required by HTML5, js handles rest
                      />
                    </div>
                    {citiesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCityInput(index)}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove city"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addCityInput}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add another city
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Vibe / Interests</label>
              <textarea
                placeholder="e.g. Foodie trip, budget friendly, lots of hiking..."
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all h-24 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {loadingText}
              </>
            ) : (
              <>
                Generate Itinerary <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
