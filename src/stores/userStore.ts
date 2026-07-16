import { create } from 'zustand';
import type { User } from '@/lib/constants';

interface UserState {
  activeUser: User;
  setActiveUser: (user: User) => void;
}

export const useUserStore = create<UserState>((set) => ({
  activeUser: 'Kapeel',
  setActiveUser: (activeUser) => set({ activeUser }),
}));
