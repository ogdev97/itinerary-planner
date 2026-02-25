import { Trash, Edit } from 'lucide-react';
import { useItineraryStore, ItineraryItem } from '@/store/useItineraryStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ItineraryCardProps {
  item: ItineraryItem;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({ item }) => {
  const { removeItem } = useItineraryStore();

  const typeColor = (type: string) => {
    switch (type) {
      case 'HOTEL': return 'bg-blue-100 text-blue-700';
      case 'ACTIVITY': return 'bg-green-100 text-green-700';
      case 'TRANSPORT': return 'bg-yellow-100 text-yellow-700';
      case 'FOOD': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-4">
        <div className={twMerge('px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide', typeColor(item.type))}>
          {item.type}
        </div>
        <div>
          <h4 className="font-medium text-neutral-900">{item.title}</h4>
          {item.notes && <p className="text-xs text-neutral-500">{item.notes}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => removeItem(item.id)}
          className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
