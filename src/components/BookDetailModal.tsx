import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { BookFormat } from '../types';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  BookOpen, 
  ShieldCheck, 
  Truck, 
  Check, 
  Sparkles,
  Info,
  Layers,
  Calendar,
  Building,
  Scale,
  Maximize2
} from 'lucide-react';

export const BookDetailModal: React.FC = () => {
  const { 
    activeBookDetail, 
    setActiveBookDetail, 
    addToCart, 
    formatPrice, 
    toggleWishlist, 
    isInWishlist, 
    setActiveSampleReader,
    setIsCartOpen 
  } = useShop();

  const [selectedFormat, setSelectedFormat] = useState<BookFormat>('Paperback');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'synopsis' | 'specs' | 'reviews'>('synopsis');

  if (!activeBookDetail) return null;

  const isFavorite = isInWishlist(activeBookDetail.id);

  // Calculate dynamic price per format
  let price = activeBookDetail.price;
  if (selectedFormat === 'Hardcover') price = Math.round(activeBookDetail.price * 1.35);
  if (selectedFormat === 'E-Book') price = Math.round(activeBookDetail.price * 0.65);
  if (selectedFormat === 'Audiobook') price = Math.round(activeBookDetail.price * 0.85);

  const handleBuyNow = () => {
    addToCart(activeBookDetail, selectedFormat, quantity);
    setActiveBookDetail(null);
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/70 animate-in fade-in">
      <div 
        className="w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]">
              {activeBookDetail.category}
            </span>
            <span className="text-xs text-[var(--text-muted)]">• Detail Buku</span>
          </div>

          <button
            onClick={() => setActiveBookDetail(null)}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Col: Cover Image & Sample Button */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-48 sm:w-56 aspect-[1/1.42] rounded-r-xl rounded-l-xs overflow-hidden book-spine-shadow border border-black/10">
                <img 
                  src={activeBookDetail.coverImage} 
                  alt={activeBookDetail.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/45 via-black/15 to-transparent pointer-events-none" />
              </div>

              <div className="w-full max-w-xs mt-5 space-y-2">
                <button
                  onClick={() => {
                    const b = activeBookDetail;
                    setActiveBookDetail(null);
                    setActiveSampleReader(b);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary-light)] font-bold text-xs transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 icon-play-centroid" />
                  <span>Baca Sampel Bab Gratis</span>
                </button>

                <button
                  onClick={() => toggleWishlist(activeBookDetail.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[var(--border-strong)] hover:bg-[var(--bg-muted)] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
                  <span>{isFavorite ? 'Tersimpan di Wishlist' : 'Simpan ke Wishlist'}</span>
                </button>
              </div>
            </div>

            {/* Right Col: Book Metadata, Format Options, Synopsis & Reviews */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[var(--text-primary)] leading-tight">
                  {activeBookDetail.title}
                </h1>
                
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                  Penulis: <span className="font-semibold text-[var(--text-primary)]">{activeBookDetail.author}</span>
                </p>

                {/* Rating & Reviews counter */}
                <div className="flex items-center gap-2 mt-2.5">
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{activeBookDetail.rating}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    • {activeBookDetail.reviewCount} ulasan terverifikasi
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Stok Tersedia ({activeBookDetail.stock})
                  </span>
                </div>

                {/* Format Selector Pills */}
                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Pilih Format Buku:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {activeBookDetail.formats.map((fmt) => {
                      const isSelected = selectedFormat === fmt;
                      return (
                        <button
                          key={fmt}
                          onClick={() => setSelectedFormat(fmt)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-light)] ring-2 ring-[var(--brand-primary)]/20'
                              : 'border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--bg-surface)]'
                          }`}
                        >
                          <div className="text-xs font-bold text-[var(--text-primary)]">{fmt}</div>
                          <div className="text-[10px] text-[var(--brand-primary)] font-semibold mt-0.5">
                            {fmt === 'Hardcover' && '+35%'}
                            {fmt === 'E-Book' && '-35% (PDF/EPUB)'}
                            {fmt === 'Audiobook' && '-15% (Narasi)'}
                            {fmt === 'Paperback' && 'Standar'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tabs: Synopsis, Specs, Reviews */}
                <div className="mt-5">
                  <div className="flex border-b border-[var(--border-subtle)] gap-4 text-xs font-bold">
                    <button
                      onClick={() => setActiveTab('synopsis')}
                      className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'synopsis'
                          ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                          : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      Sinopsis Lengkap
                    </button>
                    <button
                      onClick={() => setActiveTab('specs')}
                      className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'specs'
                          ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                          : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      Spesifikasi Buku
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'reviews'
                          ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                          : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      Ulasan ({activeBookDetail.reviews.length})
                    </button>
                  </div>

                  <div className="pt-3 min-h-[140px]">
                    {activeTab === 'synopsis' && (
                      <div className="space-y-3">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                          {activeBookDetail.synopsis}
                        </p>
                        {activeBookDetail.authorBio && (
                          <div className="p-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                            <strong className="text-[var(--text-primary)]">Tentang Penulis: </strong>
                            {activeBookDetail.authorBio}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'specs' && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">ISBN-13</span>
                          <span className="font-semibold text-[var(--text-primary)] font-mono">{activeBookDetail.specs.isbn}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">Jumlah Halaman</span>
                          <span className="font-semibold text-[var(--text-primary)]">{activeBookDetail.specs.pages} Halaman</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">Penerbit</span>
                          <span className="font-semibold text-[var(--text-primary)]">{activeBookDetail.specs.publisher}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">Bahasa</span>
                          <span className="font-semibold text-[var(--text-primary)]">{activeBookDetail.specs.language}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">Dimensi</span>
                          <span className="font-semibold text-[var(--text-primary)]">{activeBookDetail.specs.dimensions}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">Berat Pengiriman</span>
                          <span className="font-semibold text-[var(--text-primary)]">{activeBookDetail.specs.weight}</span>
                        </div>
                      </div>
                    )}

                    {activeTab === 'reviews' && (
                      <div className="space-y-3">
                        {activeBookDetail.reviews.map((rev) => (
                          <div key={rev.id} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-[var(--text-primary)]">{rev.userName}</span>
                                {rev.verified && (
                                  <span className="text-[10px] text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded font-semibold">
                                    Pembeli Terverifikasi
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[var(--text-muted)]">{rev.date}</span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              "{rev.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Purchase Footer with Quantity & Buy Buttons */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold">
                    Total Harga ({selectedFormat})
                  </div>
                  <div className="text-2xl font-extrabold text-[var(--brand-primary)]">
                    {formatPrice(price * quantity)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[var(--border-strong)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-xs font-bold hover:bg-[var(--bg-muted)] text-[var(--text-primary)]"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 text-xs font-bold text-[var(--text-primary)]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(activeBookDetail.stock, quantity + 1))}
                      className="px-3 py-2 text-xs font-bold hover:bg-[var(--bg-muted)] text-[var(--text-primary)]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(activeBookDetail, selectedFormat, quantity);
                      setActiveBookDetail(null);
                    }}
                    className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary-light)] font-bold text-xs transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>+ Keranjang</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl font-bold text-xs text-white shadow-md transition-transform active:scale-95 cursor-pointer"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  >
                    <span>Beli Sekarang</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
