import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Gift, Sparkles, Check, Users, Coffee, BookOpen } from 'lucide-react';

export const BookClubSection: React.FC = () => {
  const { addToast, formatPrice } = useShop();
  const [selectedPlan, setSelectedPlan] = useState<'santai' | 'kurasi' | 'kolektor'>('kurasi');

  const handleJoinClub = (planName: string) => {
    addToast(
      'Selamat Bergabung di JN Book Club!',
      `Pendaftaran untuk ${planName} telah tercatat. Kami akan mengirimkan paket sambutan ke email Anda.`,
      'success'
    );
  };

  return (
    <section className="py-12 border-t border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--brand-primary-light)] text-[var(--brand-primary)]">
            <Gift className="w-3.5 h-3.5" />
            <span>JN Book Club & Subscription Box</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[var(--text-primary)]">
            Dapatkan Kotak Kejutan Buku Pilihan Setiap Bulan
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Bergabunglah dengan lebih dari 4.500 pembaca di seluruh Indonesia. Setiap bulan kami mengurasi buku istimewa lengkap dengan catatan editorial dan merchandise sastra eksklusif.
          </p>
        </div>

        {/* 3 Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Plan 1 */}
          <div 
            onClick={() => setSelectedPlan('santai')}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedPlan === 'santai'
                ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20 shadow-md'
                : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
            }`}
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <div className="space-y-4">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Paket Pembaca Santai
              </div>
              <div className="text-2xl font-extrabold text-[var(--text-primary)]">
                {formatPrice(125000)} <span className="text-xs font-normal text-[var(--text-muted)]">/bulan</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Cocok bagi Anda yang ingin konsisten menyelesaikan minimal 1 buku berbobot setiap bulan.
              </p>
              <ul className="space-y-2.5 text-xs text-[var(--text-secondary)] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1 Buku Fisik Kurasi Bulan Ini</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pembatas Buku Logam Berukir Eksklusif</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Newsletter Surat Sastra & Diskusi Buku</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleJoinClub('Paket Pembaca Santai')}
              className="mt-6 w-full py-2.5 rounded-xl font-bold text-xs border border-[var(--border-strong)] hover:border-[var(--brand-primary)] transition-colors cursor-pointer text-[var(--text-primary)]"
            >
              Pilih Paket Santai
            </button>
          </div>

          {/* Plan 2: Most Popular */}
          <div 
            onClick={() => setSelectedPlan('kurasi')}
            className={`p-6 rounded-3xl border relative transition-all cursor-pointer flex flex-col justify-between shadow-lg ${
              selectedPlan === 'kurasi'
                ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20'
                : 'border-[var(--border-subtle)]'
            }`}
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <span 
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              Paling Diminati (Best Value)
            </span>

            <div className="space-y-4">
              <div className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                Paket Kurasi Istimewa
              </div>
              <div className="text-2xl font-extrabold text-[var(--text-primary)]">
                {formatPrice(235000)} <span className="text-xs font-normal text-[var(--text-muted)]">/bulan</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Pilihan favorit kutu buku: 2 buku terkurasi dengan genre kontras ditambah merchandise literasi unik.
              </p>
              <ul className="space-y-2.5 text-xs text-[var(--text-secondary)] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2 Buku Fisik (1 Fiksi + 1 Non-Fiksi)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tote Bag Kanvas JN Bookshop Edisi Khusus</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sachet Kopi Single Origin Drip Pendamping Baca</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Akses Book Club Virtual bersama Penulis Tamu</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleJoinClub('Paket Kurasi Istimewa')}
              className="mt-6 w-full py-2.5 rounded-xl font-bold text-xs text-white shadow transition-all hover:opacity-95 cursor-pointer"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              Langganan Paket Istimewa
            </button>
          </div>

          {/* Plan 3: Collector */}
          <div 
            onClick={() => setSelectedPlan('kolektor')}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedPlan === 'kolektor'
                ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20 shadow-md'
                : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
            }`}
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <div className="space-y-4">
              <div className="text-xs font-bold text-[var(--accent-gold)] uppercase tracking-wider">
                Paket Kolektor Hardcover
              </div>
              <div className="text-2xl font-extrabold text-[var(--text-primary)]">
                {formatPrice(385000)} <span className="text-xs font-normal text-[var(--text-muted)]">/bulan</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Untuk pecinta buku bernilai arsip: jilid kain mewah, bertanda tangan asli, dan kemasan boks kayu jati Belanda.
              </p>
              <ul className="space-y-2.5 text-xs text-[var(--text-secondary)] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1 Buku Edisi Hardcover Kolektor Bertanda Tangan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Packaging Kotak Kayu Eksklusif JN Archives</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sertifikat Otentisitas Bernomor Seri</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gratis Bebas Ongkir Seumur Hidup</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleJoinClub('Paket Kolektor Hardcover')}
              className="mt-6 w-full py-2.5 rounded-xl font-bold text-xs border border-[var(--border-strong)] hover:border-[var(--brand-primary)] transition-colors cursor-pointer text-[var(--text-primary)]"
            >
              Pilih Paket Kolektor
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
