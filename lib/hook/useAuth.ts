"use client";

import { create } from "zustand";

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  fullname: string;
  roleId?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
