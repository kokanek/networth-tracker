import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useSnapshotStore } from '@/stores/snapshotStore';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS, SUBTYPE_LABELS } from '@/lib/constants';
import { formatINRFull, formatDateFull } from '@/lib/utils';
import type { AssetCategory } from '@/types';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

export function SnapshotDetail({ onEdit, onDelete }: Props) {
  const { snapshots, selectedId } = useSnapshotStore();

  const snapshot = snapshots.find((s) => s._id === selectedId);

  const categoryTotals = useMemo(() => {
    if (!snapshot) return [];
    return CATEGORIES.map(({ value, label }) => ({
      category: value,
      label,
      total: snapshot.assets
        .filter((a) => a.category === value)
        .reduce((sum, a) => sum + a.value, 0),
    })).filter((c) => c.total > 0);
  }, [snapshot]);

  if (!snapshot) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">Select a bar in the chart to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <p className="text-sm text-gray-500">{formatDateFull(snapshot.date)}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{formatINRFull(snapshot.totalNetWorth)}</p>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryTotals}
              dataKey="total"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {categoryTotals.map((c) => (
                <Cell key={c.category} fill={CATEGORY_COLORS[c.category as AssetCategory]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-4">
        {categoryTotals.map((c) => (
          <div key={c.category} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: CATEGORY_COLORS[c.category as AssetCategory] }} />
            {c.label}
            <span className="font-medium text-gray-900">
              {snapshot.totalNetWorth > 0 ? Math.round((c.total / snapshot.totalNetWorth) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        {categoryTotals.map((c) => {
          const items = snapshot.assets.filter((a) => a.category === c.category);
          return (
            <div key={c.category}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: CATEGORY_COLORS[c.category as AssetCategory] }} />
                  <span className="text-sm font-semibold text-gray-900">{CATEGORY_LABELS[c.category as AssetCategory]}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{formatINRFull(c.total)}</span>
              </div>
              <div className="ml-4.5 space-y-1.5">
                {items.map((a, i) => (
                  <div key={`${a.subtype}-${a.identifier}-${i}`} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {SUBTYPE_LABELS[a.subtype] ?? a.subtype}
                      {a.identifier && <span className="text-gray-400"> · {a.identifier}</span>}
                    </span>
                    <span className="text-gray-900">{formatINRFull(a.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onEdit}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
