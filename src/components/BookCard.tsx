import React from 'react';
import { Book } from '../types';
import { useShop } from '../context/ShopContext';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  BookOpen, 
  Eye, 
  Sparkles,
  Headphones,
  Check
} from 'lucide-react';

interface BookCardProps {
  book: Book;
  viewMode?: 'grid' | 'list';
}

export const BookCard: React.FC<BookCardProps> = ({ book, viewMode = 'grid' }) => {
  const { 
    formatPrice, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setActiveBookDetail, 
    setActiveSampleReader,
    cart 
  } = useShop();

  const isFavorite = isInWishlist(book.id);
  const isInCart = cart.some((item) => item.book.id === book.id);

  if (viewMode === 'list') {
    return (
      <div 
        className="flex flex-col sm:flex-row gap-5 p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover:shadow-md group"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Book Cover */}
        <div 
          onClick={() => setActiveBookDetail(book)}
          className="relative w-28 sm:w-36 aspect-[1/1.45] rounded-r-lg rounded-l-xs overflow-hidden book-spine-shadow shrink-0 cursor-pointer self-center sm:self-start"
        >
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          {/* Spine crease */}
          <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none" />
          
          {book.discountPercentage && (
            <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded shadow">
              -{book.discountPercentage}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">
                {book.category}
              </span>
              <button
                onClick={() => toggleWishlist(book.id)}
                className="p-1.5 rounded-full hover:bg-[var(--bg-muted)] transition-colors text-[var(--text-muted)] cursor-pointer"
                title={isFavorite ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
              </button>
            </div>

            <h3 
              onClick={() => setActiveBookDetail(book)}
              className="text-base sm:text-lg font-serif font-bold text-[var(--text-primary)] hover:text-[var(--brand-primary)] cursor-pointer mt-1 line-clamp-1 transition-colors"
            >
              {book.title}
            </h3>
            
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
              oleh <span className="text-[var(--text-primary)] font-semibold">{book.author}</span>
            </p>

            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-2 leading-relaxed">
              {book.synopsis}
            </p>

            {/* Ratings & Formats */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{book.rating}</span>
                <span className="text-[var(--text-muted)] font-normal text-[11px]">
                  ({book.reviewCount})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {book.formats.map((fmt) => (
                  <span 
                    key={fmt}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-muted)] text-[var(--text-secondary)] font-medium border border-[var(--border-subtle)]"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[var(--brand-primary)]">
                {formatPrice(book.price)}
              </span>
              {book.originalPrice && (
                <span className="text-xs text-[var(--text-muted)] line-through">
                  {formatPrice(book.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSampleReader(book)}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold border border-[var(--border-strong)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer text-[var(--text-primary)]"
              >
                <BookOpen className="w-3.5 h-3.5 text-[var(--brand-primary)] icon-play-centroid" />
                <span>Sampel</span>
              </button>

              <button
                onClick={() => addToCart(book, 'Paperback', 1)}
                className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg text-xs font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                {isInCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                <span>{isInCart ? 'Tambah Lagi' : '+ Keranjang'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Mode (Default)
  return (
    <div 
      className="group flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg hover:border-[var(--brand-primary)] relative"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div>
        {/* Cover with 3D Spine and Badge Overlays */}
        <div className="relative aspect-[1/1.42] w-full rounded-r-xl rounded-l-xs overflow-hidden book-spine-shadow mb-3.5 bg-[var(--bg-muted)]">
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            onClick={() => setActiveBookDetail(book)}
          />

          {/* Left spine shadow crease */}
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/45 via-black/15 to-transparent pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            {book.isBestseller && (
              <span 
                className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md shadow-sm"
                style={{
                  backgroundColor: 'var(--accent-gold)',
                  color: '#FFFFFF',
                }}
              >
                Bestseller
              </span>
            )}
            {book.discountPercentage && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500 text-white shadow-sm">
                -{book.discountPercentage}%
              </span>
            )}
            {book.isStaffPick && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Pilihan JN
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={() => toggleWishlist(book.id)}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md text-[var(--text-secondary)] hover:text-rose-500 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
            title={isFavorite ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>

          {/* Quick Hover Action Bar */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setActiveSampleReader(book)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-black/75 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-sm shadow-md transition-all cursor-pointer"
              title="Baca Sampel Bab"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--brand-primary)] icon-play-centroid" />
              <span>Baca Sampel</span>
            </button>

            <button
              onClick={() => setActiveBookDetail(book)}
              className="p-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-white backdrop-blur-sm shadow-md transition-all cursor-pointer"
              title="Detail Buku"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
          <span className="text-[var(--text-muted)] font-medium truncate">
            {book.category}
          </span>
          <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{book.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={() => setActiveBookDetail(book)}
          className="font-serif font-bold text-base text-[var(--text-primary)] hover:text-[var(--brand-primary)] line-clamp-1 cursor-pointer transition-colors leading-snug"
          title={book.title}
        >
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1 font-medium">
          {book.author}
        </p>

        {/* Available formats pills */}
        <div className="flex items-center gap-1 mt-2.5 overflow-hidden">
          {book.formats.map((fmt) => (
            <span
              key={fmt}
              className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
            >
              {fmt === 'Audiobook' ? 'Audio' : fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Pricing & Add to Cart Footer */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-extrabold text-[var(--brand-primary)]">
            {formatPrice(book.price)}
          </span>
          {book.originalPrice && (
            <span className="text-[10px] text-[var(--text-muted)] line-through">
              {formatPrice(book.originalPrice)}
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(book, 'Paperback', 1)}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-white shadow-sm transition-all duration-150 hover:opacity-95 active:scale-95 cursor-pointer"
          style={{ backgroundColor: 'var(--brand-primary)' }}
          title="Tambah ke Keranjang Belanja"
        >
          {isInCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          <span className="hidden xs:inline">{isInCart ? 'Beli' : '+ Keranjang'}</span>
        </button>
      </div>
    </div>
  );
};
