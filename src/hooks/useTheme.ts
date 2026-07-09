/**
 * 主题 hook：同步 store 状态到 <html class="dark">
 */
import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useTheme() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  return { theme, toggleTheme };
}
