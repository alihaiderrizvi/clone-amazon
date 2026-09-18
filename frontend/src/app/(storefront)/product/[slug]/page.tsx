'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Share2, MapPin, Truck, Shield, RotateCcw, Check, AlertTriangle, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/types';
import { mockProduct } from '@/lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  
  const { addItem } = useCart();

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/products/${slug}`);
        
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else if (response.status === 404) {
          // Try mock data if API returns 404
          if (mockProduct.slug === slug || slug === 'wireless-bluetooth-headphones') {
            setProduct(mockProduct);
          } else {
            setError('Product not found');
          }
        } else {
          throw new Error('Failed to fetch product');
        }
      } catch {
        // Fallback to mock data
        if (mockProduct.slug === slug || slug === 'wireless-bluetooth-headphones') {
          setProduct(mockProduct);
        } else {
          // Create a mock product based on the slug
          setProduct({
            ...mockProduct,
            slug,
            title: slug.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button onClick={() => router.push('/search')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const discount = product.listPriceCents
    ? calculateDiscount(product.listPriceCents, product.priceCents)
    : 0;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    // Simulate a brief delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      priceCents: product.priceCents,
      listPriceCents: product.listPriceCents,
      mainImage: product.images[0],
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
    }, quantity);
    
    setIsAddingToCart(false);
    setAddedToCart(true);
    
    // Reset the "added" state after 2 seconds
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      priceCents: product.priceCents,
      listPriceCents: product.listPriceCents,
      mainImage: product.images[0],
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
    }, quantity);
    router.push('/cart');
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // Stock status helpers
  const getStockStatus = () => {
    if (product.stock === 0) {
      return { text: 'Out of Stock', color: 'text-red-700', bgColor: 'bg-red-50' };
    } else if (product.stock <= 5) {
      return { text: `Only ${product.stock} left in stock - order soon`, color: 'text-orange-600', bgColor: 'bg-orange-50' };
    } else {
      return { text: 'In Stock', color: 'text-green-700', bgColor: 'bg-green-50' };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm mb-4 overflow-x-auto">
        <ol className="flex items-center gap-2 text-gray-500 whitespace-nowrap">
          <li><Link href="/" className="hover:text-[#C7511F]">Home</Link></li>
          <li>/</li>
          <li><Link href={`/search?category=${product.categoryId}`} className="hover:text-[#C7511F] capitalize">{product.categoryId.replace('-', ' ')}</Link></li>
          <li>/</li>
          <li className="text-gray-900 truncate max-w-[200px]">{product.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Image Gallery */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden group">
              <Image
                src={product.images[selectedImage] || '/placeholder-product.svg'}
                alt={product.title}
                fill
                className="object-contain p-4 cursor-zoom-in transition-transform group-hover:scale-105"
                onClick={() => setShowZoom(true)}
                priority
              />
              
              {discount > 0 && (
                <Badge variant="danger" className="absolute top-4 left-4">
                  {discount}% OFF
                </Badge>
              )}

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <ZoomIn className="h-3 w-3" />
                Click to zoom
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-colors ${
                      selectedImage === index ? 'border-[#FF9900]' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={image || '/placeholder-product.svg'}
                      alt={`${product.title} - Image ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-contain w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-4">
          <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-2">{product.title}</h1>
          
          <p className="text-sm text-[#007185] mb-2">
            Visit the <Link href={`/search?brand=${product.brand}`} className="hover:text-[#C7511F] hover:underline">{product.brand} Store</Link>
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="flex items-center">
              <span className="text-sm font-medium text-[#007185] mr-1">{product.ratingAvg.toFixed(1)}</span>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.ratingAvg)
                      ? 'text-[#FFA41C] fill-[#FFA41C]'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <a href="#reviews" className="text-sm text-[#007185] hover:text-[#C7511F]">
              {product.ratingCount.toLocaleString()} ratings
            </a>
          </div>

          <hr className="my-4" />

          {/* Price */}
          <div className="mb-4">
            {discount > 0 && (
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="danger">Deal</Badge>
                <span className="text-sm text-gray-600">
                  List Price: <span className="line-through">{formatPrice(product.listPriceCents!)}</span>
                </span>
                <span className="text-sm text-red-600 font-medium">
                  Save {formatPrice(product.listPriceCents! - product.priceCents)} ({discount}%)
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-3xl font-medium text-[#B12704]">
                {formatPrice(product.priceCents)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">& Free Returns</p>
          </div>

          {/* About this item */}
          {product.bullets.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-sm mb-2">About this item</h3>
              <ul className="space-y-2">
                {product.bullets.map((bullet, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attributes/Specifications */}
          {Object.keys(product.attributes).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-sm mb-3">Product Details</h3>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-200 last:border-0">
                      <td className="py-2 font-medium text-gray-600 w-1/3 align-top">{key}</td>
                      <td className="py-2">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Buy Box */}
        <div className="lg:col-span-3">
          <div className="border border-gray-300 rounded-lg p-4 lg:sticky lg:top-24">
            <div className="text-2xl font-medium mb-2">
              {formatPrice(product.priceCents)}
            </div>

            {/* Delivery Info */}
            <div className="mb-4">
              <div className="flex items-start gap-2 text-sm mb-2">
                <Truck className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#007185]">
                    <span className="font-medium">FREE delivery</span>{' '}
                    <strong>
                      {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </strong>
                  </p>
                  <p className="text-gray-600">
                    Or fastest delivery{' '}
                    <strong>
                      {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                        weekday: 'long'
                      })}
                    </strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <button className="text-[#007185] hover:text-[#C7511F] text-left">
                  Deliver to your location
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className={`flex items-center gap-2 text-sm font-medium mb-4 p-2 rounded ${stockStatus.bgColor} ${stockStatus.color}`}>
              {product.stock > 0 ? (
                <Check className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              )}
              {stockStatus.text}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm font-medium">Qty:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 cursor-pointer focus:ring-2 focus:ring-[#FF9900] focus:border-[#FF9900] outline-none"
                >
                  {[...Array(Math.min(10, product.stock))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={handleAddToCart} 
                disabled={product.stock === 0 || isAddingToCart}
                isLoading={isAddingToCart}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button 
                variant="secondary" 
                className="w-full bg-[#FFA41C] hover:bg-[#FF8F00] border-[#FF8F00] text-white"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Secure transaction</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <RotateCcw className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>Free 30-day returns</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <span>Ships from Amazon Clone</span>
              </div>
            </div>

            {/* Wishlist & Share */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4">
              <button className="flex items-center gap-1.5 text-sm text-[#007185] hover:text-[#C7511F]">
                <Heart className="h-4 w-4" />
                Add to List
              </button>
              <button className="flex items-center gap-1.5 text-sm text-[#007185] hover:text-[#C7511F]">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {product.description && (
        <section className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold mb-4">Product Description</h2>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        </section>
      )}

      {/* Reviews Section Placeholder */}
      <section id="reviews" className="mt-12 border-t border-gray-200 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Customer Reviews</h2>
          <Button variant="outline" size="sm">
            Write a review
          </Button>
        </div>
        
        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-gray-900">{product.ratingAvg.toFixed(1)}</div>
              <div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(product.ratingAvg)
                          ? 'text-[#FFA41C] fill-[#FFA41C]'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {product.ratingCount.toLocaleString()} global ratings
                </p>
              </div>
            </div>
            
            {/* Rating bars */}
            {[5, 4, 3, 2, 1].map((stars) => {
              const percentage = stars === 5 ? 65 : stars === 4 ? 20 : stars === 3 ? 8 : stars === 2 ? 4 : 3;
              return (
                <div key={stars} className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer w-16">
                    {stars} star
                  </span>
                  <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-full bg-[#FFA41C]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-[#007185] w-10 text-right">{percentage}%</span>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="font-bold mb-4">Review this product</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share your thoughts with other customers
            </p>
            <Button variant="outline" className="w-full">
              Write a customer review
            </Button>
          </div>
        </div>

        {/* Reviews Placeholder */}
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">Customer reviews will appear here</p>
          <p className="text-sm text-gray-400">Be the first to review this product</p>
        </div>
      </section>

      {/* Image Zoom Modal */}
      {showZoom && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setShowZoom(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setShowZoom(false)}
          >
            <X className="h-8 w-8" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-4">
            <Image
              src={product.images[selectedImage] || '/placeholder-product.svg'}
              alt={product.title}
              fill
              className="object-contain"
            />
          </div>
          {product.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-3 rounded-full"
              >
                <ChevronLeft className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-3 rounded-full"
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Add missing X import
import { X } from 'lucide-react';

function ProductDetailSkeleton() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 bg-gray-200 rounded w-64 mb-4" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Image skeleton */}
        <div className="lg:col-span-5">
          <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="lg:col-span-4 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-full" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="space-y-2 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        {/* Buy box skeleton */}
        <div className="lg:col-span-3">
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
