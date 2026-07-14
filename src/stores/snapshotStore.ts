import { create } from 'zustand';
import type { Snapshot, Asset } from '@/types';
import { api } from '@/lib/api';

interface SnapshotState {
  snapshots: Snapshot[];
  selectedId: string | null;
  loading: boolean;
  fetch: (user: string) => Promise<void>;
  create: (user: string, date: string, assets: Asset[]) => Promise<void>;
  update: (user: string, id: string, date: string, assets: Asset[]) => Promise<void>;
  remove: (user: string, id: string) => Promise<void>;
  select: (id: string | null) => void;
}

export const useSnapshotStore = create<SnapshotState>((set) => ({
  snapshots: [],
  selectedId: null,
  loading: false,

  fetch: async (user) => {
    set({ loading: true });
    const snapshots = await api.getSnapshots(user);
    set({ snapshots, loading: false, selectedId: snapshots.length ? snapshots[snapshots.length - 1]._id : null });
  },

  create: async (user, date, assets) => {
    const snapshot = await api.createSnapshot(user, { date, assets });
    set((s) => {
      const snapshots = [...s.snapshots, snapshot].sort((a, b) => a.date.localeCompare(b.date));
      return { snapshots, selectedId: snapshot._id };
    });
  },

  update: async (user, id, date, assets) => {
    const updated = await api.updateSnapshot(user, id, { date, assets });
    set((s) => ({
      snapshots: s.snapshots.map((snap) => (snap._id === id ? updated : snap)).sort((a, b) => a.date.localeCompare(b.date)),
    }));
  },

  remove: async (user, id) => {
    await api.deleteSnapshot(user, id);
    set((s) => {
      const snapshots = s.snapshots.filter((snap) => snap._id !== id);
      return { snapshots, selectedId: snapshots.length ? snapshots[snapshots.length - 1]._id : null };
    });
  },

  select: (id) => set({ selectedId: id }),
}));
