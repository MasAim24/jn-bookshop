import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, MapPin, Clock, Phone, Coffee, Wifi, Sparkles } from 'lucide-react';

interface StoreLocation {
  city: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  features: string[];
}

const STORES: StoreLocation[] = [
  {
    city: 'Jakarta Selatan',
    name: 'JN Bookshop & Senopati Literary Lounge',
    address: 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan 12190',
    hours: 'Setiap Hari: 08.00 – 22.00 WIB',
    phone: '(021) 7280-1926',
    features: ['Artisan Coffee Bar', 'Bilik Baca Hening', 'Acara Bedah Buku Rutin', 'Ruang Co-Working'],
  },
  {
    city: 'Bandung',
    name: 'JN Bookshop Dago Heritage House',
    address: 'Jl. Ir. H. Juanda (Dago) No. 142, Coblong, Bandung 40135',
    hours: 'Setiap Hari: 09.00 – 21.00 WIB',
    phone: '(022) 250-9811',
    features: ['Kebun Teh Terbuka', 'Koleksi Sastra Klasik Langka', 'Kedai Seduh Manual'],
  },
  {
    city: 'Yogyakarta',
    name: 'JN Bookshop Malioboro Sastra Sanctuary',
    address: 'Jl. Malioboro No. 45, Sosromenduran, Gedong Tengen, Yogyakarta 55271',
    hours: 'Setiap Hari: 08.30 – 22.30 WIB',
    phone: '(0274) 512-889',
    features: ['Panggung Puisi & Musik Akustik', 'Galeri Manuskrip Jawa', 'Bebas Pinjam Buku'],
  },
  {
    city: 'Surabaya',
    name: 'JN Bookshop Gubeng Cultural Hub',
    address: 'Jl. Pemuda No. 72, Gubeng, Surabaya 60271',
    hours: 'Setiap Hari: 09.00 – 21.30 WIB',
    phone: '(031) 534-7721',
    features: ['Kafe Literasi Ramah Anak', 'Spot Kerja Produktif', 'Toko Suvenir Karya Lokal'],
  },
];

export const StoreLocatorModal: React.FC = () => {
  const { isStoreLocatorOpen, setIsStoreLocatorOpen } = useShop();

  if (!isStoreLocatorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/70 animate-in fade-in">
      <div 
        className="w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--brand-primary-light)] text-[var(--brand-primary)]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
                Kunjungi Toko Fisik JN Bookshop
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                4 cabang sanctuary literasi & kafe baca di Indonesia
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsStoreLocatorOpen(false)}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STORES.map((store) => (
              <div 
                key={store.city}
                className="p-5 rounded-2xl border space-y-3.5 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--brand-primary-light)] text-[var(--brand-primary)] uppercase tracking-wider">
                    {store.city}
                  </span>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] mt-1.5">
                    {store.name}
                  </h4>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap gap-1.5">
                  {store.features.map((feat) => (
                    <span 
                      key={feat}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-muted)] text-[var(--text-secondary)] font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)] bg-[var(--bg-elevated)]">
          Setiap pembelian buku di toko fisik dapat ditukar poin loyalty JN Club yang terintegrasi secara online.
        </div>
      </div>
    </div>
  );
};
