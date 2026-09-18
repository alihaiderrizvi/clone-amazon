'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock data for demo
const stats = [
  {
    title: 'Total Sales',
    value: '$12,345.67',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    title: 'Orders',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
  },
  {
    title: 'Active Listings',
    value: '24',
    change: '-2',
    trend: 'down',
    icon: Package,
  },
  {
    title: 'Conversion Rate',
    value: '3.2%',
    change: '+0.4%',
    trend: 'up',
    icon: TrendingUp,
  },
];

const recentOrders = [
  { id: 'ORD-001', product: 'Wireless Headphones', status: 'pending', amount: '$79.99' },
  { id: 'ORD-002', product: 'USB-C Hub', status: 'shipped', amount: '$49.99' },
  { id: 'ORD-003', product: 'Smart Watch', status: 'delivered', amount: '$199.99' },
  { id: 'ORD-004', product: 'Bluetooth Speaker', status: 'pending', amount: '$34.99' },
];

const alerts = [
  { type: 'warning', message: '3 products are low on stock' },
  { type: 'info', message: 'New seller performance report available' },
];

export default function SellerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800' : 'bg-blue-50 text-blue-800'
              }`}
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 bg-[#FFEFD6] rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#C7511F]" />
                  </div>
                  <div className={`flex items-center text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.product}</p>
                    <p className="text-sm text-gray-500">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.amount}</p>
                    <Badge
                      variant={
                        order.status === 'delivered' ? 'success' :
                        order.status === 'shipped' ? 'info' : 'warning'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/seller/listings/new"
                className="p-4 border border-gray-200 rounded-lg hover:border-[#FF9900] hover:bg-[#FFEFD6] transition-colors text-center"
              >
                <Package className="h-8 w-8 mx-auto mb-2 text-[#C7511F]" />
                <p className="font-medium">Add Listing</p>
              </a>
              <a
                href="/seller/ads/campaigns/new"
                className="p-4 border border-gray-200 rounded-lg hover:border-[#FF9900] hover:bg-[#FFEFD6] transition-colors text-center"
              >
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-[#C7511F]" />
                <p className="font-medium">Create Ad</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
