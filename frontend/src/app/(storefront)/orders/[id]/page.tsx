'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';

// Mock order for demo
const mockOrder = {
  id: 'ORDER-001',
  status: 'shipped',
  createdAt: '2024-01-05',
  estimatedDelivery: '2024-01-10',
  subtotalCents: 12998,
  shippingCents: 0,
  taxCents: 1040,
  totalCents: 14038,
  shippingAddress: {
    fullName: 'John Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
    phone: '(555) 123-4567',
  },
  paymentMethod: 'Visa ending in 3456',
  items: [
    {
      id: '1',
      productTitle: 'Wireless Bluetooth Headphones with Active Noise Cancelling',
      productImage: '/placeholder-product.png',
      quantity: 1,
      priceCents: 7999,
    },
    {
      id: '2',
      productTitle: 'USB-C Hub Multiport Adapter 7-in-1 for MacBook Pro',
      productImage: '/placeholder-product.png',
      quantity: 1,
      priceCents: 4999,
    },
  ],
  trackingSteps: [
    { status: 'Order placed', date: '2024-01-05', completed: true },
    { status: 'Payment confirmed', date: '2024-01-05', completed: true },
    { status: 'Shipped', date: '2024-01-07', completed: true },
    { status: 'Out for delivery', date: '2024-01-10', completed: false },
    { status: 'Delivered', date: null, completed: false },
  ],
};

export default function OrderDetailPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back Link */}
      <Link
        href="/orders"
        className="inline-flex items-center text-[#007185] hover:text-[#C7511F] mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to orders
      </Link>

      {/* Order Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-gray-600 mt-1">
            Order #{mockOrder.id} • Placed on {formatDate(mockOrder.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Need help?
          </Button>
          <Button variant="outline" size="sm">
            Return items
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Shipment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="info">Shipped</Badge>
                <span className="text-sm text-gray-600">
                  Estimated delivery: {formatDate(mockOrder.estimatedDelivery)}
                </span>
              </div>

              {/* Tracking Progress */}
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {mockOrder.trackingSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          step.completed
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Package className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.status}
                        </p>
                        {step.date && (
                          <p className="text-sm text-gray-500">{formatDate(step.date)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items in this order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200">
                {mockOrder.items.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    <Image
                      src={item.productImage}
                      alt={item.productTitle}
                      width={100}
                      height={100}
                      className="object-contain border border-gray-200 rounded"
                    />
                    <div className="flex-1">
                      <Link
                        href={`/product/${item.id}`}
                        className="text-[#007185] hover:text-[#C7511F] hover:underline"
                      >
                        {item.productTitle}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                      <p className="font-medium mt-1">{formatPrice(item.priceCents)}</p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="secondary" size="sm">
                          Buy it again
                        </Button>
                        <Button variant="outline" size="sm">
                          Write a review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{mockOrder.shippingAddress.fullName}</p>
              <p>{mockOrder.shippingAddress.addressLine1}</p>
              {mockOrder.shippingAddress.addressLine2 && (
                <p>{mockOrder.shippingAddress.addressLine2}</p>
              )}
              <p>
                {mockOrder.shippingAddress.city}, {mockOrder.shippingAddress.state}{' '}
                {mockOrder.shippingAddress.postalCode}
              </p>
              <p>{mockOrder.shippingAddress.country}</p>
              <p className="mt-2">{mockOrder.shippingAddress.phone}</p>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>{mockOrder.paymentMethod}</p>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items subtotal:</span>
                  <span>{formatPrice(mockOrder.subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatPrice(mockOrder.shippingCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatPrice(mockOrder.taxCents)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Order total:</span>
                  <span className="text-[#B12704]">{formatPrice(mockOrder.totalCents)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
