import React from 'react';
import { ShopProvider } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { CategoryNav } from './components/CategoryNav';
import { HeroSection } from './components/HeroSection';
import { BookGrid } from './components/BookGrid';
import { AuthorSpotlight } from './components/AuthorSpotlight';
import { BookClubSection } from './components/BookClubSection';
import { Footer } from './components/Footer';

// Modals & Overlays
import { BookDetailModal } from './components/BookDetailModal';
import { SampleReaderModal } from './components/SampleReaderModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistModal } from './components/WishlistModal';
import { StoreLocatorModal } from './components/StoreLocatorModal';
import { ToastContainer } from './components/ToastContainer';

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors selection:bg-[var(--brand-primary)] selection:text-white">
      {/* Top Navigation */}
      <Navbar />
      <CategoryNav />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection />
        <BookGrid />
        <AuthorSpotlight />
        <BookClubSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Drawers & Modals */}
      <BookDetailModal />
      <SampleReaderModal />
      <CartDrawer />
      <CheckoutModal />
      <WishlistModal />
      <StoreLocatorModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
