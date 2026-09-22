import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  BookOpen, 
  Search, 
  Heart, 
  ShoppingBag, 
  Moon, 
  Sun, 
  MapPin, 
  X, 
  Sparkles, 
  ChevronRight,
  Menu,
  Coins
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    cartCount,
    wishlist,
    theme,
    toggleTheme,
    currency,
    toggleCurrency,
    searchQuery,
    setSearchQuery,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsStoreLocatorOpen,
    books,
    setActiveBookDetail,
    selectedCategory,
    setSelectedCategory,
    addToast
  } = useShop();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick search preview results (first 4 matches)
  const searchSuggestions = searchQuery.trim().length > 1
    ? books.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    addToast('Kode Disalin!', `Voucher ${code} siap digunakan di keranjang belanja.`, 'success');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(18, 21, 23, 0.92)' : 'rgba(250, 247, 242, 0.92)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Top Notification Bar */}
      <div 
        className="w-full text-xs py-1.5 px-4 flex items-center justify-between border-b"
        style={{
          backgroundColor: 'var(--brand-secondary)',
          color: '#F4F6F5',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex items-center gap-1 font-semibold text-[var(--accent-gold)]">
              <Sparkles className="w-3.5 h-3.5" /> Promo Spesial:
            </span>
            <span>Diskon 20% kode</span>
            <button
              onClick={() => handleCopyCode('JN2026')}
              className="px-1.5 py-0.5 rounded font-mono font-bold bg-white/10 hover:bg-white/20 transition-colors underline cursor-pointer"
              title="Klik untuk salin kode"
            >
              JN2026
            </button>
            <span className="hidden sm:inline">• Gratis Ongkir min. belanja Rp 150.000</span>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <button
              onClick={() => setIsStoreLocatorOpen(true)}
              className="hidden md:flex items-center gap-1 hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Lokasi Toko Fisik</span>
            </button>

            <button
              onClick={toggleCurrency}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors font-medium cursor-pointer"
              title="Ganti mata uang"
            >
              <Coins className="w-3 h-3" />
              <span>{currency}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Monogram */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
              aria-label="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory('Semua');
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#FFFFFF',
                }}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[var(--text-primary)]">
                  JN Bookshop
                </span>
                <span className="text-[10px] tracking-widest uppercase font-medium text-[var(--text-muted)] -mt-0.5">
                  Curated Literature
                </span>
              </div>
            </a>
          </div>

          {/* Search Bar with live autocomplete */}
          <div className="relative flex-1 max-w-xl mx-2 hidden sm:block">
            <div 
              className="relative flex items-center rounded-xl border transition-all duration-200"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: isSearchFocused ? 'var(--brand-primary)' : 'var(--border-subtle)',
                boxShadow: isSearchFocused ? '0 0 0 3px rgba(217, 93, 57, 0.15)' : 'none',
              }}
            >
              <Search className="w-4 h-4 ml-3.5 text-[var(--text-muted)] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                placeholder="Cari judul buku, penulis, kategori, atau ISBN..."
                className="w-full py-2.5 pl-3 pr-16 text-sm bg-transparent outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />

              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 mr-2 rounded-full hover:bg-[var(--bg-muted)] text-[var(--text-muted)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="hidden lg:flex items-center gap-1 mr-3 px-1.5 py-0.5 rounded text-[10px] font-mono border text-[var(--text-muted)] border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                  <span>⌘</span><span>K</span>
                </div>
              )}
            </div>

            {/* Quick search popup suggestions */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div 
                className="absolute left-0 right-0 mt-2 p-2 rounded-xl shadow-2xl border z-50 animate-in fade-in slide-in-from-top-2"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="text-[11px] font-semibold text-[var(--text-muted)] px-3 py-1.5 uppercase tracking-wider">
                  Hasil Terkait ({searchSuggestions.length})
                </div>
                {searchSuggestions.map((book) => (
                  <div
                    key={book.id}
                    onMouseDown={() => {
                      setActiveBookDetail(book);
                      setIsSearchFocused(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-muted)] cursor-pointer transition-colors"
                  >
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-9 h-12 object-cover rounded shadow-sm shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {book.title}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {book.author} • {book.category}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Icons: Theme, Wishlist, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)]"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)',
              }}
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2.5 rounded-xl border transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-rose-500 hover:border-rose-300"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)',
              }}
              title="Daftar Impian (Wishlist)"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span 
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1 shadow-sm"
                  style={{ backgroundColor: '#E76F51' }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 py-2 px-3 sm:px-3.5 rounded-xl transition-all cursor-pointer font-medium text-sm shadow-sm"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: '#FFFFFF',
              }}
              title="Buka Keranjang Belanja"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Keranjang</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-white text-[var(--brand-primary)] rounded-full shadow-inner">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 sm:hidden">
          <div 
            className="flex items-center rounded-xl border py-2 px-3"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <Search className="w-4 h-4 text-[var(--text-muted)] mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, penulis, atau genre..."
              className="w-full text-xs bg-transparent outline-none text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden border-t px-4 py-4 space-y-3 animate-in slide-in-from-top-2"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Kategori Pilihan
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {['Semua', 'Sastra & Fiksi', 'Pengembangan Diri', 'Non-Fiksi & Sains', 'Bisnis & Finansial', 'Teknologi & Koding'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg text-left text-xs font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-[var(--brand-primary)] text-white' 
                    : 'hover:bg-[var(--bg-muted)] text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <button
              onClick={() => {
                setIsStoreLocatorOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 hover:text-[var(--text-primary)]"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Lokasi Toko Fisik</span>
            </button>
            <span>JN Bookshop v2.4</span>
          </div>
        </div>
      )}
    </header>
  );
};
