import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Barcode as BarcodeIcon, 
  Settings2, 
  Copy, 
  Check, 
  Eye, 
  Layers,
  Sparkles,
  Search,
  BookOpen,
  PenTool
} from 'lucide-react';
import { ProductItem, StoreProfile, BarcodeLabelSize } from '../../types/pos';
import { BarcodeSvg } from '../../services/barcode';
import { formatRupiah } from '../../services/db';
import { soundService } from '../../services/sound';

interface BarcodePrintModalProps {
  products: ProductItem[];
  initialProduct?: ProductItem | null;
  storeProfile: StoreProfile;
  onClose: () => void;
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
  products,
  initialProduct,
  storeProfile,
  onClose
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(
    initialProduct || products[0] || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [labelSize, setLabelSize] = useState<BarcodeLabelSize>('thermal_40x30');
  const [printCount, setPrintCount] = useState<number>(5);

  // Toggle elemen label
  const [showStoreName, setShowStoreName] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showShelf, setShowShelf] = useState(false);
  const [showCode, setShowCode] = useState(true);

  // Filter daftar produk untuk pencarian
  const searchResults = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8);

  const handlePrint = () => {
    soundService.playSuccess();
    window.print();
  };

  if (!selectedProduct) {
    return null;
  }

  // Label dimension styles
  const getSizeStyles = () => {
    switch (labelSize) {
      case 'mini_38x18':
        return {
          wrapperClass: 'w-[144px] h-[68px] p-1.5',
          barcodeHeight: 22,
          barcodeWidth: 1.0,
          titleClass: 'text-[9px] font-bold truncate max-w-full leading-tight',
          priceClass: 'text-[10px] font-black font-mono',
          storeClass: 'text-[7px] uppercase font-semibold text-slate-500'
        };
      case 'shelf_60x40':
        return {
          wrapperClass: 'w-[227px] h-[151px] p-3',
          barcodeHeight: 40,
          barcodeWidth: 1.4,
          titleClass: 'text-xs font-bold line-clamp-2 leading-tight',
          priceClass: 'text-lg font-black font-mono text-emerald-700',
          storeClass: 'text-[9px] uppercase font-bold text-slate-500'
        };
      case 'thermal_40x30':
      default:
        return {
          wrapperClass: 'w-[151px] h-[113px] p-2',
          barcodeHeight: 32,
          barcodeWidth: 1.15,
          titleClass: 'text-[10px] font-bold line-clamp-2 leading-tight',
          priceClass: 'text-xs font-black font-mono',
          storeClass: 'text-[8px] uppercase font-bold text-slate-500'
        };
    }
  };

  const styleConfig = getSizeStyles();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #barcode-print-zone, #barcode-print-zone * {
            visibility: visible;
          }
          #barcode-print-zone {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 4px;
            background: white !important;
          }
          .barcode-sticker-item {
            page-break-inside: avoid;
            break-inside: avoid;
            border: 1px dashed #ccc !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header Modal */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>Cetak Label Barcode & Harga Toko</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Stiker Thermal & Rak
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Buat dan cetak stiker barcode dengan harga otomatis untuk ditempel pada buku atau alat tulis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Dua Kolom */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-5">
          {/* Kolom Kiri: Konfigurasi & Pilihan Produk (7 Kolom) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Pemilihan Produk */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Pilih Produk untuk Dicetak:</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Total {products.length} item tersedia
                </span>
              </label>

              {/* Live Search Produk */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Ketik nama buku, merk, atau barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Hasil Pencarian / Quick Select */}
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {searchResults.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      soundService.playTap();
                    }}
                    className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      selectedProduct.id === p.id
                        ? 'bg-emerald-950/80 border border-emerald-600/70 text-emerald-200'
                        : 'bg-slate-900/60 hover:bg-slate-900 border border-transparent text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.barcode} • {p.category}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-emerald-400">
                        {formatRupiah(p.sellPrice)}
                      </div>
                      <div className="text-[10px] text-slate-500">Stok: {p.stock}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pilihan Ukuran Label */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <label className="text-xs font-semibold text-slate-300">
                Pilih Ukuran Kertas / Label:
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLabelSize('thermal_40x30')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    labelSize === 'thermal_40x30'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-100">40 x 30 mm</div>
                  <div className="text-[10px] text-slate-400 mt-1">Standar Thermal Roll (Kasir)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setLabelSize('mini_38x18')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    labelSize === 'mini_38x18'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-100">38 x 18 mm</div>
                  <div className="text-[10px] text-slate-400 mt-1">Mini Sticker / Tom & Jerry</div>
                </button>

                <button
                  type="button"
                  onClick={() => setLabelSize('shelf_60x40')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    labelSize === 'shelf_60x40'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-100">60 x 40 mm</div>
                  <div className="text-[10px] text-slate-400 mt-1">Label Tag Rak Display</div>
                </button>
              </div>
            </div>

            {/* Opsi Konten Label */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <label className="text-xs font-semibold text-slate-300">
                Elemen yang Ditampilkan pada Stiker:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-850">
                  <input
                    type="checkbox"
                    checked={showStoreName}
                    onChange={(e) => setShowStoreName(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Nama Toko</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-850">
                  <input
                    type="checkbox"
                    checked={showProductName}
                    onChange={(e) => setShowProductName(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Nama Produk</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-850">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Harga Jual</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-850">
                  <input
                    type="checkbox"
                    checked={showCode}
                    onChange={(e) => setShowCode(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Nomor Barcode</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-850">
                  <input
                    type="checkbox"
                    checked={showShelf}
                    onChange={(e) => setShowShelf(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Lokasi Rak</span>
                </label>
              </div>
            </div>

            {/* Jumlah Stiker yang Dicetak */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">
                  Jumlah Lembar Stiker:
                </span>
                <span className="text-[11px] text-slate-500">
                  Berapa rangkap label yang ingin dicetak sekaligus
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintCount(1)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                    printCount === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setPrintCount(5)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                    printCount === 5 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => setPrintCount(10)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                    printCount === 10 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  10
                </button>
                <button
                  type="button"
                  onClick={() => setPrintCount(selectedProduct.stock > 0 ? selectedProduct.stock : 1)}
                  className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer"
                  title="Cetak sesuai jumlah stok fisik saat ini"
                >
                  Stok ({selectedProduct.stock})
                </button>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={printCount}
                  onChange={(e) => setPrintCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Preview Stiker & Cetak (5 Kolom) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Pratinjau Stiker ({labelSize})</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {printCount} lembar siap cetak
                </span>
              </div>

              {/* Preview Box Interaktif (Kertas Stiker Putih) */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[220px]">
                <div
                  className={`bg-white text-slate-900 rounded-md shadow-xl flex flex-col justify-between overflow-hidden border border-slate-200 select-none ${styleConfig.wrapperClass}`}
                >
                  {/* Header Stiker (Toko) */}
                  {showStoreName && (
                    <div className={`text-center ${styleConfig.storeClass}`}>
                      {storeProfile.name}
                    </div>
                  )}

                  {/* Judul Produk */}
                  {showProductName && (
                    <div className={`text-center font-bold text-slate-950 ${styleConfig.titleClass}`}>
                      {selectedProduct.name}
                    </div>
                  )}

                  {/* Render Barcode SVG */}
                  <div className="w-full flex justify-center my-0.5">
                    <BarcodeSvg
                      value={selectedProduct.barcode}
                      height={styleConfig.barcodeHeight}
                      barWidth={styleConfig.barcodeWidth}
                      showText={showCode}
                      quietZone={4}
                    />
                  </div>

                  {/* Footer Stiker: Harga & Rak */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-0.5 mt-0.5">
                    {showPrice ? (
                      <div className={`font-mono font-black text-slate-950 ${styleConfig.priceClass}`}>
                        {formatRupiah(selectedProduct.sellPrice)}
                      </div>
                    ) : <span />}

                    {showShelf && selectedProduct.shelfLocation && (
                      <span className="text-[8px] font-mono text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                        Rak: {selectedProduct.shelfLocation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tips Cetak Printer Thermal & Label:</span>
                </div>
                <p>
                  • Pada dialog print browser, pilih printer label Anda (Xprinter / Panda / Zebra).
                </p>
                <p>
                  • Set <b>Margin: None</b> dan <b>Scale: 100%</b> untuk hasil presisi di garis stiker.
                </p>
              </div>
            </div>

            {/* Tombol Aksi Cetak */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak {printCount} Lembar Stiker</span>
              </button>
            </div>
          </div>
        </div>

        {/* Zona Render Struk Khusus Cetak (@media print) */}
        <div id="barcode-print-zone" className="hidden">
          {Array.from({ length: printCount }).map((_, idx) => (
            <div
              key={idx}
              className={`barcode-sticker-item bg-white text-slate-900 flex flex-col justify-between ${styleConfig.wrapperClass}`}
            >
              {showStoreName && (
                <div className={`text-center ${styleConfig.storeClass}`}>
                  {storeProfile.name}
                </div>
              )}

              {showProductName && (
                <div className={`text-center font-bold text-slate-950 ${styleConfig.titleClass}`}>
                  {selectedProduct.name}
                </div>
              )}

              <div className="w-full flex justify-center my-0.5">
                <BarcodeSvg
                  value={selectedProduct.barcode}
                  height={styleConfig.barcodeHeight}
                  barWidth={styleConfig.barcodeWidth}
                  showText={showCode}
                  quietZone={4}
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-0.5 mt-0.5">
                {showPrice ? (
                  <div className={`font-mono font-black text-slate-950 ${styleConfig.priceClass}`}>
                    {formatRupiah(selectedProduct.sellPrice)}
                  </div>
                ) : <span />}

                {showShelf && selectedProduct.shelfLocation && (
                  <span className="text-[8px] font-mono text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                    Rak: {selectedProduct.shelfLocation}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
