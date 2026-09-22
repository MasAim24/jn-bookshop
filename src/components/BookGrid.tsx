import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { BookCard } from './BookCard';
import { FilterSidebar } from './FilterSidebar';
import { 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  SlidersHorizontal, 
  BookX, 
  Sparkles,
  X
} from 'lucide-react';

export const BookGrid: React.FC = () => {
  const {
    filteredBooks,
    selectedCategory,
    searchQuery,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    resetFilters,
  } = useShop();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <section id="katalog-buku" className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[var(--text-primary)]">
                {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : selectedCategory}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                {filteredBooks.length} Buku
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Koleksi buku fisik original, edisi kolektor, e-book, dan audiobook dengan kurasi mutu terbaik.
            </p>
          </div>

          {/* Right Toolbar: Sort & View Mode */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>Filter</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-8 pr-4 py-2 rounded-xl text-xs font-medium border bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer appearance-none"
              >
                <option value="popular">Paling Populer</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="newest">Koleksi Terbaru</option>
                <option value="price-asc">Harga: Rendah ke Tinggi</option>
                <option value="price-desc">Harga: Tinggi ke Rendah</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-subtle)]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[var(--bg-elevated)] text-[var(--brand-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[var(--bg-elevated)] text-[var(--brand-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Tampilan Daftar (List)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <FilterSidebar />
          </div>

          {/* Catalog Listing */}
          <div className="lg:col-span-9">
            {filteredBooks.length === 0 ? (
              /* Empty state */
              <div 
                className="py-16 px-6 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center space-y-4"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)',
                }}
              >
                <div className="p-4 rounded-2xl bg-[var(--bg-muted)] text-[var(--text-muted)]">
                  <BookX className="w-10 h-10" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[var(--text-primary)]">
                  Tidak Ada Buku yang Cocok
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-md">
                  Coba ubah kata kunci pencarian, longgarkan rentang harga, atau reset filter untuk melihat katalog lengkap kami.
                </p>
                <button
                  onClick={resetFilters}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold text-white shadow transition-all hover:opacity-95 cursor-pointer"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              /* Books grid or list */
              <div 
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Filter Slide-over Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div 
            className="relative ml-auto w-full max-w-xs h-full p-5 overflow-y-auto shadow-2xl flex flex-col justify-between"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
                <span className="font-serif font-bold text-lg text-[var(--text-primary)]">
                  Filter Katalog
                </span>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar />
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] mt-4">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                Terapkan Filter ({filteredBooks.length} Buku)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
