import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, BookCategory, BookFormat, CartItem, PromoCode, OrderDetails } from '../types';
import { BOOKS_DATA } from '../data/books';
import { PROMO_CODES } from '../data/promoCodes';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ShopContextType {
  // Books & Filtering
  books: Book[];
  filteredBooks: Book[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: BookCategory;
  setSelectedCategory: (cat: BookCategory) => void;
  selectedFormat: BookFormat | 'Semua';
  setSelectedFormat: (fmt: BookFormat | 'Semua') => void;
  sortBy: 'popular' | 'rating' | 'newest' | 'price-asc' | 'price-desc';
  setSortBy: (sort: 'popular' | 'rating' | 'newest' | 'price-asc' | 'price-desc') => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  resetFilters: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (book: Book, format?: BookFormat, qty?: number) => void;
  removeFromCart: (bookId: string, format: BookFormat) => void;
  updateQuantity: (bookId: string, format: BookFormat, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  shippingCost: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  finalTotal: number;

  // Promo Code
  appliedPromo: PromoCode | null;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (bookId: string) => void;
  isInWishlist: (bookId: string) => boolean;

  // Theme & Currency
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currency: 'IDR' | 'USD';
  toggleCurrency: () => void;
  formatPrice: (amountInIdr: number) => string;

  // Modals & Panels
  activeBookDetail: Book | null;
  setActiveBookDetail: (book: Book | null) => void;
  activeSampleReader: Book | null;
  setActiveSampleReader: (book: Book | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isStoreLocatorOpen: boolean;
  setIsStoreLocatorOpen: (open: boolean) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Orders
  lastOrder: OrderDetails | null;
  setLastOrder: (order: OrderDetails | null) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Books Data
  const [books] = useState<Book[]>(BOOKS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory>('Semua');
  const [selectedFormat, setSelectedFormat] = useState<BookFormat | 'Semua'>('Semua');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'price-asc' | 'price-desc'>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jn_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Promo Code
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jn_wishlist');
      return saved ? JSON.parse(saved) : ['bumi-manusia', 'atomic-habits'];
    } catch {
      return ['bumi-manusia', 'atomic-habits'];
    }
  });

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('jn_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Currency
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');

  // Modals
  const [activeBookDetail, setActiveBookDetail] = useState<Book | null>(null);
  const [activeSampleReader, setActiveSampleReader] = useState<Book | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);

  // Orders
  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Cart & Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jn_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('jn_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // Sync Theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('jn_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'IDR' ? 'USD' : 'IDR'));
  };

  const formatPrice = (amountInIdr: number): string => {
    if (currency === 'USD') {
      const usdAmount = amountInIdr / 15500;
      return `$${usdAmount.toFixed(2)}`;
    }
    return `Rp ${amountInIdr.toLocaleString('id-ID')}`;
  };

  // Cart operations
  const addToCart = (book: Book, format: BookFormat = 'Paperback', qty: number = 1) => {
    let unitPrice = book.price;
    if (format === 'Hardcover') unitPrice = Math.round(book.price * 1.35);
    if (format === 'E-Book') unitPrice = Math.round(book.price * 0.65);
    if (format === 'Audiobook') unitPrice = Math.round(book.price * 0.85);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.book.id === book.id && item.format === format
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      }
      return [...prev, { book, format, quantity: qty, unitPrice }];
    });

    addToast(
      'Ditambahkan ke Keranjang',
      `"${book.title}" (${format}) berhasil masuk ke keranjang belanja Anda.`,
      'success'
    );
  };

  const removeFromCart = (bookId: string, format: BookFormat) => {
    setCart((prev) => prev.filter((item) => !(item.book.id === bookId && item.format === format)));
    addToast('Buku Dihapus', 'Item telah dikeluarkan dari keranjang belanja.', 'info');
  };

  const updateQuantity = (bookId: string, format: BookFormat, qty: number) => {
    if (qty <= 0) {
      removeFromCart(bookId, format);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.book.id === bookId && item.format === format) {
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  // Calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const freeShippingThreshold = 150000;
  const baseShippingCost = cartSubtotal > 0 ? (cartSubtotal >= freeShippingThreshold ? 0 : 18000) : 0;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  // Promo Calculation
  let cartDiscount = 0;
  let shippingCost = baseShippingCost;

  if (appliedPromo) {
    if (cartSubtotal >= appliedPromo.minSpend) {
      if (appliedPromo.discountType === 'percentage') {
        cartDiscount = Math.round((cartSubtotal * appliedPromo.discountValue) / 100);
      } else if (appliedPromo.discountType === 'fixed') {
        cartDiscount = Math.min(cartSubtotal, appliedPromo.discountValue);
      } else if (appliedPromo.discountType === 'shipping') {
        shippingCost = Math.max(0, shippingCost - appliedPromo.discountValue);
      }
    }
  }

  const finalTotal = Math.max(0, cartSubtotal - cartDiscount + shippingCost);

  const applyPromo = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = PROMO_CODES.find((p) => p.code === cleanCode);
    if (!found) {
      return { success: false, message: 'Kode voucher tidak valid atau sudah kadaluarsa.' };
    }
    if (cartSubtotal < found.minSpend) {
      return {
        success: false,
        message: `Minimal belanja untuk kode ini adalah ${formatPrice(found.minSpend)}. Tambah item lagi yuk!`,
      };
    }
    setAppliedPromo(found);
    addToast('Voucher Berhasil Dipakai!', `Potongan dari voucher ${found.code} telah diterapkan.`, 'success');
    return { success: true, message: `Voucher ${found.code} berhasil digunakan!` };
  };

  const removePromo = () => {
    setAppliedPromo(null);
    addToast('Voucher Dihapus', 'Potongan voucher telah dibatalkan.', 'info');
  };

  // Wishlist
  const toggleWishlist = (bookId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(bookId);
      if (exists) {
        addToast('Dihapus dari Wishlist', 'Buku telah dihapus dari daftar impian Anda.', 'info');
        return prev.filter((id) => id !== bookId);
      } else {
        const book = books.find((b) => b.id === bookId);
        addToast(
          'Disimpan ke Wishlist',
          `"${book?.title || 'Buku'}" berhasil disimpan ke daftar impian Anda.`,
          'success'
        );
        return [...prev, bookId];
      }
    });
  };

  const isInWishlist = (bookId: string) => wishlist.includes(bookId);

  // Filter & Search Logic
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSelectedFormat('Semua');
    setSortBy('popular');
    setPriceRange([0, 300000]);
    setMinRating(0);
    setInStockOnly(false);
  };

  const filteredBooks = books
    .filter((book) => {
      // Category filter
      if (selectedCategory !== 'Semua' && book.category !== selectedCategory) {
        return false;
      }
      // Format filter
      if (selectedFormat !== 'Semua' && !book.formats.includes(selectedFormat)) {
        return false;
      }
      // Price range filter
      if (book.price < priceRange[0] || book.price > priceRange[1]) {
        return false;
      }
      // Rating filter
      if (minRating > 0 && book.rating < minRating) {
        return false;
      }
      // Stock filter
      if (inStockOnly && book.stock <= 0) {
        return false;
      }
      // Search query filter (matches title, author, category, ISBN, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesCategory = book.category.toLowerCase().includes(q);
        const matchesIsbn = book.specs.isbn.toLowerCase().includes(q);
        const matchesTags = book.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesAuthor && !matchesCategory && !matchesIsbn && !matchesTags) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNewRelease ? 1 : 0) - (a.isNewRelease ? 1 : 0);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <ShopContext.Provider
      value={{
        books,
        filteredBooks,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedFormat,
        setSelectedFormat,
        sortBy,
        setSortBy,
        priceRange,
        setPriceRange,
        minRating,
        setMinRating,
        inStockOnly,
        setInStockOnly,
        viewMode,
        setViewMode,
        resetFilters,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartDiscount,
        shippingCost,
        freeShippingThreshold,
        amountNeededForFreeShipping,
        finalTotal,
        appliedPromo,
        applyPromo,
        removePromo,
        wishlist,
        toggleWishlist,
        isInWishlist,
        theme,
        toggleTheme,
        currency,
        toggleCurrency,
        formatPrice,
        activeBookDetail,
        setActiveBookDetail,
        activeSampleReader,
        setActiveSampleReader,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isStoreLocatorOpen,
        setIsStoreLocatorOpen,
        toasts,
        addToast,
        removeToast,
        lastOrder,
        setLastOrder,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
