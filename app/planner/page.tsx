'use client';

'use client';

import { useState, useEffect } from 'react';
import { useItineraryStore, ItineraryItem } from '@/store/useItineraryStore';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { Plus, Download, ArrowLeft, Globe } from 'lucide-react';
import { ItineraryCard } from '@/components/ItineraryCard';
import Link from 'next/link';
import { translations } from '@/lib/translations';

export default function PlannerPage() {
  // Selectors
  const cities = useItineraryStore((state) => state.cities);
  const items = useItineraryStore((state) => state.items);
  const tripName = useItineraryStore((state) => state.tripName);
  const addItem = useItineraryStore((state) => state.addItem);
  const language = useItineraryStore((state) => state.language);
  const setLanguage = useItineraryStore((state) => state.setLanguage);

  const t = translations[language];

  const [activeCityId, setActiveCityId] = useState<string | null>(null);
  
  // Initial hydration and active city setting
  useEffect(() => {
    // Trigger rehydration (safe to call multiple times, but expensive)
    useItineraryStore.persist.rehydrate();
  }, []);

  // Sync activeCityId when cities load (only if not set)
  useEffect(() => {
    if (cities.length > 0 && !activeCityId) {
      setActiveCityId(cities[0].id);
    }
  }, [cities, activeCityId]);
  
  // Add Item Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ItineraryItem>>({
    type: 'ACTIVITY',
    title: '',
    notes: ''
  });
  const [targetCityId, setTargetCityId] = useState<string>('');
  const [targetDayIndex, setTargetDayIndex] = useState<number>(0);

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
      notes: newItem.notes
    });

    setIsAdding(false);
    setNewItem({ type: 'ACTIVITY', title: '', notes: '' });
  };

  // Show loading/empty state if no cities
  if (cities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900">
        <div className="bg-white p-4 rounded-full shadow-lg mb-6 animate-pulse">
          <span className="text-4xl">🏝️</span>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-blue-950">{t.noCitiesTitle}</h2>
        <p className="text-blue-600/80 mb-8 max-w-md">{t.noCitiesSub}</p>
        <Link href="/" className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all hover:scale-105 shadow-blue-200 shadow-lg">
          {t.startNew}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans relative">
      {/* Language Switcher (Fixed) */}
      <div className="fixed top-4 right-20 z-50">
        <button
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-xs font-bold text-blue-900 border border-blue-100"
        >
          <Globe className="h-3 w-3" />
          {language === 'en' ? 'EN' : '中文'}
        </button>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-blue-950 flex items-center gap-2">
              <span className="text-2xl">🌊</span> {tripName}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all hover:shadow-lg shadow-blue-200">
              <Download className="h-4 w-4" /> {t.exportPdf}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        
        {/* Sidebar: City Navigation */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 sticky top-24">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">{t.destinationsTitle}</h3>
            <ul className="space-y-2">
              {cities.map((city) => (
                <li key={city.id}>
                  <button
                    onClick={() => setActiveCityId(city.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all ${
                      activeCityId === city.id 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-200 scale-[1.02]' 
                        : 'hover:bg-blue-50 text-slate-600 hover:text-blue-800'
                    }`}
                  >
                    <span className="font-bold">{city.name}</span>
                    <span className={`text-xs ${activeCityId === city.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {format(parseISO(city.startDate), 'MMM d')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <Link href="/" className="w-full mt-6 flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 rounded-xl py-3 text-blue-400 font-bold hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all">
              <Plus className="h-4 w-4" /> {t.addDestSidebar}
            </Link>
          </div>
        </aside>

        {/* Timeline View */}
        <div className="space-y-12 pb-20">
          {cities.filter(c => c.id === activeCityId).map(city => {
            const days = eachDayOfInterval({
              start: parseISO(city.startDate),
              end: parseISO(city.endDate)
            });

            return (
              <div key={city.id} className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-between border-b border-blue-100 pb-6">
                  <h2 className="text-4xl font-extrabold text-blue-950 tracking-tight">{city.name}</h2>
                  <span className="text-blue-600 text-sm font-bold bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                    {days.length} {t.days}
                  </span>
                </div>

                <div className="space-y-10">
                  {days.map((day, dayIndex) => {
                    const dayItems = items.filter(i => i.cityId === city.id && i.dayIndex === dayIndex);
                    
                    return (
                      <div key={day.toISOString()} className="relative pl-8 sm:pl-10 border-l-2 border-blue-100 pb-10 last:pb-0 last:border-l-0 group">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[11px] top-0 h-5 w-5 rounded-full bg-white border-[3px] border-blue-400 shadow-sm group-hover:border-blue-600 group-hover:scale-110 transition-all"></div>
                        
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-blue-900">{t.day} {dayIndex + 1}</h3>
                          <p className="text-blue-500 font-medium text-sm">{format(day, 'EEEE, MMMM do')}</p>
                        </div>

                        <div className="space-y-4">
                          {dayItems.length > 0 ? (
                            dayItems.map(item => (
                              <ItineraryCard key={item.id} item={item} />
                            ))
                          ) : (
                            <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center">
                              <p className="text-slate-400 font-medium italic">{t.noPlans}</p>
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleAddItem(city.id, dayIndex)}
                            className="mt-4 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-2 transition-colors w-fit"
                          >
                            <Plus className="h-4 w-4" /> {t.addActivity}
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
        <div className="fixed inset-0 bg-blue-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300 border border-blue-50">
            <h3 className="text-2xl font-bold mb-6 text-blue-950">{t.addItemTitle}</h3>
            <form onSubmit={submitItem} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2 uppercase tracking-wider">{t.itemTitleLabel}</label>
                <input
                  type="text"
                  placeholder={t.itemTitlePlaceholder}
                  value={newItem.title}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                  className="w-full border-2 border-blue-50 bg-blue-50/30 p-3 rounded-xl text-slate-900 focus:border-blue-500 focus:ring-0 outline-none transition-all font-medium"
                  autoFocus
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2 uppercase tracking-wider">{t.itemTypeLabel}</label>
                <select
                  value={newItem.type}
                  onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                  className="w-full border-2 border-blue-50 bg-blue-50/30 p-3 rounded-xl text-slate-900 focus:border-blue-500 focus:ring-0 outline-none transition-all font-medium"
                >
                  <option value="ACTIVITY">{t.types.ACTIVITY}</option>
                  <option value="HOTEL">{t.types.HOTEL}</option>
                  <option value="FOOD">{t.types.FOOD}</option>
                  <option value="TRANSPORT">{t.types.TRANSPORT}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2 uppercase tracking-wider">{t.itemNotesLabel}</label>
                <textarea
                  value={newItem.notes}
                  onChange={e => setNewItem({...newItem, notes: e.target.value})}
                  className="w-full border-2 border-blue-50 bg-blue-50/30 p-3 rounded-xl text-slate-900 focus:border-blue-500 focus:ring-0 outline-none transition-all h-24 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 text-slate-500 hover:text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:scale-105"
                >
                  {t.confirmBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
