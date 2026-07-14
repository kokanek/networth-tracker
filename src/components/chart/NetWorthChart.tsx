import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSnapshotStore } from '@/stores/snapshotStore';
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';
import { formatINR, formatDate } from '@/lib/utils';
import { ChartTooltip } from './ChartTooltip';
import { TimeRangeSelector } from './TimeRangeSelector';
import type { AssetCategory } from '@/types';

export function NetWorthChart({ onSelect }: { onSelect?: (id: string) => void } = {}) {
  const { snapshots, selectedId, select, loading } = useSnapshotStore();
  const [timeRange, setTimeRange] = useState(0);

  const filtered = useMemo(() => {
    if (timeRange === 0) return snapshots;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - timeRange);
    return snapshots.filter((s) => new Date(s.date) >= cutoff);
  }, [snapshots, timeRange]);

  const chartData = useMemo(
    () =>
      filtered.map((s) => {
        const row: Record<string, unknown> = { date: s.date, _id: s._id };
        for (const asset of s.assets) {
          row[asset.category] = ((row[asset.category] as number) ?? 0) + asset.value;
        }
        return row;
      }),
    [filtered]
  );

  const latestTotal = snapshots.length ? snapshots[snapshots.length - 1].totalNetWorth : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm text-gray-500">Net Worth</p>
          <p className="text-3xl font-semibold text-gray-900">{formatINR(latestTotal)}</p>
        </div>
        <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
      </div>

      <div className="mt-6 flex gap-4 mb-4">
        {CATEGORIES.map(({ value, label }) => (
          <div key={value} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: CATEGORY_COLORS[value] }} />
            {label}
          </div>
        ))}
      </div>

      <div className="h-72 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%" className="**:outline-none">
          <BarChart data={chartData}>
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => formatINR(v)} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            {CATEGORIES.map(({ value }) => (
              <Bar
                key={value}
                dataKey={value}
                stackId="stack"
                fill={CATEGORY_COLORS[value as AssetCategory]}
                radius={0}
                barSize={40}
                className="cursor-pointer"
                onClick={(data: unknown) => {
                  const d = data as { payload?: { _id?: string }; _id?: string };
                  const id = d?.payload?._id ?? d?._id;
                  if (id) {
                    select(id);
                    onSelect?.(id);
                  }
                }}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry._id as string}
                    opacity={selectedId && selectedId !== entry._id ? 0.35 : 1}
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
