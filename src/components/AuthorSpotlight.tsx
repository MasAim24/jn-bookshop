import React from 'react';
import { useShop } from '../context/ShopContext';
import { Feather, Award, BookOpen, ArrowRight } from 'lucide-react';

export const AuthorSpotlight: React.FC = () => {
  const { setSearchQuery } = useShop();

  const handleExploreAuthor = (authorName: string) => {
    setSearchQuery(authorName);
    const catalogElement = document.getElementById('katalog-buku');
    catalogElement?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-12 border-t border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]">
              <Feather className="w-4 h-4" />
              <span>Sorotan Sastrawan Bulan Ini</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[var(--text-primary)] mt-1">
              Merayakan Suara Abadi Sastra Nusantara
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md">
            Mengenal lebih dekat para pemikir dan penulis yang mengukir sejarah lewat ketajaman pena dan kejujuran kata.
          </p>
        </div>

        {/* 2 Author Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pramoedya Ananta Toer */}
          <div 
            className="p-6 sm:p-8 rounded-3xl border relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--accent-gold-bg)] text-[var(--accent-gold)] border border-[var(--accent-gold)]">
                  Tokoh Literasi Abad ke-20
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">1925 – 2006</span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)]">
                  Pramoedya Ananta Toer
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                  Kandidat Nobel Sastra • Penulis Tetralogi Buru
                </p>
              </div>

              <blockquote className="text-xs sm:text-sm italic text-[var(--text-secondary)] border-l-2 border-[var(--brand-primary)] pl-3 leading-relaxed">
                "Kalian boleh maju dalam pelajaran, mungkin mencapai deretan gelar kesarjanaan apa saja, tapi tanpa mencintai sastra, kalian hanya hewan yang pandai."
              </blockquote>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Menulis sebagian besar mahakaryanya di pengasingan Pulau Buru, Pramoedya menyuarakan martabat rakyat tertindas dengan keanggunan narasi yang tak lekang oleh zaman.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                Koleksi tersedia: Bumi Manusia, Anak Semua Bangsa, Rumah Kaca
              </span>
              <button
                onClick={() => handleExploreAuthor('Pramoedya')}
                className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:underline cursor-pointer shrink-0"
              >
                <span>Lihat Karya</span>
                <ArrowRight className="w-3.5 h-3.5 icon-arrow-centroid" />
              </button>
            </div>
          </div>

          {/* Leila S. Chudori */}
          <div 
            className="p-6 sm:p-8 rounded-3xl border relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  S.E.A. Write Awardee
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">Kontemporer</span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)]">
                  Leila S. Chudori
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                  Jurnalis Investigasi & Sastrawan Kontemporer Indonesia
                </p>
              </div>

              <blockquote className="text-xs sm:text-sm italic text-[var(--text-secondary)] border-l-2 border-[var(--brand-primary)] pl-3 leading-relaxed">
                "Kebenaran mungkin bisa dibungkam di dasar samudra, tetapi ingatan dan cinta keluarga tak akan pernah bisa ditenggelamkan."
              </blockquote>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Karyanya merajut fakta sejarah politik Indonesia dengan kedalaman emosional dan riset jurnalistik yang ketat, menjadikannya salah satu penulis fiksi sejarah terpenting generasi kini.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                Koleksi tersedia: Laut Bercerita, Pulang, Namaku Subangke
              </span>
              <button
                onClick={() => handleExploreAuthor('Leila S. Chudori')}
                className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:underline cursor-pointer shrink-0"
              >
                <span>Lihat Karya</span>
                <ArrowRight className="w-3.5 h-3.5 icon-arrow-centroid" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
