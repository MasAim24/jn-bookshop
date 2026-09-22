# 📚 JN Book & Stationary Shop — Desktop Windows POS (.exe)

Aplikasi Desktop Windows Standalone Executable (`.exe`) untuk kasir Point of Sale (POS) dan manajemen inventaris toko buku dan alat tulis (**JN Book & Stationary Shop**).

---

## 🌟 Fitur Utama

### 1. 🛒 Sistem Kasir & Transaksi Cepat (POS Terminal)
- **Pemindai Barcode / ISBN Otomatis**: Deteksi instan input pemindai barcode USB/Bluetooth (`F1` fokus pencarian, `Enter` langsung masukkan barang ke keranjang).
- **Pencarian Cepat**: Filter berdasarkan judul buku, pengarang, penerbit, merk ATK, atau kategori.
- **Keranjang Belanja Interaktif**: Stepper kuantitas, diskon persentase (`%`) atau nominal per item, dan pembatalan item.
- **Kalkulator Pembayaran Otomatis**:
  - Pilihan pecahan uang cepat (`Uang Pas`, `Rp 20.000`, `Rp 50.000`, `Rp 100.000`, `Rp 200.000`).
  - Penghitungan uang kembalian secara otomatis dan presisi dengan validasi uang kurang.
- **Multi Metode Pembayaran**: Tunai (Cash), QRIS Dinamis (tampil QR code otomatis di layar), Kartu Debit/EDC, dan Transfer Bank.
- **Tahan Pesanan (Hold & Recall Sale)**: Menahan transaksi antrian saat pelanggan menambah belanjaan atau menunggu konfirmasi.

### 2. 📦 Manajemen Stok & Inventaris Toko
- **Katalog Buku & Alat Tulis Lengkap**:
  - Input data buku dan alat tulis: Nama Produk, Barcode/ISBN, Kategori, Penulis/Penerbit atau Merk (Joyko, Faber-Castell, SiDU, dll).
  - Harga Beli (Modal HPP), Harga Jual Kasir, dan kalkulator persentase Margin Keuntungan live.
  - Jumlah Stok Fisik, Satuan (`Pcs`, `Pak`, `Rim`, `Eks`, `Lusin`), Batas Minimum Peringatan Stok Menipis (*Min Alert*), dan Lokasi Rak Toko.
- **Filter Cepat**: Filter Semua, Buku & Novel, Alat Tulis (ATK), dan Stok Menipis (*Low Stock Warning*).
- **Penyesuaian Stok Cepat (*Stock Opname*)**: Tambah/kurang stok dengan catatan alasan.
- **Ekspor CSV**: Ekspor seluruh katalog dan nilai aset modal ke file spreadsheet Excel/CSV.

### 3. 🖨️ Cetak Struk Printer Termal (Thermal Receipt Printer)
- **Dukungan Kertas Kasir 58mm & 80mm**:
  - Lebar 32 karakter untuk printer kasir mini Bluetooth / USB (58mm).
  - Lebar 48 karakter untuk printer POS desktop (80mm).
- **Cetak Bersih Tanpa Header/Footer Browser**: Aturan `@media print` terisolasi mencetak hanya struk thermal dengan font monospace tajam.
- **Fitur Struk Lengkap**: Logo, nama toko, alamat, no telepon, no nota unik, rincian item, diskon, PPN, metode bayar, uang tunai, kembalian, barcode nota, dan ucapan terima kasih.
- **Test Print & Preview**: Tombol uji coba pencetakan struk langsung di aplikasi.

### 4. 💾 Database Lokal Persisten (SQLite Engine)
- **Data Tersimpan Permanen**: Seluruh stok barang, perubahan inventaris, dan riwayat transaksi kasir tersimpan aman di disk lokal pengguna.
- **Tidak Akan Hilang Saat Aplikasi Ditutup**: Menggunakan arsitektur penyimpanan lokal IndexedDB & SQLite storage.
- **Pencadangan & Pemulihan (Backup & Restore)**:
  - Unduh cadangan database ke file `.sqlite.json` kapan saja.
  - Pulihkan seluruh data transaksi dan inventaris pada komputer baru hanya dengan mengunggah file cadangan.
- **Reset Pabrik (*Factory Reset*)**: Opsi untuk mengembalikan data awal bawaan toko buku dan ATK.

### 5. 📊 Laporan Penjualan & Analitika Omzet
- **Dashboard Finansial Real-time**:
  - Total Omzet Harian (Hari Ini) dan Bulanan.
  - Total Keuntungan Bersih (*Gross Profit* = Omzet - Total Modal HPP).
  - Jumlah Transaksi & Total Buku/ATK Terjual.
- **Rekap Metode Pembayaran**: Persentase transaksi Tunai, QRIS, Debit, dan Transfer.
- **Top 5 Produk Terlaris (*Best Seller*)**: Daftar 5 buku dan ATK dengan volume penjualan terbanyak.
- **Riwayat Transaksi Kasir**: Tabel histori lengkap dengan fitur **Cetak Ulang Struk (*Reprint*)** dan **Batalkan Transaksi (*Void/Refund*)** yang otomatis mengembalikan stok barang ke inventaris.
- **Ekspor Laporan**: Simpan laporan penjualan ke format CSV / Excel.

---

## 🚀 Cara Menjalankan & Membangun File `.exe` Windows

### Opsi A: Membangun File `.exe` Menggunakan GitHub Actions (Otomatis di Cloud)
1. Push repository ini ke akun GitHub Anda:
   ```bash
   git add .
   git commit -m "feat: complete JN Book & Stationary POS Desktop app"
   git push origin main
   ```
2. Buka tab **Actions** di repositori GitHub Anda.
3. Alur kerja **Build Windows Executable (.exe)** akan berjalan otomatis di lingkungan Windows (`windows-latest`).
4. Setelah selesai (~2-3 menit), unduh file instalasi dari bagian **Artifacts**:
   - `JN Book & Stationary Shop-1.0.0-Setup.exe` (Standalone Installer)
   - `JN Book & Stationary Shop-Portable.exe` (Aplikasi portabel sekali klik tanpa install)

---

### Opsi B: Membangun File `.exe` Langsung di Komputer Windows
1. Pastikan komputer Windows Anda sudah terinstal [Node.js](https://nodejs.org/).
2. Salin folder proyek ini ke komputer Windows Anda.
3. Klik ganda (double-click) file:
   ```cmd
   build-exe.bat
   ```
4. Skrip otomatis akan menginstal dependensi, mengompilasi Vite, dan memaketkan aplikasi ke dalam folder `dist_electron/`.

---

### Opsi C: Menjalankan Mode Web / Pratinjau Lokal
Jika ingin menjalankan antarmuka kasir langsung di browser Termux / Linux:
```bash
pnpm run build
pnpm run preview --host 0.0.0.0 --port 5173
```
Buka browser pada: `http://localhost:5173`

---

## 📂 Struktur Direktori Proyek

```text
jn-bookshop/
├── .github/workflows/
│   └── build-windows.yml       # CI/CD otomatis untuk menghasilkan installer .exe
├── electron/
│   ├── main.cjs                # Main process Electron (Window, IPC, Silent Print)
│   └── preload.cjs             # Bridge keamanan contextBridge
├── src/
│   ├── components/
│   │   ├── desktop/            # Custom Windows Title Bar & Sidebar Navigation
│   │   ├── pos/                # POS Terminal, Barcode Scanner, Keranjang, Checkout Modal, Receipt Modal
│   │   ├── inventory/          # Manajemen Stok Buku & ATK, Modal Tambah/Edit, Penyesuaian Stok
│   │   ├── reports/            # Laporan Omzet Harian/Bulanan, Laba Bersih, Riwayat Nota
│   │   ├── printer/            # Konfigurasi Printer Kasir 58mm/80mm & Test Print
│   │   ├── database/           # Status SQLite Lokal, Backup & Restore Database
│   │   └── settings/           # Pengaturan Toko & Teks Struk
│   ├── services/
│   │   ├── db.ts               # Engine database lokal SQLite/IndexedDB & Seeder
│   │   └── thermalPrinter.ts   # Formatting struk termal fixed-width 58mm/80mm
│   ├── types/
│   │   └── pos.ts              # Model data TypeScript
│   ├── App.tsx                 # Root desktop layout
│   └── index.css               # Styling Tailwind v4 & print CSS rules
├── build-exe.bat               # Skrip kompilasi .exe sekali klik di Windows
├── electron-builder.json       # Konfigurasi pemaket NSIS & Portable exe
└── package.json
```
