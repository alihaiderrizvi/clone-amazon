'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, subtotalCents, itemCount, updateQuantity, removeItem, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Your Amazon Clone Cart is empty</h1>
            <p className="text-gray-600 mb-6">
              Your shopping cart is waiting. Give it purpose – fill it with groceries, clothing, 
              household supplies, electronics, and more.
            </p>
            <Link href="/search">
              <Button>Continue shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold border-b border-gray-200 pb-4 mb-4">
                Shopping Cart
              </h1>
              <p className="text-sm text-gray-600 text-right mb-4">Price</p>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.productId} className="py-6 flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link href={`/product/${item.product.slug}`}>
                        <Image
                          src={item.product.mainImage || '/placeholder-product.png'}
                          alt={item.product.title}
                          width={180}
                          height={180}
                          className="object-contain"
                        />
                      </Link>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/product/${item.product.slug}`}
                        className="text-lg font-medium text-gray-900 hover:text-[#C7511F] line-clamp-2"
                      >
                        {item.product.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{item.product.brand}</p>
                      <p className="text-sm text-green-700 mt-1">In Stock</p>

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-3">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-gray-300">|</span>

                        {/* Delete */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>

                        <span className="text-gray-300">|</span>

                        {/* Save for Later */}
                        <button className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline">
                          Save for later
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-lg font-bold">
                        {formatPrice(item.product.priceCents)}
                      </p>
                      {item.product.listPriceCents && item.product.listPriceCents > item.product.priceCents && (
                        <p className="text-sm text-gray-500 line-through">
                          {formatPrice(item.product.listPriceCents)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="text-right pt-4 border-t border-gray-200">
                <p className="text-lg">
                  Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                  <span className="font-bold">{formatPrice(subtotalCents)}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="mb-4">
                <p className="flex items-center gap-2 text-sm text-green-700 mb-2">
                  <span className="text-lg">✓</span>
                  Your order qualifies for FREE Shipping
                </p>
              </div>

              <p className="text-lg mb-4">
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                <span className="font-bold">{formatPrice(subtotalCents)}</span>
              </p>

              <label className="flex items-center gap-2 text-sm mb-4">
                <input type="checkbox" className="rounded border-gray-300" />
                This order contains a gift
              </label>

              <Link href="/checkout">
                <Button className="w-full">Proceed to checkout</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
