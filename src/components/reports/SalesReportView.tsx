import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  Download, 
  Printer, 
  RotateCcw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  FileText,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import { POSTransaction, StoreProfile } from '../../types/pos';
import { dbService, formatRupiah } from '../../services/db';
import { ReceiptModal } from '../pos/ReceiptModal';

interface SalesReportViewProps {
  transactions: POSTransaction[];
  storeProfile: StoreProfile;
  refreshData: () => void;
}

export const SalesReportView: React.FC<SalesReportViewProps> = ({
  transactions,
  storeProfile,
  refreshData
}) => {
  const [dateFilter, setDateFilter] = useState<'today' | 'month' | 'all'>('today');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<POSTransaction | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filter transaksi berdasarkan rentang
  const filteredTransactions = transactions.filter(tx => {
    const txDate = tx.timestamp.split('T')[0];
    if (dateFilter === 'today') return txDate === todayStr;
    if (dateFilter === 'month') return txDate.startsWith(currentMonthStr);
    return true;
  });

  const completedTransactions = filteredTransactions.filter(tx => tx.status === 'completed');

  // KPI Calculations
  const totalOmzet = completedTransactions.reduce((acc, tx) => acc + tx.grandTotal, 0);
  const totalHPP = completedTransactions.reduce((acc, tx) => acc + tx.totalCostHPP, 0);
  const totalNetProfit = totalOmzet - totalHPP;
  const totalTxCount = completedTransactions.length;
  const totalItemsSold = completedTransactions.reduce((acc, tx) => acc + tx.totalItemsCount, 0);

  // Rekap Metode Bayar
  const paymentTotals = {
    cash: completedTransactions.filter(t => t.paymentMethod === 'cash').reduce((a, b) => a + b.grandTotal, 0),
    qris: completedTransactions.filter(t => t.paymentMethod === 'qris').reduce((a, b) => a + b.grandTotal, 0),
    debit: completedTransactions.filter(t => t.paymentMethod === 'debit').reduce((a, b) => a + b.grandTotal, 0),
    transfer: completedTransactions.filter(t => t.paymentMethod === 'transfer').reduce((a, b) => a + b.grandTotal, 0),
  };

  // Top 5 Produk Terlaris
  const productQtyMap: Record<string, { name: string; qty: number; total: number; type: string }> = {};
  for (const tx of completedTransactions) {
    for (const it of tx.items) {
      if (!productQtyMap[it.product.id]) {
        productQtyMap[it.product.id] = {
          name: it.product.name,
          qty: 0,
          total: 0,
          type: it.product.type
        };
      }
      productQtyMap[it.product.id].qty += it.quantity;
      productQtyMap[it.product.id].total += it.subtotal;
    }
  }

  const topProducts = Object.values(productQtyMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Batalkan / Refund Transaksi
  const handleRefund = (txId: string) => {
    if (confirm(`Apakah Anda yakin ingin membatalkan transaksi ${txId}? Stok barang akan dikembalikan ke inventaris.`)) {
      const ok = dbService.refundTransaction(txId);
      if (ok) {
        alert('Transaksi berhasil dibatalkan dan stok telah dikembalikan.');
        refreshData();
      }
    }
  };

  // Ekspor CSV Laporan Penjualan
  const handleExportCSV = () => {
    const headers = ['No Nota', 'Waktu', 'Kasir', 'Pelanggan', 'Jumlah Item', 'Subtotal', 'Diskon', 'Grand Total', 'Metode Bayar', 'Status'];
    const rows = filteredTransactions.map(t => [
      `"${t.id}"`,
      `"${new Date(t.timestamp).toLocaleString('id-ID')}"`,
      `"${t.cashierName}"`,
      `"${t.customerName || '-'}"`,
      t.totalItemsCount,
      t.subtotal,
      t.discountTotal,
      t.grandTotal,
      t.paymentMethod.toUpperCase(),
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan-Penjualan-${dateFilter}-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header & Range Filter */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Laporan & Analitika Penjualan</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pantau total omzet harian, bulanan, keuntungan bersih, dan riwayat transaksi kasir
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Unduh CSV</span>
            </button>

            {/* Filter Rentang Tanggal */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  dateFilter === 'today'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  dateFilter === 'month'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bulan Ini
              </button>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  dateFilter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua Waktu
              </button>
            </div>
          </div>
        </div>

        {/* 4 Kartu KPI Keuangan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Omzet */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Omzet Penjualan</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1 truncate">
              {formatRupiah(totalOmzet)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {dateFilter === 'today' ? 'Omzet Penjualan Hari Ini' : 'Akumulasi Omzet Periode'}
            </div>
          </div>

          {/* Laba Bersih */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Keuntungan Bersih (Profit)</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold font-mono text-blue-400 mt-1 truncate">
              {formatRupiah(totalNetProfit)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Omzet - Total Modal HPP
            </div>
          </div>

          {/* Total Transaksi */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Jumlah Transaksi</span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold font-mono text-purple-400 mt-1">
              {totalTxCount} <span className="text-xs font-normal text-slate-500">struk</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Rata-rata: {totalTxCount > 0 ? formatRupiah(Math.round(totalOmzet / totalTxCount)) : 'Rp 0'}
            </div>
          </div>

          {/* Total Barang Terjual */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Barang Terjual</span>
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {totalItemsSold} <span className="text-xs font-normal text-slate-500">unit</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Buku & Produk ATK
            </div>
          </div>
        </div>

        {/* Breakdown Pembayaran & Top 5 Produk Terlaris */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Rekap Pembayaran */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <span className="font-semibold text-slate-300">Ringkasan Metode Pembayaran</span>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-850 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tunai (Cash)</span>
                </span>
                <span className="font-bold text-emerald-400">{formatRupiah(paymentTotals.cash)}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-850 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>QRIS</span>
                </span>
                <span className="font-bold text-blue-400">{formatRupiah(paymentTotals.qris)}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-850 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>EDC / Kartu</span>
                </span>
                <span className="font-bold text-amber-400">{formatRupiah(paymentTotals.debit)}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-850 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                  <span>Transfer</span>
                </span>
                <span className="font-bold text-purple-400">{formatRupiah(paymentTotals.transfer)}</span>
              </div>
            </div>
          </div>

          {/* Top 5 Produk Terlaris */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <span className="font-semibold text-slate-300">5 Produk Paling Laris (Best Seller)</span>
            <div className="space-y-1.5 pt-1">
              {topProducts.length === 0 ? (
                <p className="text-slate-500 py-2">Belum ada data transaksi di periode ini.</p>
              ) : (
                topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 truncate max-w-[240px]">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="truncate text-slate-200">{p.name}</span>
                    </div>
                    <div className="font-mono text-slate-300 flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">{p.qty} terjual</span>
                      <span className="text-slate-500">({formatRupiah(p.total)})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Transaksi */}
      <div className="flex-1 overflow-auto p-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/50">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">No. Nota</th>
                <th className="py-3 px-3">Waktu Transaksi</th>
                <th className="py-3 px-3">Pelanggan</th>
                <th className="py-3 px-3">Kasir</th>
                <th className="py-3 px-3 text-center">Item</th>
                <th className="py-3 px-3 text-right">Total Tagihan</th>
                <th className="py-3 px-3">Metode</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Belum ada riwayat transaksi pada periode yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isRefunded = tx.status === 'refunded';

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-850/60 transition-colors ${
                        isRefunded ? 'opacity-50 line-through' : ''
                      }`}
                    >
                      {/* No Nota */}
                      <td className="py-3 px-3 font-mono font-semibold text-slate-200 text-[11px]">
                        {tx.id}
                      </td>

                      {/* Waktu */}
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(tx.timestamp).toLocaleString('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>

                      {/* Pelanggan */}
                      <td className="py-3 px-3 text-slate-300">
                        {tx.customerName || <span className="text-slate-500">-</span>}
                      </td>

                      {/* Kasir */}
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {tx.cashierName}
                      </td>

                      {/* Item */}
                      <td className="py-3 px-3 text-center font-mono">
                        {tx.totalItemsCount}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        {formatRupiah(tx.grandTotal)}
                      </td>

                      {/* Metode */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                          {tx.paymentMethod}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          isRefunded
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/50'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                        }`}>
                          {isRefunded ? 'Dibatalkan' : 'Selesai'}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTxForReceipt(tx)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Cetak Ulang Struk (Reprint)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {!isRefunded && (
                            <button
                              onClick={() => handleRefund(tx.id)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Batalkan / Void Transaksi"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cetak Ulang Struk */}
      {selectedTxForReceipt && (
        <ReceiptModal
          transaction={selectedTxForReceipt}
          storeProfile={storeProfile}
          onClose={() => setSelectedTxForReceipt(null)}
        />
      )}
    </div>
  );
};
