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
  Copy, 
  Check, 
  FileJson, 
  Calendar, 
  Store, 
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';
import { dbService } from '../../services/db';
import { DatabaseBackup, BackupPreferences } from '../../types/pos';

interface DatabaseManagerViewProps {
  refreshData: () => void;
}

export const DatabaseManagerView: React.FC<DatabaseManagerViewProps> = ({ refreshData }) => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [backupPrefs, setBackupPrefs] = useState<BackupPreferences>(() => dbService.getBackupPreferences());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State untuk Modal Preview Restore
  const [pendingBackup, setPendingBackup] = useState<{ data: DatabaseBackup; fileName: string; rawJson: string } | null>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');

  const products = dbService.getProducts();
  const transactions = dbService.getTransactions();
  const shifts = dbService.getShifts();

  // Ekspor Database ke File JSON
  const handleExportDatabase = () => {
    const jsonStr = dbService.exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    link.download = `JN-Bookshop-Backup-${dateStr}-${timeStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setBackupPrefs(dbService.getBackupPreferences());
    setNotification({
      type: 'success',
      message: 'File cadangan JSON berhasil dibuat dan diunduh ke komputer Anda!'
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Salin JSON ke Clipboard
  const handleCopyJson = async () => {
    try {
      const jsonStr = dbService.exportDatabase();
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setBackupPrefs(dbService.getBackupPreferences());
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setNotification({
        type: 'error',
        message: 'Gagal menyalin ke clipboard. Izin browser tidak tersedia.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Deteksi File yang dipilih pengguna
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = event.target?.result as string;
        const parsed = JSON.parse(rawJson) as DatabaseBackup;

        if (!parsed.products || !Array.isArray(parsed.products)) {
          throw new Error('Format file tidak valid: Daftar produk tidak ditemukan');
        }

        // Tampilkan Modal Konfirmasi / Preview Restore
        setPendingBackup({
          data: parsed,
          fileName: file.name,
          rawJson
        });
        setRestoreMode('replace');
      } catch (err: any) {
        setNotification({
          type: 'error',
          message: `Gagal membaca file: ${err.message || 'Format JSON tidak valid'}`
        });
        setTimeout(() => setNotification(null), 4000);
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Eksekusi Restore setelah konfirmasi modal
  const handleConfirmRestore = () => {
    if (!pendingBackup) return;

    const res = dbService.importDatabase(pendingBackup.rawJson, restoreMode);
    if (res.success) {
      refreshData();
      setNotification({
        type: 'success',
        message: `${res.message} (${res.stats?.products || 0} barang, ${res.stats?.transactions || 0} transaksi diproses)`
      });
      setPendingBackup(null);
    } else {
      setNotification({
        type: 'error',
        message: res.message
      });
    }
    setTimeout(() => setNotification(null), 5000);
  };

  // Toggle Auto-Backup On Shift Close
  const handleToggleAutoBackup = (checked: boolean) => {
    const updated = { ...backupPrefs, autoBackupOnShiftClose: checked };
    setBackupPrefs(updated);
    dbService.saveBackupPreferences(updated);
    setNotification({
      type: 'success',
      message: checked 
        ? 'Pencadangan otomatis aktif saat Kasir Tutup Shift (Z-Report)!' 
        : 'Pencadangan otomatis dinonaktifkan.'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Reset ke Data Default Pabrik
  const handleFactoryReset = () => {
    if (confirm('PERINGATAN: Semua transaksi dan perubahan stok akan direset kembali ke data awal toko buku & ATK bawaan. Lanjutkan?')) {
      dbService.resetToFactoryDefaults();
      refreshData();
      setNotification({
        type: 'success',
        message: 'Database berhasil direset ke data katalog awal bawaan toko!'
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
          <span>Database Lokal, Pencadangan & Pemulihan (Backup & Restore JSON)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Data tersimpan secara persisten di mesin lokal. Buat cadangan teratur untuk mencegah kehilangan data jika komputer kasir bermasalah.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5 max-w-4xl">
        {/* Notifikasi Toast */}
        {notification && (
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 animate-fadeIn shadow-sm ${
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

        {/* Status Database & Ringkasan Entitas */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>Engine Database: Local SQLite & Storage Engine</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/70 text-emerald-300 border border-emerald-700/60 text-[10px] font-mono">
                    OFFLINE-READY
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cadangan Terakhir: </span>
                  <strong className="text-emerald-400 font-mono">
                    {backupPrefs.lastBackupDate 
                      ? new Date(backupPrefs.lastBackupDate).toLocaleString('id-ID')
                      : 'Belum pernah dicadangkan'
                    }
                  </strong>
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
              <span className="text-slate-400 text-[11px] block">Total Produk & Jasa</span>
              <div className="font-bold font-mono text-base text-slate-100 mt-1">
                {products.length} Entitas
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">Riwayat Transaksi Kasir</span>
              <div className="font-bold font-mono text-base text-emerald-400 mt-1">
                {transactions.length} Struk
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">Riwayat Shift Kas Laci</span>
              <div className="font-bold font-mono text-base text-blue-400 mt-1">
                {shifts.length} Shift Tercatat
              </div>
            </div>
          </div>
        </div>

        {/* Tindakan Backup & Restore Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Ekspor Cadangan Data (Backup) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center mb-3">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-100">1. Ekspor Cadangan Data (JSON Backup)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Unduh seluruh data produk, layanan jasa, riwayat transaksi, catatan kas laci, dan konfigurasi toko ke dalam satu berkas format JSON.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleExportDatabase}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Cadangan JSON</span>
              </button>

              <button
                type="button"
                onClick={handleCopyJson}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Teks JSON Berhasil Disalin!' : 'Salin JSON ke Clipboard'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Pulihkan Data dari File (Restore) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-100">2. Pulihkan Database dari File (Restore)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Pilih file cadangan sebelumnya untuk mengembalikan seluruh stok barang dan transaksi kasir pada komputer ini.
              </p>
            </div>

            <div className="pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.sqlite"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Berkas Cadangan (.JSON)</span>
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-2">
                Sistem akan menampilkan pratinjau data sebelum proses pemulihan dieksekusi.
              </p>
            </div>
          </div>
        </div>

        {/* Pengaturan Pencadangan Otomatis */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-200">Pencadangan Otomatis Saat Tutup Shift (Z-Report)</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Otomatis mengunduh file cadangan JSON harian setiap kali kasir menyelesaikan laporan tutup shift harian.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={backupPrefs.autoBackupOnShiftClose}
              onChange={(e) => handleToggleAutoBackup(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Zona Berbahaya: Reset Pabrik */}
        <div className="p-4 rounded-xl bg-slate-900 border border-rose-900/40 flex items-center justify-between shadow-xs">
          <div>
            <div className="font-semibold text-xs text-rose-300">Reset ke Data Bawaan Pabrik</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Menghapus transaksi uji coba dan mengembalikan katalog buku & ATK bawaan awal.
            </div>
          </div>

          <button
            type="button"
            onClick={handleFactoryReset}
            className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database</span>
          </button>
        </div>
      </div>

      {/* MODAL PRATINJAU PEMULIHAN (RESTORE PREVIEW MODAL) */}
      {pendingBackup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-100 space-y-4 p-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Pratinjau Berkas Cadangan</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{pendingBackup.fileName}</p>
              </div>
            </div>

            {/* Metadata File Cadangan */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Nama Usaha / Toko:</span>
                <span className="font-bold text-slate-100">{pendingBackup.data.storeProfile?.name || 'JN Bookshop'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Tanggal Dicadangkan:</span>
                <span className="font-mono text-slate-200">
                  {new Date(pendingBackup.data.exportedAt).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Versi Struktur:</span>
                <span className="font-mono text-emerald-400 font-semibold">{pendingBackup.data.version || '1.0.0'}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 font-mono text-center">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Barang/Jasa</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {pendingBackup.data.products?.length || 0}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Transaksi</span>
                  <span className="font-bold text-blue-400 text-sm">
                    {pendingBackup.data.transactions?.length || 0}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Shift Kasir</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {pendingBackup.data.shifts?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Pilihan Metode Pemulihan */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-300 block">Pilih Mode Pemulihan:</span>

              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  restoreMode === 'replace'
                    ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="restoreMode"
                  value="replace"
                  checked={restoreMode === 'replace'}
                  onChange={() => setRestoreMode('replace')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-100 block">Ganti Semua Data (Full Replace - Rekomendasi)</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Menghapus data sementara di komputer ini dan menggantikan seluruh produk, stok, dan riwayat transaksi dengan data file cadangan secara bersih.
                  </p>
                </div>
              </label>

              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  restoreMode === 'merge'
                    ? 'bg-blue-950/40 border-blue-600/80 text-blue-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="restoreMode"
                  value="merge"
                  checked={restoreMode === 'merge'}
                  onChange={() => setRestoreMode('merge')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-100 block">Gabungkan Data (Merge)</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Menyisipkan produk atau transaksi baru dari file cadangan tanpa menghapus data produk yang sudah ada di komputer saat ini.
                  </p>
                </div>
              </label>
            </div>

            {/* Tombol Aksi Modal */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPendingBackup(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmRestore}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Konfirmasi & Pulihkan Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
