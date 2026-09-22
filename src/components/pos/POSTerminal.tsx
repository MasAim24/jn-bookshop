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
  Package
} from 'lucide-react';
import { ProductItem, POSCartItem, HeldOrder, StoreProfile } from '../../types/pos';
import { dbService, formatRupiah } from '../../services/db';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';

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
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'buku' | 'alat_tulis'>('semua');
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] = useState<any | null>(null);
  const [barcodeNotification, setBarcodeNotification] = useState<string | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load held orders
  useEffect(() => {
    setHeldOrders(dbService.getHeldOrders());
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
      // F12 to checkout
      if (e.key === 'F12' && cart.length > 0) {
        e.preventDefault();
        setIsPaymentModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

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
      addToCart(exactMatch);
      setBarcodeNotification(`Berhasil scan: ${exactMatch.name}`);
      setSearchQuery('');
      setTimeout(() => setBarcodeNotification(null), 2500);
      return;
    }

    // Jika ada 1 hasil filter pencarian, tambahkan langsung
    if (filteredProducts.length === 1) {
      addToCart(filteredProducts[0]);
      setBarcodeNotification(`Ditambahkan: ${filteredProducts[0].name}`);
      setSearchQuery('');
      setTimeout(() => setBarcodeNotification(null), 2500);
    }
  };

  // Tambah item ke keranjang
  const addToCart = (product: ProductItem) => {
    if (product.stock <= 0) {
      alert(`Stok produk "${product.name}" habis! Silakan lakukan restok terlebih dahulu.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Jumlah melebihi stok yang tersedia (${product.stock} ${product.unit})`);
          return prev;
        }
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
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>Cari (F1)</span>
            </button>
          </form>

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
              Semua Produk ({products.length})
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
        <div className="flex-1 overflow-y-auto p-3">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Package className="w-12 h-12 stroke-1 text-slate-600" />
              <p className="text-sm font-medium">Produk tidak ditemukan</p>
              <p className="text-xs text-slate-600">Coba kata kunci lain atau scan barcode produk</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`group relative p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                        : 'bg-slate-900 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-850 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Badge Tipe & Stok */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          product.type === 'buku'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                        }`}>
                          {product.type === 'buku' ? 'Buku' : 'ATK'}
                        </span>

                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                          isOutOfStock
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/50'
                            : isLowStock
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {isOutOfStock ? 'Habis' : `Stok: ${product.stock} ${product.unit}`}
                        </span>
                      </div>

                      {/* Nama Produk */}
                      <h4 className="font-medium text-xs text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h4>

                      {/* Kategori & Lokasi Rak */}
                      <p className="text-[10px] text-slate-400 mt-1 truncate">
                        {product.category} • <span className="text-slate-500">{product.shelfLocation}</span>
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between">
                      <div className="font-bold text-xs font-mono text-emerald-400">
                        {formatRupiah(product.sellPrice)}
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className="w-6 h-6 rounded bg-emerald-600/80 group-hover:bg-emerald-500 text-white flex items-center justify-center transition-transform group-hover:scale-105"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          BAGIAN KANAN: KERANJANG BELANJA & CHECKOUT
          ========================================= */}
      <div className="w-96 bg-slate-900 flex flex-col shrink-0">
        {/* Header Keranjang */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-100">Keranjang Kasir</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              {totalItemsCount} item
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Daftar Barang dalam Keranjang */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Barcode className="w-10 h-10 text-slate-700 stroke-1" />
              <p className="text-xs font-medium text-slate-400">Keranjang Masih Kosong</p>
              <p className="text-[11px] text-slate-600 text-center max-w-[200px]">
                Scan barcode barang atau klik produk di katalog untuk menambahkan
              </p>

              {/* Tampilkan jika ada pesanan tertahan */}
              {heldOrders.length > 0 && (
                <div className="mt-4 w-full pt-3 border-t border-slate-800">
                  <p className="text-[11px] font-semibold text-amber-400 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Pesanan Tertahan ({heldOrders.length})</span>
                  </p>
                  <div className="space-y-1.5">
                    {heldOrders.map(order => (
                      <div
                        key={order.id}
                        className="p-2 rounded bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-slate-200">{order.customerLabel}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {order.items.length} item • {formatRupiah(order.subtotal)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRecallOrder(order)}
                          className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-medium"
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
                className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-medium text-xs text-slate-100 truncate">
                      {item.product.name}
                    </h5>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {formatRupiah(item.unitPrice)} / {item.product.unit}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Hapus item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Stepper Jumlah & Subtotal */}
                <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                      className="w-10 text-center py-0.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-slate-100"
                    />
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-xs font-mono text-emerald-400">
                      {formatRupiah(item.subtotal)}
                    </div>
                    {item.discountValue > 0 && (
                      <div className="text-[10px] text-amber-400 font-mono">
                        Diskon: {item.discountValue}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rangkuman Biaya & Tombol Bayar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2.5">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200">{formatRupiah(subtotalCart)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Diskon</span>
                <span className="font-mono">-{formatRupiah(totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-800">
              <span className="font-bold text-sm text-slate-100">Total Tagihan</span>
              <span className="font-bold text-xl font-mono text-emerald-400">
                {formatRupiah(grandTotalCart)}
              </span>
            </div>
          </div>

          {/* Tombol Tahan & Bayar */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleHoldOrder}
              className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
              title="Tahan transaksi untuk antrian lain"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Tahan</span>
            </button>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setIsPaymentModalOpen(true)}
              className="col-span-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
            >
              <CreditCard className="w-4 h-4" />
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
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={(transaction) => {
            setIsPaymentModalOpen(false);
            setCart([]);
            refreshData();
            setActiveReceiptTx(transaction);
          }}
        />
      )}

      {/* Modal Cetak Struk */}
      {activeReceiptTx && (
        <ReceiptModal
          transaction={activeReceiptTx}
          storeProfile={storeProfile}
          onClose={() => setActiveReceiptTx(null)}
        />
      )}
    </div>
  );
};
