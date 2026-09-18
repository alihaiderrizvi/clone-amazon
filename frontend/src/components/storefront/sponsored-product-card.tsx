'use client';

import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { ProductListItem } from '@/types';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { getProductImage } from '@/lib/api-url';
import { recordAdClick } from '@/lib/api';
import { ProductImage } from '@/components/ui/product-image';

interface SponsoredProductCardProps {
  product: ProductListItem;
  campaignId: string;
  query: string;
}

export function SponsoredProductCard({ product, campaignId, query }: SponsoredProductCardProps) {
  const router = useRouter();
  const discount = product.listPriceCents
    ? calculateDiscount(product.listPriceCents, product.priceCents)
    : 0;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Record the click (fire and forget, don't block navigation)
    try {
      await recordAdClick({
        campaignId,
        productId: product.id,
        query,
      });
    } catch (err) {
      console.error('Failed to record ad click:', err);
    }
    
    // Navigate to product page
    router.push(`/product/${product.slug}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="group bg-white rounded-lg border-2 border-[#FFD814] p-4 hover:shadow-lg transition-shadow cursor-pointer relative"
    >
      {/* Sponsored Badge */}
      <span className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
        Sponsored
      </span>

      {/* Product Image */}
      <div className="relative aspect-square mb-3 overflow-hidden rounded bg-gray-50">
        <ProductImage
          src={getProductImage(product)}
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
        {product.brand && (
          <p className="text-xs text-gray-500">{product.brand}</p>
        )}

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

        {/* Delivery info */}
        <div className="text-xs text-gray-600">
          <span className="text-[#007185] font-medium">FREE delivery</span> with Prime
        </div>
      </div>
    </div>
  );
}
