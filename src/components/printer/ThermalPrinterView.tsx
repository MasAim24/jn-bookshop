import React, { useState } from 'react';
import { 
  Printer, 
  Settings2, 
  FileText, 
  Check, 
  HelpCircle, 
  Radio, 
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';
import { StoreProfile, PrinterConfig } from '../../types/pos';
import { dbService } from '../../services/db';
import { ThermalPrinterService } from '../../services/thermalPrinter';

interface ThermalPrinterViewProps {
  storeProfile: StoreProfile;
  refreshData: () => void;
}

export const ThermalPrinterView: React.FC<ThermalPrinterViewProps> = ({
  storeProfile,
  refreshData
}) => {
  const [config, setConfig] = useState<PrinterConfig>(dbService.getPrinterConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testReceiptText, setTestReceiptText] = useState<string>(
    ThermalPrinterService.generateTestReceipt(storeProfile, dbService.getPrinterConfig())
  );

  const handleUpdateWidth = (width: '58mm' | '80mm') => {
    const updated = { ...config, paperWidth: width };
    setConfig(updated);
    dbService.savePrinterConfig(updated);
    setTestReceiptText(ThermalPrinterService.generateTestReceipt(storeProfile, updated));
  };

  const handleToggleAutoPrint = (checked: boolean) => {
    const updated = { ...config, autoPrintReceipt: checked };
    setConfig(updated);
    dbService.savePrinterConfig(updated);
  };

  const handleToggleBarcode = (checked: boolean) => {
    const updated = { ...config, showBarcode: checked };
    setConfig(updated);
    dbService.savePrinterConfig(updated);
    setTestReceiptText(ThermalPrinterService.generateTestReceipt(storeProfile, updated));
  };

  const handleTestPrint = () => {
    ThermalPrinterService.printThermal();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Printer className="w-5 h-5 text-emerald-400" />
          <span>Pengaturan Printer Termal (Thermal Receipt Printer)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Dukungan printer kasir Bluetooth, USB, ESC/POS, dan dialog cetak Windows untuk kertas 58mm & 80mm
        </p>
      </div>

      <div className="flex-1 overflow-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Form Konfigurasi Printer */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-emerald-400" />
              <span>Format & Ukuran Kertas Struk</span>
            </h3>

            {/* Pilihan 58mm vs 80mm */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Pilih Ukuran Kertas Printer Kasir
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdateWidth('58mm')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    config.paperWidth === '58mm'
                      ? 'bg-emerald-950/40 border-emerald-500 text-slate-100 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Thermal 58mm</span>
                    {config.paperWidth === '58mm' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Lebar standar 32 karakter. Cocok untuk printer mini portable Bluetooth / USB (misal: RPP02N, VSC, Eppos, Iware).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateWidth('80mm')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    config.paperWidth === '80mm'
                      ? 'bg-emerald-950/40 border-emerald-500 text-slate-100 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Thermal 80mm</span>
                    {config.paperWidth === '80mm' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Lebar 48 karakter. Cocok untuk printer POS desktop restoran & supermarket (misal: Epson TM-T82, Iware, Xprinter).
                  </p>
                </button>
              </div>
            </div>

            {/* Opsi Switch Tambahan */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Cetak Otomatis Saat Checkout</div>
                  <div className="text-[11px] text-slate-500">Membuka dialog cetak langsung saat kasir menekan Selesaikan Transaksi</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoPrintReceipt}
                  onChange={(e) => handleToggleAutoPrint(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Tampilkan Barcode Struk</div>
                  <div className="text-[11px] text-slate-500">Mencetak representasi barcode nomor nota di bagian bawah struk</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showBarcode}
                  onChange={(e) => handleToggleBarcode(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Panduan Koneksi Printer di Windows */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs text-slate-300">
            <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Petunjuk Menghubungkan Printer Termal di Windows OS:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
              <li>Colokkan kabel USB printer kasir ke laptop/PC Windows, atau hubungkan via Bluetooth di Windows Settings.</li>
              <li>Instal driver bawaan printer termal (atau gunakan driver generic <strong>POS-58</strong> / <strong>POS-80</strong>).</li>
              <li>Set printer termal sebagai <strong>Default Printer</strong> di Control Panel Windows.</li>
              <li>Saat dialog cetak muncul, pastikan margin diatur ke <strong>None</strong> agar struk tidak terpotong.</li>
            </ol>
          </div>
        </div>

        {/* Kolom Kanan: Preview Struk Kalibrasi & Tombol Cetak */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Preview Cetak Kertas ({config.paperWidth})</span>
            </h3>

            <button
              onClick={handleTestPrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Test Struk (Test Print)</span>
            </button>
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-center items-start overflow-y-auto">
            <div
              className={`bg-[#FAFAF9] text-[#1C1917] p-5 shadow-2xl border border-stone-300 font-mono text-[11px] leading-tight select-text rounded-xs ${
                config.paperWidth === '58mm' ? 'w-[280px]' : 'w-[380px]'
              }`}
            >
              <pre className="whitespace-pre-wrap font-mono text-[11px]">
                {testReceiptText}
              </pre>
            </div>
          </div>

          {/* Hidden printable test receipt */}
          <div
            id="thermal-receipt-printable"
            className={config.paperWidth === '80mm' ? 'paper-80mm' : ''}
            style={{ display: 'none' }}
          >
            <pre style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {testReceiptText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
