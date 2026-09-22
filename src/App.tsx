import React, { useState, useEffect } from 'react';
import { WindowsTitleBar } from './components/desktop/WindowsTitleBar';
import { SidebarNav, NavTab } from './components/desktop/SidebarNav';
import { POSTerminal } from './components/pos/POSTerminal';
import { InventoryManager } from './components/inventory/InventoryManager';
import { SalesReportView } from './components/reports/SalesReportView';
import { ThermalPrinterView } from './components/printer/ThermalPrinterView';
import { DatabaseManagerView } from './components/database/DatabaseManagerView';
import { StoreSettingsView } from './components/settings/StoreSettingsView';

import { ProductItem, POSTransaction, StoreProfile } from './types/pos';
import { dbService } from './services/db';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('pos');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(dbService.getStoreProfile());
  const [cartCount, setCartCount] = useState<number>(0);

  // Sinkronisasi data dari DB lokal
  const refreshAllData = () => {
    setProducts(dbService.getProducts());
    setTransactions(dbService.getTransactions());
    setStoreProfile(dbService.getStoreProfile());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const lowStockCount = products.filter(p => p.stock <= p.minStockAlert).length;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none antialiased">
      {/* 1. Windows Desktop Custom Title Bar */}
      <WindowsTitleBar />

      {/* 2. Main App Content with Sidebar and Views */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartCount={cartCount}
          lowStockCount={lowStockCount}
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
    </div>
  );
};

export default App;
