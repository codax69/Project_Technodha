import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThemeToggle = ({ className = '', size = 'sm' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`rounded-2xl border transition-all duration-300 gap-2 font-bold cursor-pointer ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 text-amber-400 hover:bg-neutral-800 hover:text-amber-300'
          : 'bg-white border-cream-200 text-charcoal-900 hover:bg-cream-100 hover:text-coral-500'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
          <span className="text-xs">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-charcoal-700 animate-in spin-in-90 duration-300" />
          <span className="text-xs">Dark</span>
        </>
      )}
    </Button>
  );
};
