// Definisi tipe data komprehensif untuk Sistem POS Kasir & Inventaris JN Book & Stationary Shop

export type ProductType = 'buku' | 'alat_tulis' | 'jasa';

export interface ProductItem {
  id: string;
  barcode: string;            // ISBN atau Barcode SKU ATK / Kode Jasa
  name: string;
  type: ProductType;          // Buku, Alat Tulis, atau Jasa (Fotocopy, Print, Baliho, Jilid)
  category: string;          // Kategori detail
  brandOrPublisher?: string; // Penerbit (Buku) atau Merk (ATK: Joyko, Faber-Castell, dll)
  costPrice: number;         // Harga Beli / Modal HPP (Rp)
  sellPrice: number;         // Harga Jual (Rp)
  stock: number;             // Jumlah stok fisik saat ini
  minStockAlert: number;     // Batas minimum peringatan stok menipis
  unit: string;              // Satuan: Pcs, Pak, Rim, Lusin, Box, Set
  shelfLocation: string;     // Lokasi rak / etalase fisik
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface POSCartItem {
  product: ProductItem;
  quantity: number;
  unitPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'transfer';

export interface POSTransaction {
  id: string;                 // No Nota: JNB-YYYYMMDD-XXXX
  timestamp: string;          // ISO String
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  items: POSCartItem[];
  totalItemsCount: number;
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  grandTotal: number;
  totalCostHPP: number;       // Total harga modal untuk menghitung laba bersih
  netProfit: number;          // grandTotal - totalCostHPP - taxAmount
  paymentMethod: PaymentMethod;
  cashTendered: number;       // Uang yang diserahkan pelanggan
  changeAmount: number;       // Uang kembalian
  referenceNumber?: string;   // Ref QRIS / No kartu debit / No transfer
  status: 'completed' | 'refunded';
  notes?: string;
}

export interface HeldOrder {
  id: string;
  heldAt: string;
  customerLabel: string;
  items: POSCartItem[];
  subtotal: number;
}

export interface StoreProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  receiptHeader: string;
  receiptFooter: string;
  taxRatePercent: number;     // Default 0% atau 11%
  enableTax: boolean;
  currencySymbol: string;     // 'Rp'
}

export interface PrinterConfig {
  paperWidth: '58mm' | '80mm';
  autoPrintReceipt: boolean;
  cutPaper: boolean;
  cashDrawerKick: boolean;
  showBarcode: boolean;
  showCashierName: boolean;
}

export interface DatabaseBackup {
  version: string;
  exportedAt: string;
  storeProfile: StoreProfile;
  printerConfig: PrinterConfig;
  products: ProductItem[];
  transactions: POSTransaction[];
  shifts?: CashierShift[];
  cashMovements?: CashMovement[];
}

// Model Shift Kasir & Rekap Kas Laci (Pilihan 1)
export interface CashierShift {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  cashSales: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface CashMovement {
  id: string;
  shiftId: string;
  timestamp: string;
  type: 'in' | 'out';
  amount: number;
  category: string;
  note: string;
  cashierName: string;
}

// Model Konfigurasi Cetak Label Barcode (Pilihan 2)
export type BarcodeLabelSize = 'thermal_40x30' | 'mini_38x18' | 'shelf_60x40' | 'standard-thermal' | 'mini-sticker' | 'shelf-tag';

export interface BarcodeLabelConfig {
  labelSize: BarcodeLabelSize;
  includeStoreName: boolean;
  includePrice: boolean;
  includeBarcodeText: boolean;
  includeCategory: boolean;
}

