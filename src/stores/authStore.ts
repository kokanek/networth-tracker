import { create } from 'zustand';
import { getAuthToken, setAuthToken } from '@/lib/auth';

interface AuthState {
    token: string;
    setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: getAuthToken(),
    setToken: (token) => {
        setAuthToken(token);
        set({ token });
    },
}));
