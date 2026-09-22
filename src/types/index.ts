export type BookCategory = 
  | 'Semua'
  | 'Sastra & Fiksi'
  | 'Non-Fiksi & Sains'
  | 'Pengembangan Diri'
  | 'Bisnis & Finansial'
  | 'Teknologi & Koding'
  | 'Filsafat & Sejarah'
  | 'Seni & Desain'
  | 'Anak & Remaja';

export type BookFormat = 'Paperback' | 'Hardcover' | 'E-Book' | 'Audiobook';

export interface BookReview {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  helpfulCount: number;
}

export interface BookSpec {
  isbn: string;
  pages: number;
  publisher: string;
  publishDate: string;
  language: string;
  dimensions: string;
  weight: string;
}

export interface BookChapter {
  title: string;
  content: string[];
}

export interface Book {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  authorBio?: string;
  coverImage: string;
  category: BookCategory;
  formats: BookFormat[];
  price: number; // in IDR
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  synopsis: string;
  shortQuote?: string;
  isBestseller?: boolean;
  isStaffPick?: boolean;
  isNewRelease?: boolean;
  isFlashSale?: boolean;
  stock: number;
  specs: BookSpec;
  sampleChapters: BookChapter[];
  reviews: BookReview[];
  tags: string[];
}

export interface CartItem {
  book: Book;
  format: BookFormat;
  quantity: number;
  unitPrice: number;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed' | 'shipping';
  discountValue: number;
  minSpend: number;
  description: string;
}

export interface OrderItem {
  title: string;
  author: string;
  format: BookFormat;
  quantity: number;
  price: number;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  courier: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  date: string;
  status: 'Menunggu Pembayaran' | 'Diproses' | 'Dalam Pengiriman' | 'Selesai';
}
