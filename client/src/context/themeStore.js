import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: 'light',
  isDarkMode: false,
  toggleTheme: () => {
    // Keep clean light mode as requested by user
    document.documentElement.classList.remove('dark');
    set({ theme: 'light', isDarkMode: false });
  },
  initTheme: () => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
    set({ theme: 'light', isDarkMode: false });
  }
}));

export default useThemeStore;

