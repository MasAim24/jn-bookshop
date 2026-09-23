import React, { useState, useEffect } from 'react';
import { BookOpen, Minus, Square, X, HardDrive, ShieldCheck, Sun, Moon } from 'lucide-react';

interface WindowsTitleBarProps {
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  theme: propTheme,
  toggleTheme: propToggleTheme
}) => {
  const [time, setTime] = useState<string>('');
  const [internalTheme, setInternalTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('jn_pos_theme') as 'dark' | 'light') || 'dark';
  });

  const theme = propTheme || internalTheme;
  const toggleTheme = propToggleTheme || (() => {
    setInternalTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('jn_pos_theme', theme);
  }, [theme]);

  const handleMinimize = () => {
    const win = window as any;
    if (win.electronAPI?.minimize) {
      win.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    const win = window as any;
    if (win.electronAPI?.maximize) {
      win.electronAPI.maximize();
    }
  };

  const handleClose = () => {
    const win = window as any;
    if (win.electronAPI?.close) {
      win.electronAPI.close();
    }
  };

  return (
    <header className="h-9 bg-slate-900 select-none text-slate-200 text-xs flex items-center justify-between px-3 border-b border-slate-800 z-50 sticky top-0">
      {/* Kiri: App Branding */}
      <div className="flex items-center space-x-2.5">
        <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-white shadow-xs">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-slate-100 tracking-wide">
          JN Book & Stationary Shop
        </span>
        <span className="text-slate-500 hidden sm:inline">|</span>
        <span className="text-slate-400 hidden sm:inline text-[11px]">
          Desktop POS & Manajemen Toko (v1.0.0 Windows)
        </span>
      </div>

      {/* Tengah: Status SQLite & Jam */}
      <div className="flex items-center space-x-3 text-[11px]">
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-medium">
          <HardDrive className="w-3 h-3 text-emerald-400" />
          <span>SQLite Local: Aktif</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>

        <div className="hidden md:flex items-center space-x-1 text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Offline Ready</span>
        </div>

        <div className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
          {time} WIB
        </div>
      </div>

      {/* Kanan: Theme Toggle & Windows Window Controls */}
      <div className="flex items-center space-x-2 -mr-1">
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Ganti ke Tampilan Terang' : 'Ganti ke Tampilan Gelap'}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-3 h-3 text-blue-300" />
              <span className="hidden sm:inline">Gelap</span>
            </>
          )}
        </button>

        <div className="flex items-center space-x-0.5">
          <button
            onClick={handleMinimize}
            title="Minimize"
            className="w-8 h-7 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            title="Maximize"
            className="w-8 h-7 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            title="Tutup Aplikasi"
            className="w-8 h-7 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
