'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ProductGrid } from '@/components/storefront/product-grid';
import { ProductListItem, SearchResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, ChevronDown, X, Star } from 'lucide-react';
import { mockSearchResult, mockProducts, mockCategories } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { ProductCardSkeleton } from '@/components/storefront/product-card';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Avg. Customer Review' },
  { value: 'newest', label: 'Newest Arrivals' },
];

const priceRanges = [
  { label: 'Under $25', min: 0, max: 2500 },
  { label: '$25 to $50', min: 2500, max: 5000 },
  { label: '$50 to $100', min: 5000, max: 10000 },
  { label: '$100 to $200', min: 10000, max: 20000 },
  { label: '$200 & Above', min: 20000, max: undefined },
];

export function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // URL params
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sortBy = (searchParams.get('sort') as SortOption) || 'relevance';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
  const minRating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined;
  const brandsParam = searchParams.get('brands') || '';

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(
    new Set(brandsParam ? brandsParam.split(',') : [])
  );
  const [priceMin, setPriceMin] = useState(minPrice !== undefined ? (minPrice / 100).toString() : '');
  const [priceMax, setPriceMax] = useState(maxPrice !== undefined ? (maxPrice / 100).toString() : '');

  // Update URL with filters
  const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters change (except when changing page)
    if (!('page' in updates)) {
      params.delete('page');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const params = new URLSearchParams();
        
        if (query) params.set('q', query);
        if (category) params.set('category', category);
        if (sortBy) params.set('sort_by', sortBy);
        if (page > 1) params.set('page', page.toString());
        if (minPrice !== undefined) params.set('min_price', minPrice.toString());
        if (maxPrice !== undefined) params.set('max_price', maxPrice.toString());
        if (minRating !== undefined) params.set('min_rating', minRating.toString());
        if (selectedBrands.size > 0) params.set('brands', Array.from(selectedBrands).join(','));
        params.set('limit', '12');

        const response = await fetch(`${apiUrl}/products/search?${params.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          setSearchResult(data);
        } else {
          throw new Error('API not available');
        }
      } catch {
        // Fallback to mock data with client-side filtering
        let filteredProducts = [...mockProducts];

        // Filter by search query
        if (query) {
          const q = query.toLowerCase();
          filteredProducts = filteredProducts.filter(
            p => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
          );
        }

        // Filter by price
        if (minPrice !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.priceCents >= minPrice);
        }
        if (maxPrice !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.priceCents <= maxPrice);
        }

        // Filter by rating
        if (minRating !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.ratingAvg >= minRating);
        }

        // Filter by brands
        if (selectedBrands.size > 0) {
          filteredProducts = filteredProducts.filter(p => selectedBrands.has(p.brand));
        }

        // Sort
        switch (sortBy) {
          case 'price_asc':
            filteredProducts.sort((a, b) => a.priceCents - b.priceCents);
            break;
          case 'price_desc':
            filteredProducts.sort((a, b) => b.priceCents - a.priceCents);
            break;
          case 'rating':
            filteredProducts.sort((a, b) => b.ratingAvg - a.ratingAvg);
            break;
        }

        setSearchResult({
          ...mockSearchResult,
          products: filteredProducts,
          total: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / 12),
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [query, category, sortBy, page, minPrice, maxPrice, minRating, selectedBrands]);

  // Handle sort change
  const handleSortChange = (value: SortOption) => {
    updateFilters({ sort: value === 'relevance' ? undefined : value });
    setShowSortDropdown(false);
  };

  // Handle category click
  const handleCategoryClick = (categorySlug: string) => {
    updateFilters({ category: categorySlug === category ? undefined : categorySlug });
  };

  // Handle rating filter
  const handleRatingFilter = (rating: number) => {
    updateFilters({ rating: minRating === rating ? undefined : rating.toString() });
  };

  // Handle price range click
  const handlePriceRangeClick = (min: number, max: number | undefined) => {
    updateFilters({
      minPrice: min.toString(),
      maxPrice: max?.toString(),
    });
    setPriceMin((min / 100).toString());
    setPriceMax(max ? (max / 100).toString() : '');
  };

  // Handle custom price range
  const handleCustomPriceRange = () => {
    const min = priceMin ? parseInt(priceMin) * 100 : undefined;
    const max = priceMax ? parseInt(priceMax) * 100 : undefined;
    updateFilters({
      minPrice: min?.toString(),
      maxPrice: max?.toString(),
    });
  };

  // Handle brand toggle
  const handleBrandToggle = (brand: string) => {
    const newBrands = new Set(selectedBrands);
    if (newBrands.has(brand)) {
      newBrands.delete(brand);
    } else {
      newBrands.add(brand);
    }
    setSelectedBrands(newBrands);
    updateFilters({
      brands: newBrands.size > 0 ? Array.from(newBrands).join(',') : undefined,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedBrands(new Set());
    setPriceMin('');
    setPriceMax('');
    router.push(query ? `/search?q=${query}` : '/search');
  };

  // Page change
  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage > 1 ? newPage.toString() : undefined });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const products = searchResult?.products || [];
  const total = searchResult?.total || 0;
  const totalPages = searchResult?.totalPages || 1;
  const facets = searchResult?.facets || mockSearchResult.facets;

  const hasActiveFilters = category || minPrice !== undefined || maxPrice !== undefined || minRating !== undefined || selectedBrands.size > 0;

  // Filter Sidebar Component
  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`space-y-6 ${isMobile ? 'p-4' : ''}`}>
      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
        >
          Clear all filters
        </button>
      )}

      {/* Department/Category Filter */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="font-bold text-sm mb-3">Department</h3>
        <ul className="space-y-2 text-sm">
          {(facets.categories.length > 0 ? facets.categories : mockCategories).map((cat) => (
            <li key={cat.id || cat.slug}>
              <button
                onClick={() => handleCategoryClick(cat.slug || cat.id)}
                className={`text-left hover:text-[#C7511F] ${
                  category === (cat.slug || cat.id) ? 'font-bold text-[#C7511F]' : ''
                }`}
              >
                {cat.name}
                {'count' in cat && (
                  <span className="text-gray-500 ml-1">({cat.count})</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Rating Filter */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="font-bold text-sm mb-3">Customer Review</h3>
        <ul className="space-y-2 text-sm">
          {[4, 3, 2, 1].map((rating) => (
            <li key={rating}>
              <button
                onClick={() => handleRatingFilter(rating)}
                className={`flex items-center gap-1.5 hover:text-[#C7511F] ${
                  minRating === rating ? 'font-bold' : ''
                }`}
              >
                <span className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating ? 'text-[#FFA41C] fill-[#FFA41C]' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </span>
                <span>& Up</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Filter */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="font-bold text-sm mb-3">Price</h3>
        <ul className="space-y-2 text-sm mb-3">
          {priceRanges.map((range) => (
            <li key={range.label}>
              <button
                onClick={() => handlePriceRangeClick(range.min, range.max)}
                className={`text-left hover:text-[#C7511F] ${
                  minPrice === range.min && maxPrice === range.max ? 'font-bold text-[#C7511F]' : ''
                }`}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
        
        {/* Custom Price Range */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-20 h-8 text-sm"
          />
          <span className="text-gray-500">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-20 h-8 text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCustomPriceRange}
            className="h-8 px-2"
          >
            Go
          </Button>
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className="font-bold text-sm mb-3">Brand</h3>
        <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
          {facets.brands.map((brand) => (
            <li key={brand.name}>
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#C7511F]">
                <input
                  type="checkbox"
                  checked={selectedBrands.has(brand.name)}
                  onChange={() => handleBrandToggle(brand.name)}
                  className="rounded border-gray-300 text-[#FF9900] focus:ring-[#FF9900]"
                />
                <span>{brand.name}</span>
                <span className="text-gray-500">({brand.count})</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

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
              Browsing: <span className="text-[#C7511F] capitalize">{category.replace('-', ' ')}</span>
            </>
          ) : (
            'All Products'
          )}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {isLoading ? 'Loading...' : `${total.toLocaleString()} results`}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <span className="ml-2">
              ({minPrice !== undefined ? formatPrice(minPrice) : '$0'} - {maxPrice !== undefined ? formatPrice(maxPrice) : 'Any'})
            </span>
          )}
        </p>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {category && (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-sm px-2 py-1 rounded">
                {category}
                <button onClick={() => handleCategoryClick(category)} className="hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {minRating !== undefined && (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-sm px-2 py-1 rounded">
                {minRating}+ Stars
                <button onClick={() => handleRatingFilter(minRating)} className="hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedBrands.size > 0 && Array.from(selectedBrands).map(brand => (
              <span key={brand} className="inline-flex items-center gap-1 bg-gray-100 text-sm px-2 py-1 rounded">
                {brand}
                <button onClick={() => handleBrandToggle(brand)} className="hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Sort and Filter Bar */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 gap-4">
            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowMobileFilters(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 bg-[#FF9900] text-white text-xs rounded-full px-1.5">
                  {[category, minPrice, maxPrice, minRating, selectedBrands.size > 0].filter(Boolean).length}
                </span>
              )}
            </Button>

            {/* Sort Dropdown */}
            <div className="relative ml-auto">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 text-sm border border-gray-300 rounded px-3 py-1.5 bg-gray-50 hover:bg-gray-100 min-w-[180px] justify-between"
              >
                <span className="text-gray-600">Sort by:</span>
                <span className="font-medium">
                  {sortOptions.find(o => o.value === sortBy)?.label || 'Featured'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSortDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSortDropdown(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          sortBy === option.value ? 'bg-gray-50 font-medium' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No products found</p>
              <p className="text-gray-400 text-sm mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-1 sm:gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar isMobile />
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <Button
                className="w-full"
                onClick={() => setShowMobileFilters(false)}
              >
                Show {total} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
