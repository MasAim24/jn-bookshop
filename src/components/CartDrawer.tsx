import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  Truck, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartCount,
    cartSubtotal,
    cartDiscount,
    shippingCost,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    finalTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    formatPrice,
    appliedPromo,
    applyPromo,
    removePromo,
    setIsCheckoutOpen,
    setSelectedCategory
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyPromo(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Free shipping percentage
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-over Container */}
      <div 
        className="relative w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l animate-in slide-in-from-right duration-300 z-10"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--brand-primary-light)] text-[var(--brand-primary)]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
                Keranjang Belanja
              </h3>
              <span className="text-xs text-[var(--text-secondary)]">
                {cartCount} buku siap dikirim
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-[var(--text-muted)] hover:text-rose-500 transition-colors p-1"
                title="Kosongkan keranjang"
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Tutup keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping Milestone Progress */}
        <div 
          className="px-6 py-3 border-b text-xs space-y-1.5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
              <Truck className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              {amountNeededForFreeShipping === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Hore! Anda berhak Bebas Ongkir 🎉
                </span>
              ) : (
                <span>
                  Tambah <strong className="text-[var(--brand-primary)]">{formatPrice(amountNeededForFreeShipping)}</strong> untuk Gratis Ongkir
                </span>
              )}
            </span>
            <span className="text-[var(--text-muted)]">{freeShippingProgress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${freeShippingProgress}%`,
                backgroundColor: amountNeededForFreeShipping === 0 ? 'var(--status-success)' : 'var(--brand-primary)',
              }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-4 rounded-2xl bg-[var(--bg-muted)] text-[var(--text-muted)]">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h4 className="font-serif font-bold text-base text-[var(--text-primary)]">
                Keranjang Masih Kosong
              </h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs">
                Jelajahi koleksi buku sastra, fiksi, dan pengembangan diri terbaik pilihan kami.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setSelectedCategory('Semua');
                }}
                className="mt-2 py-2 px-5 rounded-xl text-xs font-bold text-white shadow"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                Mulai Belanja Sekarang
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={`${item.book.id}-${item.format}`}
                className="flex items-start gap-3.5 p-3 rounded-2xl border transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                {/* Book Thumbnail */}
                <img 
                  src={item.book.coverImage} 
                  alt={item.book.title} 
                  className="w-14 h-20 object-cover rounded-r-md rounded-l-xs book-spine-shadow shrink-0" 
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-bold font-serif text-[var(--text-primary)] line-clamp-1">
                      {item.book.title}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.book.id, item.format)}
                      className="text-[var(--text-muted)] hover:text-rose-500 p-0.5"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] truncate">
                    {item.book.author}
                  </p>

                  <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                    {item.format}
                  </span>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center border border-[var(--border-strong)] rounded-lg overflow-hidden bg-[var(--bg-elevated)]">
                      <button
                        onClick={() => updateQuantity(item.book.id, item.format, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 text-xs font-bold text-[var(--text-primary)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.book.id, item.format, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-extrabold text-[var(--brand-primary)]">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Calculations */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-[var(--border-subtle)] space-y-4 bg-[var(--bg-elevated)]">
            
            {/* Promo Code Input */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Voucher <strong>{appliedPromo.code}</strong> aktif</span>
                  </div>
                  <button
                    onClick={removePromo}
                    className="text-emerald-800 dark:text-emerald-200 hover:text-rose-500 font-bold p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex items-center rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-surface)]">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Kode Promo (coba JN2026)"
                      className="w-full py-2 px-3 text-xs bg-transparent outline-none uppercase font-mono text-[var(--text-primary)]"
                    />
                    <button
                      type="submit"
                      className="py-2 px-3 text-xs font-bold text-[var(--brand-primary)] hover:bg-[var(--brand-primary-light)] transition-colors shrink-0"
                    >
                      Gunakan
                    </button>
                  </div>
                  {couponFeedback && !couponFeedback.success && (
                    <p className="text-[10px] text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {couponFeedback.message}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal Buku ({cartCount} item)</span>
                <span className="font-semibold text-[var(--text-primary)]">{formatPrice(cartSubtotal)}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Potongan Diskon</span>
                  <span>-{formatPrice(cartDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Estimasi Biaya Ongkir</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="font-bold text-emerald-600">GRATIS</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-[var(--text-primary)] pt-2 border-t border-[var(--border-subtle)]">
                <span>Total Pembayaran</span>
                <span className="text-base text-[var(--brand-primary)]">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-4 h-4 icon-arrow-centroid" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
