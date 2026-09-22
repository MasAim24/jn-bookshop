import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  BookOpen, 
  Type, 
  Sun, 
  Moon, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight,
  Bookmark,
  Check
} from 'lucide-react';

type ReaderTheme = 'ivory' | 'white' | 'sepia' | 'dark';

export const SampleReaderModal: React.FC = () => {
  const { 
    activeSampleReader, 
    setActiveSampleReader, 
    addToCart, 
    formatPrice,
    cart 
  } = useShop();

  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState<number>(17);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('ivory');

  if (!activeSampleReader) return null;

  const chapters = activeSampleReader.sampleChapters || [];
  const currentChapter = chapters[currentChapterIdx] || chapters[0];
  const isInCart = cart.some((item) => item.book.id === activeSampleReader.id);

  // Theme color styles for reading canvas
  const themeStyles: Record<ReaderTheme, { bg: string; text: string; border: string }> = {
    ivory: { bg: '#FAF7F0', text: '#2A2723', border: '#E7DFC6' },
    white: { bg: '#FFFFFF', text: '#111827', border: '#E5E7EB' },
    sepia: { bg: '#F5EBD7', text: '#543D2B', border: '#E2CEB0' },
    dark: { bg: '#161819', text: '#DCDAD5', border: '#2C3033' },
  };

  const activeStyle = themeStyles[readerTheme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/75 animate-in fade-in">
      <div 
        className="w-full max-w-4xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border transition-colors"
        style={{
          backgroundColor: activeStyle.bg,
          color: activeStyle.text,
          borderColor: activeStyle.border,
        }}
      >
        {/* Top Reader Toolbar */}
        <div 
          className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b backdrop-blur-sm"
          style={{ borderColor: activeStyle.border }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src={activeSampleReader.coverImage} 
              alt={activeSampleReader.title} 
              className="w-7 h-10 object-cover rounded shadow-sm shrink-0" 
            />
            <div className="truncate">
              <h3 className="text-sm font-bold truncate leading-tight">
                {activeSampleReader.title}
              </h3>
              <p className="text-xs opacity-75 truncate">
                Sampel Baca • Bab {currentChapterIdx + 1} dari {chapters.length}
              </p>
            </div>
          </div>

          {/* Reader Preferences (Font, Size, Theme) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Font Family Toggle */}
            <button
              onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer"
              style={{ borderColor: activeStyle.border }}
              title="Ganti Font Serif / Sans"
            >
              {fontFamily === 'serif' ? 'Serif' : 'Sans'}
            </button>

            {/* Font Size Modifier */}
            <div 
              className="flex items-center border rounded-lg text-xs font-semibold overflow-hidden"
              style={{ borderColor: activeStyle.border }}
            >
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Perkecil huruf"
              >
                A-
              </button>
              <span className="px-1.5 py-1 text-[11px] opacity-75">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className="px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Perbesar huruf"
              >
                A+
              </button>
            </div>

            {/* Theme Selectors */}
            <div className="hidden sm:flex items-center gap-1 border rounded-lg p-0.5" style={{ borderColor: activeStyle.border }}>
              <button
                onClick={() => setReaderTheme('ivory')}
                className={`w-5 h-5 rounded-md border ${readerTheme === 'ivory' ? 'ring-2 ring-[var(--brand-primary)]' : ''}`}
                style={{ backgroundColor: '#FAF7F0', borderColor: '#E7DFC6' }}
                title="Tema Kertas Ivory"
              />
              <button
                onClick={() => setReaderTheme('white')}
                className={`w-5 h-5 rounded-md border ${readerTheme === 'white' ? 'ring-2 ring-[var(--brand-primary)]' : ''}`}
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                title="Tema Putih Bersih"
              />
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`w-5 h-5 rounded-md border ${readerTheme === 'sepia' ? 'ring-2 ring-[var(--brand-primary)]' : ''}`}
                style={{ backgroundColor: '#F5EBD7', borderColor: '#E2CEB0' }}
                title="Tema Sepia Hangat"
              />
              <button
                onClick={() => setReaderTheme('dark')}
                className={`w-5 h-5 rounded-md border ${readerTheme === 'dark' ? 'ring-2 ring-[var(--brand-primary)]' : ''}`}
                style={{ backgroundColor: '#161819', borderColor: '#2C3033' }}
                title="Tema Malam Obsidian"
              />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setActiveSampleReader(null)}
              className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer ml-1"
              aria-label="Tutup jendela baca"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reading Body Canvas */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-16 lg:px-24 py-8 sm:py-12">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Chapter Header */}
            <div className="text-center pb-6 border-b" style={{ borderColor: activeStyle.border }}>
              <span className="text-xs uppercase tracking-widest opacity-60 font-semibold">
                JN Bookshop E-Reader Preview
              </span>
              <h2 className={`text-2xl sm:text-3xl font-bold mt-2 ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}>
                {currentChapter?.title || 'Bab 1'}
              </h2>
              <p className="text-xs opacity-75 mt-1">
                Estimasi waktu baca: 3 menit
              </p>
            </div>

            {/* Paragraphs */}
            <div 
              className={`space-y-5 leading-relaxed tracking-normal ${
                fontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            >
              {currentChapter?.content.map((paragraph, idx) => (
                <p key={idx} className="indent-6 sm:indent-8 text-justify">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* End of sample notice */}
            <div 
              className="mt-12 p-6 rounded-2xl border text-center space-y-3"
              style={{
                borderColor: activeStyle.border,
                backgroundColor: readerTheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <div className="inline-flex p-3 rounded-full bg-[var(--brand-primary-light)] text-[var(--brand-primary)]">
                <BookOpen className="w-6 h-6 icon-play-centroid" />
              </div>
              <h4 className="font-bold text-base sm:text-lg">
                Menikmati Bab Pertama Ini?
              </h4>
              <p className="text-xs sm:text-sm opacity-80 max-w-md mx-auto">
                Lanjutkan petualangan membaca Anda dengan memiliki buku utuh karya <strong>{activeSampleReader.author}</strong>.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    addToCart(activeSampleReader, 'Paperback', 1);
                  }}
                  className="flex items-center gap-2 py-2.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  {isInCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>{isInCart ? 'Tambah Lagi' : `Beli Buku Ini (${formatPrice(activeSampleReader.price)})`}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div 
          className="flex items-center justify-between px-6 py-3 border-t text-xs backdrop-blur-sm"
          style={{ borderColor: activeStyle.border }}
        >
          <button
            onClick={() => setCurrentChapterIdx(Math.max(0, currentChapterIdx - 1))}
            disabled={currentChapterIdx === 0}
            className="flex items-center gap-1 font-semibold disabled:opacity-30 hover:underline cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Bab Sebelumnya</span>
          </button>

          <div className="font-medium opacity-70 text-xs">
            Halaman Sampel • JN Bookshop Digital
          </div>

          <button
            onClick={() => setCurrentChapterIdx(Math.min(chapters.length - 1, currentChapterIdx + 1))}
            disabled={currentChapterIdx >= chapters.length - 1}
            className="flex items-center gap-1 font-semibold disabled:opacity-30 hover:underline cursor-pointer"
          >
            <span>Bab Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
