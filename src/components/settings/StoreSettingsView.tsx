import React, { useState } from 'react';
import { Settings, Store, Receipt, Save, CheckCircle } from 'lucide-react';
import { StoreProfile } from '../../types/pos';
import { dbService } from '../../services/db';

interface StoreSettingsViewProps {
  storeProfile: StoreProfile;
  refreshData: () => void;
}

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({
  storeProfile,
  refreshData
}) => {
  const [profile, setProfile] = useState<StoreProfile>(storeProfile);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveStoreProfile(profile);
    refreshData();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>Pengaturan Toko & Informasi Struk</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Sesuaikan identitas bisnis, alamat toko, nomor telepon, dan catatan yang dicetak pada struk kasir
        </p>
      </div>

      <div className="flex-1 overflow-auto p-5 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {saved && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Pengaturan profil toko berhasil disimpan!</span>
            </div>
          )}

          {/* Kartu Profil Toko */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Identitas Usaha / Toko</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Toko *
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Alamat Lengkap Toko (Dicetak di Struk) *
                </label>
                <input
                  type="text"
                  required
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nomor Telepon / WhatsApp Kasir *
                </label>
                <input
                  type="text"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mata Uang
                </label>
                <input
                  type="text"
                  disabled
                  value="Rupiah (Rp - IDR)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Kartu Catatan Struk Termal */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Teks Header & Footer Struk Kasir</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pesan Selamat Datang (Header)
              </label>
              <input
                type="text"
                value={profile.receiptHeader}
                onChange={(e) => setProfile({ ...profile, receiptHeader: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Catatan Footer Nota / Syarat Pengembalian (Footer)
              </label>
              <textarea
                rows={3}
                value={profile.receiptFooter}
                onChange={(e) => setProfile({ ...profile, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Gunakan baris baru (Enter) untuk membagi baris pada kertas printer termal.
              </p>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
