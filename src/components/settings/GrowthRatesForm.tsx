import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUserStore } from '@/stores/userStore';
import { ASSET_TYPES } from '@/lib/constants';
import type { GrowthRates, AssetType } from '@/types';

export function GrowthRatesForm() {
  const { growthRates, update, loading } = useSettingsStore();
  const { activeUser } = useUserStore();
  const [rates, setRates] = useState<GrowthRates>(growthRates);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRates(growthRates);
  }, [growthRates]);

  const handleSave = async () => {
    await update(activeUser, rates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Growth Rate Assumptions</h2>
      <p className="text-sm text-gray-500 mb-6">Annual growth rates used for projections</p>

      <div className="space-y-4">
        {ASSET_TYPES.map(({ value, label }) => (
          <div key={value} className="flex items-center justify-between gap-4">
            <label className="text-sm font-medium text-gray-700 min-w-[120px]">{label}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={rates[value as AssetType]}
                onChange={(e) => setRates({ ...rates, [value]: Number(e.target.value) })}
                className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                step="0.5"
              />
              <span className="text-sm text-gray-400">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
        >
          Save
        </button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  );
}
