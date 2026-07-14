import type { ReactNode } from 'react';

export function DashboardLayout({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
