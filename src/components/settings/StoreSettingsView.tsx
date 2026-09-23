import React, { useState } from 'react';
import { Settings, Store, Receipt, Save, CheckCircle, ShieldCheck, KeyRound, Lock, AlertCircle } from 'lucide-react';
import { StoreProfile, SecurityConfig } from '../../types/pos';
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
  const [security, setSecurity] = useState<SecurityConfig>(() => dbService.getSecurityConfig());
  const [saved, setSaved] = useState(false);

  // Form Ganti PIN
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveStoreProfile(profile);
    dbService.saveSecurityConfig(security);
    refreshData();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmNewPin) {
      setPinFeedback({ type: 'error', message: 'Konfirmasi PIN baru tidak cocok!' });
      return;
    }
    const res = dbService.updatePin(oldPin, newPin);
    if (res.success) {
      setPinFeedback({ type: 'success', message: res.message });
      setOldPin('');
      setNewPin('');
      setConfirmNewPin('');
      setSecurity(dbService.getSecurityConfig());
      refreshData();
    } else {
      setPinFeedback({ type: 'error', message: res.message });
    }
    setTimeout(() => setPinFeedback(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>Pengaturan Toko & Keamanan PIN</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Sesuaikan identitas bisnis, nota struk kasir, serta otorisasi PIN akses manajer / owner
        </p>
      </div>

      <div className="flex-1 overflow-auto p-5 max-w-3xl space-y-5">
        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Pengaturan profil dan preferensi keamanan berhasil disimpan!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Kartu Profil Toko */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs">
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
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs">
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

          {/* Kartu Hak Akses & Proteksi PIN */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Proteksi Kunci PIN Owner & Pembatasan Kasir</span>
              </h3>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-slate-300 font-medium">Aktifkan Kunci PIN</span>
                <input
                  type="checkbox"
                  checked={security.enablePinProtection}
                  onChange={(e) => setSecurity({ ...security, enablePinProtection: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-700 cursor-pointer"
                />
              </label>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Bila diaktifkan, kasir tidak dapat melihat laporan keuntungan/omzet atau mengubah harga barang tanpa memasukkan PIN Owner.
            </p>

            {security.enablePinProtection && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-300 block">Pilih Menu yang Dilindungi PIN:</span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={security.protectReports}
                      onChange={(e) => setSecurity({ ...security, protectReports: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-700 cursor-pointer"
                    />
                    <span className="text-slate-200">Laporan Penjualan & Laba</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={security.protectInventory}
                      onChange={(e) => setSecurity({ ...security, protectInventory: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-700 cursor-pointer"
                    />
                    <span className="text-slate-200">Stok & Edit Harga Barang</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={security.protectDatabase}
                      onChange={(e) => setSecurity({ ...security, protectDatabase: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-700 cursor-pointer"
                    />
                    <span className="text-slate-200">Database & Backup JSON</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={security.protectSettings}
                      onChange={(e) => setSecurity({ ...security, protectSettings: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-700 cursor-pointer"
                    />
                    <span className="text-slate-200">Pengaturan Toko</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Tombol Simpan Profil */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Toko</span>
            </button>
          </div>
        </form>

        {/* Form Ganti PIN Owner Terpisah */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Ubah PIN Keamanan Owner</span>
          </h3>

          <p className="text-xs text-slate-400">
            PIN bawaan awal toko adalah <strong className="text-amber-400 font-mono">1234</strong>. Ubah PIN ini untuk mencegah kasir membuka data rahasia toko Anda.
          </p>

          {pinFeedback && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium animate-fadeIn ${
              pinFeedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                : 'bg-rose-950/80 border-rose-700 text-rose-300'
            }`}>
              {pinFeedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{pinFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePin} className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                PIN Lama *
              </label>
              <input
                type="password"
                required
                maxLength={8}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                placeholder="PIN saat ini"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-center tracking-widest"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                PIN Baru (4-8 Digit) *
              </label>
              <input
                type="password"
                required
                minLength={4}
                maxLength={8}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="PIN Baru"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-center tracking-widest"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Konfirmasi PIN Baru *
              </label>
              <input
                type="password"
                required
                minLength={4}
                maxLength={8}
                value={confirmNewPin}
                onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Ulangi PIN Baru"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-center tracking-widest"
              />
            </div>

            <div className="col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/40 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Perbarui PIN Keamanan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
