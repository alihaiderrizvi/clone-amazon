'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { ProductListItem } from '@/types';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: ProductListItem;
  compact?: boolean;
  showAddToCart?: boolean;
}

export function ProductCard({ product, compact = false, showAddToCart = false }: ProductCardProps) {
  const { addItem } = useCart();
  const discount = product.listPriceCents
    ? calculateDiscount(product.listPriceCents, product.priceCents)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  if (compact) {
    return (
      <Link
        href={`/product/${product.slug}`}
        className="group bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow block h-full"
      >
        {/* Product Image */}
        <div className="relative aspect-square mb-2 overflow-hidden rounded bg-gray-50">
          <Image
            src={product.mainImage || '/placeholder-product.svg'}
            alt={product.title}
            fill
            className="object-contain group-hover:scale-105 transition-transform p-2"
            sizes="200px"
          />
          {discount > 0 && (
            <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-[#C7511F] leading-tight">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(product.ratingAvg)
                    ? 'text-[#FFA41C] fill-[#FFA41C]'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-[10px] text-[#007185] ml-0.5">
              ({product.ratingCount.toLocaleString()})
            </span>
          </div>

          {/* Price */}
          <div>
            <span className="text-sm font-medium text-gray-900">
              {formatPrice(product.priceCents)}
            </span>
            {product.listPriceCents && product.listPriceCents > product.priceCents && (
              <span className="ml-1 text-xs text-gray-500 line-through">
                {formatPrice(product.listPriceCents)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <Link href={`/product/${product.slug}`}>
        {/* Product Image */}
        <div className="relative aspect-square mb-3 overflow-hidden rounded bg-gray-50">
          <Image
            src={product.mainImage || '/placeholder-product.svg'}
            alt={product.title}
            fill
            className="object-contain group-hover:scale-105 transition-transform p-2"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#C7511F]">
            {product.title}
          </h3>

          {/* Brand */}
          <p className="text-xs text-gray-500">{product.brand}</p>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.ratingAvg)
                      ? 'text-[#FFA41C] fill-[#FFA41C]'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-[#007185]">
              ({product.ratingCount.toLocaleString()})
            </span>
          </div>

          {/* Price */}
          <div className="pt-1">
            <span className="text-lg font-medium text-gray-900">
              {formatPrice(product.priceCents)}
            </span>
            {product.listPriceCents && product.listPriceCents > product.priceCents && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                {formatPrice(product.listPriceCents)}
              </span>
            )}
          </div>

          {/* Prime badge placeholder */}
          <div className="text-xs text-gray-600">
            <span className="text-[#007185] font-medium">FREE delivery</span> Tue, Jan 7
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      {showAddToCart && (
        <Button
          variant="primary"
          size="sm"
          className="w-full mt-3"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          Add to Cart
        </Button>
      )}
    </div>
  );
}

export function ProductCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
        <div className="aspect-square bg-gray-200 rounded mb-2" />
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-2 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="aspect-square bg-gray-200 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}
