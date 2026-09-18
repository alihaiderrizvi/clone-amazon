import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/cart-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Amazon Clone - Online Shopping',
  description: 'Shop millions of products with fast delivery. Find deals on electronics, home, fashion, and more.',
  keywords: ['amazon', 'shopping', 'online store', 'ecommerce'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-gray-50 font-sans antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
