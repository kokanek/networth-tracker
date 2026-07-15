import type { Asset, Snapshot } from '@/types';
import { getAuthToken } from '@/lib/auth';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
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
};
