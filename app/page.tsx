'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { useItineraryStore } from '@/store/useItineraryStore';
import { format } from 'date-fns';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Selectors
  const addCity = useItineraryStore((state) => state.addCity);
  const addItem = useItineraryStore((state) => state.addItem);
  const setTripName = useItineraryStore((state) => state.setTripName);

  // Ensure hydration
  useEffect(() => {
    useItineraryStore.persist.rehydrate();
  }, []);

  const [citiesInput, setCitiesInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vibe, setVibe] = useState('');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citiesInput || !startDate || !endDate) return;

    setLoading(true);

    try {
      // Call our API to generate the plan
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cities: citiesInput, 
          startDate, 
          endDate, 
          vibe 
        }),
      });

      if (!res.ok) throw new Error('Failed to generate');

      const data = await res.json();
      
      // Populate Store with AI Data
      setTripName(data.tripName || `Trip to ${citiesInput}`);

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
              <label className="block text-sm font-medium text-neutral-700 mb-1">Destinations</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="e.g. Tokyo, Kyoto, Osaka"
                  value={citiesInput}
                  onChange={(e) => setCitiesInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
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
                <Loader2 className="h-4 w-4 animate-spin" /> Generating Plan...
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
