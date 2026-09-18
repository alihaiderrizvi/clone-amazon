'use client';

import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/storefront/product-grid';
import { ProductListItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown } from 'lucide-react';

// Placeholder products for demo
const mockProducts: ProductListItem[] = [
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

export function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-xl font-medium">
          {query ? (
            <>
              Results for &quot;<span className="text-[#C7511F]">{query}</span>&quot;
            </>
          ) : category ? (
            <>
              Browsing: <span className="text-[#C7511F] capitalize">{category}</span>
            </>
          ) : (
            'All Products'
          )}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Showing {mockProducts.length} results
        </p>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-4 space-y-6">
            {/* Department Filter */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-sm mb-2">Department</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <button className="text-left hover:text-[#C7511F]">Electronics</button>
                </li>
                <li>
                  <button className="text-left hover:text-[#C7511F]">Computers</button>
                </li>
                <li>
                  <button className="text-left hover:text-[#C7511F]">Home & Kitchen</button>
                </li>
                <li>
                  <button className="text-left hover:text-[#C7511F]">Fashion</button>
                </li>
              </ul>
            </div>

            {/* Rating Filter */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-sm mb-2">Customer Review</h3>
              <ul className="space-y-1 text-sm">
                {[4, 3, 2, 1].map((rating) => (
                  <li key={rating}>
                    <button className="flex items-center gap-1 hover:text-[#C7511F]">
                      <span className="text-[#FFA41C]">{'★'.repeat(rating)}</span>
                      <span className="text-gray-400">{'★'.repeat(5 - rating)}</span>
                      <span>& Up</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-sm mb-2">Price</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <button className="text-left hover:text-[#C7511F]">Under $25</button>
                </li>
                <li>
                  <button className="text-left hover:text-[#C7511F]">$25 to $50</button>
                </li>
                <li>
                  <button className="text-left hover:text-[#C7511F]">$50 to $100</button>
                </li>
                <li>
                  <button className="text-left hover:text-[#C7511F]">$100 to $200</button>
                </li>
                <li>
                  <button className="text-left hover:text-[#C7511F]">$200 & Above</button>
                </li>
              </ul>
            </div>

            {/* Brand Filter */}
            <div>
              <h3 className="font-bold text-sm mb-2">Brand</h3>
              <ul className="space-y-1 text-sm">
                {['AudioTech', 'FitGear', 'SoundWave', 'TechConnect'].map((brand) => (
                  <li key={brand}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span>{brand}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort and Filter Bar */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <Button variant="outline" size="sm" className="lg:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">Sort by:</span>
              <button className="flex items-center gap-1 text-sm border border-gray-300 rounded px-3 py-1.5 bg-gray-50 hover:bg-gray-100">
                Featured
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid products={mockProducts} />

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="primary">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
