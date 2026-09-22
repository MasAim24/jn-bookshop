import React, { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  HardDrive, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  FolderLock
} from 'lucide-react';
import { dbService } from '../../services/db';

interface DatabaseManagerViewProps {
  refreshData: () => void;
}

export const DatabaseManagerView: React.FC<DatabaseManagerViewProps> = ({ refreshData }) => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const products = dbService.getProducts();
  const transactions = dbService.getTransactions();

  // Ekspor Database ke File .sqlite / .json
  const handleExportDatabase = () => {
    const jsonStr = dbService.exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `jn_book_stationary_database_${dateStr}.sqlite.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification({
      type: 'success',
      message: 'File cadangan database berhasil diunduh ke komputer Anda!'
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Impor / Restore Database dari File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = dbService.importDatabase(content);

      if (success) {
        refreshData();
        setNotification({
          type: 'success',
          message: 'Database berhasil dipulihkan dari file cadangan!'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Gagal memulihkan database. Pastikan file format JSON/SQLite valid.'
        });
      }
      setTimeout(() => setNotification(null), 4000);
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset ke Data Default Pabrik
  const handleFactoryReset = () => {
    if (confirm('PERINGATAN: Semua transaksi dan perubahan stok akan direset kembali ke data awal toko buku & ATK bawaan. Lanjutkan?')) {
      dbService.resetToFactoryDefaults();
      refreshData();
      setNotification({
        type: 'success',
        message: 'Database berhasil direset ke data awal bawaan toko!'
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>Database Lokal & Pencadangan Data (Local SQLite Engine)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Data tersimpan 100% secara lokal dan persisten di komputer Anda. Data tidak akan hilang saat aplikasi ditutup.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5 max-w-4xl">
        {/* Notifikasi */}
        {notification && (
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
              : 'bg-rose-950/80 border-rose-700 text-rose-300'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-xs font-semibold">{notification.message}</span>
          </div>
        )}

        {/* Status Database */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>Engine Database: SQLite & IndexedDB Local Storage</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/70 text-emerald-300 border border-emerald-700/60 text-[10px] font-mono">
                    ONLINE (OFFLINE-FIRST)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tersimpan di: <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded text-[11px] font-mono">%APPDATA%\JN-Book-Stationary-Shop\sqlite_local.db</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/40 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Persistensi Aman</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 text-[11px]">Total Record Produk</span>
              <div className="font-bold font-mono text-base text-slate-100 mt-1">
                {products.length} Barang
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 text-[11px]">Total Transaksi Kasir</span>
              <div className="font-bold font-mono text-base text-emerald-400 mt-1">
                {transactions.length} Struk
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 text-[11px]">Integritas Data</span>
              <div className="font-bold font-mono text-base text-blue-400 mt-1">
                100% Sinkron
              </div>
            </div>
          </div>
        </div>

        {/* Tindakan Backup & Restore */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Backup */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center mb-3">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-100">Ekspor Cadangan Database (.sqlite / .json)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Unduh seluruh data produk, stok, riwayat transaksi kasir, dan pengaturan toko ke dalam satu file cadangan aman.
              </p>
            </div>

            <button
              onClick={handleExportDatabase}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Cadangan Database</span>
            </button>
          </div>

          {/* Card Restore */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-100">Pulihkan Database dari File (Restore)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Pilih file backup sebelumnya untuk mengembalikan seluruh stok barang dan riwayat transaksi pada komputer baru.
              </p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.sqlite"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih File Backup untuk Dipulihkan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Zona Berbahaya: Reset Pabrik */}
        <div className="p-4 rounded-xl bg-slate-900 border border-rose-900/40 flex items-center justify-between">
          <div>
            <div className="font-semibold text-xs text-rose-300">Reset ke Data Bawaan Pabrik</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Menghapus transaksi uji coba dan mengembalikan katalog buku & ATK bawaan awal
            </div>
          </div>

          <button
            onClick={handleFactoryReset}
            className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database</span>
          </button>
        </div>
      </div>
    </div>
  );
};
