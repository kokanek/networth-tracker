import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants';
import { formatINR, formatDateFull } from '@/lib/utils';
import type { AssetCategory } from '@/types';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number }>;
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum: number, p) => sum + (p.value ?? 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-900 mb-2">{formatDateFull(label as string)}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: CATEGORY_COLORS[entry.dataKey as AssetCategory] }} />
            <span className="text-gray-600">{CATEGORY_LABELS[entry.dataKey as AssetCategory]}</span>
          </div>
          <span className="font-medium text-gray-900">{formatINR(entry.value ?? 0)}</span>
        </div>
      ))}
      <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between">
        <span className="font-medium text-gray-900">Total</span>
        <span className="font-semibold text-gray-900">{formatINR(total)}</span>
      </div>
    </div>
  );
}
