import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, X, Delete, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';
import { dbService } from '../../services/db';
import { soundService } from '../../services/sound';

interface PinAuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export const PinAuthModal: React.FC<PinAuthModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
  title = 'Otorisasi Akses Manajer / Owner',
  description = 'Menu ini dilindungi dengan PIN keamanan untuk menjaga kerahasiaan data toko.'
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showDigits, setShowDigits] = useState<boolean>(false);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsShaking(false);
    }
  }, [isOpen]);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < 8) {
      soundService.playTap();
      setPin(prev => prev + digit);
      setErrorMsg('');
    }
  }, [pin]);

  const handleDelete = useCallback(() => {
    soundService.playTap();
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  }, []);

  const handleClear = useCallback(() => {
    soundService.playTap();
    setPin('');
    setErrorMsg('');
  }, []);

  const handleSubmit = useCallback(() => {
    if (!pin) {
      soundService.playError();
      setErrorMsg('Masukkan PIN terlebih dahulu!');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const isValid = dbService.verifyPin(pin);
    if (isValid) {
      soundService.playSuccess();
      setPin('');
      setErrorMsg('');
      onSuccess();
    } else {
      soundService.playError();
      setErrorMsg('PIN salah! Silakan coba lagi.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPin('');
    }
  }, [pin, onSuccess]);

  // Listener Keyboard Fisik
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleDelete, handleSubmit, onCancel]);

  if (!isOpen) return null;

  const maxDots = Math.max(4, pin.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className={`bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden text-slate-100 transition-all ${
          isShaking ? 'animate-shake' : ''
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.15)'
        }}
      >
        {/* Modal Header */}
        <div className="p-5 pb-3 flex items-start justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">{title}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: PIN Indicator */}
        <div className="p-6 flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Masukkan 4-6 Digit PIN</span>
            <button
              type="button"
              onClick={() => setShowDigits(!showDigits)}
              className="ml-1 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
              title={showDigits ? "Sembunyikan angka" : "Tampilkan angka"}
            >
              {showDigits ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* PIN Dots Display */}
          <div className="flex items-center gap-3 py-2">
            {Array.from({ length: 4 }).map((_, idx) => {
              const isFilled = idx < pin.length;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 flex items-center justify-center text-[10px] font-bold ${
                    isFilled
                      ? 'bg-emerald-500 border-2 border-emerald-400 scale-110 shadow-sm shadow-emerald-500/50 text-slate-950'
                      : 'bg-slate-950 border-2 border-slate-700'
                  }`}
                >
                  {isFilled && showDigits ? pin[idx] : ''}
                </div>
              );
            })}
            {pin.length > 4 && (
              <span className="text-xs font-mono text-emerald-400 font-bold ml-1">
                +{pin.length - 4} digit
              </span>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 w-full justify-center animate-fadeIn">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Numeric Keypad Buttons */}
          <div className="grid grid-cols-3 gap-2.5 w-full pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(num)}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-emerald-600 text-slate-100 hover:text-white font-mono font-bold text-lg border border-slate-700/60 transition-all shadow-xs cursor-pointer select-none"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="py-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-rose-400 font-bold text-xs border border-slate-800 transition-all cursor-pointer select-none"
            >
              Hapus (C)
            </button>

            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="py-3 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-emerald-600 text-slate-100 hover:text-white font-mono font-bold text-lg border border-slate-700/60 transition-all shadow-xs cursor-pointer select-none"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="py-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-amber-400 font-bold text-xs flex items-center justify-center border border-slate-800 transition-all cursor-pointer select-none"
              title="Hapus Satu Digit"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          {/* Hint info */}
          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-500">
              💡 PIN Bawaan Toko: <span className="font-mono font-bold text-amber-400">1234</span>
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              (Dapat diubah di menu Pengaturan Toko)
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pin.length < 4}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              pin.length >= 4
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Verifikasi PIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
