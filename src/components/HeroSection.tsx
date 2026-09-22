import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Sparkles, 
  BookOpen, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Clock, 
  Flame,
  ArrowRight,
  Eye
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { 
    books, 
    addToCart, 
    setActiveSampleReader, 
    setActiveBookDetail, 
    formatPrice 
  } = useShop();

  // Featured Hero Book: "Bumi Manusia"
  const featuredBook = books.find((b) => b.id === 'bumi-manusia') || books[0];

  // Flash Sale 24h Countdown state
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 38,
    seconds: 42,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden pt-6 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Editorial Hero Card */}
        <div 
          className="relative rounded-3xl border p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xl"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          {/* Subtle Ambient Glow */}
          <div 
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          />
          <div 
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: 'var(--accent-gold)' }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content / Editorial Copy */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge & Spotlight Tag */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                  style={{
                    backgroundColor: 'var(--accent-gold-bg)',
                    color: 'var(--accent-gold)',
                    border: '1px solid var(--accent-gold)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Kurasi Utama Pekan Ini
                </span>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  Tetralogi Buru #1
                </span>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 ml-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{featuredBook.rating}</span>
                  <span className="text-[var(--text-muted)] font-normal">
                    ({featuredBook.reviewCount} ulasan pembaca)
                  </span>
                </div>
              </div>

              {/* Title & Author */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15]">
                  {featuredBook.title}
                </h1>
                <p className="text-base sm:text-lg font-medium text-[var(--text-secondary)] mt-2">
                  Karya Agung <span className="text-[var(--brand-primary)] font-semibold">{featuredBook.author}</span>
                </p>
              </div>

              {/* Literary Quote Box */}
              {featuredBook.shortQuote && (
                <div 
                  className="p-4 rounded-2xl border-l-4 italic text-sm sm:text-base leading-relaxed"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--brand-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {featuredBook.shortQuote}
                </div>
              )}

              {/* Synopsis snippet */}
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                {featuredBook.synopsis}
              </p>

              {/* Pricing & CTA Actions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                    Harga Spesial
                  </div>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[var(--brand-primary)]">
                      {formatPrice(featuredBook.price)}
                    </span>
                    {featuredBook.originalPrice && (
                      <span className="text-sm text-[var(--text-muted)] line-through">
                        {formatPrice(featuredBook.originalPrice)}
                      </span>
                    )}
                    {featuredBook.discountPercentage && (
                      <span className="text-xs font-bold text-rose-500 bg-rose-100 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">
                        Hemat {featuredBook.discountPercentage}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => addToCart(featuredBook, 'Hardcover', 1)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-200 hover:opacity-95 active:scale-95 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--brand-primary)',
                    }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Beli Sekarang</span>
                  </button>

                  <button
                    onClick={() => setActiveSampleReader(featuredBook)}
                    className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm border transition-all duration-200 hover:bg-[var(--bg-muted)] active:scale-95 cursor-pointer text-[var(--text-primary)]"
                    style={{
                      borderColor: 'var(--border-strong)',
                      backgroundColor: 'var(--bg-elevated)',
                    }}
                    title="Baca Sampel Bab 1 Langsung di Aplikasi"
                  >
                    <BookOpen className="w-4 h-4 text-[var(--brand-primary)] icon-play-centroid" />
                    <span>Baca Sampel</span>
                  </button>

                  <button
                    onClick={() => setActiveBookDetail(featuredBook)}
                    className="p-3 rounded-xl border text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
                    title="Detail Buku Lengkap"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Side: Realistic 3D Book Presentation */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative group cursor-pointer" onClick={() => setActiveBookDetail(featuredBook)}>
                
                {/* Book Cover Frame with 3D spine shadow */}
                <div className="relative w-56 sm:w-64 lg:w-72 aspect-[1/1.45] rounded-r-xl rounded-l-sm overflow-hidden book-spine-shadow book-card-hover border-y border-r border-black/10">
                  <img
                    src={featuredBook.coverImage}
                    alt={featuredBook.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Spine Crease Overlay */}
                  <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none" />
                  {/* Subtle Paper Gloss Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none opacity-60" />
                </div>

                {/* Floating Tag */}
                <div 
                  className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-1.5 backdrop-blur-md animate-bounce"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Edisi Kolektor Terbatas</span>
                </div>
              </div>
            </div>

          </div>

          {/* Flash Sale Bar inside hero */}
          <div 
            className="mt-8 pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500 text-white animate-pulse">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-rose-500">
                  Flash Sale 24-Jam
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Diskon hingga 35% untuk 120 buku sastra & inspirasi terpilih
                </div>
              </div>
            </div>

            {/* Countdown timer blocks */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1 mr-1">
                <Clock className="w-3.5 h-3.5" /> Berakhir dalam:
              </span>
              <div className="flex items-center gap-1 font-mono font-bold text-xs">
                <span className="px-2 py-1 rounded-md bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                  {String(timeLeft.hours).padStart(2, '0')}j
                </span>
                <span className="text-[var(--text-muted)]">:</span>
                <span className="px-2 py-1 rounded-md bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span className="text-[var(--text-muted)]">:</span>
                <span className="px-2 py-1 rounded-md bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-[var(--brand-primary)]">
                  {String(timeLeft.seconds).padStart(2, '0')}d
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Trust & Guarantee Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div 
            className="flex items-center gap-3 p-4 rounded-2xl border transition-colors"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">100% Asli & Original</h4>
              <p className="text-[11px] text-[var(--text-muted)]">Langsung dari penerbit resmi</p>
            </div>
          </div>

          <div 
            className="flex items-center gap-3 p-4 rounded-2xl border transition-colors"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Pengiriman Cepat</h4>
              <p className="text-[11px] text-[var(--text-muted)]">Kirim hari yang sama ke seluruh RI</p>
            </div>
          </div>

          <div 
            className="flex items-center gap-3 p-4 rounded-2xl border transition-colors"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Garansi 7 Hari</h4>
              <p className="text-[11px] text-[var(--text-muted)]">Ganti baru jika cacat cetak</p>
            </div>
          </div>

          <div 
            className="flex items-center gap-3 p-4 rounded-2xl border transition-colors"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Packaging Premium</h4>
              <p className="text-[11px] text-[var(--text-muted)]">Kardus tebal & bubble wrap gratis</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
