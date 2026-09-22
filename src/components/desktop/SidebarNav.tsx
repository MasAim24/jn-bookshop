import React from 'react';
import { 
  ShoppingCart, 
  Boxes, 
  BarChart3, 
  Printer, 
  Database, 
  Settings, 
  AlertTriangle,
  BookOpen
} from 'lucide-react';

export type NavTab = 'pos' | 'inventory' | 'reports' | 'printer' | 'database' | 'settings';

interface SidebarNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  cartCount: number;
  lowStockCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  lowStockCount
}) => {
  const navItems = [
    {
      id: 'pos' as NavTab,
      label: 'Kasir (POS)',
      sublabel: 'Transaksi & Struk',
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : undefined,
      badgeColor: 'bg-emerald-500 text-white'
    },
    {
      id: 'inventory' as NavTab,
      label: 'Stok & Inventaris',
      sublabel: 'Buku & Alat Tulis',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Alert` : undefined,
      badgeColor: 'bg-amber-500 text-slate-900 font-semibold'
    },
    {
      id: 'reports' as NavTab,
      label: 'Laporan Penjualan',
      sublabel: 'Omzet & Keuntungan',
      icon: BarChart3
    },
    {
      id: 'printer' as NavTab,
      label: 'Printer Termal',
      sublabel: 'Ukuran 58mm / 80mm',
      icon: Printer
    },
    {
      id: 'database' as NavTab,
      label: 'Database Lokal',
      sublabel: 'SQLite & Backup',
      icon: Database
    },
    {
      id: 'settings' as NavTab,
      label: 'Pengaturan Toko',
      sublabel: 'Profil & Pajak',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
      {/* Store Banner */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40">
        <div className="w-10 h-10 rounded-lg bg-emerald-600/90 text-white flex items-center justify-center shadow-md">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-100 text-sm leading-tight truncate">
            JN Book & Stationary
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            POS Terminal Kasir
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <div className="text-xs truncate">{item.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor} ml-2 shrink-0`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Versi Desktop</span>
          <span className="font-mono text-slate-300">v1.0.0 (Win64)</span>
        </div>
        <div className="flex items-center space-x-1.5 mt-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          <span className="truncate">Database Lokal SQLite Siap</span>
        </div>
      </div>
    </aside>
  );
};
