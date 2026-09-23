import React, { useState, useEffect } from 'react';
import { WindowsTitleBar } from './components/desktop/WindowsTitleBar';
import { SidebarNav, NavTab } from './components/desktop/SidebarNav';
import { POSTerminal } from './components/pos/POSTerminal';
import { InventoryManager } from './components/inventory/InventoryManager';
import { SalesReportView } from './components/reports/SalesReportView';
import { ThermalPrinterView } from './components/printer/ThermalPrinterView';
import { DatabaseManagerView } from './components/database/DatabaseManagerView';
import { StoreSettingsView } from './components/settings/StoreSettingsView';
import { PinAuthModal } from './components/auth/PinAuthModal';

import { ProductItem, POSTransaction, StoreProfile, SecurityConfig } from './types/pos';
import { dbService } from './services/db';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('pos');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(dbService.getStoreProfile());
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => dbService.getSecurityConfig());
  const [cartCount, setCartCount] = useState<number>(0);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('jn_pos_theme') as 'dark' | 'light') || 'dark';
  });

  // State Keamanan & Otorisasi PIN
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pendingTab, setPendingTab] = useState<NavTab | null>(null);

  // Sinkronisasi data dari DB lokal
  const refreshAllData = () => {
    setProducts(dbService.getProducts());
    setTransactions(dbService.getTransactions());
    setStoreProfile(dbService.getStoreProfile());
    setSecurityConfig(dbService.getSecurityConfig());
  };

  useEffect(() => {
    refreshAllData();
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

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Cek apakah suatu tab dilindungi PIN
  const isTabProtected = (tab: NavTab): boolean => {
    if (!securityConfig.enablePinProtection) return false;
    if (tab === 'reports') return securityConfig.protectReports;
    if (tab === 'inventory') return securityConfig.protectInventory;
    if (tab === 'database') return securityConfig.protectDatabase;
    if (tab === 'settings') return securityConfig.protectSettings;
    return false;
  };

  // Handler Navigasi Tab
  const handleSelectTab = (tab: NavTab) => {
    if (isTabProtected(tab) && !isOwnerUnlocked) {
      setPendingTab(tab);
      setIsPinModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Handler Sukses Verifikasi PIN
  const handlePinSuccess = () => {
    setIsOwnerUnlocked(true);
    setIsPinModalOpen(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  // Handler Kunci Sesi Kembali
  const handleLockSession = () => {
    setIsOwnerUnlocked(false);
    if (isTabProtected(activeTab)) {
      setActiveTab('pos');
    }
  };

  const lowStockCount = products.filter(p => p.stock <= p.minStockAlert).length;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none antialiased">
      {/* 1. Windows Desktop Custom Title Bar */}
      <WindowsTitleBar theme={theme} toggleTheme={toggleTheme} />

      {/* 2. Main App Content with Sidebar and Views */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          cartCount={cartCount}
          lowStockCount={lowStockCount}
          isOwnerUnlocked={isOwnerUnlocked}
          onLock={handleLockSession}
          onUnlockRequest={(targetTab) => {
            setPendingTab(targetTab || null);
            setIsPinModalOpen(true);
          }}
          isTabProtected={isTabProtected}
        />

        {/* Tab Content Display */}
        <main className="flex-1 flex overflow-hidden bg-slate-950">
          {activeTab === 'pos' && (
            <POSTerminal
              products={products}
              refreshData={refreshAllData}
              storeProfile={storeProfile}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager
              products={products}
              refreshData={refreshAllData}
              storeProfile={storeProfile}
            />
          )}

          {activeTab === 'reports' && (
            <SalesReportView
              transactions={transactions}
              storeProfile={storeProfile}
              refreshData={refreshAllData}
            />
          )}

          {activeTab === 'printer' && (
            <ThermalPrinterView
              storeProfile={storeProfile}
              refreshData={refreshAllData}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseManagerView
              refreshData={refreshAllData}
            />
          )}

          {activeTab === 'settings' && (
            <StoreSettingsView
              storeProfile={storeProfile}
              refreshData={refreshAllData}
            />
          )}
        </main>
      </div>

      {/* MODAL OTORISASI PIN OWNER */}
      <PinAuthModal
        isOpen={isPinModalOpen}
        onSuccess={handlePinSuccess}
        onCancel={() => {
          setIsPinModalOpen(false);
          setPendingTab(null);
        }}
        title={
          pendingTab === 'reports' ? 'Buka Laporan Penjualan (PIN)' :
          pendingTab === 'inventory' ? 'Buka Manajemen Stok (PIN)' :
          pendingTab === 'database' ? 'Buka Database & Backup (PIN)' :
          pendingTab === 'settings' ? 'Buka Pengaturan Toko (PIN)' :
          'Otorisasi Akses Manajer / Owner'
        }
        description="Masukkan PIN keamanan Owner untuk membuka menu ini dan menjaga kerahasiaan data toko."
      />
    </div>
  );
};

export default App;
