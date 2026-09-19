import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full border border-border-light dark:border-border-dark flex items-center justify-center bg-white/80 dark:bg-[#1A1A1E]/80 hover:bg-accent/10 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-sm"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Dark mode (click to switch to Light mode)' : 'Light mode (click to switch to Dark mode)'}
    >
      {theme === 'dark' ? (
        <Moon size={18} className="text-ink-dark" />
      ) : (
        <Sun size={18} className="text-amber-500" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;