import { create } from 'zustand';
import { User } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (email: string, password: string) => {
    // Simulate API call
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'password') { // In real app, use proper password hashing
      set({ user });
      return true;
    }
    return false;
  },
  logout: () => set({ user: null }),
}));