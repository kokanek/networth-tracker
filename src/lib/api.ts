import type { Asset, GrowthRates, Settings, Snapshot } from '@/types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getSnapshots: (user: string): Promise<Snapshot[]> =>
    request(`/api/snapshots?user=${encodeURIComponent(user)}`),

  createSnapshot: (user: string, data: { date: string; assets: Asset[] }): Promise<Snapshot> =>
    request(`/api/snapshots?user=${encodeURIComponent(user)}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSnapshot: (user: string, id: string, data: { date: string; assets: Asset[] }): Promise<Snapshot> =>
    request(`/api/snapshots/${encodeURIComponent(id)}?user=${encodeURIComponent(user)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteSnapshot: (user: string, id: string): Promise<{ success: boolean }> =>
    request(`/api/snapshots/${encodeURIComponent(id)}?user=${encodeURIComponent(user)}`, {
      method: 'DELETE',
    }),

  getSettings: (user: string): Promise<Settings> =>
    request(`/api/settings?user=${encodeURIComponent(user)}`),

  updateSettings: (user: string, growthRates: GrowthRates): Promise<Settings> =>
    request(`/api/settings?user=${encodeURIComponent(user)}`, {
      method: 'PUT',
      body: JSON.stringify({ growthRates }),
    }),
};
