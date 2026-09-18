'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

export function CartBadge() {
  const { itemCount, isLoading } = useCart();

  return (
    <Link
      href="/cart"
      className="flex items-center px-2 py-2 hover:outline hover:outline-1 hover:outline-white rounded relative"
    >
      <div className="relative">
        <ShoppingCart className="h-8 w-8 text-white" />
        <span className="absolute -top-1 left-4 bg-[#F08804] text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
          {isLoading ? '-' : itemCount > 99 ? '99+' : itemCount}
        </span>
      </div>
      <span className="hidden sm:block ml-1 text-sm font-bold text-white">Cart</span>
    </Link>
  );
}
