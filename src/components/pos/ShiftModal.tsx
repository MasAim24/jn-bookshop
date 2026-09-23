import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  History,
  FileSpreadsheet
} from 'lucide-react';
import { CashierShift, CashMovement, StoreProfile } from '../../types/pos';
import { dbService, formatRupiah } from '../../services/db';
import { soundService } from '../../services/sound';

interface ShiftModalProps {
  activeShift: CashierShift | null;
  storeProfile: StoreProfile;
  onClose: () => void;
  onShiftChange: () => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  activeShift,
  storeProfile,
  onClose,
  onShiftChange
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'movement' | 'close' | 'history'>('overview');

  // Form Buka Shift
  const [openCashierName, setOpenCashierName] = useState('Kasir 1');
  const [openStartingCash, setOpenStartingCash] = useState<number>(200000);
  const [openNotes, setOpenNotes] = useState('Modal kembalian pagi');

  // Form Kas Masuk/Keluar
  const [moveType, setMoveType] = useState<'in' | 'out'>('out');
  const [moveAmount, setMoveAmount] = useState<number>(0);
  const [moveCategory, setMoveCategory] = useState('Beli Perlengkapan Toko');
  const [moveNote, setMoveNote] = useState('');

  // Form Tutup Shift
  const [actualCash, setActualCash] = useState<number>(activeShift?.expectedCash || 0);
  const [closeNotes, setCloseNotes] = useState('');
  const [closedShiftResult, setClosedShiftResult] = useState<CashierShift | null>(null);

  // Data Mutasi Kas & Riwayat
  const movements = activeShift ? dbService.getCashMovementsForShift(activeShift.id) : [];
  const shiftHistory = dbService.getShifts();

  // Buka Shift Baru
  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (openStartingCash < 0) {
      alert('Modal awal tidak boleh kurang dari 0!');
      return;
    }
    soundService.playSuccess();
    dbService.startShift(openCashierName, openStartingCash, openNotes);
    onShiftChange();
  };

  // Simpan Mutasi Kas Masuk/Keluar
  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (moveAmount <= 0) {
      alert('Nominal harus lebih dari 0!');
      return;
    }
    soundService.playAdd();
    dbService.addCashMovement(moveType, moveAmount, moveCategory, moveNote);
    setMoveAmount(0);
    setMoveNote('');
    onShiftChange();
    setActiveTab('overview');
  };

  // Konfirmasi Tutup Shift
  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = confirm('Apakah Anda yakin ingin menutup shift kasir ini dan mencetak rekap kas?');
    if (!confirmed) return;

    soundService.playSuccess();
    const res = dbService.closeShift(actualCash, closeNotes);
    setClosedShiftResult(res);
    onShiftChange();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header Modal */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>Manajemen Shift & Kas Laci</span>
                {activeShift ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-mono font-bold">
                    Shift Aktif
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px] font-medium">
                    Shift Belum Dibuka
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Catat modal awal, kas kecil (petty cash), dan tutup shift kasir</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigasi Jika Shift Aktif */}
        {activeShift && !closedShiftResult && (
          <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Ringkasan Kas</span>
            </button>

            <button
              onClick={() => setActiveTab('movement')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'movement'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Kas Masuk / Keluar ({movements.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('close')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'close'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tutup Shift (Z-Report)</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ml-auto ${
                activeTab === 'history'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Riwayat Shift</span>
            </button>
          </div>
        )}

        {/* Isi Modal */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Kondisi 1: Shift Belum Dibuka */}
          {!activeShift && !closedShiftResult && (
            <form onSubmit={handleStartShift} className="space-y-4">
              <div className="p-4 rounded-xl pos-alert-amber bg-amber-500/15 dark:bg-amber-950/70 border border-amber-500/40 dark:border-amber-700/60 text-xs flex items-start gap-3 shadow-xs">
                <AlertCircle className="w-5 h-5 pos-alert-icon text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm pos-alert-title text-[#78350f] dark:text-amber-300">Shift Kasir Belum Dimulai</p>
                  <p className="mt-1 pos-alert-desc text-[#92400e] dark:text-amber-200 leading-relaxed font-medium">
                    Sebelum memulai transaksi penjualan kasir, masukkan nama kasir bertugas dan modal awal uang tunai di laci untuk keperluan uang kembalian.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Kasir Bertugas</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={openCashierName}
                    onChange={(e) => setOpenCashierName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    placeholder="Contoh: Budi (Kasir Pagi)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Modal Awal Uang Tunai di Laci (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  required
                  value={openStartingCash}
                  onChange={(e) => setOpenStartingCash(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xl font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex gap-2 mt-2">
                  {[100000, 200000, 300000, 500000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setOpenStartingCash(amt)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                    >
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={openNotes}
                  onChange={(e) => setOpenNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                  placeholder="Keterangan shift..."
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Buka Shift & Aktifkan Kasir</span>
                </button>
              </div>
            </form>
          )}

          {/* Kondisi 2: Shift Sedang Aktif - Tab Overview */}
          {activeShift && !closedShiftResult && activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Display Kas Laci Saat Ini */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-slate-200">{activeShift.cashierName}</span>
                    <span>• {activeShift.id}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Mulai: {new Date(activeShift.startTime).toLocaleTimeString('id-ID')} WIB</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Total Kas Tunai di Laci Saat Ini
                    </span>
                    <span className="text-[11px] text-emerald-400/80 font-mono">Modal + Penjualan + Mutasi</span>
                  </div>
                  <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                    {formatRupiah(activeShift.expectedCash)}
                  </div>
                </div>
              </div>

              {/* Rincian Komponen Kas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Modal Awal</span>
                  <span className="font-bold font-mono text-slate-200 text-sm mt-0.5 block">
                    {formatRupiah(activeShift.startingCash)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] text-emerald-400">+ Penjualan Tunai</span>
                  <span className="font-bold font-mono text-emerald-400 text-sm mt-0.5 block">
                    {formatRupiah(activeShift.cashSales)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] text-blue-400">+ Kas Masuk</span>
                  <span className="font-bold font-mono text-blue-400 text-sm mt-0.5 block">
                    {formatRupiah(activeShift.cashIn)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] text-rose-400">- Kas Keluar</span>
                  <span className="font-bold font-mono text-rose-400 text-sm mt-0.5 block">
                    {formatRupiah(activeShift.cashOut)}
                  </span>
                </div>
              </div>

              {/* Tombol Aksi Cepat */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('movement')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700/60 transition-colors"
                >
                  <ArrowDownRight className="w-4 h-4 text-amber-400" />
                  <span>Catat Kas Keluar / Masuk</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('close')}
                  className="p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 border border-rose-800/60 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-rose-400" />
                  <span>Tutup Shift Kasir</span>
                </button>
              </div>
            </div>
          )}

          {/* Kondisi 2: Tab Mutasi Kas Masuk / Keluar */}
          {activeShift && !closedShiftResult && activeTab === 'movement' && (
            <div className="space-y-4">
              <form onSubmit={handleSaveMovement} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Input Kas Masuk / Keluar Baru</h4>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMoveType('out')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      moveType === 'out'
                        ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Kas Keluar (Petty Cash)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMoveType('in')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      moveType === 'in'
                        ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Kas Masuk Tambahan</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nominal (Rp)</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      value={moveAmount || ''}
                      onChange={(e) => setMoveAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Kategori Keperluan</label>
                    <select
                      value={moveCategory}
                      onChange={(e) => setMoveCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Beli Perlengkapan Toko">Beli Perlengkapan Toko (Lakban/Kertas)</option>
                      <option value="Konsumsi / Makan Kasir">Konsumsi / Makan Kasir</option>
                      <option value="Setoran Uang ke Owner">Setoran Uang ke Owner</option>
                      <option value="Tambahan Uang Kembalian">Tambahan Uang Kembalian</option>
                      <option value="Biaya Parkir & Kurir">Biaya Parkir & Kurir</option>
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Keterangan / Alasan</label>
                  <input
                    type="text"
                    required
                    value={moveNote}
                    onChange={(e) => setMoveNote(e.target.value)}
                    placeholder="Contoh: Beli lakban coklat 2 roll untuk packing buku"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Simpan Mutasi Kas</span>
                </button>
              </form>

              {/* Tabel Riwayat Mutasi Kas */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-300">Daftar Mutasi Kas Shift Ini</h4>
                {movements.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-lg text-center">
                    Belum ada catatan kas masuk/keluar pada shift ini
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {movements.map(m => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded ${m.type === 'in' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                            {m.type === 'in' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          </span>
                          <div>
                            <p className="font-medium text-slate-200">{m.category}</p>
                            <p className="text-[11px] text-slate-500">{m.note} • {new Date(m.timestamp).toLocaleTimeString('id-ID')}</p>
                          </div>
                        </div>

                        <span className={`font-mono font-bold ${m.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {m.type === 'in' ? '+' : '-'}{formatRupiah(m.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kondisi 2: Tab Tutup Shift */}
          {activeShift && !closedShiftResult && activeTab === 'close' && (
            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Modal Awal:</span>
                  <span className="font-mono text-slate-200">{formatRupiah(activeShift.startingCash)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>+ Penjualan Tunai:</span>
                  <span className="font-mono">{formatRupiah(activeShift.cashSales)}</span>
                </div>
                <div className="flex justify-between text-xs text-blue-400">
                  <span>+ Kas Masuk Manual:</span>
                  <span className="font-mono">{formatRupiah(activeShift.cashIn)}</span>
                </div>
                <div className="flex justify-between text-xs text-rose-400">
                  <span>- Kas Keluar (Petty Cash):</span>
                  <span className="font-mono">-{formatRupiah(activeShift.cashOut)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                  <span className="text-slate-200">Uang Seharusnya di Laci (Expected):</span>
                  <span className="font-mono text-emerald-400">{formatRupiah(activeShift.expectedCash)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hitung Fisik Uang di Laci Kasir (Actual Cash)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={actualCash}
                  onChange={(e) => setActualCash(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-2xl font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Indikator Selisih Kas */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                actualCash === activeShift.expectedCash
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : actualCash > activeShift.expectedCash
                  ? 'bg-blue-950/40 border-blue-800 text-blue-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                <span className="font-medium">Status Selisih Kas:</span>
                <span className="font-mono font-bold text-sm">
                  {actualCash === activeShift.expectedCash ? (
                    'SEIMBANG / PAS (Rp 0)'
                  ) : actualCash > activeShift.expectedCash ? (
                    `SURPLUS / LEBIH: +${formatRupiah(actualCash - activeShift.expectedCash)}`
                  ) : (
                    `DEFISIT / KURANG: -${formatRupiah(activeShift.expectedCash - actualCash)}`
                  )}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Penutupan Shift</label>
                <input
                  type="text"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="Keterangan penutupan shift..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesaikan & Tutup Shift (Z-Report)</span>
              </button>
            </form>
          )}

          {/* Kondisi 2: Tab Riwayat Shift Lalu */}
          {activeShift && !closedShiftResult && activeTab === 'history' && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-200 mb-2">Riwayat Shift Sebelumnya</h4>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {shiftHistory.map(s => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{s.cashierName} ({s.id})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.status === 'open' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        {s.status === 'open' ? 'SEDANG AKTIF' : 'SELESAI'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                      <div>Modal: <span className="text-slate-200 font-semibold">{formatRupiah(s.startingCash)}</span></div>
                      <div>Penjualan: <span className="text-emerald-400 font-semibold">{formatRupiah(s.cashSales)}</span></div>
                      <div>Selisih: <span className={`font-semibold ${(s.difference || 0) < 0 ? 'text-rose-400' : 'text-slate-200'}`}>{formatRupiah(s.difference || 0)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kondisi 3: Hasil Tutup Shift Selesai (Z-Report Display) */}
          {closedShiftResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl pos-alert-emerald bg-emerald-500/15 dark:bg-emerald-950/70 border border-emerald-500/40 dark:border-emerald-800/80 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 pos-alert-icon text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="font-bold text-base pos-alert-title text-[#064e3b] dark:text-emerald-200">Shift Berhasil Ditutup</h4>
                <p className="text-xs pos-alert-desc text-[#065f46] dark:text-emerald-300">Rekapitulasi kas harian (Z-Report) telah dicatat</p>
              </div>

              {/* Tampilan Struk Z-Report Kasir */}
              <div className="bg-[#FAFAF9] text-[#1C1917] p-5 rounded-lg border border-stone-300 font-mono text-xs leading-relaxed max-w-sm mx-auto shadow-xl select-text">
                <div className="text-center pb-2 border-b border-dashed border-stone-400">
                  <div className="font-bold text-sm">{storeProfile.name}</div>
                  <div className="text-[10px] text-stone-600">LAPORAN PENUTUPAN SHIFT (Z-REPORT)</div>
                  <div className="text-[10px] text-stone-500">{new Date().toLocaleString('id-ID')}</div>
                </div>

                <div className="py-2.5 border-b border-dashed border-stone-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Kasir Bertugas:</span>
                    <span className="font-bold">{closedShiftResult.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>No Shift:</span>
                    <span>{closedShiftResult.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modal Awal:</span>
                    <span>{formatRupiah(closedShiftResult.startingCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penjualan Tunai:</span>
                    <span>+{formatRupiah(closedShiftResult.cashSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kas Masuk:</span>
                    <span>+{formatRupiah(closedShiftResult.cashIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kas Keluar:</span>
                    <span>-{formatRupiah(closedShiftResult.cashOut)}</span>
                  </div>
                </div>

                <div className="py-2 space-y-1 font-bold">
                  <div className="flex justify-between">
                    <span>Total Seharusnya:</span>
                    <span>{formatRupiah(closedShiftResult.expectedCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uang Fisik di Laci:</span>
                    <span>{formatRupiah(closedShiftResult.actualCash || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-dashed border-stone-400">
                    <span>Selisih:</span>
                    <span>{formatRupiah(closedShiftResult.difference || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Struk Rekap</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
