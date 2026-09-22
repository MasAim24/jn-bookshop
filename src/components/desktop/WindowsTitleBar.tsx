import React, { useState, useEffect } from 'react';
import { BookOpen, Minus, Square, X, HardDrive, Wifi, ShieldCheck } from 'lucide-react';

export const WindowsTitleBar: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

      {/* Kanan: Windows Window Controls */}
      <div className="flex items-center space-x-1 -mr-2">
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
    </header>
  );
};
