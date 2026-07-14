import { CATEGORIES, SUBTYPES } from '@/lib/constants';
import type { Asset, AssetCategory } from '@/types';

interface Props {
  asset: Asset;
  onChange: (asset: Asset) => void;
  onRemove: () => void;
}

export function AssetInput({ asset, onChange, onRemove }: Props) {
  const subtypes = SUBTYPES[asset.category];

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-1 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <select
            value={asset.category}
            onChange={(e) => {
              const category = e.target.value as AssetCategory;
              onChange({ ...asset, category, subtype: SUBTYPES[category][0].value });
            }}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Subtype</label>
          <select
            value={asset.subtype}
            onChange={(e) => onChange({ ...asset, subtype: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {subtypes.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Identifier</label>
          <input
            type="text"
            value={asset.identifier}
            onChange={(e) => onChange({ ...asset, identifier: e.target.value })}
            placeholder="e.g. Zerodha"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Value (₹)</label>
          <input
            type="number"
            value={asset.value || ''}
            onChange={(e) => onChange({ ...asset, value: Number(e.target.value) })}
            placeholder="0"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <button type="button" onClick={onRemove} className="mt-6 text-gray-400 hover:text-red-500 transition-colors text-lg">
        &times;
      </button>
    </div>
  );
}
