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
  loading: boolean; // Thêm loading state
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void; // Thêm action để update loading
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true, // Giá trị mặc định là true vì lúc khởi tạo app thường cần check auth
  login: (user, token) => set({ user, token, loading: false }), // Tự động set loading false khi login
  logout: () => set({ user: null, token: null, loading: false }), // Tự động set loading false khi logout
  setLoading: (loading) => set({ loading }) // Action để manually set loading state
}));