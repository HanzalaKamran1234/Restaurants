import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { FloatingActions } from '../components/FloatingActions';

import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Ziyafat (ضیافت) | Luxury Online Food Delivery Karachi',
  description: 'Ziyafat brings traditional premium dining to your doorstep in North Nazimabad, Karachi. Savor our royal Fast Food and authentic Desi Khany.',
  keywords: 'Ziyafat, Food Delivery Karachi, North Nazimabad Food, Luxury Restaurant Karachi, Biryani, Burgers, Pakistani Cuisine',
  openGraph: {
    title: 'Ziyafat (ضیافت) | Premium Dining',
    description: 'Traditional culinary perfection delivered hot in Karachi.',
    type: 'website',
    images: [{ url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800' }],
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
