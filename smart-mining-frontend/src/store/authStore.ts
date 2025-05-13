import { create } from "zustand";
import { User } from "../types";
import axios from "axios";

// API base URL - change this to your Laravel API URL
const API_URL = "http://localhost:8000/api";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      const { user, token } = response.data;

      // Save token to localStorage for persistence
      localStorage.setItem("token", token);

      // Set axios default header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({ user, token, loading: false });
      return true;
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.message || "Login failed",
      });
      return false;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      // Call logout API if token exists
      if (get().token) {
        try {
          await axios.post(
            `${API_URL}/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
            }
          );
        } catch (logoutError) {
          console.warn("API logout failed, continuing with local logout", logoutError);
        }
      }

      // Remove token from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("auth-storage");

      // Remove default header
      delete axios.defaults.headers.common["Authorization"];

      set({ user: null, token: null, loading: false, error: null });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, clear local state
      localStorage.removeItem("token");
      localStorage.removeItem("auth-storage");
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, token: null, loading: false });
    }
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) return false;

    set({ loading: true });
    try {
      // Set the auth header for this request
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get(`${API_URL}/user`);
      set({ user: response.data.user, loading: false });
      return true;
    } catch (error) {
      // If auth check fails, clear token
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, token: null, loading: false });
      return false;
    }
  },
}));
