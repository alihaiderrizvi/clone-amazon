'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order, OrderStatus, OrderList } from '@/types';
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

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'not_shipped' | 'cancelled'>('all');

  useEffect(() => {
    const loadOrders = async () => {
      if (authLoading || !isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getOrders(page);
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, authLoading, page]);

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'not_shipped') {
      return !['shipped', 'delivered'].includes(order.status);
    }
    if (activeFilter === 'cancelled') {
      return ['cancelled', 'refunded'].includes(order.status);
    }
    return true;
  });

  if (authLoading || isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded" />
            ))}
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
            <h1 className="text-2xl font-bold mb-4">Sign in to view your orders</h1>
            <p className="text-gray-600 mb-6">
              Track, return, or buy items from your orders.
            </p>
            <Link href="/login?redirectTo=/orders">
              <Button>Sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      {/* Order Filters */}
      <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveFilter('all')}
          className={`text-sm font-medium pb-2 border-b-2 ${
            activeFilter === 'all'
              ? 'border-[#FF9900] text-[#FF9900]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveFilter('not_shipped')}
          className={`text-sm font-medium pb-2 border-b-2 ${
            activeFilter === 'not_shipped'
              ? 'border-[#FF9900] text-[#FF9900]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Not Yet Shipped
        </button>
        <button
          onClick={() => setActiveFilter('cancelled')}
          className={`text-sm font-medium pb-2 border-b-2 ${
            activeFilter === 'cancelled'
              ? 'border-[#FF9900] text-[#FF9900]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Cancelled Orders
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">
              {activeFilter === 'all'
                ? "When you place orders, they will appear here."
                : activeFilter === 'not_shipped'
                ? "All your orders have been shipped!"
                : "You don't have any cancelled orders."}
            </p>
            <Link href="/search">
              <Button>Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <Card key={order.id}>
                {/* Order Header */}
                <div className="bg-gray-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                    <div className="flex gap-6">
                      <div>
                        <span className="text-gray-500 block">ORDER PLACED</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">TOTAL</span>
                        <span>{formatPrice(order.totalCents)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">SHIP TO</span>
                        <span className="text-[#007185]">{order.shippingAddress.fullName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 block">ORDER # {order.id}</span>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-[#007185] hover:text-[#C7511F] hover:underline"
                      >
                        View order details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <CardContent className="p-4">
                  {/* Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <StatusIcon className={`h-5 w-5 ${
                      order.status === 'delivered' ? 'text-green-600' :
                      order.status === 'shipped' ? 'text-blue-600' :
                      order.status === 'cancelled' || order.status === 'refunded' ? 'text-red-600' :
                      'text-yellow-600'
                    }`} />
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <Image
                          src={item.productImage || '/placeholder-product.svg'}
                          alt={item.productTitle}
                          width={80}
                          height={80}
                          className="object-contain border border-gray-200 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${item.productId}`}
                            className="text-[#007185] hover:text-[#C7511F] hover:underline line-clamp-2"
                          >
                            {item.productTitle}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            Qty: {item.quantity} · {formatPrice(item.priceCents)}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="secondary" size="sm">
                              Buy it again
                            </Button>
                            <Button variant="outline" size="sm">
                              View your item
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-500">
                        + {order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
