import { ProductListItem } from '@/types';
import { ProductCard, ProductCardSkeleton } from './product-card';

interface ProductGridProps {
  products: ProductListItem[];
  emptyMessage?: string;
  showAddToCart?: boolean;
  columns?: 2 | 3 | 4 | 5;
  isLoading?: boolean;
  loadingCount?: number;
}

export function ProductGrid({ 
  products, 
  emptyMessage = 'No products found',
  showAddToCart = false,
  columns = 4,
  isLoading = false,
  loadingCount = 8,
}: ProductGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  };

  if (isLoading) {
    return (
      <div className={`grid ${columnClasses[columns]} gap-3 sm:gap-4`}>
        {[...Array(loadingCount)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${columnClasses[columns]} gap-3 sm:gap-4`}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          showAddToCart={showAddToCart}
        />
      ))}
    </div>
  );
}
