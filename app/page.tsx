'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useItineraryStore } from '@/store/useItineraryStore';
import { format } from 'date-fns';

export default function Home() {
  const router = useRouter();
  const { addCity, setTripName } = useItineraryStore((state: any) => ({
    addCity: state.addCity,
    setTripName: state.setTripName // I need to add this to store
  }));

  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !startDate || !endDate) return;

    addCity({ name: city, startDate, endDate });
    setTripName(`Trip to ${city}`);
    router.push('/planner');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-neutral-50 text-neutral-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Plan Your Journey</h1>
          <p className="text-neutral-500">Minimalist itinerary planner for modern travelers.</p>
        </div>

        <form onSubmit={handleStart} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Where to?</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="e.g. Tokyo, Japan"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
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
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            Start Planning <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </main>
  );
}
