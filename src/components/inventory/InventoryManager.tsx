import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  BookOpen, 
  PenTool, 
  Download, 
  RefreshCw, 
  X, 
  Check, 
  ArrowUpDown,
  DollarSign,
  PackageCheck,
  Barcode,
  Printer,
  Sparkles
} from 'lucide-react';
import { ProductItem, ProductType, StoreProfile } from '../../types/pos';
import { dbService, formatRupiah } from '../../services/db';
import { BarcodePrintModal } from './BarcodePrintModal';

interface InventoryManagerProps {
  products: ProductItem[];
  refreshData: () => void;
  storeProfile?: StoreProfile;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  refreshData,
  storeProfile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buku' | 'alat_tulis' | 'jasa' | 'low_stock'>('all');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeSelectedProduct, setBarcodeSelectedProduct] = useState<ProductItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<ProductItem | null>(null);

  // Form states untuk Tambah/Edit Produk
  const [formName, setFormName] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formType, setFormType] = useState<ProductType>('buku');
  const [formCategory, setFormCategory] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSellPrice, setFormSellPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formMinAlert, setFormMinAlert] = useState<number>(5);
  const [formUnit, setFormUnit] = useState('Pcs');
  const [formShelf, setFormShelf] = useState('');

  // Form states untuk Penyesuaian Stok
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'add' | 'reduce'>('add');
  const [adjustNote, setAdjustNote] = useState('Barang Masuk / Pembelian Baru');

  // Filter produk
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brandOrPublisher && p.brandOrPublisher.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'buku') return p.type === 'buku';
    if (filterType === 'alat_tulis') return p.type === 'alat_tulis';
    if (filterType === 'jasa') return p.type === 'jasa';
    if (filterType === 'low_stock') return p.type !== 'jasa' && p.stock <= p.minStockAlert;
    return true;
  });

  // KPI Ringkasan Inventaris
  const totalItemsCount = products.length;
  const totalPhysicalStock = products.filter(p => p.type !== 'jasa').reduce((acc, p) => acc + p.stock, 0);
  const totalAssetValue = products.filter(p => p.type !== 'jasa').reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const lowStockCount = products.filter(p => p.type !== 'jasa' && p.stock <= p.minStockAlert).length;

  // Buka Form Tambah
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBarcode(`JNB-${Math.floor(100000000 + Math.random() * 900000000)}`);
    setFormType('buku');
    setFormCategory('Novel Sastra');
    setFormBrand('');
    setFormCostPrice(50000);
    setFormSellPrice(70000);
    setFormStock(10);
    setFormMinAlert(5);
    setFormUnit('Pcs');
    setFormShelf('Rak Depan');
    setIsAddEditModalOpen(true);
  };

  // Buka Form Edit
  const handleOpenEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormBarcode(product.barcode);
    setFormType(product.type);
    setFormCategory(product.category);
    setFormBrand(product.brandOrPublisher || '');
    setFormCostPrice(product.costPrice);
    setFormSellPrice(product.sellPrice);
    setFormStock(product.stock);
    setFormMinAlert(product.minStockAlert);
    setFormUnit(product.unit);
    setFormShelf(product.shelfLocation);
    setIsAddEditModalOpen(true);
  };

  // Simpan Produk
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBarcode.trim()) {
      alert('Nama produk dan barcode wajib diisi!');
      return;
    }

    const isJasa = formType === 'jasa';
    const newProd: ProductItem = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      barcode: formBarcode.trim(),
      name: formName.trim(),
      type: formType,
      category: formCategory.trim() || (isJasa ? 'Layanan & Percetakan' : 'Umum'),
      brandOrPublisher: formBrand.trim() || (isJasa ? 'Mesin / Station Kasir' : undefined),
      costPrice: Number(formCostPrice) || 0,
      sellPrice: Number(formSellPrice) || 0,
      stock: isJasa ? 99999 : (Number(formStock) || 0),
      minStockAlert: isJasa ? 0 : (Number(formMinAlert) || 5),
      unit: formUnit.trim() || (isJasa ? 'Lembar' : 'Pcs'),
      shelfLocation: formShelf.trim() || (isJasa ? 'Area Percetakan' : 'Rak Toko'),
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dbService.saveProduct(newProd);
    refreshData();
    setIsAddEditModalOpen(false);
  };

  // Hapus Produk
  const handleDeleteProduct = (product: ProductItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
      dbService.deleteProduct(product.id);
      refreshData();
    }
  };

  // Buka Modal Penyesuaian Stok
  const handleOpenAdjustModal = (product: ProductItem) => {
    setAdjustingProduct(product);
    setAdjustQty(1);
    setAdjustType('add');
    setAdjustNote('Barang Masuk / Pembelian Baru');
    setIsAdjustModalOpen(true);
  };

  // Simpan Penyesuaian Stok
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const current = adjustingProduct.stock;
    const diff = adjustType === 'add' ? adjustQty : -adjustQty;
    const newStock = Math.max(0, current + diff);

    dbService.updateProductStock(adjustingProduct.id, newStock);
    refreshData();
    setIsAdjustModalOpen(false);
  };

  // Ekspor ke CSV Excel
  const handleExportCSV = () => {
    const headers = ['ID', 'Barcode', 'Nama Produk', 'Tipe', 'Kategori', 'Penerbit/Merk', 'Harga Beli (Modal)', 'Harga Jual', 'Stok', 'Satuan', 'Lokasi Rak'];
    const rows = products.map(p => [
      `"${p.id}"`,
      `"${p.barcode}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      p.type === 'buku' ? 'Buku' : 'Alat Tulis',
      `"${p.category}"`,
      `"${(p.brandOrPublisher || '').replace(/"/g, '""')}"`,
      p.costPrice,
      p.sellPrice,
      p.stock,
      p.unit,
      `"${p.shelfLocation}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stok-Inventaris-JNBook-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hitung margin persentase live
  const marginPercentage = formCostPrice > 0 
    ? Math.round(((formSellPrice - formCostPrice) / formCostPrice) * 100) 
    : 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header & KPI Summary */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-400" />
              <span>Manajemen Stok & Inventaris Toko</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola katalog buku, novel, dan alat tulis (ATK) lengkap dengan harga beli, harga jual, dan stok fisik
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBarcodeSelectedProduct(null);
                setIsBarcodeModalOpen(true);
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Barcode className="w-4 h-4 text-amber-400" />
              <span>Cetak Label Barcode</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm shadow-emerald-950/50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400">Total Jenis Produk</span>
            <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
              {totalItemsCount} <span className="text-xs font-normal text-slate-500">item</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400">Total Fisik Unit</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              {totalPhysicalStock} <span className="text-xs font-normal text-slate-500">pcs/pak</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400">Total Nilai Aset (HPP)</span>
            <div className="text-xl font-bold font-mono text-blue-400 mt-0.5 truncate">
              {formatRupiah(totalAssetValue)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400">Stok Perlu Restok</span>
            <div className={`text-xl font-bold font-mono mt-0.5 ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {lowStockCount} <span className="text-xs font-normal text-slate-500">produk</span>
            </div>
          </div>
        </div>

        {/* Filter & Pencarian */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama buku/ATK, barcode/ISBN, merk, kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setFilterType('buku')}
              className={`px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                filterType === 'buku'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku</span>
            </button>
            <button
              onClick={() => setFilterType('alat_tulis')}
              className={`px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                filterType === 'alat_tulis'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Alat Tulis</span>
            </button>
            <button
              onClick={() => setFilterType('jasa')}
              className={`px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                filterType === 'jasa'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Layanan & Jasa ({products.filter(p => p.type === 'jasa').length})</span>
            </button>
            <button
              onClick={() => setFilterType('low_stock')}
              className={`px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                filterType === 'low_stock'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Stok Menipis ({lowStockCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Inventaris */}
      <div className="flex-1 overflow-auto p-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/50">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Barcode / SKU</th>
                <th className="py-3 px-3">Nama Produk / Layanan</th>
                <th className="py-3 px-3">Tipe</th>
                <th className="py-3 px-3 text-right">Harga Modal (HPP)</th>
                <th className="py-3 px-3 text-right">Harga Jual</th>
                <th className="py-3 px-3 text-center">Margin %</th>
                <th className="py-3 px-3 text-center">Stok Fisik</th>
                <th className="py-3 px-3">Lokasi / Mesin</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Tidak ada produk yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isService = product.type === 'jasa';
                  const isOutOfStock = !isService && product.stock <= 0;
                  const isLow = !isService && product.stock > 0 && product.stock <= product.minStockAlert;
                  const margin = product.costPrice > 0 
                    ? Math.round(((product.sellPrice - product.costPrice) / product.costPrice) * 100) 
                    : 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-850/60 transition-colors group"
                    >
                      {/* Barcode */}
                      <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                        {product.barcode}
                      </td>

                      {/* Nama Produk & Kategori */}
                      <td className="py-3 px-3 max-w-[280px]">
                        <div className="font-semibold text-slate-100 group-hover:text-emerald-300 truncate">
                          {product.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {product.category} {product.brandOrPublisher ? `• ${product.brandOrPublisher}` : ''}
                        </div>
                      </td>

                      {/* Tipe */}
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          product.type === 'buku'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800/40'
                            : product.type === 'alat_tulis'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                            : 'bg-purple-950 text-purple-300 border border-purple-800/40'
                        }`}>
                          {product.type === 'buku' ? 'Buku' : product.type === 'alat_tulis' ? 'ATK' : 'Jasa'}
                        </span>
                      </td>

                      {/* Harga Beli */}
                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        {formatRupiah(product.costPrice)}
                      </td>

                      {/* Harga Jual */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-400">
                        {formatRupiah(product.sellPrice)}
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          +{margin}%
                        </span>
                      </td>

                      {/* Stok Fisik */}
                      <td className="py-3 px-3 text-center">
                        {isService ? (
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800/40 font-semibold">
                            Non-Fisik ({product.unit})
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            isOutOfStock
                              ? 'bg-rose-950 text-rose-400 border border-rose-800/50'
                              : isLow
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                              : 'bg-slate-800 text-slate-200'
                          }`}>
                            {product.stock} {product.unit}
                          </span>
                        )}
                      </td>

                      {/* Lokasi Rak */}
                      <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-[120px]">
                        {product.shelfLocation}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setBarcodeSelectedProduct(product);
                              setIsBarcodeModalOpen(true);
                            }}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                            title="Cetak Label Barcode & Harga"
                          >
                            <Barcode className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenAdjustModal(product)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="Sesuaikan Stok (+/-)"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit Data Produk"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal Tambah / Edit Produk */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scaleUp">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>{editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}</span>
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-4">
              {/* Tipe Produk */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tipe Produk / Layanan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('buku');
                      if (formBarcode.startsWith('JASA-')) {
                        setFormBarcode(`JNB-${Math.floor(100000000 + Math.random() * 900000000)}`);
                      }
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formType === 'buku'
                        ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Buku & Novel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('alat_tulis');
                      if (formBarcode.startsWith('JASA-')) {
                        setFormBarcode(`JNB-${Math.floor(100000000 + Math.random() * 900000000)}`);
                      }
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formType === 'alat_tulis'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Alat Tulis (ATK)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('jasa');
                      if (!formBarcode.startsWith('JASA-')) {
                        setFormBarcode(`JASA-${Math.floor(1000 + Math.random() * 9000)}`);
                      }
                      setFormUnit('Lembar');
                      setFormCategory('Layanan & Percetakan');
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formType === 'jasa'
                        ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Printer className="w-4 h-4" />
                    <span>Layanan & Jasa</span>
                  </button>
                </div>

                {/* Template Cepat Layanan & Percetakan */}
                {formType === 'jasa' && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-1.5 animate-fadeIn">
                    <span className="text-[11px] text-purple-300 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Pilih Template Layanan Cepat:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setFormName('Fotocopy HVS A4/F4 (Hitam Putih)');
                          setFormCategory('Fotocopy & Dokumen');
                          setFormCostPrice(100);
                          setFormSellPrice(350);
                          setFormUnit('Lembar');
                          setFormShelf('Mesin Fotocopy Depan');
                          setFormBrand('Mesin IR 6000');
                        }}
                        className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                      >
                        📄 Fotocopy Hitam Putih (Rp 350)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormName('Fotocopy Warna A4/F4');
                          setFormCategory('Fotocopy & Dokumen');
                          setFormCostPrice(500);
                          setFormSellPrice(1500);
                          setFormUnit('Lembar');
                          setFormShelf('Mesin Fotocopy Warna');
                          setFormBrand('Konica Minolta');
                        }}
                        className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                      >
                        🎨 Fotocopy Warna (Rp 1.500)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormName('Print Dokumen Warna A4 (Tinta Inkjet)');
                          setFormCategory('Print & Digital Output');
                          setFormCostPrice(800);
                          setFormSellPrice(2500);
                          setFormUnit('Lembar');
                          setFormShelf('PC Cetak Kasir');
                          setFormBrand('Epson L-Series');
                        }}
                        className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                      >
                        🖨️ Print Warna A4 (Rp 2.500)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormName('Cetak Baliho / Spanduk Flexi 280gr (Outdoor)');
                          setFormCategory('Percetakan & Banner');
                          setFormCostPrice(12000);
                          setFormSellPrice(25000);
                          setFormUnit('Meter');
                          setFormShelf('Mesin Outdoor 3.2m');
                          setFormBrand('Outdoor Solvent');
                        }}
                        className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                      >
                        🚩 Cetak Baliho/Spanduk (Rp 25.000/m²)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormName('Jilid Spiral Kawat + Cover Mika');
                          setFormCategory('Jilid & Finishing');
                          setFormCostPrice(4000);
                          setFormSellPrice(12000);
                          setFormUnit('Buku');
                          setFormShelf('Meja Jilid & Finishing');
                          setFormBrand('Spiral Kawat');
                        }}
                        className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                      >
                        📒 Jilid Spiral Kawat (Rp 12.000)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormName('Laminating Panas Presisi A4/F4');
                          setFormCategory('Jilid & Finishing');
                          setFormCostPrice(1200);
                          setFormSellPrice(5000);
                          setFormUnit('Lembar');
                          setFormShelf('Mesin Roll Panas');
                          setFormBrand('Mesin Laminating');
                        }}
                        className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                      >
                        ✨ Laminating Panas (Rp 5.000)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Barcode & Nama */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Barcode / ISBN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="978602..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nama Produk Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Judul buku atau nama barang ATK..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Kategori & Penerbit / Merk */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Novel, Komik, Buku Tulis, Pulpen"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {formType === 'buku' ? 'Penulis / Penerbit' : 'Merk / Brand'}
                  </label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder={formType === 'buku' ? 'Gramedia / Mizan' : 'Joyko / Faber-Castell / SiDU'}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Harga Beli, Harga Jual, dan Live Margin */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Harga Beli / HPP (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Harga Jual Kasir (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formSellPrice}
                      onChange={(e) => setFormSellPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Margin Keuntungan
                    </label>
                    <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 font-bold">
                      +{marginPercentage}% ({formatRupiah(Math.max(0, formSellPrice - formCostPrice))})
                    </div>
                  </div>
                </div>
              </div>

              {/* Stok, Alert, Satuan, dan Lokasi Rak */}
              {formType === 'jasa' ? (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-800/40">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Satuan Hitung Layanan *
                    </label>
                    <input
                      type="text"
                      required
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder="Lembar, Halaman, Meter (m²), Buku, Set"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-medium focus:border-purple-500"
                    />
                    <div className="flex gap-1.5 mt-1.5 text-[10px]">
                      {['Lembar', 'Meter', 'Buku', 'Set', 'Halaman'].map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setFormUnit(u)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Lokasi Mesin / Pos Kerja
                    </label>
                    <input
                      type="text"
                      value={formShelf}
                      onChange={(e) => setFormShelf(e.target.value)}
                      placeholder="e.g. Mesin IR 6000, Meja Jilid, PC Cetak"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:border-purple-500"
                    />
                    <span className="text-[10px] text-purple-300/80 mt-1.5 block">
                      * Layanan non-fisik tidak dibatasi stok & selalu dapat diorder di kasir
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Stok Awal
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Min Alert
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formMinAlert}
                      onChange={(e) => setFormMinAlert(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Satuan
                    </label>
                    <input
                      type="text"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder="Pcs, Pak, Rim, Eks"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Lokasi Rak
                    </label>
                    <input
                      type="text"
                      value={formShelf}
                      onChange={(e) => setFormShelf(e.target.value)}
                      placeholder="Rak A-01"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Tombol Simpan */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Penyesuaian Stok Cepat */}
      {isAdjustModalOpen && adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                <span>Penyesuaian Stok Fisik</span>
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-semibold text-xs text-slate-100">{adjustingProduct.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Stok saat ini: <span className="font-mono font-bold text-emerald-400">{adjustingProduct.stock} {adjustingProduct.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Jenis Penyesuaian
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium ${
                      adjustType === 'add'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    + Tambah Stok (Masuk)
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('reduce')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium ${
                      adjustType === 'reduce'
                        ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    - Kurangi Stok (Rusak/Hilang)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Jumlah ({adjustingProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono font-bold text-emerald-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  Simpan Penyesuaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak Label Barcode & Harga Toko */}
      {isBarcodeModalOpen && (
        <BarcodePrintModal
          products={products}
          initialProduct={barcodeSelectedProduct}
          storeProfile={storeProfile || dbService.getStoreProfile()}
          onClose={() => setIsBarcodeModalOpen(false)}
        />
      )}
    </div>
  );
};
