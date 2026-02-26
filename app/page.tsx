import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, ArrowRight, Loader2, Plus, Trash2, Globe } from 'lucide-react';
import { useItineraryStore } from '@/store/useItineraryStore';
import LocationSearch from '@/components/LocationSearch';
import { format, differenceInHours } from 'date-fns';
import { translations, Language } from '@/lib/translations';

interface CityInput {
  name: string;
  startDate: string;
  endDate: string;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Selectors
  const addCity = useItineraryStore((state) => state.addCity);
  const addItem = useItineraryStore((state) => state.addItem);
  const setTripName = useItineraryStore((state) => state.setTripName);
  const language = useItineraryStore((state) => state.language);
  const setLanguage = useItineraryStore((state) => state.setLanguage);
  
  const t = translations[language]; // Current translation
  const [loadingText, setLoadingText] = useState(t.generating);

  // Update loading text when language changes
  useEffect(() => {
    setLoadingText(t.generating);
  }, [language]);

  // Ensure hydration
  useEffect(() => {
    useItineraryStore.persist.rehydrate();
    
    // Check if we have a stored trip
    const storedState = localStorage.getItem('itinerary-storage');
    // ... logic ...
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
    setLoadingText(t.generating); 

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cities: validCities, 
          vibe,
          language // Pass selected language to API
        }),
      });

      if (!res.ok) throw new Error('Failed to generate');

      setLoadingText(t.finalizing);
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
                    time: activity.time, 
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
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-100 text-slate-900 relative">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm font-semibold text-blue-900 border border-blue-100"
        >
          <Globe className="h-4 w-4" />
          {language === 'en' ? 'English' : '简体中文'}
        </button>
      </div>

      <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 rounded-full bg-blue-100 mb-2 animate-bounce">
            <span className="text-4xl">🌊</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-blue-950 drop-shadow-sm">
            {t.title}
          </h1>
          <p className="text-lg text-blue-600/80 font-medium">
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-6 bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 ring-1 ring-blue-100 transition-all hover:shadow-2xl hover:bg-white/90">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-blue-900 uppercase tracking-wider">{t.destinations}</label>
              
              {citiesList.map((city, index) => (
                <div key={index} className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm space-y-3 relative group transition-all hover:border-blue-300">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-blue-400 mb-1 uppercase">{t.cityLabel}</label>
                      <LocationSearch
                        value={city.name}
                        onChange={(val) => handleCityChange(index, 'name', val)}
                        placeholder={t.searchPlaceholder}
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
                      <label className="block text-xs font-semibold text-blue-400 mb-1 uppercase">{t.fromLabel}</label>
                      <input
                        type="date"
                        value={city.startDate}
                        onChange={(e) => handleCityChange(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-100 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-700 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-400 mb-1 uppercase">{t.toLabel}</label>
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
                <Plus className="h-4 w-4" /> {t.addCityBtn}
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">{t.vibeLabel}</label>
              <textarea
                placeholder={t.vibePlaceholder}
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
                {t.generateBtn} <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

