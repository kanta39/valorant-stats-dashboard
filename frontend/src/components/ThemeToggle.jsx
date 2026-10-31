import { useState, useEffect } from 'react';

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
      return document.documentElement.classList.contains('light') ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'theme' && e.newValue) {
        applyTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    const meta = document.querySelector('meta[name="color-scheme"]');

    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      if (meta) meta.content = 'light';
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      if (meta) meta.content = 'dark';
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  };

  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isLight ? 'สลับเป็นโหมดมืด (Dark Mode)' : 'สลับเป็นโหมดสว่าง (Light Mode)'}
      aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer select-none border shadow-sm ${
        isLight
          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 shadow-slate-200/50'
          : 'bg-gray-900/90 hover:bg-gray-800 text-gray-200 border-gray-700/80 hover:border-gray-600 shadow-black/40'
      } ${className}`}
    >
      {/* Animated icon indicator */}
      <span className="relative flex items-center justify-center w-5 h-5">
        {isLight ? (
          <span className="text-amber-500 text-sm transform transition-transform duration-300 rotate-0">
            ☀️
          </span>
        ) : (
          <span className="text-blue-400 text-sm transform transition-transform duration-300 -rotate-12">
            🌙
          </span>
        )}
      </span>

      <span className="font-extrabold tracking-wider uppercase text-[11px]">
        {isLight ? 'โหมดสว่าง' : 'โหมดมืด'}
      </span>

      {/* Mini toggle switch pill */}
      <div
        className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
          isLight ? 'bg-amber-400 justify-end' : 'bg-gray-700 justify-start'
        }`}
      >
        <div className="w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300"></div>
      </div>
    </button>
  );
}
