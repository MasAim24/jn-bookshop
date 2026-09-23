import React from 'react';
import { 
  ShoppingCart, 
  Boxes, 
  BarChart3, 
  Printer, 
  Database, 
  Settings, 
  BookOpen,
  Lock,
  Unlock
} from 'lucide-react';

export type NavTab = 'pos' | 'inventory' | 'reports' | 'printer' | 'database' | 'settings';

interface SidebarNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  cartCount: number;
  lowStockCount: number;
  isOwnerUnlocked: boolean;
  onLock: () => void;
  onUnlockRequest: (targetTab?: NavTab) => void;
  isTabProtected: (tab: NavTab) => boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  lowStockCount,
  isOwnerUnlocked,
  onLock,
  onUnlockRequest,
  isTabProtected
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

  const handleTabClick = (tabId: NavTab) => {
    if (isTabProtected(tabId) && !isOwnerUnlocked) {
      onUnlockRequest(tabId);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none">
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
          const locked = isTabProtected(item.id) && !isOwnerUnlocked;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <div className="text-xs truncate flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {locked && (
                      <span title="Dilindungi PIN Owner">
                        <Lock className="w-3 h-3 text-amber-400 shrink-0 inline" />
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {item.sublabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {locked && !isActive && (
                  <span className="text-[9px] bg-slate-800 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                    PIN
                  </span>
                )}
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor} ml-1 shrink-0`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Security Status Card & Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold">
            {isOwnerUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs">Owner Aktif</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400 text-xs">Kasir Terkunci</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={isOwnerUnlocked ? onLock : () => onUnlockRequest()}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
              isOwnerUnlocked
                ? 'bg-rose-950/70 hover:bg-rose-900 border-rose-800 text-rose-300'
                : 'bg-emerald-950/70 hover:bg-emerald-900 border-emerald-700 text-emerald-300'
            }`}
          >
            {isOwnerUnlocked ? 'Kunci Akses' : 'Buka Kunci'}
          </button>
        </div>

        <div className="flex items-center justify-between text-slate-500 pt-1">
          <span>Versi Desktop</span>
          <span className="font-mono text-slate-400">v1.1.0 (Win64)</span>
        </div>
        <div className="flex items-center space-x-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          <span className="truncate text-[10px]">Database Lokal SQLite Siap</span>
        </div>
      </div>
    </aside>
  );
};
