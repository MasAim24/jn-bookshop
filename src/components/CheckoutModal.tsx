import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { OrderDetails } from '../types';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Truck, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft, 
  Printer, 
  Check,
  Building2,
  Wallet
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartDiscount,
    shippingCost,
    finalTotal,
    formatPrice,
    clearCart,
    lastOrder,
    setLastOrder,
    addToast
  } = useShop();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    name: 'Siti Rahmawati',
    phone: '0812-3456-7890',
    address: 'Jl. Teuku Cik Ditiro No. 42, Menteng',
    city: 'Jakarta Pusat',
    postalCode: '10310',
    notes: 'Mohon selipkan pembatas buku tambahan jika ada, terima kasih!',
  });

  const [courier, setCourier] = useState('JNE Reguler Express (1-2 Hari)');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca_va' | 'mandiri_va' | 'gopay'>('qris');

  if (!isCheckoutOpen) return null;

  const handleCompleteOrder = () => {
    // Generate order ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `JN-2026-${randomNum}`;

    const newOrder: OrderDetails = {
      orderId,
      customerName: formData.name,
      phone: formData.phone,
      address: `${formData.address}, ${formData.city} ${formData.postalCode}`,
      city: formData.city,
      courier,
      paymentMethod: 
        paymentMethod === 'qris' ? 'QRIS Pembayaran Instan' :
        paymentMethod === 'bca_va' ? 'BCA Virtual Account' :
        paymentMethod === 'mandiri_va' ? 'Mandiri Virtual Account' : 'GoPay / e-Wallet',
      items: cart.map(item => ({
        title: item.book.title,
        author: item.book.author,
        format: item.format,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shippingFee: shippingCost,
      total: finalTotal,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'Diproses',
    };

    setLastOrder(newOrder);
    setStep(3);
    clearCart();

    // Fire Confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D95D39', '#C98A2C', '#2A9D8F', '#2C3E35'],
      });
    } catch {}

    addToast('Pesanan Berhasil Dibuat!', `Order ${orderId} sedang disiapkan oleh tim kurasi JN Bookshop.`, 'success');
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/75 animate-in fade-in">
      <div 
        className="w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-lg text-[var(--text-primary)]">
              {step === 3 ? 'Pesanan Berhasil!' : 'Penyelesaian Pesanan (Checkout)'}
            </span>
            {step < 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)] font-semibold">
                Langkah {step} dari 2
              </span>
            )}
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* STEP 1: Shipping Address & Courier */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
                <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Alamat Pengiriman Buku
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Nama Penerima</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Kota / Kabupaten</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Jakarta Pusat">Jakarta Pusat</option>
                    <option value="Jakarta Selatan">Jakarta Selatan</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Semarang">Semarang</option>
                    <option value="Denpasar">Denpasar</option>
                    <option value="Medan">Medan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Kode Pos</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              {/* Courier Selection */}
              <div className="pt-2">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                  Pilihan Jasa Ekspedisi:
                </label>
                <div className="space-y-2">
                  {[
                    { name: 'JNE Reguler Express (1-2 Hari)', badge: 'Rekomendasi' },
                    { name: 'SiCepat Best Cargo (1 Hari Sampai)', badge: 'Cepat' },
                    { name: 'AnterAja Eco Delivery (2-3 Hari)', badge: 'Hemat' },
                  ].map((c) => (
                    <label
                      key={c.name}
                      onClick={() => setCourier(c.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        courier === c.name
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-light)]'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-[var(--text-primary)]">
                        <Truck className="w-4 h-4 text-[var(--brand-primary)]" />
                        <span>{c.name}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)]">
                        {c.badge}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary Bottom */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Total Pembayaran</span>
                  <div className="text-lg font-extrabold text-[var(--brand-primary)]">
                    {formatPrice(finalTotal)}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 py-2.5 px-6 rounded-xl font-bold text-xs text-white shadow transition-all hover:opacity-95 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  <span>Pilih Pembayaran</span>
                  <ArrowRight className="w-4 h-4 icon-arrow-centroid" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
                <CreditCard className="w-4 h-4 text-[var(--brand-primary)]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Metode Pembayaran Aman
                </h3>
              </div>

              <div className="space-y-2.5">
                {/* QRIS */}
                <div 
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'qris'
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-light)] ring-2 ring-[var(--brand-primary)]/20'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-black/30 shadow-sm border border-[var(--border-subtle)]">
                        <QrCode className="w-5 h-5 text-[var(--brand-primary)]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">
                          QRIS Instan (Semua Bank & e-Wallet)
                        </h4>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, DANA
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'qris' && <Check className="w-4 h-4 text-[var(--brand-primary)]" />}
                  </div>

                  {paymentMethod === 'qris' && (
                    <div className="mt-3 p-3 rounded-xl bg-white dark:bg-black/40 border border-[var(--border-subtle)] flex items-center justify-center flex-col gap-1.5">
                      <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border text-xs text-center p-2 font-mono">
                        [QRIS KODE JN BOOKSHOP]
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Scan menggunakan aplikasi mobile banking apa pun
                      </span>
                    </div>
                  )}
                </div>

                {/* BCA Virtual Account */}
                <div 
                  onClick={() => setPaymentMethod('bca_va')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'bca_va'
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-light)] ring-2 ring-[var(--brand-primary)]/20'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-black/30 shadow-sm border border-[var(--border-subtle)]">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">
                          BCA Virtual Account
                        </h4>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Verifikasi instan otomatis 24 jam
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'bca_va' && <Check className="w-4 h-4 text-[var(--brand-primary)]" />}
                  </div>
                </div>

                {/* Mandiri Virtual Account */}
                <div 
                  onClick={() => setPaymentMethod('mandiri_va')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'mandiri_va'
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-light)] ring-2 ring-[var(--brand-primary)]/20'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-black/30 shadow-sm border border-[var(--border-subtle)]">
                        <Building2 className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">
                          Mandiri Virtual Account (Livin')
                        </h4>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Konfirmasi pembayaran otomatis tanpa upload struk
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'mandiri_va' && <Check className="w-4 h-4 text-[var(--brand-primary)]" />}
                  </div>
                </div>
              </div>

              {/* Navigation Bottom */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali ke Alamat</span>
                </button>

                <button
                  onClick={handleCompleteOrder}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Bayar Sekarang ({formatPrice(finalTotal)})</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Success & Invoice Receipt */}
          {step === 3 && lastOrder && (
            <div className="space-y-6 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-serif font-extrabold text-[var(--text-primary)]">
                  Terima Kasih Atas Pesanan Anda!
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  Nomor Pesanan: <strong className="font-mono text-[var(--brand-primary)]">{lastOrder.orderId}</strong>
                </p>
              </div>

              {/* Receipt Ticket Box */}
              <div 
                className="p-5 rounded-2xl border text-left space-y-4 text-xs shadow-inner"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-bold">Waktu Transaksi</span>
                    <span className="font-semibold text-[var(--text-primary)]">{lastOrder.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-bold">Status Pesanan</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      {lastOrder.status} (Gudang JN)
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                    Daftar Buku:
                  </span>
                  {lastOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-[var(--text-primary)]">{item.title}</strong>
                        <span className="text-[var(--text-muted)] ml-1">({item.format} x{item.quantity})</span>
                      </div>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Pengiriman ({lastOrder.courier})</span>
                    <span>{lastOrder.shippingFee === 0 ? 'Gratis' : formatPrice(lastOrder.shippingFee)}</span>
                  </div>
                  {lastOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Voucher Diskon</span>
                      <span>-{formatPrice(lastOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-[var(--text-primary)] pt-1">
                    <span>Total yang Telah Dibayar</span>
                    <span className="text-[var(--brand-primary)]">{formatPrice(lastOrder.total)}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[var(--text-secondary)] bg-[var(--bg-muted)] p-2.5 rounded-xl">
                  <strong>Tujuan: </strong> {lastOrder.customerName} ({lastOrder.phone}) • {lastOrder.address}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl border border-[var(--border-strong)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Struk / Invoice</span>
                </button>

                <button
                  onClick={handleClose}
                  className="py-2.5 px-6 rounded-xl font-bold text-xs text-white shadow transition-all cursor-pointer"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  Lanjut Jelajahi Buku Lain
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
