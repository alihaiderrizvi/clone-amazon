import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductGrid } from '@/components/storefront/product-grid';
import { ProductListItem } from '@/types';
import Link from 'next/link';

// Placeholder products for demo
const featuredProducts: ProductListItem[] = [
  {
    id: '1',
    slug: 'wireless-bluetooth-headphones',
    title: 'Wireless Bluetooth Headphones with Active Noise Cancelling',
    brand: 'AudioTech',
    priceCents: 7999,
    listPriceCents: 12999,
    mainImage: '/placeholder-product.png',
    ratingAvg: 4.5,
    ratingCount: 2341,
  },
  {
    id: '2',
    slug: 'smart-watch-fitness-tracker',
    title: 'Smart Watch Fitness Tracker with Heart Rate Monitor',
    brand: 'FitGear',
    priceCents: 4999,
    listPriceCents: 6999,
    mainImage: '/placeholder-product.png',
    ratingAvg: 4.2,
    ratingCount: 1892,
  },
  {
    id: '3',
    slug: 'portable-bluetooth-speaker',
    title: 'Portable Bluetooth Speaker Waterproof with 24Hr Playtime',
    brand: 'SoundWave',
    priceCents: 3499,
    mainImage: '/placeholder-product.png',
    ratingAvg: 4.7,
    ratingCount: 5621,
  },
  {
    id: '4',
    slug: 'usb-c-hub-multiport',
    title: 'USB-C Hub Multiport Adapter 7-in-1 for MacBook Pro',
    brand: 'TechConnect',
    priceCents: 2999,
    listPriceCents: 4999,
    mainImage: '/placeholder-product.png',
    ratingAvg: 4.4,
    ratingCount: 987,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-b from-[#232F3E] to-gray-100 h-[300px] sm:h-[400px]">
          <div className="max-w-[1500px] mx-auto px-4 py-8 h-full flex flex-col justify-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Welcome to Amazon Clone
            </h1>
            <p className="text-gray-200 text-lg mb-6 max-w-xl">
              Shop millions of products with fast delivery. Find deals on electronics, 
              home, fashion, and more.
            </p>
            <Link
              href="/search"
              className="inline-block bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium px-6 py-3 rounded-md w-fit"
            >
              Start Shopping
            </Link>
          </div>
        </div>

        {/* Category Cards */}
        <div className="max-w-[1500px] mx-auto px-4 -mt-20 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Electronics', href: '/search?category=electronics', image: '🎧' },
              { name: 'Fashion', href: '/search?category=fashion', image: '👕' },
              { name: 'Home & Kitchen', href: '/search?category=home', image: '🏠' },
              { name: 'Books', href: '/search?category=books', image: '📚' },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{category.image}</div>
                <h3 className="font-bold text-lg">{category.name}</h3>
                <p className="text-sm text-[#007185]">Shop now</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <section className="max-w-[1500px] mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/search" className="text-[#007185] hover:underline">
              See all deals
            </Link>
          </div>
          <ProductGrid products={featuredProducts} />
        </section>

        {/* Deals Section */}
        <section className="bg-white py-12">
          <div className="max-w-[1500px] mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Today&apos;s Deals</h2>
            <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-8 text-white">
              <h3 className="text-3xl font-bold mb-2">Up to 50% Off</h3>
              <p className="text-lg mb-4">Limited time deals on top brands</p>
              <Link
                href="/search?deals=true"
                className="inline-block bg-white text-gray-900 font-medium px-6 py-2 rounded-md hover:bg-gray-100"
              >
                Shop Deals
              </Link>
            </div>
          </div>
        </section>

        {/* Become a Seller CTA */}
        <section className="max-w-[1500px] mx-auto px-4 py-12">
          <div className="bg-[#232F3E] rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Become a Seller</h2>
              <p className="text-gray-300">
                Start selling your products to millions of customers today
              </p>
            </div>
            <Link
              href="/seller/onboarding"
              className="bg-[#FF9900] hover:bg-[#E88B00] text-white font-medium px-6 py-3 rounded-md whitespace-nowrap"
            >
              Start Selling
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
