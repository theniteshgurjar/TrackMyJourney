import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: 'dark',
  isDarkMode: true,
  toggleTheme: () => {
    // Disabled toggle since we only want dark mode
    document.documentElement.classList.add('dark');
  },
  initTheme: () => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    set({ theme: 'dark', isDarkMode: true });
  }
}));

export default useThemeStore;
