'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  AlertCircle,
  ArrowUpRight,
  FileEdit,
  Eye,
} from 'lucide-react';
import { getSellerStats, getSellerListings } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { SellerStats, SellerListing } from '@/types';

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [recentListings, setRecentListings] = useState<SellerListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsData, listingsData] = await Promise.all([
          getSellerStats(),
          getSellerListings({ limit: 5 }),
        ]);
        setStats(statsData);
        setRecentListings(listingsData.products);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9900]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const alerts = [];
  if (stats && stats.lowStockCount > 0) {
    alerts.push({ type: 'warning', message: `${stats.lowStockCount} products are low on stock` });
  }
  if (stats && stats.outOfStockCount > 0) {
    alerts.push({ type: 'error', message: `${stats.outOfStockCount} products are out of stock` });
  }
  if (stats && stats.draftCount > 0) {
    alerts.push({ type: 'info', message: `${stats.draftCount} listings are still in draft` });
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats ? formatPrice(stats.totalRevenueCents) : '$0.00',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders?.toString() || '0',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Listings',
      value: stats?.publishedCount?.toString() || '0',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Listings',
      value: stats?.totalListings?.toString() || '0',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

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
                alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800' : 
                alert.type === 'error' ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
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
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
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
        {/* Recent Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Listings</CardTitle>
            <Link href="/seller/listings" className="text-sm text-[#007185] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentListings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No listings yet</p>
                <Link href="/seller/listings/new" className="text-[#007185] hover:underline text-sm">
                  Create your first listing
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={listing.status === 'published' ? 'success' : 'warning'}
                        >
                          {listing.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatPrice(listing.priceCents)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/seller/listings/${listing.id}`}
                        className="p-1.5 text-gray-400 hover:text-gray-600"
                      >
                        <FileEdit className="h-4 w-4" />
                      </Link>
                      {listing.status === 'published' && (
                        <Link
                          href={`/product/${listing.slug}`}
                          className="p-1.5 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/seller/listings/new"
                className="p-4 border border-gray-200 rounded-lg hover:border-[#FF9900] hover:bg-[#FFEFD6] transition-colors text-center"
              >
                <Package className="h-8 w-8 mx-auto mb-2 text-[#C7511F]" />
                <p className="font-medium">Add Listing</p>
              </Link>
              <Link
                href="/seller/listings"
                className="p-4 border border-gray-200 rounded-lg hover:border-[#FF9900] hover:bg-[#FFEFD6] transition-colors text-center"
              >
                <FileEdit className="h-8 w-8 mx-auto mb-2 text-[#C7511F]" />
                <p className="font-medium">Manage Listings</p>
              </Link>
              <Link
                href="/seller/ads"
                className="p-4 border border-gray-200 rounded-lg hover:border-[#FF9900] hover:bg-[#FFEFD6] transition-colors text-center"
              >
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-[#C7511F]" />
                <p className="font-medium">Advertising</p>
              </Link>
              <Link
                href="/"
                className="p-4 border border-gray-200 rounded-lg hover:border-[#FF9900] hover:bg-[#FFEFD6] transition-colors text-center"
              >
                <ArrowUpRight className="h-8 w-8 mx-auto mb-2 text-[#C7511F]" />
                <p className="font-medium">View Store</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
