'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, CreditCard, Clock, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';
import * as api from '@/lib/api';

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'warning' | 'info' | 'success' | 'danger'; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'info', icon: Package },
  processing: { label: 'Processing', variant: 'info', icon: Package },
  shipped: { label: 'Shipped', variant: 'info', icon: Truck },
  delivered: { label: 'Delivered', variant: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'danger', icon: XCircle },
  refunded: { label: 'Refunded', variant: 'danger', icon: RefreshCw },
};

interface TrackingStep {
  status: string;
  date: string | null;
  completed: boolean;
}

function getTrackingSteps(order: Order): TrackingStep[] {
  const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);
  
  const steps = [
    { status: 'Order placed', date: order.createdAt, completed: currentIndex >= 0 },
    { status: 'Order confirmed', date: currentIndex >= 1 ? order.createdAt : null, completed: currentIndex >= 1 },
    { status: 'Processing', date: currentIndex >= 2 ? order.updatedAt : null, completed: currentIndex >= 2 },
    { status: 'Shipped', date: currentIndex >= 3 ? order.updatedAt : null, completed: currentIndex >= 3 },
    { status: 'Delivered', date: currentIndex >= 4 ? order.updatedAt : null, completed: currentIndex >= 4 },
  ];

  if (order.status === 'cancelled' || order.status === 'refunded') {
    return [
      { status: 'Order placed', date: order.createdAt, completed: true },
      { status: order.status === 'cancelled' ? 'Cancelled' : 'Refunded', date: order.updatedAt, completed: true },
    ];
  }

  return steps;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (authLoading || !isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getOrder(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Error loading order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId, isAuthenticated, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
          <div className="h-8 bg-gray-200 rounded w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 bg-gray-200 rounded" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Sign in to view this order</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access your order details.
            </p>
            <Link href={`/login?redirectTo=/orders/${orderId}`}>
              <Button>Sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Order not found</h1>
            <p className="text-gray-600 mb-6">
              {error || "We couldn't find this order. It may have been removed or the ID is incorrect."}
            </p>
            <Link href="/orders">
              <Button>View all orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const trackingSteps = getTrackingSteps(order);

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
            Order #{order.id} · Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Need help?
          </Button>
          {['pending', 'confirmed', 'processing'].includes(order.status) && (
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              Cancel order
            </Button>
          )}
          {order.status === 'delivered' && (
            <Button variant="outline" size="sm">
              Return items
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${
                  order.status === 'delivered' ? 'text-green-600' :
                  order.status === 'shipped' ? 'text-blue-600' :
                  order.status === 'cancelled' || order.status === 'refunded' ? 'text-red-600' :
                  'text-yellow-600'
                }`} />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={status.variant}>{status.label}</Badge>
                {order.status === 'shipped' && (
                  <span className="text-sm text-gray-600">
                    Estimated delivery: 3-5 business days
                  </span>
                )}
              </div>

              {/* Tracking Progress */}
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {trackingSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          step.completed
                            ? order.status === 'cancelled' || order.status === 'refunded'
                              ? 'bg-red-600 text-white'
                              : 'bg-green-600 text-white'
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
              <CardTitle>Items in this order ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    <Image
                      src={item.productImage || '/placeholder-product.svg'}
                      alt={item.productTitle}
                      width={100}
                      height={100}
                      className="object-contain border border-gray-200 rounded"
                    />
                    <div className="flex-1">
                      <Link
                        href={`/product/${item.productId}`}
                        className="text-[#007185] hover:text-[#C7511F] hover:underline"
                      >
                        {item.productTitle}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                      <p className="font-medium mt-1">{formatPrice(item.priceCents * item.quantity)}</p>
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
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Payment on order placement</p>
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
                  <span>{formatPrice(order.subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{order.shippingCents === 0 ? 'FREE' : formatPrice(order.shippingCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatPrice(order.taxCents)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Order total:</span>
                  <span className="text-[#B12704]">{formatPrice(order.totalCents)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
