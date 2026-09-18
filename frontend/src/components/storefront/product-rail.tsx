'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductListItem } from '@/types';
import { ProductCard } from './product-card';

interface ProductRailProps {
  title: string;
  products: ProductListItem[];
  seeAllLink?: string;
  isLoading?: boolean;
}

export function ProductRail({ title, products, seeAllLink, isLoading = false }: ProductRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-shrink-0 w-[200px]">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {seeAllLink && (
          <Link
            href={seeAllLink}
            className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            See all deals
          </Link>
        )}
      </div>

      {/* Product Scroll Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 -ml-4"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>

        {/* Scrollable Area */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[200px]">
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 -mr-4"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
      <div className="aspect-square bg-gray-200 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function ProductRailSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex-shrink-0 w-[200px]">
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
