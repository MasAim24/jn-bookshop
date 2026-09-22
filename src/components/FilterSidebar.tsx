import React from 'react';
import { useShop } from '../context/ShopContext';
import { BookCategory, BookFormat } from '../types';
import { 
  Filter, 
  RotateCcw, 
  Star, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';

const CATEGORIES: BookCategory[] = [
  'Semua',
  'Sastra & Fiksi',
  'Pengembangan Diri',
  'Non-Fiksi & Sains',
  'Bisnis & Finansial',
  'Teknologi & Koding',
  'Filsafat & Sejarah',
  'Seni & Desain',
  'Anak & Remaja',
];

const FORMATS: (BookFormat | 'Semua')[] = [
  'Semua',
  'Paperback',
  'Hardcover',
  'E-Book',
  'Audiobook',
];

export const FilterSidebar: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedFormat,
    setSelectedFormat,
    priceRange,
    setPriceRange,
    minRating,
    setMinRating,
    inStockOnly,
    setInStockOnly,
    resetFilters,
    formatPrice,
    filteredBooks
  } = useShop();

  return (
    <aside 
      className="p-5 rounded-2xl border space-y-6 self-start sticky top-24"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="font-bold text-sm text-[var(--text-primary)]">Filter Buku</h3>
        </div>

        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-[var(--brand-primary)] hover:underline font-semibold cursor-pointer"
          title="Reset semua filter ke kondisi awal"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Kategori Genre
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[var(--brand-primary)] text-white font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{cat}</span>
              {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Pilihan Format
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {FORMATS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                selectedFormat === fmt
                  ? 'bg-[var(--brand-primary)] text-white border-transparent font-semibold shadow-sm'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--brand-primary)]'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Maks. Harga
          </span>
          <span className="font-bold text-[var(--brand-primary)]">
            {formatPrice(priceRange[1])}
          </span>
        </div>
        <input
          type="range"
          min={50000}
          max={250000}
          step={10000}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-[var(--brand-primary)] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
          <span>{formatPrice(50000)}</span>
          <span>{formatPrice(250000)}</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Rating Pembaca
        </h4>
        <div className="space-y-1">
          {[
            { label: 'Semua Rating', val: 0 },
            { label: '4.8 ★ ke atas (Sangat Rekomendasi)', val: 4.8 },
            { label: '4.5 ★ ke atas', val: 4.5 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setMinRating(item.val)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                minRating === item.val
                  ? 'bg-[var(--bg-muted)] text-[var(--brand-primary)] font-bold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Star className={`w-3.5 h-3.5 ${minRating === item.val ? 'fill-amber-400 text-amber-400' : 'text-[var(--text-muted)]'}`} />
                <span>{item.label}</span>
              </div>
              {minRating === item.val && <Check className="w-3 h-3 text-[var(--brand-primary)]" />}
            </button>
          ))}
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div className="pt-2 border-t border-[var(--border-subtle)]">
        <label className="flex items-center gap-2.5 text-xs text-[var(--text-primary)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] accent-[var(--brand-primary)]"
          />
          <span className="font-medium">Hanya buku siap kirim (Ready Stock)</span>
        </label>
      </div>

      {/* Filter result hint */}
      <div className="text-[11px] text-[var(--text-muted)] pt-1 text-center">
        Ditemukan <strong className="text-[var(--text-primary)]">{filteredBooks.length}</strong> buku sesuai filter
      </div>
    </aside>
  );
};
