import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  BookOpen, 
  Send, 
  MapPin, 
  Mail, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { addToast, setIsStoreLocatorOpen, setSelectedCategory } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast('Email Belum Tepat', 'Mohon masukkan alamat email yang valid.', 'error');
      return;
    }
    addToast(
      'Berhasil Berlangganan Newsletter!',
      'Gunakan kode voucher "JNNEWBIE" untuk potongan Rp 25.000 pada pesanan pertama Anda.',
      'success'
    );
    setNewsletterEmail('');
  };

  return (
    <footer 
      className="border-t transition-colors mt-12 pt-12 pb-8"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Newsletter & Mission Card */}
        <div 
          className="p-8 sm:p-10 rounded-3xl border flex flex-col lg:flex-row items-center justify-between gap-8"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="space-y-2 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]">
              <Sparkles className="w-3.5 h-3.5" />
              Surat Kabar Sastra & Diskon Eksklusif
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)]">
              Dapatkan Rekomendasi Buku Mingguan
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md">
              Daftarkan email Anda untuk menerima review kurator, potongan voucher bulanan, dan jadwal temu penulis.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Masukkan alamat email Anda..."
              className="py-3 px-4 rounded-xl border text-xs bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] min-w-[260px]"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs text-white shadow transition-all hover:opacity-95 active:scale-95 cursor-pointer shrink-0"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <span>Langganan</span>
              <Send className="w-3.5 h-3.5 icon-arrow-centroid" />
            </button>
          </form>
        </div>

        {/* 4 Main Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-serif font-extrabold text-xl text-[var(--text-primary)]">
                JN Bookshop
              </span>
            </div>

            <p className="text-[var(--text-secondary)] leading-relaxed max-w-sm">
              Toko buku independen modern yang berdedikasi menjaga denyut literasi Nusantara melalui kurasi karya sastra klasik, pemikiran filsafat, sains populer, dan inspirasi kontemporer.
            </p>

            <div className="space-y-1.5 text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>halo@jnbookshop.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>+62 811-2026-BOOK (CS WhatsApp)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Kategori Populer */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[var(--text-primary)] text-xs">
              Koleksi Populer
            </h4>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              {['Sastra & Fiksi', 'Pengembangan Diri', 'Non-Fiksi & Sains', 'Bisnis & Finansial', 'Teknologi & Koding'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat as any);
                      window.scrollTo({ top: 500, behavior: 'smooth' });
                    }}
                    className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Layanan Pembaca */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[var(--text-primary)] text-xs">
              Layanan Pembaca
            </h4>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li><a href="#" className="hover:text-[var(--brand-primary)] transition-colors">Cara Belanja & Ongkir</a></li>
              <li><a href="#" className="hover:text-[var(--brand-primary)] transition-colors">Garansi Buku Rusak</a></li>
              <li><a href="#" className="hover:text-[var(--brand-primary)] transition-colors">E-Book Reader Panduan</a></li>
              <li><a href="#" className="hover:text-[var(--brand-primary)] transition-colors">Voucher & Promo Aktif</a></li>
              <li>
                <button
                  onClick={() => setIsStoreLocatorOpen(true)}
                  className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer text-left"
                >
                  Lokasi Toko Fisik (4 Kota)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Keamanan & Partner */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[var(--text-primary)] text-xs">
              Jaminan Keamanan
            </h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Semua transaksi dilindungi enkripsi SSL 256-bit dan pembayaran langsung ke rekening resmi berbadan hukum.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] text-[var(--text-muted)] font-mono">
              <span className="px-2 py-1 rounded bg-[var(--bg-muted)] border border-[var(--border-subtle)]">QRIS</span>
              <span className="px-2 py-1 rounded bg-[var(--bg-muted)] border border-[var(--border-subtle)]">BCA VA</span>
              <span className="px-2 py-1 rounded bg-[var(--bg-muted)] border border-[var(--border-subtle)]">Mandiri</span>
              <span className="px-2 py-1 rounded bg-[var(--bg-muted)] border border-[var(--border-subtle)]">JNE</span>
              <span className="px-2 py-1 rounded bg-[var(--bg-muted)] border border-[var(--border-subtle)]">SiCepat</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-muted)]">
          <div>
            © 2026 <strong>JN Bookshop Indonesia</strong>. Seluruh Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-1">
            <span>Dibuat dengan dedikasi sastra & rekayasa UI/UX berstandar tinggi.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
