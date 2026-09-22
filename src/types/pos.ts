// Definisi tipe data komprehensif untuk Sistem POS Kasir & Inventaris JN Book & Stationary Shop

export type ProductType = 'buku' | 'alat_tulis';

export interface ProductItem {
  id: string;
  barcode: string;            // ISBN atau Barcode SKU ATK
  name: string;
  type: ProductType;          // Buku atau Alat Tulis
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
}
