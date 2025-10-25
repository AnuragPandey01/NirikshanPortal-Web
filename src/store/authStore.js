import { create } from "zustand";
import pb from "@/lib/pb";

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    set({ loading: true });
    try {
      // TODO: Implement login logic
      set({ user: session, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      // TODO: Implement logout logic
      localStorage.clear();
      set({ user: null, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));

export default useAuthStore;
