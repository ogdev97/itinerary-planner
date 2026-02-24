'use client';

import { useState, useEffect } from 'react';
import { useItineraryStore, City, ItineraryItem } from '@/store/useItineraryStore';
import { format, eachDayOfInterval, parseISO, addDays } from 'date-fns';
import { Plus, Download, ArrowLeft } from 'lucide-react';
import { ItineraryCard } from '@/components/ItineraryCard';
import Link from 'next/link';

export default function PlannerPage() {
  const { cities, items, tripName, getTotalBudget, addItem } = useItineraryStore();
  const [activeCityId, setActiveCityId] = useState<string | null>(cities[0]?.id || null);
  
  // Add Item Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ItineraryItem>>({
    type: 'ACTIVITY',
    title: '',
    cost: 0,
    notes: ''
  });
  const [targetCityId, setTargetCityId] = useState<string>('');
  const [targetDayIndex, setTargetDayIndex] = useState<number>(0);

  const totalBudget = getTotalBudget();

  // Hydration fix
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null; // or a loading spinner

  const handleAddItem = (cityId: string, dayIndex: number) => {
    setTargetCityId(cityId);
    setTargetDayIndex(dayIndex);
    setIsAdding(true);
  };

  const submitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !targetCityId) return;

    addItem({
      cityId: targetCityId,
      dayIndex: targetDayIndex,
      type: newItem.type as any,
      title: newItem.title!,
      cost: Number(newItem.cost) || 0,
      notes: newItem.notes
    });

    setIsAdding(false);
    setNewItem({ type: 'ACTIVITY', title: '', cost: 0, notes: '' });
  };

  if (cities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h2 className="text-2xl font-bold mb-4">No cities added yet!</h2>
        <Link href="/" className="text-blue-600 hover:underline">Go back to start</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-neutral-500 hover:text-neutral-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900">{tripName}</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-xs text-neutral-500 uppercase tracking-wide">Total Budget</span>
              <span className="block text-lg font-bold text-green-600">${totalBudget.toFixed(2)}</span>
            </div>
            <button className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-neutral-800 transition-colors">
              <Download className="h-4 w-4" /> Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        
        {/* Sidebar: City Navigation */}
        <aside className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">Itinerary</h3>
            <ul className="space-y-2">
              {cities.map((city) => (
                <li key={city.id}>
                  <button
                    onClick={() => setActiveCityId(city.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                      activeCityId === city.id 
                        ? 'bg-neutral-900 text-white shadow-md' 
                        : 'hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <span className="font-medium">{city.name}</span>
                    <span className="text-xs opacity-70">
                      {format(parseISO(city.startDate), 'MMM d')} - {format(parseISO(city.endDate), 'MMM d')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 flex items-center justify-center gap-2 border border-dashed border-neutral-300 rounded-lg py-3 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-all">
              <Plus className="h-4 w-4" /> Add City
            </button>
          </div>
        </aside>

        {/* Timeline View */}
        <div className="space-y-8">
          {cities.filter(c => c.id === activeCityId).map(city => {
            const days = eachDayOfInterval({
              start: parseISO(city.startDate),
              end: parseISO(city.endDate)
            });

            return (
              <div key={city.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-neutral-900">{city.name}</h2>
                  <span className="text-neutral-500 text-sm font-medium bg-white px-3 py-1 rounded-full border border-neutral-200">
                    {days.length} Days
                  </span>
                </div>

                <div className="space-y-6">
                  {days.map((day, dayIndex) => {
                    const dayItems = items.filter(i => i.cityId === city.id && i.dayIndex === dayIndex);
                    
                    return (
                      <div key={day.toISOString()} className="relative pl-8 border-l-2 border-neutral-200 pb-8 last:pb-0 last:border-l-0">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-neutral-900 border-4 border-white shadow-sm"></div>
                        
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-neutral-900">Day {dayIndex + 1}</h3>
                          <p className="text-neutral-500 text-sm">{format(day, 'EEEE, MMMM do')}</p>
                        </div>

                        <div className="space-y-3">
                          {dayItems.length > 0 ? (
                            dayItems.map(item => (
                              <ItineraryCard key={item.id} item={item} />
                            ))
                          ) : (
                            <p className="text-sm text-neutral-400 italic">No activities planned yet.</p>
                          )}
                          
                          <button
                            onClick={() => handleAddItem(city.id, dayIndex)}
                            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                          >
                            <Plus className="h-3 w-3" /> Add Activity
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Item Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4">Add New Item</h3>
            <form onSubmit={submitItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Visit Museum"
                  value={newItem.title}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                  className="w-full border p-2 rounded-lg"
                  autoFocus
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newItem.type}
                    onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                    className="w-full border p-2 rounded-lg"
                  >
                    <option value="ACTIVITY">Activity</option>
                    <option value="HOTEL">Hotel</option>
                    <option value="FOOD">Food</option>
                    <option value="TRANSPORT">Transport</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.cost}
                    onChange={e => setNewItem({...newItem, cost: Number(e.target.value)})}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea
                  value={newItem.notes}
                  onChange={e => setNewItem({...newItem, notes: e.target.value})}
                  className="w-full border p-2 rounded-lg h-20"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
