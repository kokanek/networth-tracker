import { TIME_RANGES } from '@/lib/constants';

interface Props {
  selected: number;
  onChange: (months: number) => void;
}

export function TimeRangeSelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {TIME_RANGES.map(({ label, months }) => (
        <button
          key={label}
          onClick={() => onChange(months)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            selected === months ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
