import { ProductItem, POSTransaction, StoreProfile, PrinterConfig, DatabaseBackup, HeldOrder, CashierShift, CashMovement } from '../types/pos';

// Kunci penyimpanan lokal
const STORAGE_KEYS = {
  PRODUCTS: 'jnb_pos_products_v1',
  TRANSACTIONS: 'jnb_pos_transactions_v1',
  STORE_PROFILE: 'jnb_pos_store_profile_v1',
  PRINTER_CONFIG: 'jnb_pos_printer_config_v1',
  HELD_ORDERS: 'jnb_pos_held_orders_v1',
  SHIFTS: 'jnb_pos_shifts_v1',
  CASH_MOVEMENTS: 'jnb_pos_cash_movements_v1',
  INITIALIZED: 'jnb_pos_initialized_v1'
};

// Data Profil Toko Awal
export const DEFAULT_STORE_PROFILE: StoreProfile = {
  name: 'JN Book & Stationary Shop',
  tagline: 'Pusat Buku, Literasi & Alat Tulis Terlengkap',
  address: 'Jl. Boulevard Utama No. 88, Cibubur, Jakarta Timur',
  phone: '0812-9988-7766 / (021) 8877-6655',
  receiptHeader: 'Selamat Datang di JN Book & Stationary',
  receiptFooter: 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli dapat ditukar 1x24 jam dengan membawa struk.',
  taxRatePercent: 0,
  enableTax: false,
  currencySymbol: 'Rp'
};

// Konfigurasi Printer Awal
export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  paperWidth: '58mm',
  autoPrintReceipt: true,
  cutPaper: true,
  cashDrawerKick: false,
  showBarcode: true,
  showCashierName: true
};

// Seeder Produk Buku & Alat Tulis Realistis
export const INITIAL_PRODUCTS: ProductItem[] = [
  // --- KATEGORI BUKU ---
  {
    id: 'prod-b-01',
    barcode: '9786020633176',
    name: 'Atomic Habits (Perubahan Kecil Hasil Luar Biasa)',
    type: 'buku',
    category: 'Pengembangan Diri',
    brandOrPublisher: 'Gramedia Pustaka Utama',
    costPrice: 85000,
    sellPrice: 108000,
    stock: 28,
    minStockAlert: 5,
    unit: 'Eks',
    shelfLocation: 'Rak Buku A-01',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-b-02',
    barcode: '9786024411350',
    name: 'Filosofi Teras (Henry Manampiring)',
    type: 'buku',
    category: 'Filsafat Populer',
    brandOrPublisher: 'Penerbit Kompas',
    costPrice: 76000,
    sellPrice: 98000,
    stock: 22,
    minStockAlert: 5,
    unit: 'Eks',
    shelfLocation: 'Rak Buku A-02',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-b-03',
    barcode: '9786024246945',
    name: 'Laut Bercerita - Leila S. Chudori',
    type: 'buku',
    category: 'Novel Sastra',
    brandOrPublisher: 'KPG (Kepustakaan Populer Gramedia)',
    costPrice: 90000,
    sellPrice: 115000,
    stock: 19,
    minStockAlert: 4,
    unit: 'Eks',
    shelfLocation: 'Rak Fiksi B-01',
    imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-b-04',
    barcode: '9786230028005',
    name: 'Komik One Piece Vol. 100',
    type: 'buku',
    category: 'Komik & Manga',
    brandOrPublisher: 'Elex Media Komputindo',
    costPrice: 32000,
    sellPrice: 45000,
    stock: 40,
    minStockAlert: 10,
    unit: 'Eks',
    shelfLocation: 'Rak Komik C-03',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-b-05',
    barcode: '9786022918806',
    name: 'The Psychology of Money - Morgan Housel',
    type: 'buku',
    category: 'Bisnis & Finansial',
    brandOrPublisher: 'Bentang Pustaka',
    costPrice: 65000,
    sellPrice: 85000,
    stock: 16,
    minStockAlert: 5,
    unit: 'Eks',
    shelfLocation: 'Rak Bisnis A-04',
    imageUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-b-06',
    barcode: '9786231802101',
    name: 'Buku Mandiri IPA SMP Kelas VIII Kurikulum Merdeka',
    type: 'buku',
    category: 'Buku Pelajaran',
    brandOrPublisher: 'Erlangga',
    costPrice: 72000,
    sellPrice: 92000,
    stock: 35,
    minStockAlert: 8,
    unit: 'Eks',
    shelfLocation: 'Rak Sekolah E-01',
    imageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-b-07',
    barcode: '9786022912446',
    name: 'Dunia Sophie (Novel Sejarah Filsafat)',
    type: 'buku',
    category: 'Filsafat Populer',
    brandOrPublisher: 'Mizan',
    costPrice: 105000,
    sellPrice: 135000,
    stock: 12,
    minStockAlert: 3,
    unit: 'Eks',
    shelfLocation: 'Rak Buku A-03',
    imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },

  // --- KATEGORI ALAT TULIS & KERTAS (STATIONERY) ---
  {
    id: 'prod-atk-01',
    barcode: '8992775110012',
    name: 'Buku Tulis Sinar Dunia (SiDU) 38 Lembar (1 Pak / 10 Buku)',
    type: 'alat_tulis',
    category: 'Buku Tulis & Kertas',
    brandOrPublisher: 'Sinar Dunia (APP)',
    costPrice: 32000,
    sellPrice: 42000,
    stock: 65,
    minStockAlert: 15,
    unit: 'Pak',
    shelfLocation: 'Etalase ATK Rak 1',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-atk-02',
    barcode: '8993988100018',
    name: 'Pulpen Gel Joyko JK-100 0.5mm Hitam',
    type: 'alat_tulis',
    category: 'Pulpen & Pensil',
    brandOrPublisher: 'Joyko',
    costPrice: 2800,
    sellPrice: 4500,
    stock: 140,
    minStockAlert: 25,
    unit: 'Pcs',
    shelfLocation: 'Display Kasir Depan',
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-7a4e69b50b57?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-atk-03',
    barcode: '8992828001015',
    name: 'Pensil 2B Faber-Castell Ujian Komputer Asli',
    type: 'alat_tulis',
    category: 'Pulpen & Pensil',
    brandOrPublisher: 'Faber-Castell',
    costPrice: 3600,
    sellPrice: 5500,
    stock: 95,
    minStockAlert: 20,
    unit: 'Pcs',
    shelfLocation: 'Display Kasir Depan',
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-atk-04',
    barcode: '8993211000014',
    name: 'Kertas HVS PaperOne A4 75 GSM (1 Rim / 500 Lembar)',
    type: 'alat_tulis',
    category: 'Buku Tulis & Kertas',
    brandOrPublisher: 'PaperOne',
    costPrice: 47000,
    sellPrice: 58000,
    stock: 45,
    minStockAlert: 10,
    unit: 'Rim',
    shelfLocation: 'Gudang Rak Bawah G-01',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-atk-05',
    barcode: '8993988300036',
    name: 'Correction Tape Joyko CT-522 (Tipe-X Kertas 12M)',
    type: 'alat_tulis',
    category: 'Alat Tulis Kantor',
    brandOrPublisher: 'Joyko',
    costPrice: 5200,
    sellPrice: 8500,
    stock: 50,
    minStockAlert: 10,
    unit: 'Pcs',
    shelfLocation: 'Etalase ATK Rak 2',
    imageUrl: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-atk-06',
    barcode: '8992745000010',
    name: 'Spidol Whiteboard Snowman BG-12 Hitam',
    type: 'alat_tulis',
    category: 'Pulpen & Pensil',
    brandOrPublisher: 'Snowman',
    costPrice: 7500,
    sellPrice: 11000,
    stock: 60,
    minStockAlert: 12,
    unit: 'Pcs',
    shelfLocation: 'Etalase ATK Rak 2',
    imageUrl: 'https://images.unsplash.com/photo-1580584126903-c17d41830450?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-atk-07',
    barcode: '8993988200022',
    name: 'Penghapus Pensil Joyko Hitam ER-B40',
    type: 'alat_tulis',
    category: 'Alat Tulis Kantor',
    brandOrPublisher: 'Joyko',
    costPrice: 1500,
    sellPrice: 3000,
    stock: 80,
    minStockAlert: 20,
    unit: 'Pcs',
    shelfLocation: 'Display Kasir Depan',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-atk-08',
    barcode: '021200501001',
    name: 'Sticky Notes Post-it 3M Kuning 3x3 Inch',
    type: 'alat_tulis',
    category: 'Alat Tulis Kantor',
    brandOrPublisher: '3M Post-it',
    costPrice: 10500,
    sellPrice: 16000,
    stock: 4, // low stock test
    minStockAlert: 10,
    unit: 'Pad',
    shelfLocation: 'Etalase ATK Rak 3',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-atk-09',
    barcode: '8997011002213',
    name: 'Stabilo Boss Original Highlighter Kuning',
    type: 'alat_tulis',
    category: 'Pulpen & Pensil',
    brandOrPublisher: 'Stabilo Boss',
    costPrice: 11000,
    sellPrice: 16500,
    stock: 35,
    minStockAlert: 8,
    unit: 'Pcs',
    shelfLocation: 'Etalase ATK Rak 2',
    imageUrl: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },

  // --- KATEGORI LAYANAN & JASA PERCETAKAN ---
  {
    id: 'prod-jasa-01',
    barcode: 'JASA-FC-01',
    name: 'Fotocopy HVS A4/F4 (Hitam Putih)',
    type: 'jasa',
    category: 'Fotocopy & Dokumen',
    brandOrPublisher: 'Mesin Canon IR 6000',
    costPrice: 100,
    sellPrice: 350,
    stock: 99999,
    minStockAlert: 0,
    unit: 'Lembar',
    shelfLocation: 'Mesin Fotocopy Depan',
    imageUrl: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-jasa-02',
    barcode: 'JASA-FC-02',
    name: 'Fotocopy Warna A4/F4',
    type: 'jasa',
    category: 'Fotocopy & Dokumen',
    brandOrPublisher: 'Mesin Konica Minolta',
    costPrice: 500,
    sellPrice: 1500,
    stock: 99999,
    minStockAlert: 0,
    unit: 'Lembar',
    shelfLocation: 'Mesin Fotocopy Warna',
    imageUrl: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-jasa-03',
    barcode: 'JASA-PR-01',
    name: 'Print Dokumen Hitam Putih (HVS A4/F4)',
    type: 'jasa',
    category: 'Print & Digital Output',
    brandOrPublisher: 'Print Station Kasir',
    costPrice: 150,
    sellPrice: 500,
    stock: 99999,
    minStockAlert: 0,
    unit: 'Lembar',
    shelfLocation: 'PC Kasir / Cetak',
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-jasa-04',
    barcode: 'JASA-PR-02',
    name: 'Print Dokumen Warna / Makalah / Proposal',
    type: 'jasa',
    category: 'Print & Digital Output',
    brandOrPublisher: 'Epson L-Series Inkjet',
    costPrice: 800,
    sellPrice: 2500,
    stock: 99999,
    minStockAlert: 0,
    unit: 'Lembar',
    shelfLocation: 'PC Kasir / Cetak',
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-jasa-05',
    barcode: 'JASA-BL-01',
    name: 'Cetak Baliho / Spanduk Flexi 280gr (Outdoor)',
    type: 'jasa',
    category: 'Percetakan & Banner',
    brandOrPublisher: 'Mesin Solvent 3.2m',
    costPrice: 12000,
    sellPrice: 25000,
    stock: 99999,
    minStockAlert: 0,
    unit: 'Meter',
    shelfLocation: 'Area Percetakan Luar',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-jasa-06',
    barcode: 'JASA-BN-01',
    name: 'Cetak X-Banner 60x160cm (+ Rangka Tiang)',
    type: 'jasa',
    category: 'Percetakan & Banner',
    brandOrPublisher: 'Indoor High-Res',
    costPrice: 42000,
    sellPrice: 75000,
    stock: 99999,
    minStockAlert: 0,
    unit: 'Set',
    shelfLocation: 'Display Banner Toko',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-jasa-07',
    barcode: 'JASA-JL-01',
    name: 'Jilid Lakban Hitam & Mika Bening (Skripsi/Makalah)',
    type: 'jasa',
    category: 'Jilid & Finishing',
    brandOrPublisher: 'Finishing Meja 1',
    costPrice: 1000,
    sellPrice: 3500,
    stock: 99999,
    minStockAlert: 0,
    unit: 'Buku',
    shelfLocation: 'Meja Finishing & Jilid',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-jasa-08',
    barcode: 'JASA-JL-02',
    name: 'Jilid Spiral Kawat + Cover Mika Depan Belakang',
    type: 'jasa',
    category: 'Jilid & Finishing',
    brandOrPublisher: 'Mesin Spiral Kawat',
    costPrice: 4000,
    sellPrice: 12000,
    stock: 99999,
    minStockAlert: 0,
    unit: 'Buku',
    shelfLocation: 'Meja Finishing & Jilid',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-jasa-09',
    barcode: 'JASA-LM-01',
    name: 'Laminating Panas Presisi A4/F4 (Ijazah/Sertifikat)',
    type: 'jasa',
    category: 'Jilid & Finishing',
    brandOrPublisher: 'Mesin Roll Panas',
    costPrice: 1200,
    sellPrice: 5000,
    stock: 99999,
    minStockAlert: 0,
    unit: 'Lembar',
    shelfLocation: 'Meja Laminating Depan',
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-jasa-10',
    barcode: 'JASA-SC-01',
    name: 'Scan Dokumen ke PDF / JPG / Flashdisk',
    type: 'jasa',
    category: 'Fotocopy & Dokumen',
    brandOrPublisher: 'Scanner Flatbed A4/F4',
    costPrice: 0,
    sellPrice: 1000,
    stock: 99999,
    minStockAlert: 0,
    unit: 'Halaman',
    shelfLocation: 'PC Kasir / Cetak',
    imageUrl: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  }
];

// Helper untuk format Rupiah
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Database Service Singleton
class DatabaseService {
  private isBrowser = typeof window !== 'undefined';

  constructor() {
    this.initDatabase();
  }

  // Inisialisasi Database Lokal
  public initDatabase(): void {
    if (!this.isBrowser) return;

    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.getDemoTransactions()));
      localStorage.setItem(STORAGE_KEYS.STORE_PROFILE, JSON.stringify(DEFAULT_STORE_PROFILE));
      localStorage.setItem(STORAGE_KEYS.PRINTER_CONFIG, JSON.stringify(DEFAULT_PRINTER_CONFIG));
      localStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // Demo transaksi awal agar grafik dan laporan langsung tampil memukau
  private getDemoTransactions(): POSTransaction[] {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    return [
      {
        id: `JNB-${dateStr.replace(/-/g, '')}-0001`,
        timestamp: `${dateStr}T09:15:20Z`,
        cashierName: 'Kasir 01 (Budi)',
        customerName: 'Ahmad Fauzi',
        customerPhone: '081234567890',
        items: [
          {
            product: INITIAL_PRODUCTS[0], // Atomic Habits
            quantity: 1,
            unitPrice: 108000,
            discountType: 'percentage',
            discountValue: 0,
            subtotal: 108000
          },
          {
            product: INITIAL_PRODUCTS[7], // Sinar Dunia SiDU
            quantity: 2,
            unitPrice: 42000,
            discountType: 'percentage',
            discountValue: 0,
            subtotal: 84000
          }
        ],
        totalItemsCount: 3,
        subtotal: 192000,
        discountTotal: 0,
        taxAmount: 0,
        grandTotal: 192000,
        totalCostHPP: 85000 + (32000 * 2), // 149000
        netProfit: 192000 - 149000, // 43000
        paymentMethod: 'cash',
        cashTendered: 200000,
        changeAmount: 8000,
        status: 'completed'
      },
      {
        id: `JNB-${dateStr.replace(/-/g, '')}-0002`,
        timestamp: `${dateStr}T11:40:10Z`,
        cashierName: 'Kasir 01 (Budi)',
        customerName: 'Rina Kusuma',
        items: [
          {
            product: INITIAL_PRODUCTS[1], // Filosofi Teras
            quantity: 1,
            unitPrice: 98000,
            discountType: 'percentage',
            discountValue: 10,
            subtotal: 88200
          },
          {
            product: INITIAL_PRODUCTS[8], // Pulpen Joyko
            quantity: 4,
            unitPrice: 4500,
            discountType: 'percentage',
            discountValue: 0,
            subtotal: 18000
          }
        ],
        totalItemsCount: 5,
        subtotal: 106200,
        discountTotal: 9800,
        taxAmount: 0,
        grandTotal: 106200,
        totalCostHPP: 76000 + (2800 * 4), // 87200
        netProfit: 106200 - 87200, // 19000
        paymentMethod: 'qris',
        cashTendered: 106200,
        changeAmount: 0,
        referenceNumber: 'QRIS-2026-99021',
        status: 'completed'
      }
    ];
  }

  // --- CRUD PRODUK (Buku, Alat Tulis & Layanan Jasa) ---
  public getProducts(): ProductItem[] {
    if (!this.isBrowser) return INITIAL_PRODUCTS;
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) return INITIAL_PRODUCTS;
    try {
      const list: ProductItem[] = JSON.parse(raw);
      // Auto-migrate: Pastikan produk layanan & jasa (fotocopy, print, baliho) otomatis ditambahkan jika belum ada
      const hasServices = list.some(p => p.type === 'jasa');
      if (!hasServices) {
        const services = INITIAL_PRODUCTS.filter(p => p.type === 'jasa');
        const merged = [...list, ...services];
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
        return merged;
      }
      return list;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public saveProduct(product: ProductItem): void {
    if (!this.isBrowser) return;
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);

    const now = new Date().toISOString();
    if (index >= 0) {
      products[index] = { ...product, updatedAt: now };
    } else {
      products.unshift({ ...product, createdAt: now, updatedAt: now });
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  public deleteProduct(id: string): void {
    if (!this.isBrowser) return;
    const products = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  public updateProductStock(id: string, newStock: number): void {
    if (!this.isBrowser) return;
    const products = this.getProducts();
    const item = products.find(p => p.id === id);
    if (item) {
      item.stock = Math.max(0, newStock);
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  }

  public getProductByBarcode(barcode: string): ProductItem | undefined {
    const products = this.getProducts();
    const cleanBarcode = barcode.trim().toLowerCase();
    return products.find(p => p.barcode.toLowerCase() === cleanBarcode);
  }

  // --- TRANSAKSI KASIR (Point of Sale) ---
  public getTransactions(): POSTransaction[] {
    if (!this.isBrowser) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  }

  public createTransaction(transaction: POSTransaction): void {
    if (!this.isBrowser) return;
    const transactions = this.getTransactions();
    transactions.unshift(transaction);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Kurangi stok barang fisik dari inventaris (kecuali layanan/jasa yang stoknya unlimited)
    const products = this.getProducts();
    for (const item of transaction.items) {
      const prod = products.find(p => p.id === item.product.id);
      if (prod && prod.type !== 'jasa') {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.updatedAt = new Date().toISOString();
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Jika transaksi tunai berhasil, catat penjualan tunai ke shift aktif
    if (transaction.status === 'completed' && transaction.paymentMethod === 'cash') {
      this.recordCashSaleInShift(transaction.grandTotal);
    }
  }

  public refundTransaction(transactionId: string): boolean {
    if (!this.isBrowser) return false;
    const transactions = this.getTransactions();
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx || tx.status === 'refunded') return false;

    tx.status = 'refunded';
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Kembalikan stok fisik ke inventaris (kecuali layanan/jasa)
    const products = this.getProducts();
    for (const item of tx.items) {
      const prod = products.find(p => p.id === item.product.id);
      if (prod && prod.type !== 'jasa') {
        prod.stock += item.quantity;
        prod.updatedAt = new Date().toISOString();
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Jika pengembalian transaksi tunai, kurangi kas penjualan shift
    if (tx.paymentMethod === 'cash') {
      this.recordCashSaleInShift(-tx.grandTotal);
    }

    return true;
  }

  // --- MANAJEMEN SHIFT KASIR & KAS LACI ---
  public getShifts(): CashierShift[] {
    if (!this.isBrowser) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    return raw ? JSON.parse(raw) : [];
  }

  public getActiveShift(): CashierShift | null {
    const shifts = this.getShifts();
    return shifts.find(s => s.status === 'open') || null;
  }

  public startShift(cashierName: string, startingCash: number, notes?: string): CashierShift {
    const active = this.getActiveShift();
    if (active) return active;

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const newShift: CashierShift = {
      id: `SHIFT-${dateStr}-${rand}`,
      cashierName: cashierName.trim() || 'Kasir Toko',
      startTime: new Date().toISOString(),
      startingCash,
      cashSales: 0,
      cashIn: 0,
      cashOut: 0,
      expectedCash: startingCash,
      status: 'open',
      notes
    };

    const shifts = this.getShifts();
    shifts.unshift(newShift);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    return newShift;
  }

  public getCashMovements(): CashMovement[] {
    if (!this.isBrowser) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_MOVEMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public getCashMovementsForShift(shiftId: string): CashMovement[] {
    return this.getCashMovements().filter(m => m.shiftId === shiftId);
  }

  public addCashMovement(
    type: 'in' | 'out',
    amount: number,
    category: string,
    note: string,
    cashierName?: string
  ): CashMovement | null {
    const activeShift = this.getActiveShift();
    if (!activeShift) return null;

    const newMovement: CashMovement = {
      id: `CASH-${Date.now()}`,
      shiftId: activeShift.id,
      timestamp: new Date().toISOString(),
      type,
      amount,
      category,
      note,
      cashierName: cashierName || activeShift.cashierName
    };

    const movements = this.getCashMovements();
    movements.unshift(newMovement);
    localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify(movements));

    // Update active shift totals
    if (type === 'in') {
      activeShift.cashIn += amount;
    } else {
      activeShift.cashOut += amount;
    }
    activeShift.expectedCash = activeShift.startingCash + activeShift.cashSales + activeShift.cashIn - activeShift.cashOut;

    const shifts = this.getShifts().map(s => s.id === activeShift.id ? activeShift : s);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));

    return newMovement;
  }

  public closeShift(actualCash: number, notes?: string): CashierShift | null {
    const activeShift = this.getActiveShift();
    if (!activeShift) return null;

    const expectedCash = activeShift.startingCash + activeShift.cashSales + activeShift.cashIn - activeShift.cashOut;
    const difference = actualCash - expectedCash;

    activeShift.endTime = new Date().toISOString();
    activeShift.expectedCash = expectedCash;
    activeShift.actualCash = actualCash;
    activeShift.difference = difference;
    activeShift.status = 'closed';
    if (notes) activeShift.notes = (activeShift.notes ? activeShift.notes + ' | ' : '') + notes;

    const shifts = this.getShifts().map(s => s.id === activeShift.id ? activeShift : s);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    return activeShift;
  }

  public recordCashSaleInShift(amount: number): void {
    const activeShift = this.getActiveShift();
    if (!activeShift) return;

    activeShift.cashSales += amount;
    activeShift.expectedCash = activeShift.startingCash + activeShift.cashSales + activeShift.cashIn - activeShift.cashOut;

    const shifts = this.getShifts().map(s => s.id === activeShift.id ? activeShift : s);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  }

  // --- TAHAN TRANSAKSI (Hold / Recall Orders) ---
  public getHeldOrders(): HeldOrder[] {
    if (!this.isBrowser) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.HELD_ORDERS);
    return raw ? JSON.parse(raw) : [];
  }

  public saveHeldOrder(order: HeldOrder): void {
    if (!this.isBrowser) return;
    const orders = this.getHeldOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(orders));
  }

  public deleteHeldOrder(orderId: string): void {
    if (!this.isBrowser) return;
    const orders = this.getHeldOrders().filter(o => o.id !== orderId);
    localStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(orders));
  }

  // --- PROFIL TOKO & PENGATURAN ---
  public getStoreProfile(): StoreProfile {
    if (!this.isBrowser) return DEFAULT_STORE_PROFILE;
    const raw = localStorage.getItem(STORAGE_KEYS.STORE_PROFILE);
    return raw ? JSON.parse(raw) : DEFAULT_STORE_PROFILE;
  }

  public saveStoreProfile(profile: StoreProfile): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.STORE_PROFILE, JSON.stringify(profile));
  }

  // --- KONFIGURASI PRINTER THERMAL ---
  public getPrinterConfig(): PrinterConfig {
    if (!this.isBrowser) return DEFAULT_PRINTER_CONFIG;
    const raw = localStorage.getItem(STORAGE_KEYS.PRINTER_CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_PRINTER_CONFIG;
  }

  public savePrinterConfig(config: PrinterConfig): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.PRINTER_CONFIG, JSON.stringify(config));
  }

  // --- STATISTIK & LAPORAN PENJUALAN ---
  public getSalesAnalytics(filterDate?: string) {
    const transactions = this.getTransactions().filter(t => t.status === 'completed');
    const targetDate = filterDate || new Date().toISOString().split('T')[0];

    const currentMonthPrefix = targetDate.substring(0, 7); // YYYY-MM

    let dailyOmzet = 0;
    let dailyProfit = 0;
    let dailyTransactionsCount = 0;
    let dailyItemsSold = 0;

    let monthlyOmzet = 0;
    let monthlyProfit = 0;
    let monthlyTransactionsCount = 0;

    const paymentBreakdown = {
      cash: 0,
      qris: 0,
      debit: 0,
      transfer: 0
    };

    const productSalesMap: Record<string, { name: string; type: string; qty: number; totalSales: number }> = {};

    for (const tx of transactions) {
      const txDate = tx.timestamp.split('T')[0];
      const txMonth = txDate.substring(0, 7);

      // Hitungan Harian
      if (txDate === targetDate) {
        dailyOmzet += tx.grandTotal;
        dailyProfit += tx.netProfit;
        dailyTransactionsCount += 1;
        dailyItemsSold += tx.totalItemsCount;
      }

      // Hitungan Bulanan
      if (txMonth === currentMonthPrefix) {
        monthlyOmzet += tx.grandTotal;
        monthlyProfit += tx.netProfit;
        monthlyTransactionsCount += 1;
      }

      // Rekap Metode Bayar
      paymentBreakdown[tx.paymentMethod] = (paymentBreakdown[tx.paymentMethod] || 0) + tx.grandTotal;

      // Rekap Item Terlaris
      for (const item of tx.items) {
        if (!productSalesMap[item.product.id]) {
          productSalesMap[item.product.id] = {
            name: item.product.name,
            type: item.product.type,
            qty: 0,
            totalSales: 0
          };
        }
        productSalesMap[item.product.id].qty += item.quantity;
        productSalesMap[item.product.id].totalSales += item.subtotal;
      }
    }

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      targetDate,
      dailyOmzet,
      dailyProfit,
      dailyTransactionsCount,
      dailyItemsSold,
      monthlyOmzet,
      monthlyProfit,
      monthlyTransactionsCount,
      paymentBreakdown,
      topSellingProducts
    };
  }

  // --- EKSPOR & IMPOR DATABASE SQLITE / JSON ---
  public exportDatabase(): string {
    const backup: DatabaseBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      storeProfile: this.getStoreProfile(),
      printerConfig: this.getPrinterConfig(),
      products: this.getProducts(),
      transactions: this.getTransactions()
    };
    return JSON.stringify(backup, null, 2);
  }

  public importDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as DatabaseBackup;
      if (!data.products || !Array.isArray(data.products)) {
        throw new Error('Format data tidak valid: produk tidak ditemukan');
      }

      if (data.products) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
      if (data.storeProfile) localStorage.setItem(STORAGE_KEYS.STORE_PROFILE, JSON.stringify(data.storeProfile));
      if (data.printerConfig) localStorage.setItem(STORAGE_KEYS.PRINTER_CONFIG, JSON.stringify(data.printerConfig));

      return true;
    } catch (e) {
      console.error('Import database failed:', e);
      return false;
    }
  }

  public resetToFactoryDefaults(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    this.initDatabase();
  }
}

export const dbService = new DatabaseService();
