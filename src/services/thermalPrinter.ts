import { POSTransaction, StoreProfile, PrinterConfig } from '../types/pos';
import { formatRupiah } from './db';

export class ThermalPrinterService {
  /**
   * Menghasilkan teks struk termal yang rapi dengan lebar karakter tetap (32 char untuk 58mm, 48 char untuk 80mm)
   */
  public static generateReceiptText(
    transaction: POSTransaction,
    profile: StoreProfile,
    config: PrinterConfig
  ): string {
    const lineWidth = config.paperWidth === '58mm' ? 32 : 48;
    const divider = '-'.repeat(lineWidth);
    const doubleDivider = '='.repeat(lineWidth);

    const padCenter = (text: string): string => {
      if (text.length >= lineWidth) return text.substring(0, lineWidth);
      const remaining = lineWidth - text.length;
      const left = Math.floor(remaining / 2);
      const right = remaining - left;
      return ' '.repeat(left) + text + ' '.repeat(right);
    };

    const padLine = (left: string, right: string): string => {
      const space = lineWidth - left.length - right.length;
      if (space <= 0) {
        return left.substring(0, lineWidth - right.length - 1) + ' ' + right;
      }
      return left + ' '.repeat(space) + right;
    };

    const lines: string[] = [];

    // Header Toko
    lines.push(doubleDivider);
    lines.push(padCenter(profile.name.toUpperCase()));
    if (profile.tagline) lines.push(padCenter(profile.tagline));
    lines.push(padCenter(profile.address));
    lines.push(padCenter(`Telp: ${profile.phone}`));
    lines.push(doubleDivider);

    // Info Transaksi
    const dateFormatted = new Date(transaction.timestamp).toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'medium'
    });
    lines.push(padLine('No. Nota :', transaction.id));
    lines.push(padLine('Waktu    :', dateFormatted));
    if (config.showCashierName) {
      lines.push(padLine('Kasir    :', transaction.cashierName));
    }
    if (transaction.customerName) {
      lines.push(padLine('Pelanggan:', transaction.customerName));
    }
    lines.push(divider);

    // Daftar Item
    lines.push(padLine('ITEM [QTY x HARGA]', 'TOTAL'));
    lines.push(divider);

    for (const item of transaction.items) {
      // Baris nama barang
      lines.push(item.product.name.substring(0, lineWidth));
      
      const qtyAndPrice = `  ${item.quantity} ${item.product.unit} x ${formatRupiah(item.unitPrice)}`;
      const itemSubtotal = formatRupiah(item.subtotal);
      lines.push(padLine(qtyAndPrice, itemSubtotal));

      if (item.discountValue > 0) {
        const discLabel = item.discountType === 'percentage' 
          ? `  (Diskon ${item.discountValue}%)` 
          : `  (Diskon Potongan)`;
        const discNominal = `-${formatRupiah(
          item.discountType === 'percentage' 
            ? (item.unitPrice * item.quantity * item.discountValue) / 100 
            : item.discountValue
        )}`;
        lines.push(padLine(discLabel, discNominal));
      }
    }

    lines.push(divider);

    // Rincian Pembayaran
    lines.push(padLine('Subtotal:', formatRupiah(transaction.subtotal)));
    if (transaction.discountTotal > 0) {
      lines.push(padLine('Total Diskon:', `-${formatRupiah(transaction.discountTotal)}`));
    }
    if (transaction.taxAmount > 0) {
      lines.push(padLine(`PPN (${profile.taxRatePercent}%):`, formatRupiah(transaction.taxAmount)));
    }
    lines.push(doubleDivider);
    lines.push(padLine('TOTAL TAGIHAN:', formatRupiah(transaction.grandTotal)));

    // Metode Bayar
    const methodNames: Record<string, string> = {
      cash: 'TUNAI (CASH)',
      qris: 'QRIS',
      debit: 'KARTU DEBIT/EDC',
      transfer: 'TRANSFER BANK'
    };

    lines.push(padLine('Metode Bayar:', methodNames[transaction.paymentMethod] || transaction.paymentMethod.toUpperCase()));

    if (transaction.paymentMethod === 'cash') {
      lines.push(padLine('Uang Diterima:', formatRupiah(transaction.cashTendered)));
      lines.push(padLine('KEMBALIAN:', formatRupiah(transaction.changeAmount)));
    } else if (transaction.referenceNumber) {
      lines.push(padLine('No. Referensi:', transaction.referenceNumber));
    }

    lines.push(doubleDivider);

    // Barcode representasi nota
    if (config.showBarcode) {
      lines.push(padCenter(`* ${transaction.id} *`));
      lines.push(padCenter('|| | |||| || ||||| |||| | |||'));
    }

    // Pesan Footer
    if (profile.receiptFooter) {
      const footerLines = profile.receiptFooter.split('\n');
      for (const fl of footerLines) {
        lines.push(padCenter(fl));
      }
    }
    lines.push(doubleDivider);

    return lines.join('\n');
  }

  /**
   * Menjalankan cetak struk via Windows / Browser Print Dialog khusus thermal
   */
  public static printThermal(receiptElementId: string = 'thermal-receipt-printable'): void {
    if (typeof window === 'undefined') return;

    // Jika berjalan di Electron dengan IPC khusus
    const win = window as any;
    if (win.electronAPI && typeof win.electronAPI.printThermalReceipt === 'function') {
      win.electronAPI.printThermalReceipt();
      return;
    }

    // Menggunakan window.print() dengan CSS terisolasi
    window.print();
  }

  /**
   * Menghasilkan Test Print untuk kalibrasi printer kasir
   */
  public static generateTestReceipt(profile: StoreProfile, config: PrinterConfig): string {
    const dummyTx: POSTransaction = {
      id: 'TEST-PRINTER-001',
      timestamp: new Date().toISOString(),
      cashierName: 'Admin / Teknisi',
      customerName: 'Uji Coba Printer',
      items: [
        {
          product: {
            id: 'test-1',
            barcode: '123456789',
            name: 'Uji Karakter Printer Termal',
            type: 'alat_tulis',
            category: 'Testing',
            costPrice: 5000,
            sellPrice: 10000,
            stock: 100,
            minStockAlert: 10,
            unit: 'Pcs',
            shelfLocation: 'Testing',
            createdAt: '',
            updatedAt: ''
          },
          quantity: 1,
          unitPrice: 10000,
          discountType: 'percentage',
          discountValue: 0,
          subtotal: 10000
        }
      ],
      totalItemsCount: 1,
      subtotal: 10000,
      discountTotal: 0,
      taxAmount: 0,
      grandTotal: 10000,
      totalCostHPP: 5000,
      netProfit: 5000,
      paymentMethod: 'cash',
      cashTendered: 10000,
      changeAmount: 0,
      status: 'completed'
    };

    return this.generateReceiptText(dummyTx, profile, config);
  }
}
