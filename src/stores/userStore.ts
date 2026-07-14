import { create } from 'zustand';
import type { User } from '@/lib/constants';

interface UserState {
  activeUser: User;
  setActiveUser: (user: User) => void;
}

export const useUserStore = create<UserState>((set) => ({
  activeUser: 'kapeel',
  setActiveUser: (activeUser) => set({ activeUser }),
}));
