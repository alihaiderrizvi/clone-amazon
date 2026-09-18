'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, Share2, MapPin, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';

// Mock product data
const product = {
  id: '1',
  slug: 'wireless-bluetooth-headphones',
  title: 'Wireless Bluetooth Headphones with Active Noise Cancelling, 40H Playtime, Hi-Res Audio, Deep Bass, Memory Foam Ear Cups',
  brand: 'AudioTech',
  categoryId: 'electronics',
  priceCents: 7999,
  listPriceCents: 12999,
  images: ['/placeholder-product.png', '/placeholder-product.png', '/placeholder-product.png'],
  bullets: [
    'Industry-leading Active Noise Cancellation technology',
    '40 hours of battery life with quick charging (10 min = 5 hours)',
    'Hi-Res Audio certified for exceptional sound quality',
    'Premium memory foam ear cups for all-day comfort',
    'Multi-device connectivity with Bluetooth 5.2',
  ],
  description: 'Experience premium audio with our flagship wireless headphones. Featuring industry-leading active noise cancellation, these headphones let you immerse yourself in your music, podcasts, or calls without distraction. The Hi-Res Audio certification ensures you hear every detail as the artist intended.',
  attributes: {
    'Color': 'Midnight Black',
    'Connectivity': 'Bluetooth 5.2',
    'Battery Life': '40 hours',
    'Driver Size': '40mm',
  },
  ratingAvg: 4.5,
  ratingCount: 2341,
  stock: 15,
  sellerId: 'seller-1',
  status: 'published' as const,
};

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const discount = product.listPriceCents
    ? calculateDiscount(product.listPriceCents, product.priceCents)
    : 0;

  const handleAddToCart = () => {
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
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm mb-4">
        <ol className="flex items-center gap-2 text-gray-500">
          <li><a href="/" className="hover:text-[#C7511F]">Home</a></li>
          <li>/</li>
          <li><a href="/search?category=electronics" className="hover:text-[#C7511F]">Electronics</a></li>
          <li>/</li>
          <li className="text-gray-900 truncate max-w-[200px]">{product.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Image Gallery */}
        <div className="lg:col-span-5">
          <div className="sticky top-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg border border-gray-200 mb-4">
              <Image
                src={product.images[selectedImage]}
                alt={product.title}
                fill
                className="object-contain p-4"
              />
              {discount > 0 && (
                <Badge variant="danger" className="absolute top-4 left-4">
                  {discount}% OFF
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded border-2 overflow-hidden ${
                    selectedImage === index ? 'border-[#FF9900]' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-4">
          <h1 className="text-xl font-medium text-gray-900 mb-2">{product.title}</h1>
          
          <p className="text-sm text-[#007185] mb-2">
            Visit the <a href="#" className="hover:text-[#C7511F] hover:underline">{product.brand} Store</a>
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-[#007185] mr-1">{product.ratingAvg}</span>
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
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="danger">Deal</Badge>
                <span className="text-sm text-gray-600">
                  Was: <span className="line-through">{formatPrice(product.listPriceCents!)}</span>
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-3xl font-medium text-[#B12704]">
                {formatPrice(product.priceCents)}
              </span>
            </div>
          </div>

          {/* Bullets */}
          <div className="mb-6">
            <h3 className="font-bold text-sm mb-2">About this item</h3>
            <ul className="space-y-2">
              {product.bullets.map((bullet, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-gray-400">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Attributes */}
          <div className="bg-gray-50 rounded-lg p-4">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.attributes).map(([key, value]) => (
                  <tr key={key}>
                    <td className="py-1 font-medium text-gray-600 w-1/3">{key}</td>
                    <td className="py-1">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buy Box */}
        <div className="lg:col-span-3">
          <div className="border border-gray-300 rounded-lg p-4 sticky top-4">
            <div className="text-2xl font-medium mb-2">
              {formatPrice(product.priceCents)}
            </div>

            {/* Delivery Info */}
            <div className="mb-4">
              <div className="flex items-start gap-2 text-sm mb-2">
                <Truck className="h-4 w-4 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-[#007185]">FREE delivery <strong>Tuesday, Jan 7</strong></p>
                  <p className="text-gray-600">Or fastest delivery <strong>Tomorrow</strong></p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <a href="#" className="text-[#007185] hover:text-[#C7511F]">
                  Deliver to Location
                </a>
              </div>
            </div>

            {/* Stock Status */}
            <p className={`text-lg font-medium mb-4 ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-2 mb-4">
              <label className="text-sm">Qty:</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50"
              >
                {[...Array(Math.min(10, product.stock))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button className="w-full" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="secondary" className="w-full bg-[#FFA41C] hover:bg-[#FF8F00] border-[#FF8F00]">
                Buy Now
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Secure transaction</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <RotateCcw className="h-4 w-4" />
                <span>Free 30-day returns</span>
              </div>
            </div>

            {/* Wishlist */}
            <button className="flex items-center gap-2 text-sm text-[#007185] hover:text-[#C7511F] mt-4">
              <Heart className="h-4 w-4" />
              Add to Wishlist
            </button>

            {/* Share */}
            <button className="flex items-center gap-2 text-sm text-[#007185] hover:text-[#C7511F] mt-2">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <section className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold mb-4">Product Description</h2>
        <p className="text-gray-700 leading-relaxed">{product.description}</p>
      </section>

      {/* Reviews Section Placeholder */}
      <section id="reviews" className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Reviews coming soon</p>
        </div>
      </section>
    </div>
  );
}
