import React from 'react';
import { useShop } from '../context/ShopContext';
import { BookCategory, BookFormat } from '../types';
import { 
  Sparkles, 
  BookOpen, 
  Headphones, 
  Tablet, 
  Bookmark, 
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

const FORMAT_OPTIONS: { id: BookFormat | 'Semua'; label: string; icon: React.ReactNode }[] = [
  { id: 'Semua', label: 'Semua Format', icon: <Bookmark className="w-3.5 h-3.5" /> },
  { id: 'Paperback', label: 'Buku Fisik', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'E-Book', label: 'E-Book (Digital)', icon: <Tablet className="w-3.5 h-3.5" /> },
  { id: 'Audiobook', label: 'Audiobook', icon: <Headphones className="w-3.5 h-3.5" /> },
];

export const CategoryNav: React.FC = () => {
  const { 
    selectedCategory, 
    setSelectedCategory, 
    selectedFormat, 
    setSelectedFormat,
    books 
  } = useShop();

  // Calculate book counts per category
  const getCategoryCount = (cat: BookCategory) => {
    if (cat === 'Semua') return books.length;
    return books.filter((b) => b.category === cat).length;
  };

  return (
    <div 
      className="border-b transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = getCategoryCount(cat);

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'shadow-sm text-white font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] border border-transparent'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--brand-primary)' : 'transparent',
                    borderColor: isSelected ? 'transparent' : 'var(--border-subtle)',
                  }}
                >
                  {cat === 'Semua' && <Sparkles className="w-3 h-3" />}
                  <span>{cat}</span>
                  <span 
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Format Filter Pill Group */}
          <div className="flex items-center gap-1 self-start md:self-auto shrink-0 bg-[var(--bg-muted)] p-1 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] px-2 hidden lg:inline">
              Format:
            </span>
            {FORMAT_OPTIONS.map((item) => {
              const active = selectedFormat === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedFormat(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--bg-elevated)] text-[var(--brand-primary)] shadow-sm font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
