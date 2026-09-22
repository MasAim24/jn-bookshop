import React, { useState } from 'react';
import { X, Printer, Download, Check, Copy } from 'lucide-react';
import { POSTransaction, StoreProfile } from '../../types/pos';
import { ThermalPrinterService } from '../../services/thermalPrinter';
import { dbService } from '../../services/db';

interface ReceiptModalProps {
  transaction: POSTransaction;
  storeProfile: StoreProfile;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  storeProfile,
  onClose
}) => {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [copied, setCopied] = useState(false);

  const printerConfig = {
    ...dbService.getPrinterConfig(),
    paperWidth
  };

  const receiptPlainText = ThermalPrinterService.generateReceiptText(
    transaction,
    storeProfile,
    printerConfig
  );

  const handlePrint = () => {
    ThermalPrinterService.printThermal();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptPlainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([receiptPlainText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Struk-${transaction.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scaleUp">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Struk Transaksi Selesai</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{transaction.id}</p>
          </div>

          {/* Selector 58mm / 80mm */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  paperWidth === '58mm'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  paperWidth === '80mm'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                80mm
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Struk Termal Realistis */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex justify-center">
          <div
            className={`bg-[#FAFAF9] text-[#1C1917] p-5 shadow-2xl border border-stone-300 font-mono text-[11px] leading-tight select-text transition-all rounded-xs ${
              paperWidth === '58mm' ? 'w-[280px]' : 'w-[380px]'
            }`}
            style={{
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
            }}
          >
            <pre className="whitespace-pre-wrap font-mono text-[11px]">
              {receiptPlainText}
            </pre>
          </div>
        </div>

        {/* Hidden Container yang akan dicetak oleh printer thermal */}
        <div
          id="thermal-receipt-printable"
          className={paperWidth === '80mm' ? 'paper-80mm' : ''}
          style={{ display: 'none' }}
        >
          <pre style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {receiptPlainText}
          </pre>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan .TXT</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
