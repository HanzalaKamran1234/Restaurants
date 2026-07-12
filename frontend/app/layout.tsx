import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { FloatingActions } from '../components/FloatingActions';

import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'THE VESTRA | Wear Confidence.',
  description: 'THE VESTRA is a world-class luxury minimalist fashion brand. Shop our premium collections of heavyweight tees, structured coats, raw denim, and bespoke leather goods.',
  keywords: 'THE VESTRA, Luxury Fashion, Minimalist Clothing, Menswear Pakistan, International Luxury Wear, Premium Apparel, Heavyweight Oversized Tee',
  openGraph: {
    title: 'THE VESTRA | Premium Garments',
    description: 'Luxury garments crafted for modern elegance. Wear Confidence.',
    type: 'website',
    images: [{ url: '/products/tshirts/product-01/image-01-front.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <AppProvider>
          {/* Ambient Lighting Overlay */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] radial-glow opacity-30"></div>
            <div className="absolute top-[40%] right-[-10%] w-[60%] h-[60%] radial-glow-gold opacity-20"></div>
          </div>
          
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>

          <CartDrawer />
          <FloatingActions />
        </AppProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
