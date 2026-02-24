import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type ItineraryType = 'HOTEL' | 'ACTIVITY' | 'TRANSPORT' | 'FOOD' | 'OTHER';

export interface ItineraryItem {
  id: string;
  cityId: string;
  dayIndex: number; // 0-based index relative to city start
  type: ItineraryType;
  title: string;
  cost: number;
  time?: string;
  notes?: string;
}

export interface City {
  id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  color: string; // Tailwindi-ish color key
}

interface ItineraryState {
  tripName: string;
  cities: City[];
  items: ItineraryItem[];
  currency: string;
  
  setTripName: (name: string) => void;
  addCity: (city: Omit<City, 'id' | 'color'>) => void;
  removeCity: (id: string) => void;
  addItem: (item: Omit<ItineraryItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ItineraryItem>) => void;
  setCurrency: (currency: string) => void;
  getTotalBudget: () => number;
}

const COLORS = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-yellow-100', 'bg-pink-100', 'bg-indigo-100'];

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set, get) => ({
      tripName: 'My Trip',
      cities: [],
      items: [],
      currency: 'USD',
      
      setTripName: (name) => set({ tripName: name }),

      addCity: (cityData) => set((state) => ({
        cities: [
          ...state.cities,
          { 
            ...cityData, 
            id: uuidv4(), 
            color: COLORS[state.cities.length % COLORS.length] 
          }
        ]
      })),

      removeCity: (id) => set((state) => ({
        cities: state.cities.filter((c) => c.id !== id),
        items: state.items.filter((i) => i.cityId !== id) // Cascade delete items
      })),

      addItem: (itemData) => set((state) => ({
        items: [...state.items, { ...itemData, id: uuidv4() }]
      })),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),

      updateItem: (id, updates) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, ...updates } : i)
      })),

      setCurrency: (currency) => set({ currency }),

      getTotalBudget: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + (item.cost || 0), 0);
      }
    }),
    {
      name: 'itinerary-storage',
      skipHydration: true, // Fix: Do not hydrate on initialization (avoids SSR mismatch)
    }
  )
);
