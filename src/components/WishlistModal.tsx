import React from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  Heart, 
  Trash2, 
  ShoppingBag, 
  BookOpen, 
  Check 
} from 'lucide-react';

export const WishlistModal: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    books,
    toggleWishlist,
    addToCart,
    formatPrice,
    setActiveBookDetail,
    addToast
  } = useShop();

  if (!isWishlistOpen) return null;

  const wishlistBooks = books.filter((b) => wishlist.includes(b.id));

  const handleMoveAllToCart = () => {
    wishlistBooks.forEach((book) => {
      addToCart(book, 'Paperback', 1);
    });
    addToast('Semua Dipindahkan!', `${wishlistBooks.length} buku wishlist berhasil ditambahkan ke keranjang belanja.`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/70 animate-in fade-in">
      <div 
        className="w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
                Daftar Impian Membaca (Wishlist)
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {wishlistBooks.length} judul tersimpan di rak pribadi Anda
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlistBooks.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-4 rounded-2xl bg-[var(--bg-muted)] text-[var(--text-muted)]">
                <Heart className="w-10 h-10" />
              </div>
              <h4 className="font-serif font-bold text-base text-[var(--text-primary)]">
                Daftar Impian Masih Kosong
              </h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs">
                Klik ikon hati pada buku yang Anda sukai untuk menyimpannya ke daftar bacaan nanti.
              </p>
            </div>
          ) : (
            wishlistBooks.map((book) => (
              <div 
                key={book.id}
                className="flex items-center justify-between gap-4 p-3.5 rounded-2xl border transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div 
                  className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                  onClick={() => {
                    setIsWishlistOpen(false);
                    setActiveBookDetail(book);
                  }}
                >
                  <img 
                    src={book.coverImage} 
                    alt={book.title} 
                    className="w-12 h-16 object-cover rounded book-spine-shadow shrink-0" 
                  />
                  <div className="truncate">
                    <h4 className="text-xs sm:text-sm font-serif font-bold text-[var(--text-primary)] truncate hover:text-[var(--brand-primary)]">
                      {book.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {book.author}
                    </p>
                    <span className="text-xs font-extrabold text-[var(--brand-primary)] block mt-0.5">
                      {formatPrice(book.price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => addToCart(book, 'Paperback', 1)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                    title="Tambah ke Keranjang"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">+ Keranjang</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(book.id)}
                    className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
                    title="Hapus dari Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlistBooks.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]">
            <span className="text-xs text-[var(--text-muted)]">
              Total {wishlistBooks.length} buku impian
            </span>

            <button
              onClick={handleMoveAllToCart}
              className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary-light)] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Pindahkan Semua ke Keranjang</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
