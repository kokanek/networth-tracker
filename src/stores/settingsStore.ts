import { create } from 'zustand';
import type { GrowthRates } from '@/types';
import { api } from '@/lib/api';
import { DEFAULT_GROWTH_RATES } from '@/lib/constants';

interface SettingsState {
  growthRates: GrowthRates;
  loading: boolean;
  fetch: (user: string) => Promise<void>;
  update: (user: string, growthRates: GrowthRates) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  growthRates: DEFAULT_GROWTH_RATES,
  loading: false,

  fetch: async (user) => {
    set({ loading: true });
    const settings = await api.getSettings(user);
    set({ growthRates: settings.growthRates, loading: false });
  },

  update: async (user, growthRates) => {
    await api.updateSettings(user, growthRates);
    set({ growthRates });
  },
}));
