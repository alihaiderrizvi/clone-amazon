'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';

// Mock orders for demo
const mockOrders = [
  {
    id: 'ORDER-001',
    status: 'delivered',
    createdAt: '2024-01-05',
    deliveredAt: '2024-01-08',
    totalCents: 12998,
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
        productTitle: 'USB-C Hub Multiport Adapter',
        productImage: '/placeholder-product.png',
        quantity: 1,
        priceCents: 4999,
      },
    ],
  },
  {
    id: 'ORDER-002',
    status: 'shipped',
    createdAt: '2024-01-10',
    totalCents: 4999,
    items: [
      {
        id: '3',
        productTitle: 'Smart Watch Fitness Tracker with Heart Rate Monitor',
        productImage: '/placeholder-product.png',
        quantity: 1,
        priceCents: 4999,
      },
    ],
  },
  {
    id: 'ORDER-003',
    status: 'processing',
    createdAt: '2024-01-12',
    totalCents: 3499,
    items: [
      {
        id: '4',
        productTitle: 'Portable Bluetooth Speaker Waterproof',
        productImage: '/placeholder-product.png',
        quantity: 1,
        priceCents: 3499,
      },
    ],
  },
];

const statusConfig = {
  pending: { label: 'Pending', variant: 'warning' as const, icon: Package },
  processing: { label: 'Processing', variant: 'info' as const, icon: Package },
  shipped: { label: 'Shipped', variant: 'info' as const, icon: Truck },
  delivered: { label: 'Delivered', variant: 'success' as const, icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'danger' as const, icon: Package },
};

export default function OrdersPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      {/* Order Filters */}
      <div className="flex items-center gap-4 mb-6">
        <button className="text-sm font-medium border-b-2 border-[#FF9900] pb-1">
          Orders
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-900 pb-1">
          Buy Again
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-900 pb-1">
          Not Yet Shipped
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-900 pb-1">
          Cancelled Orders
        </button>
      </div>

      {mockOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              When you place orders, they will appear here.
            </p>
            <Link href="/search">
              <Button>Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mockOrders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig];
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
                        <span className="text-[#007185]">John Doe</span>
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
                      'text-gray-600'
                    }`} />
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {order.deliveredAt && (
                      <span className="text-sm text-gray-600">
                        on {formatDate(order.deliveredAt)}
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <Image
                          src={item.productImage}
                          alt={item.productTitle}
                          width={80}
                          height={80}
                          className="object-contain border border-gray-200 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${item.id}`}
                            className="text-[#007185] hover:text-[#C7511F] hover:underline line-clamp-2"
                          >
                            {item.productTitle}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            Qty: {item.quantity}
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
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
