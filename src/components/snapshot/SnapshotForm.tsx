import { useState, useEffect } from 'react';
import type { Asset, Snapshot } from '@/types';
import { CATEGORIES, SUBTYPES } from '@/lib/constants';
import { AssetInput } from './AssetInput';

interface Props {
  snapshot?: Snapshot | null;
  onSave: (date: string, assets: Asset[]) => void | Promise<void>;
  onClose: () => void;
}

function emptyAsset(): Asset {
  const category = CATEGORIES[0].value;
  return { category, subtype: SUBTYPES[category][0].value, identifier: '', value: 0 };
}

export function SnapshotForm({ snapshot, onSave, onClose }: Props) {
  const [date, setDate] = useState(snapshot?.date ?? new Date().toISOString().slice(0, 10));
  const [assets, setAssets] = useState<Asset[]>(snapshot?.assets ?? []);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (snapshot) {
      setDate(snapshot.date);
      setAssets(snapshot.assets);
    }
  }, [snapshot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validAssets = assets.filter((a) => a.value > 0);
    if (validAssets.length === 0) return;
    setSubmitting(true);
    try {
      await onSave(date, validAssets);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {snapshot ? 'Edit Snapshot' : 'Add Snapshot'}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Components</label>
            {assets.map((asset, i) => (
              <AssetInput
                key={i}
                asset={asset}
                onChange={(updated) => {
                  const next = [...assets];
                  next[i] = updated;
                  setAssets(next);
                }}
                onRemove={() => setAssets(assets.filter((_, j) => j !== i))}
              />
            ))}
            <button
              type="button"
              onClick={() => setAssets([...assets, emptyAsset()])}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors text-lg"
              aria-label="Add component"
            >
              +
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
            {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
