import React, { useState, useMemo } from 'react';
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
  QrCode,
  BookOpen,
  PenTool,
  Clock,
  ArrowUpRight,
  Filter,
  Percent
} from 'lucide-react';
import { POSTransaction, StoreProfile } from '../../types/pos';
import { dbService, formatRupiah } from '../../services/db';
import { ReceiptModal } from '../pos/ReceiptModal';

interface SalesReportViewProps {
  transactions: POSTransaction[];
  storeProfile: StoreProfile;
  refreshData: () => void;
}

type DateFilterType = 'today' | 'yesterday' | 'week' | 'month' | 'custom' | 'all';

export const SalesReportView: React.FC<SalesReportViewProps> = ({
  transactions,
  storeProfile,
  refreshData
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<POSTransaction | null>(null);

  // Kustom Tanggal
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(todayObj.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const yesterdayObj = new Date();
  yesterdayObj.setDate(todayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  const currentMonthPrefix = todayStr.substring(0, 7);

  const [customStartDate, setCustomStartDate] = useState(sevenDaysAgoStr);
  const [customEndDate, setCustomEndDate] = useState(todayStr);

  // Filter transaksi berdasarkan rentang tanggal
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = tx.timestamp.split('T')[0];
      if (dateFilter === 'today') return txDate === todayStr;
      if (dateFilter === 'yesterday') return txDate === yesterdayStr;
      if (dateFilter === 'week') return txDate >= sevenDaysAgoStr && txDate <= todayStr;
      if (dateFilter === 'month') return txDate.startsWith(currentMonthPrefix);
      if (dateFilter === 'custom') {
        const start = customStartDate || '1970-01-01';
        const end = customEndDate || '2099-12-31';
        return txDate >= start && txDate <= end;
      }
      return true; // 'all'
    });
  }, [transactions, dateFilter, customStartDate, customEndDate, todayStr, yesterdayStr, sevenDaysAgoStr, currentMonthPrefix]);

  const completedTransactions = useMemo(() => {
    return filteredTransactions.filter(tx => tx.status === 'completed');
  }, [filteredTransactions]);

  // KPI Calculations
  const totalOmzet = completedTransactions.reduce((acc, tx) => acc + tx.grandTotal, 0);
  const totalHPP = completedTransactions.reduce((acc, tx) => acc + tx.totalCostHPP, 0);
  const totalNetProfit = totalOmzet - totalHPP;
  const marginPercentage = totalOmzet > 0 ? Math.round((totalNetProfit / totalOmzet) * 100) : 0;
  const totalTxCount = completedTransactions.length;
  const totalItemsSold = completedTransactions.reduce((acc, tx) => acc + tx.totalItemsCount, 0);
  const totalDiscountGiven = completedTransactions.reduce((acc, tx) => acc + tx.discountTotal, 0);
  const avgBasketSize = totalTxCount > 0 ? Math.round(totalOmzet / totalTxCount) : 0;

  // Rekap Metode Bayar
  const paymentTotals = useMemo(() => ({
    cash: completedTransactions.filter(t => t.paymentMethod === 'cash').reduce((a, b) => a + b.grandTotal, 0),
    qris: completedTransactions.filter(t => t.paymentMethod === 'qris').reduce((a, b) => a + b.grandTotal, 0),
    debit: completedTransactions.filter(t => t.paymentMethod === 'debit').reduce((a, b) => a + b.grandTotal, 0),
    transfer: completedTransactions.filter(t => t.paymentMethod === 'transfer').reduce((a, b) => a + b.grandTotal, 0),
  }), [completedTransactions]);

  // Analitika Kategori: Buku vs Alat Tulis (ATK) vs Layanan & Jasa
  const categoryStats = useMemo(() => {
    let bukuOmzet = 0;
    let bukuQty = 0;
    let atkOmzet = 0;
    let atkQty = 0;
    let jasaOmzet = 0;
    let jasaQty = 0;

    for (const tx of completedTransactions) {
      for (const item of tx.items) {
        if (item.product.type === 'buku') {
          bukuOmzet += item.subtotal;
          bukuQty += item.quantity;
        } else if (item.product.type === 'jasa') {
          jasaOmzet += item.subtotal;
          jasaQty += item.quantity;
        } else {
          atkOmzet += item.subtotal;
          atkQty += item.quantity;
        }
      }
    }

    const totalCatOmzet = bukuOmzet + atkOmzet + jasaOmzet;
    const bukuPercent = totalCatOmzet > 0 ? Math.round((bukuOmzet / totalCatOmzet) * 100) : 0;
    const atkPercent = totalCatOmzet > 0 ? Math.round((atkOmzet / totalCatOmzet) * 100) : 0;
    const jasaPercent = totalCatOmzet > 0 ? Math.max(0, 100 - (bukuPercent + atkPercent)) : 0;

    return {
      buku: { omzet: bukuOmzet, qty: bukuQty, percent: bukuPercent },
      atk: { omzet: atkOmzet, qty: atkQty, percent: atkPercent },
      jasa: { omzet: jasaOmzet, qty: jasaQty, percent: jasaPercent }
    };
  }, [completedTransactions]);

  // Analitika Jam Sibuk Transaksi (Hourly Distribution)
  const hourlyData = useMemo(() => {
    const hoursCount: Record<number, number> = {};
    for (let h = 8; h <= 21; h++) {
      hoursCount[h] = 0;
    }
    for (const tx of completedTransactions) {
      const date = new Date(tx.timestamp);
      const hour = date.getHours();
      if (hour >= 8 && hour <= 21) {
        hoursCount[hour] = (hoursCount[hour] || 0) + 1;
      }
    }
    const maxHourCount = Math.max(...Object.values(hoursCount), 1);
    return { hoursCount, maxHourCount };
  }, [completedTransactions]);

  // Tren Harian (Grafik Batang Bar Chart)
  const dailyChartData = useMemo(() => {
    const map: Record<string, { date: string; omzet: number; count: number }> = {};

    // Kumpulkan per tanggal
    for (const tx of completedTransactions) {
      const d = tx.timestamp.split('T')[0];
      if (!map[d]) {
        map[d] = { date: d, omzet: 0, count: 0 };
      }
      map[d].omzet += tx.grandTotal;
      map[d].count += 1;
    }

    // Urutkan berdasarkan tanggal menaik
    const list = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));

    // Jika kosong, sediakan minimal hari ini
    if (list.length === 0) {
      list.push({ date: todayStr, omzet: 0, count: 0 });
    }

    const maxOmzet = Math.max(...list.map(d => d.omzet), 100000);
    return { list, maxOmzet };
  }, [completedTransactions, todayStr]);

  // Top 5 Produk Terlaris
  const topProducts = useMemo(() => {
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
    return Object.values(productQtyMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [completedTransactions]);

  // Batalkan / Refund Transaksi
  const handleRefund = (txId: string) => {
    if (confirm(`Apakah Anda yakin ingin membatalkan transaksi ${txId}? Stok barang akan otomatis dikembalikan ke inventaris.`)) {
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
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 space-y-4 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Laporan & Analitika Penjualan Toko</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pantau omzet berkala, laba kotor/bersih, grafik tren harian, perbandingan Buku vs ATK, dan jam sibuk kasir
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Unduh CSV</span>
            </button>

            {/* Filter Rentang Tanggal Cepat */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setDateFilter('today')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  dateFilter === 'today'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('yesterday')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  dateFilter === 'yesterday'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kemarin
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('week')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  dateFilter === 'week'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('month')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  dateFilter === 'month'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('custom')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  dateFilter === 'custom'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kustom
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('all')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  dateFilter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua
              </button>
            </div>
          </div>
        </div>

        {/* Input Rentang Tanggal Kustom (Jika memilih Kustom) */}
        {dateFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-950 border border-emerald-500/40 animate-fadeIn text-xs">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Pilih Rentang Tanggal:</span>
            </span>

            <div className="flex items-center gap-2">
              <label className="text-slate-400">Dari:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-slate-400">Sampai:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <span className="text-slate-500 ml-auto">
              Menampilkan {completedTransactions.length} transaksi pada rentang ini
            </span>
          </div>
        )}

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
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{completedTransactions.length} struk berhasil</span>
              <span className="text-emerald-400 font-semibold font-mono">Margin {marginPercentage}%</span>
            </div>
          </div>

          {/* Laba Bersih */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Keuntungan Kotor (Profit)</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold font-mono text-blue-400 mt-1 truncate">
              {formatRupiah(totalNetProfit)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Modal HPP: {formatRupiah(totalHPP)}
            </div>
          </div>

          {/* Rata-rata Struk */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Rata-rata Belanja (Basket)</span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold font-mono text-purple-400 mt-1 truncate">
              {formatRupiah(avgBasketSize)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Diskon Diberikan: {formatRupiah(totalDiscountGiven)}
            </div>
          </div>

          {/* Total Barang Terjual */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Fisik Terjual</span>
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {totalItemsSold} <span className="text-xs font-normal text-slate-500">unit</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              Buku ({categoryStats.buku.qty}) • ATK ({categoryStats.atk.qty}) • Jasa ({categoryStats.jasa.qty})
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: Scrollable Analitik & Tabel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Row Visual Charts: Tren Penjualan Harian & Komparasi Kategori */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Grafik Batang SVG: Tren Penjualan Harian (7 Kolom) */}
          <div className="lg:col-span-7 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  Grafik Tren Omzet Penjualan Harian
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Puncak: {formatRupiah(dailyChartData.maxOmzet)}
              </span>
            </div>

            {/* Visual SVG Bar Chart */}
            <div className="h-44 w-full flex items-end gap-2 pt-4 px-2 border-b border-slate-800">
              {dailyChartData.list.map((item, idx) => {
                const heightPercent = Math.max(8, Math.round((item.omzet / dailyChartData.maxOmzet) * 100));
                const dateLabel = item.date.substring(5); // MM-DD

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip Hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 text-slate-100 text-[10px] px-2 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20 font-mono">
                      <div>{item.date}</div>
                      <div className="text-emerald-400 font-bold">{formatRupiah(item.omzet)}</div>
                      <div className="text-slate-400">{item.count} transaksi</div>
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[36px] bg-gradient-to-t from-emerald-600 to-teal-400 hover:from-emerald-500 hover:to-teal-300 rounded-t-md transition-all cursor-pointer shadow-sm group-hover:shadow-emerald-500/20"
                    />

                    {/* X-axis Label */}
                    <span className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-full">
                      {dateLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
              <span>* Arahkan kursor pada batang untuk melihat nominal omzet & jumlah struk</span>
              <span className="font-mono text-emerald-400 font-semibold">Total: {formatRupiah(totalOmzet)}</span>
            </div>
          </div>

          {/* Komparasi Kategori: Buku vs ATK vs Jasa & Jam Sibuk (5 Kolom) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Proporsi Buku vs ATK vs Jasa */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 block">
                Komposisi Penjualan: Buku, ATK & Layanan Jasa
              </span>

              {/* Progress bar tripel */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  style={{ width: `${categoryStats.buku.percent}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`Buku: ${categoryStats.buku.percent}%`}
                />
                <div
                  style={{ width: `${categoryStats.atk.percent}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`ATK: ${categoryStats.atk.percent}%`}
                />
                <div
                  style={{ width: `${categoryStats.jasa.percent}%` }}
                  className="bg-purple-500 h-full transition-all"
                  title={`Jasa: ${categoryStats.jasa.percent}%`}
                />
              </div>

              {/* Legend & Detail 3 Kolom */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-1 text-blue-400 font-semibold truncate text-[11px]">
                    <BookOpen className="w-3 h-3 shrink-0" />
                    <span>Buku ({categoryStats.buku.percent}%)</span>
                  </div>
                  <div className="font-mono font-bold text-slate-200 mt-1 text-xs truncate">
                    {formatRupiah(categoryStats.buku.omzet)}
                  </div>
                  <div className="text-[10px] text-slate-500">{categoryStats.buku.qty} eks</div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-1 text-amber-400 font-semibold truncate text-[11px]">
                    <PenTool className="w-3 h-3 shrink-0" />
                    <span>ATK ({categoryStats.atk.percent}%)</span>
                  </div>
                  <div className="font-mono font-bold text-slate-200 mt-1 text-xs truncate">
                    {formatRupiah(categoryStats.atk.omzet)}
                  </div>
                  <div className="text-[10px] text-slate-500">{categoryStats.atk.qty} pcs</div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-1 text-purple-400 font-semibold truncate text-[11px]">
                    <Printer className="w-3 h-3 shrink-0" />
                    <span>Jasa ({categoryStats.jasa.percent}%)</span>
                  </div>
                  <div className="font-mono font-bold text-slate-200 mt-1 text-xs truncate">
                    {formatRupiah(categoryStats.jasa.omzet)}
                  </div>
                  <div className="text-[10px] text-slate-500">{categoryStats.jasa.qty} order</div>
                </div>
              </div>
            </div>

            {/* Jam Sibuk Transaksi (Peak Hours) */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Jam Sibuk Kasir (08:00 - 21:00)</span>
                </span>
                <span className="text-[10px] text-slate-500">Kepadatan Antrian</span>
              </div>

              <div className="flex items-end gap-1 h-12 pt-2">
                {Object.entries(hourlyData.hoursCount).map(([hour, count]) => {
                  const hPercent = Math.max(12, Math.round((count / hourlyData.maxHourCount) * 100));
                  return (
                    <div
                      key={hour}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-[9px] px-1 py-0.5 rounded border border-slate-700 text-purple-300 font-mono whitespace-nowrap z-10">
                        {hour}:00 ({count} tx)
                      </div>
                      <div
                        style={{ height: `${hPercent}%` }}
                        className={`w-full rounded-t-xs transition-all ${
                          count > 0 ? 'bg-purple-500 group-hover:bg-purple-400' : 'bg-slate-800'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>21:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row Kedua: Metode Pembayaran & Top 5 Produk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rekap Metode Bayar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2.5">
            <span className="font-bold text-slate-200 block">Distribusi Metode Pembayaran</span>
            <div className="grid grid-cols-2 gap-2.5 pt-1 font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Tunai (Cash)</span>
                </span>
                <span className="font-bold text-emerald-400">{formatRupiah(paymentTotals.cash)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  <span>QRIS</span>
                </span>
                <span className="font-bold text-blue-400">{formatRupiah(paymentTotals.qris)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>EDC / Kartu</span>
                </span>
                <span className="font-bold text-amber-400">{formatRupiah(paymentTotals.debit)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  <span>Transfer</span>
                </span>
                <span className="font-bold text-purple-400">{formatRupiah(paymentTotals.transfer)}</span>
              </div>
            </div>
          </div>

          {/* Top 5 Produk Terlaris */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2.5">
            <span className="font-bold text-slate-200 block">5 Produk Terlaris (Best Seller)</span>
            <div className="space-y-2 pt-1">
              {topProducts.length === 0 ? (
                <p className="text-slate-500 py-3">Belum ada transaksi di periode ini.</p>
              ) : (
                topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[260px]">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="truncate text-slate-200 font-medium">{p.name}</span>
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

        {/* Tabel Riwayat Transaksi Kasir */}
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/50">
          <div className="p-3 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-200">
              Riwayat Transaksi Kasir ({filteredTransactions.length} data)
            </span>
            <span className="text-[11px] text-slate-400">
              Klik struk untuk cetak ulang / batalkan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
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
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          {tx.cashierName}
                        </td>

                        {/* Jumlah Item */}
                        <td className="py-3 px-3 text-center font-mono font-medium">
                          {tx.totalItemsCount}
                        </td>

                        {/* Grand Total */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                          {formatRupiah(tx.grandTotal)}
                        </td>

                        {/* Metode Bayar */}
                        <td className="py-3 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            tx.paymentMethod === 'cash'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                              : tx.paymentMethod === 'qris'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800/50'
                              : 'bg-purple-950 text-purple-300 border border-purple-800/50'
                          }`}>
                            {tx.paymentMethod}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          {isRefunded ? (
                            <span className="text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/40">
                              Dibatalkan
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                              Selesai
                            </span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedTxForReceipt(tx)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Lihat & Cetak Ulang Struk"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {!isRefunded && (
                              <button
                                onClick={() => handleRefund(tx.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Batalkan Transaksi (Refund Stok)"
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
