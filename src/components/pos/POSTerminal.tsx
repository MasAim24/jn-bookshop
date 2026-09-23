import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  RotateCcw, 
  Clock, 
  Percent, 
  BookOpen, 
  PenTool, 
  AlertCircle,
  Tag,
  CheckCircle2,
  Package,
  ShoppingCart,
  Volume2,
  VolumeX,
  Wallet,
  Printer
} from 'lucide-react';
import { ProductItem, POSCartItem, HeldOrder, StoreProfile, CashierShift } from '../../types/pos';
import { dbService, formatRupiah } from '../../services/db';
import { soundService } from '../../services/sound';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { ShiftModal } from './ShiftModal';

interface POSTerminalProps {
  products: ProductItem[];
  refreshData: () => void;
  storeProfile: StoreProfile;
}

export const POSTerminal: React.FC<POSTerminalProps> = ({
  products,
  refreshData,
  storeProfile
}) => {
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'buku' | 'alat_tulis' | 'jasa'>('semua');
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [activeShift, setActiveShift] = useState<CashierShift | null>(null);
  const [activeReceiptTx, setActiveReceiptTx] = useState<any | null>(null);
  const [barcodeNotification, setBarcodeNotification] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(soundService.isMuted());
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleMute = () => {
    setIsMuted(soundService.toggleMute());
  };

  const refreshShift = () => {
    setActiveShift(dbService.getActiveShift());
  };

  // Load held orders & active shift
  useEffect(() => {
    setHeldOrders(dbService.getHeldOrders());
    refreshShift();
  }, []);

  // Autofocus barcode search input on mount and on shortcut
  useEffect(() => {
    searchInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 to focus barcode search
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // F2 to hold order
      if (e.key === 'F2') {
        e.preventDefault();
        handleHoldOrder();
      }
      // F12 to checkout
      if (e.key === 'F12' && cart.length > 0) {
        e.preventDefault();
        setIsPaymentModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, heldOrders]);

  // Filter produk
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brandOrPublisher && p.brandOrPublisher.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedCategory === 'buku') return p.type === 'buku';
    if (selectedCategory === 'alat_tulis') return p.type === 'alat_tulis';
    if (selectedCategory === 'jasa') return p.type === 'jasa';
    return true;
  });

  // Handler input barcode scanner (biasanya barcode scanner mengirim string + Enter)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Cari exact match barcode dulu
    const exactMatch = products.find(
      p => p.barcode.trim().toLowerCase() === searchQuery.trim().toLowerCase()
    );

    if (exactMatch) {
      soundService.playScan();
      addToCart(exactMatch);
      setBarcodeNotification(`Berhasil scan: ${exactMatch.name}`);
      setSearchQuery('');
      setTimeout(() => setBarcodeNotification(null), 2500);
      return;
    }

    // Jika ada 1 hasil filter pencarian, tambahkan langsung
    if (filteredProducts.length === 1) {
      soundService.playScan();
      addToCart(filteredProducts[0]);
      setBarcodeNotification(`Ditambahkan: ${filteredProducts[0].name}`);
      setSearchQuery('');
      setTimeout(() => setBarcodeNotification(null), 2500);
      return;
    }

    // Jika tidak ditemukan
    soundService.playError();
  };

  // Tambah item ke keranjang
  const addToCart = (product: ProductItem) => {
    if (product.stock <= 0) {
      soundService.playError();
      alert(`Stok produk "${product.name}" habis! Silakan lakukan restok terlebih dahulu.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          soundService.playError();
          alert(`Jumlah melebihi stok yang tersedia (${product.stock} ${product.unit})`);
          return prev;
        }
        soundService.playAdd();
        return prev.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: calculateItemSubtotal(
                  item.product.sellPrice,
                  item.quantity + 1,
                  item.discountType,
                  item.discountValue
                )
              }
            : item
        );
      } else {
        soundService.playScan();
        return [
          ...prev,
          {
            product,
            quantity: 1,
            unitPrice: product.sellPrice,
            discountType: 'percentage',
            discountValue: 0,
            subtotal: product.sellPrice
          }
        ];
      }
    });
  };

  // Update kuantitas
  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          if (newQty > item.product.stock) {
            alert(`Stok maksimal hanya ${item.product.stock} ${item.product.unit}`);
            return item;
          }
          return {
            ...item,
            quantity: newQty,
            subtotal: calculateItemSubtotal(
              item.unitPrice,
              newQty,
              item.discountType,
              item.discountValue
            )
          };
        }
        return item;
      })
    );
  };

  // Update diskon item
  const updateItemDiscount = (
    productId: string,
    discountType: 'percentage' | 'fixed',
    discountValue: number
  ) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          return {
            ...item,
            discountType,
            discountValue,
            subtotal: calculateItemSubtotal(
              item.unitPrice,
              item.quantity,
              discountType,
              discountValue
            )
          };
        }
        return item;
      })
    );
  };

  // Hapus item dari keranjang
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Hitung subtotal per item
  const calculateItemSubtotal = (
    price: number,
    qty: number,
    discType: 'percentage' | 'fixed',
    discVal: number
  ): number => {
    const rawTotal = price * qty;
    if (discType === 'percentage') {
      const discount = (rawTotal * Math.min(100, Math.max(0, discVal))) / 100;
      return Math.max(0, rawTotal - discount);
    } else {
      return Math.max(0, rawTotal - discVal);
    }
  };

  // Kalkulasi Total Belanja
  const subtotalCart = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const grandTotalCart = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const totalDiscount = Math.max(0, subtotalCart - grandTotalCart);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Tahan Pesanan (Hold Sale)
  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    const label = prompt('Masukkan nama/label antrian pesanan ini (misal: "Ibu Meja 2" atau "Pak Budi"):', `Antrian #${heldOrders.length + 1}`);
    if (!label) return;

    const newOrder: HeldOrder = {
      id: `HOLD-${Date.now()}`,
      heldAt: new Date().toISOString(),
      customerLabel: label,
      items: [...cart],
      subtotal: grandTotalCart
    };

    dbService.saveHeldOrder(newOrder);
    setHeldOrders(dbService.getHeldOrders());
    setCart([]);
    alert(`Pesanan "${label}" berhasil ditahan!`);
  };

  // Buka Pesanan Tertahan (Recall Sale)
  const handleRecallOrder = (order: HeldOrder) => {
    if (cart.length > 0) {
      const confirmReplace = confirm('Keranjang saat ini masih berisi barang. Gantikan dengan pesanan tertahan ini?');
      if (!confirmReplace) return;
    }

    setCart(order.items);
    dbService.deleteHeldOrder(order.id);
    setHeldOrders(dbService.getHeldOrders());
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950 text-slate-100">
      {/* =========================================
          BAGIAN KIRI: KATALOG PRODUK & SCANNER
          ========================================= */}
      <div className="flex-1 flex flex-col border-r border-slate-800 min-w-0">
        {/* Top Filter Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/80 space-y-2.5">
          <div className="flex items-center gap-2">
            <form onSubmit={handleBarcodeSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Scan barcode / ISBN atau ketik nama buku/ATK... (Tekan Enter)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Cari (F1)</span>
              </button>
            </form>

            {/* Tombol Shift Kasir */}
            <button
              type="button"
              onClick={() => setIsShiftModalOpen(true)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer ${
                activeShift
                  ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-amber-950/80 hover:bg-amber-900 border-amber-600/80 text-amber-300 animate-pulse'
              }`}
              title={activeShift ? `Shift aktif: ${activeShift.cashierName} (Saldo: ${formatRupiah(activeShift.expectedCash)})` : 'Shift kasir belum dibuka, klik untuk buka shift'}
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="leading-tight text-[11px] font-bold">
                  {activeShift ? activeShift.cashierName : 'Buka Shift'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {activeShift ? formatRupiah(activeShift.expectedCash) : 'Kas Tutup'}
                </span>
              </div>
            </button>
          </div>

          {/* Notifikasi Barcode Beep */}
          {barcodeNotification && (
            <div className="px-3 py-1.5 bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{barcodeNotification}</span>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('semua')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                selectedCategory === 'semua'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setSelectedCategory('buku')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                selectedCategory === 'buku'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku & Novel</span>
            </button>
            <button
              onClick={() => setSelectedCategory('alat_tulis')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                selectedCategory === 'alat_tulis'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Alat Tulis (ATK)</span>
            </button>
            <button
              onClick={() => setSelectedCategory('jasa')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                selectedCategory === 'jasa'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Layanan & Jasa</span>
            </button>

            {/* Held Orders Count Indicator */}
            {heldOrders.length > 0 && (
              <div className="ml-auto flex items-center gap-1">
                <span className="text-[11px] text-amber-400 bg-amber-950/70 border border-amber-800 px-2 py-0.5 rounded-full font-medium">
                  {heldOrders.length} Tertahan
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3.5">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Package className="w-12 h-12 stroke-1 text-slate-600" />
              <p className="text-sm font-medium">Produk tidak ditemukan</p>
              <p className="text-xs text-slate-600">Coba kata kunci lain atau scan barcode produk</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredProducts.map(product => {
                const isService = product.type === 'jasa';
                const isOutOfStock = !isService && product.stock <= 0;
                const isLowStock = !isService && product.stock > 0 && product.stock <= product.minStockAlert;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (isOutOfStock) {
                        soundService.playError();
                        return;
                      }
                      addToCart(product);
                    }}
                    className={`group relative p-2.5 sm:p-3 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                        : isService
                        ? 'bg-slate-900/90 border-slate-800 hover:border-purple-500/60 hover:bg-slate-850 hover:shadow-lg active:scale-[0.99]'
                        : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-850 hover:shadow-lg active:scale-[0.99]'
                    }`}
                  >
                    <div>
                      {/* Badge Tipe & Stok */}
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span className={`text-[10px] sm:text-[10.5px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shrink-0 ${
                          product.type === 'buku'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                            : product.type === 'alat_tulis'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                        }`}>
                          {product.type === 'buku' ? (
                            <>
                              <BookOpen className="w-3 h-3 text-blue-400 shrink-0" />
                              <span>Buku</span>
                            </>
                          ) : product.type === 'alat_tulis' ? (
                            <>
                              <PenTool className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>ATK</span>
                            </>
                          ) : (
                            <>
                              <Printer className="w-3 h-3 text-purple-400 shrink-0" />
                              <span>Jasa</span>
                            </>
                          )}
                        </span>

                        <span className={`text-[10px] sm:text-[10.5px] font-mono px-1.5 py-0.5 rounded-md font-semibold whitespace-nowrap shrink-0 ${
                          isService
                            ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                            : isOutOfStock
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            : isLowStock
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60 animate-pulse'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {isService ? `Per ${product.unit}` : isOutOfStock ? 'Habis' : `${product.stock} ${product.unit}`}
                        </span>
                      </div>

                      {/* Nama Produk (Ukuran Pas & Rapi, 2 baris seimbang) */}
                      <h4 
                        className="font-semibold text-xs sm:text-[13px] text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug min-h-[2.2rem] sm:min-h-[2.35rem]"
                        title={product.name}
                      >
                        {product.name}
                      </h4>

                      {/* Kategori & Lokasi Rak */}
                      <div className="mt-1.5 flex items-center justify-between text-[10.5px] sm:text-[11px] text-slate-400 gap-1 overflow-hidden">
                        <span className="truncate" title={product.category}>
                          {product.category}
                        </span>
                        {product.shelfLocation && (
                          <span 
                            className="text-[10px] text-slate-400 font-mono shrink-0 px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60"
                            title={`Lokasi Rak: ${product.shelfLocation}`}
                          >
                            {product.shelfLocation}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Harga & Tombol Tambah Proporsional */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="font-bold text-xs sm:text-[13px] lg:text-sm font-mono text-emerald-400 tabular-nums truncate">
                        {formatRupiah(product.sellPrice)}
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isOutOfStock) {
                            soundService.playError();
                            return;
                          }
                          addToCart(product);
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-90 text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
                        title="Tambah ke keranjang"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Shortcuts Cheat-sheet & Audio Controls Bar */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">F1</kbd>
              <span>Scan/Cari</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">F2</kbd>
              <span>Tahan Nota</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-emerald-400 font-bold">F12</kbd>
              <span>Bayar Cepat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">Esc</kbd>
              <span>Tutup/Batal</span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition-colors shrink-0 cursor-pointer"
            title={isMuted ? 'Aktifkan Suara Beep Kasir' : 'Bisukan Suara Beep Kasir'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[11px] text-rose-400 font-medium">Bisu (Muted)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-medium">Beep Aktif</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================
          BAGIAN KANAN: KERANJANG BELANJA & CHECKOUT
          ========================================= */}
      <div className="w-[430px] lg:w-[480px] xl:w-[520px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 shadow-2xl">
        {/* Header Keranjang */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 leading-tight">Keranjang Kasir</h3>
              <span className="text-[11px] text-slate-400">Daftar item belanja pelanggan</span>
            </div>
            <span className="ml-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-mono font-bold">
              {totalItemsCount} item
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Kosongkan semua barang dalam keranjang ini?')) {
                  setCart([]);
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium border border-rose-900/40"
              title="Kosongkan seluruh keranjang"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Daftar Barang dalam Keranjang */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                <Barcode className="w-8 h-8 text-slate-600 stroke-1" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-300">Keranjang Masih Kosong</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[260px] leading-relaxed">
                  Scan barcode barang atau klik produk di katalog sebelah kiri untuk mulai transaksi kasir
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
                  F1: Scan Barcode
                </span>
                <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
                  F12: Bayar Cepat
                </span>
              </div>

              {/* Tampilkan jika ada pesanan tertahan */}
              {heldOrders.length > 0 && (
                <div className="mt-4 w-full pt-3 border-t border-slate-800">
                  <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pesanan Tertahan ({heldOrders.length})</span>
                  </p>
                  <div className="space-y-2">
                    {heldOrders.map(order => (
                      <div
                        key={order.id}
                        className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between shadow-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{order.customerLabel}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {order.items.length} item • {formatRupiah(order.subtotal)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRecallOrder(order)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          Panggil
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.product.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700/80 transition-all shadow-xs space-y-2.5"
              >
                {/* Baris 1: Nama Produk, Harga Satuan & Tombol Hapus */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-semibold text-sm lg:text-base text-slate-100 leading-snug">
                      {item.product.name}
                    </h5>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 font-mono mt-1">
                      <span className="text-slate-300 font-medium">
                        {formatRupiah(item.unitPrice)} <span className="text-slate-500">/ {item.product.unit}</span>
                      </span>
                      {item.product.shelfLocation && (
                        <span className="text-[11px] text-slate-500 font-sans">
                          • Rak {item.product.shelfLocation}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 flex items-center justify-center transition-colors shrink-0"
                    title="Hapus barang dari keranjang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Baris 2: Stepper Kuantitas + Tombol Diskon + Subtotal Nominal Besar */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {/* Stepper Jumlah */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center font-bold text-base transition-all"
                      title="Kurangi 1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                      className="w-14 h-8 text-center bg-slate-900 border border-slate-700 rounded-lg text-sm lg:text-base font-bold font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center font-bold text-base transition-all shadow-xs"
                      title="Tambah 1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Tombol Diskon Per Item */}
                    <button
                      type="button"
                      onClick={() => {
                        const currentVal = item.discountValue || 0;
                        const val = prompt(`Masukkan diskon persen (%) untuk "${item.product.name}":`, String(currentVal));
                        if (val !== null) {
                          const num = parseFloat(val) || 0;
                          updateItemDiscount(item.product.id, 'percentage', Math.max(0, Math.min(100, num)));
                        }
                      }}
                      className={`h-8 px-2 rounded-lg text-xs font-mono font-medium flex items-center gap-1 border transition-colors ${
                        item.discountValue > 0
                          ? 'bg-amber-950/60 border-amber-700/80 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                      title="Atur diskon per item"
                    >
                      <Percent className="w-3 h-3" />
                      <span>{item.discountValue > 0 ? `${item.discountValue}%` : 'Disc'}</span>
                    </button>
                  </div>

                  {/* Nominal Subtotal Item (Besar & Kontras) */}
                  <div className="text-right pl-2">
                    {item.discountValue > 0 && (
                      <div className="text-[11px] text-slate-500 line-through font-mono">
                        {formatRupiah(item.unitPrice * item.quantity)}
                      </div>
                    )}
                    <div className="font-extrabold text-base lg:text-lg font-mono text-emerald-400 tabular-nums tracking-tight">
                      {formatRupiah(item.subtotal)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rangkuman Biaya & Tombol Bayar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
          {/* Display Board Kasir / Layar Total Tagihan */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg space-y-2">
            <div className="flex justify-between text-xs lg:text-sm text-slate-400">
              <span>Subtotal ({totalItemsCount} item)</span>
              <span className="font-mono text-slate-200 font-semibold">{formatRupiah(subtotalCart)}</span>
            </div>

            {totalDiscount > 0 && (
              <div className="flex justify-between text-xs lg:text-sm text-amber-400 font-medium">
                <span>Total Potongan Diskon</span>
                <span className="font-mono font-bold">-{formatRupiah(totalDiscount)}</span>
              </div>
            )}

            <div className="pt-2.5 border-t border-slate-800/80 flex items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-bold tracking-wider text-slate-300 uppercase block">Total Bayar</span>
                <span className="text-[10px] text-emerald-400/80 font-mono font-medium">F12 untuk Bayar Cepat</span>
              </div>
              <div className="text-right">
                <div className="text-3xl lg:text-4xl font-black font-mono tracking-tight text-emerald-400 tabular-nums drop-shadow-sm">
                  {formatRupiah(grandTotalCart)}
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Tahan & Bayar Kasir */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleHoldOrder}
              className="col-span-1 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all"
              title="Tahan transaksi untuk melayani antrian berikutnya"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Tahan</span>
            </button>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setIsPaymentModalOpen(true)}
              className="col-span-3 h-14 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-base lg:text-lg font-black tracking-wide flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <CreditCard className="w-5 h-5" />
              <span>BAYAR (F12)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Pembayaran */}
      {isPaymentModalOpen && (
        <PaymentModal
          cart={cart}
          subtotal={subtotalCart}
          discountTotal={totalDiscount}
          grandTotal={grandTotalCart}
          storeProfile={storeProfile}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }}
          onSuccess={(transaction) => {
            setIsPaymentModalOpen(false);
            setCart([]);
            refreshData();
            refreshShift();
            setActiveReceiptTx(transaction);
          }}
        />
      )}

      {/* Modal Cetak Struk */}
      {activeReceiptTx && (
        <ReceiptModal
          transaction={activeReceiptTx}
          storeProfile={storeProfile}
          onClose={() => {
            setActiveReceiptTx(null);
            setTimeout(() => {
              searchInputRef.current?.focus();
              searchInputRef.current?.select();
            }, 100);
          }}
        />
      )}

      {/* Modal Shift Kasir & Rekap Laci */}
      {isShiftModalOpen && (
        <ShiftModal
          activeShift={activeShift}
          storeProfile={storeProfile}
          onClose={() => {
            setIsShiftModalOpen(false);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }}
          onShiftChange={() => {
            refreshShift();
            refreshData();
          }}
        />
      )}
    </div>
  );
};
