import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { SalesAssistant } from '@/components/ai/SalesAssistant';
import { ToastHost } from '@/components/ToastHost';

const noto = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'أبو بشار — متجر الأناقة',
  description: 'ملابس وأحذية رجالية ونسائية وأطفال بأسعار ممتازة',
};

export const viewport: Viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={noto.variable}>
      <body className="bg-ink-50 text-ink-700 dark:bg-ink-800 dark:text-ink-50 font-arabic antialiased min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <SalesAssistant />
          <ToastHost />
        </Providers>
      </body>
    </html>
  );
}
