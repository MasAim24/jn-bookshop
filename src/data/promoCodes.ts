import { PromoCode } from '../types';

export const PROMO_CODES: PromoCode[] = [
  {
    code: 'JN2026',
    discountType: 'percentage',
    discountValue: 20,
    minSpend: 100000,
    description: 'Diskon 20% untuk semua buku (Min. belanja Rp 100.000)',
  },
  {
    code: 'GRATISONGKIR',
    discountType: 'shipping',
    discountValue: 25000,
    minSpend: 120000,
    description: 'Gratis ongkir s.d Rp 25.000 (Min. belanja Rp 120.000)',
  },
  {
    code: 'LITERASI30',
    discountType: 'percentage',
    discountValue: 30,
    minSpend: 250000,
    description: 'Diskon 30% Spesial Pecinta Buku (Min. belanja Rp 250.000)',
  },
  {
    code: 'JNNEWBIE',
    discountType: 'fixed',
    discountValue: 25000,
    minSpend: 75000,
    description: 'Potongan langsung Rp 25.000 untuk pembeli pertama',
  },
];
