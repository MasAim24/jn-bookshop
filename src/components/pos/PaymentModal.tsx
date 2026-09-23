import React, { useState, useEffect } from 'react';
import { 
  X, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Building2, 
  CheckCircle, 
  Printer, 
  AlertTriangle,
  User,
  Phone,
  Delete,
  Calculator
} from 'lucide-react';
import { POSCartItem, POSTransaction, StoreProfile, PaymentMethod } from '../../types/pos';
import { dbService, formatRupiah } from '../../services/db';
import { soundService } from '../../services/sound';

interface PaymentModalProps {
  cart: POSCartItem[];
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  storeProfile: StoreProfile;
  onClose: () => void;
  onSuccess: (transaction: POSTransaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  cart,
  subtotal,
  discountTotal,
  grandTotal,
  storeProfile,
  onClose,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(grandTotal);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [autoPrint, setAutoPrint] = useState<boolean>(true);
  const [showNumpad, setShowNumpad] = useState<boolean>(true);

  // Kalkulasi kembalian
  const changeAmount = paymentMethod === 'cash' ? Math.max(0, cashTendered - grandTotal) : 0;
  const isInsufficientCash = paymentMethod === 'cash' && cashTendered < grandTotal;

  // Generate Pecahan Uang Dinamis Berdasarkan Grand Total
  const dynamicQuickCash = React.useMemo(() => {
    const list: { label: string; value: number }[] = [
      { label: 'Uang Pas', value: grandTotal }
    ];

    const roundSteps = [
      Math.ceil(grandTotal / 5000) * 5000,
      Math.ceil(grandTotal / 10000) * 10000,
      Math.ceil(grandTotal / 20000) * 20000,
      Math.ceil(grandTotal / 50000) * 5000,
      Math.ceil(grandTotal / 50000) * 50000,
      Math.ceil(grandTotal / 100000) * 100000
    ];

    const commonCashNominals = [20000, 50000, 100000, 200000, 500000];

    const uniqueValues = Array.from(new Set([...roundSteps, ...commonCashNominals]))
      .filter(val => val > grandTotal)
      .sort((a, b) => a - b)
      .slice(0, 5);

    uniqueValues.forEach(val => {
      list.push({ label: formatRupiah(val), value: val });
    });

    return list;
  }, [grandTotal]);

  // Listener Keyboard: Esc untuk keluar, Enter untuk selesaikan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Enter') {
        // Hanya jika tidak di textarea/input teks tertentu
        const target = e.target as HTMLElement;
        if (target && target.tagName === 'INPUT' && target.getAttribute('type') === 'text') {
          return;
        }
        if (!isInsufficientCash) {
          e.preventDefault();
          handleCompleteTransaction();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cashTendered, isInsufficientCash, grandTotal]);

  // Numpad Touch Handler
  const handleNumpadInput = (char: string) => {
    soundService.playAdd();
    if (char === 'C') {
      setCashTendered(0);
      return;
    }
    if (char === 'BACK') {
      const str = String(cashTendered);
      if (str.length <= 1) {
        setCashTendered(0);
      } else {
        setCashTendered(parseInt(str.slice(0, -1)) || 0);
      }
      return;
    }
    if (char === 'PAS') {
      setCashTendered(grandTotal);
      return;
    }

    const currentStr = cashTendered === 0 ? '' : String(cashTendered);
    const newStr = currentStr + char;
    setCashTendered(parseInt(newStr) || 0);
  };

  const handleCompleteTransaction = () => {
    if (isInsufficientCash) {
      soundService.playError();
      alert('Nominal uang tunai yang diterima kurang dari total tagihan!');
      return;
    }

    soundService.playSuccess();

    // Hitung total modal HPP untuk analitika laba bersih
    const totalCostHPP = cart.reduce(
      (acc, item) => acc + (item.product.costPrice * item.quantity),
      0
    );
    const netProfit = grandTotal - totalCostHPP;

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const transactionId = `JNB-${dateStr}-${randomSuffix}`;

    const newTx: POSTransaction = {
      id: transactionId,
      timestamp: new Date().toISOString(),
      cashierName: 'Kasir Toko (Admin)',
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      items: cart,
      totalItemsCount: cart.reduce((acc, item) => acc + item.quantity, 0),
      subtotal,
      discountTotal,
      taxAmount: 0,
      grandTotal,
      totalCostHPP,
      netProfit,
      paymentMethod,
      cashTendered: paymentMethod === 'cash' ? cashTendered : grandTotal,
      changeAmount,
      referenceNumber: referenceNumber.trim() || (paymentMethod === 'qris' ? `QRIS-${Date.now().toString().slice(-6)}` : undefined),
      status: 'completed'
    };

    // Simpan ke database lokal
    dbService.createTransaction(newTx);
    onSuccess(newTx);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-400" />
              <span>Pembayaran Kasir</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Pilih metode pembayaran dan masukkan nominal bayar</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Banner Tagihan */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tagihan Belanja</span>
              <div className="text-3xl lg:text-4xl font-black font-mono tracking-tight text-emerald-400 tabular-nums">
                {formatRupiah(grandTotal)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>Total Item: <span className="text-slate-200 font-bold">{cart.length} jenis</span></div>
              {discountTotal > 0 && (
                <div className="text-amber-400 font-medium mt-0.5">Diskon: -{formatRupiah(discountTotal)}</div>
              )}
            </div>
          </div>

          {/* Metode Bayar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs font-semibold">Tunai</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'qris'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs font-semibold">QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('debit')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'debit'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-semibold">EDC / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'transfer'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs font-semibold">Transfer</span>
              </button>
            </div>
          </div>

          {/* Area Spesifik Tiap Metode Bayar */}
          {paymentMethod === 'cash' ? (
            <div className="space-y-3.5 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Uang Tunai Diterima (Rp)
                </label>
                <button
                  type="button"
                  onClick={() => setShowNumpad(!showNumpad)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>{showNumpad ? 'Sembunyikan Numpad' : 'Buka Numpad Layar'}</span>
                </button>
              </div>

              <input
                type="number"
                value={cashTendered || ''}
                onChange={(e) => setCashTendered(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-2xl lg:text-3xl font-black font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 shadow-inner"
              />

              {/* Pecahan Uang Cepat Dinamis */}
              <div className="flex flex-wrap gap-2">
                {dynamicQuickCash.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundService.playAdd();
                      setCashTendered(opt.value);
                    }}
                    className={`px-3 py-1.5 rounded-lg active:scale-95 text-xs font-mono font-bold transition-all border ${
                      opt.label === 'Uang Pas'
                        ? 'bg-emerald-600/30 border-emerald-500/80 text-emerald-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Numpad Virtual Touchscreen */}
              {showNumpad && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="grid grid-cols-4 gap-1.5">
                    {['7', '8', '9', 'C'].map((btn) => (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => handleNumpadInput(btn)}
                        className={`h-11 rounded-lg font-bold font-mono text-sm transition-all active:scale-95 ${
                          btn === 'C'
                            ? 'bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/80 shadow-xs'
                        }`}
                      >
                        {btn}
                      </button>
                    ))}
                    {['4', '5', '6', 'BACK'].map((btn) => (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => handleNumpadInput(btn)}
                        className={`h-11 rounded-lg font-bold font-mono text-sm transition-all active:scale-95 flex items-center justify-center ${
                          btn === 'BACK'
                            ? 'bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800 text-amber-300'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/80 shadow-xs'
                        }`}
                      >
                        {btn === 'BACK' ? <Delete className="w-4 h-4" /> : btn}
                      </button>
                    ))}
                    {['1', '2', '3', '000'].map((btn) => (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => handleNumpadInput(btn)}
                        className="h-11 rounded-lg font-bold font-mono text-sm transition-all active:scale-95 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/80 shadow-xs"
                      >
                        {btn}
                      </button>
                    ))}
                    {['0', '00', 'PAS'].map((btn) => (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => handleNumpadInput(btn)}
                        className={`h-11 rounded-lg font-bold font-mono text-sm transition-all active:scale-95 ${
                          btn === 'PAS'
                            ? 'col-span-2 bg-emerald-700 hover:bg-emerald-600 text-white font-sans'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/80 shadow-xs'
                        }`}
                      >
                        {btn === 'PAS' ? 'Uang Pas' : btn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tampilan Kembalian */}
              <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                isInsufficientCash
                  ? 'bg-rose-950/50 border-rose-800/80 text-rose-300'
                  : 'bg-emerald-950/50 border-emerald-700/80 text-emerald-300 shadow-md'
              }`}>
                <div>
                  {isInsufficientCash ? (
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Uang Kurang Sebesar:</span>
                    </div>
                  ) : (
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-400/90">Uang Kembalian:</span>
                  )}
                </div>
                <div className="font-black text-2xl lg:text-3xl font-mono tabular-nums">
                  {formatRupiah(isInsufficientCash ? grandTotal - cashTendered : changeAmount)}
                </div>
              </div>
            </div>
          ) : paymentMethod === 'qris' ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 bg-white rounded-xl shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JNBOOKSHOP-QRIS-${grandTotal}`}
                  alt="QRIS QR Code"
                  className="w-36 h-36"
                />
              </div>
              <div>
                <p className="font-semibold text-xs text-slate-200">Scan QRIS Nasional</p>
                <p className="text-[11px] text-slate-400 mt-0.5">BCA, Mandiri, GoPay, OVO, ShopeePay, Dana</p>
                <p className="text-xs font-mono font-bold text-emerald-400 mt-1">{formatRupiah(grandTotal)}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Nomor Referensi / Approval Code / No Kartu (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: REF-8877192 / BCA-0912"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Detail Pelanggan (Opsional) */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nama Pembeli (Opsional)</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Nama Pelanggan"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">No. WhatsApp / HP</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoPrint}
              onChange={(e) => setAutoPrint(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Cetak Struk Termal Otomatis</span>
          </label>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isInsufficientCash}
              onClick={handleCompleteTransaction}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/60 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Selesaikan Transaksi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
