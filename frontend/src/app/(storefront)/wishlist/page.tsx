'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import { getProductImage } from '@/lib/api-url';
import { Wishlist, WishlistItem } from '@/types';
import * as api from '@/lib/api';

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadWishlist = async () => {
      if (authLoading) return;
      
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getWishlist();
        setWishlist(data);
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [isAuthenticated, authLoading]);

  const handleRemoveFromWishlist = async (productId: string) => {
    setLoadingItems(prev => new Set(prev).add(productId));
    try {
      const updatedWishlist = await api.removeFromWishlist(productId);
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    setLoadingItems(prev => new Set(prev).add(item.productId));
    try {
      // Add to cart
      await addItem(item.product, 1);
      // Remove from wishlist
      const updatedWishlist = await api.removeFromWishlist(item.productId);
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error('Error moving to cart:', error);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.productId);
        return newSet;
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Sign in to view your Wishlist</h1>
            <p className="text-gray-600 mb-6">
              Save items you love to your wishlist and access them from any device.
            </p>
            <Link href="/login?redirectTo=/wishlist">
              <Button>Sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Your Wishlist is empty</h1>
            <p className="text-gray-600 mb-6">
              Save items to your wishlist while browsing and come back to find them here.
            </p>
            <Link href="/search">
              <Button>Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist ({wishlist.items.length} items)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {wishlist.items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <Link href={`/product/${item.product.slug}`}>
              <div className="aspect-square relative bg-gray-50">
                <Image
                  src={getProductImage(item.product)}
                  alt={item.product.title}
                  fill
                  className="object-contain p-4"
                />
              </div>
            </Link>
            <CardContent className="p-4">
              <Link
                href={`/product/${item.product.slug}`}
                className="text-sm font-medium text-gray-900 hover:text-[#C7511F] line-clamp-2 mb-1"
              >
                {item.product.title}
              </Link>
              <p className="text-xs text-gray-500 mb-2">{item.product.brand}</p>
              
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-bold">{formatPrice(item.product.priceCents)}</span>
                {item.product.listPriceCents && item.product.listPriceCents > item.product.priceCents && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(item.product.listPriceCents)}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleMoveToCart(item)}
                  disabled={loadingItems.has(item.productId)}
                  isLoading={loadingItems.has(item.productId)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveFromWishlist(item.productId)}
                  disabled={loadingItems.has(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
