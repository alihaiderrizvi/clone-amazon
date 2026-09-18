'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

// Mock listings for demo
const mockListings = [
  {
    id: '1',
    title: 'Wireless Bluetooth Headphones with Active Noise Cancelling',
    image: '/placeholder-product.png',
    status: 'published',
    priceCents: 7999,
    stock: 45,
    sales: 234,
  },
  {
    id: '2',
    title: 'USB-C Hub Multiport Adapter 7-in-1 for MacBook Pro',
    image: '/placeholder-product.png',
    status: 'published',
    priceCents: 4999,
    stock: 12,
    sales: 156,
  },
  {
    id: '3',
    title: 'Smart Watch Fitness Tracker with Heart Rate Monitor',
    image: '/placeholder-product.png',
    status: 'draft',
    priceCents: 14999,
    stock: 0,
    sales: 0,
  },
  {
    id: '4',
    title: 'Portable Bluetooth Speaker Waterproof with 24Hr Playtime',
    image: '/placeholder-product.png',
    status: 'paused',
    priceCents: 3499,
    stock: 5,
    sales: 89,
  },
];

export default function ListingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
          <p className="text-gray-600 mt-1">Manage your product listings</p>
        </div>
        <Link href="/seller/listings/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search listings..." className="pl-9" />
              </div>
            </div>
            <select className="h-10 px-3 border border-gray-300 rounded-md bg-white text-sm">
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Paused</option>
            </select>
            <select className="h-10 px-3 border border-gray-300 rounded-md bg-white text-sm">
              <option>Sort by: Newest</option>
              <option>Sort by: Sales</option>
              <option>Sort by: Price</option>
              <option>Sort by: Stock</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Sales</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockListings.map((listing) => (
                <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        width={48}
                        height={48}
                        className="rounded border border-gray-200 object-contain"
                      />
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1 max-w-[300px]">
                          {listing.title}
                        </p>
                        <p className="text-sm text-gray-500">ID: {listing.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        listing.status === 'published' ? 'success' :
                        listing.status === 'draft' ? 'warning' : 'default'
                      }
                    >
                      {listing.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 font-medium">
                    {formatPrice(listing.priceCents)}
                  </td>
                  <td className="py-4 px-4">
                    <span className={listing.stock < 10 ? 'text-red-600 font-medium' : ''}>
                      {listing.stock}
                    </span>
                  </td>
                  <td className="py-4 px-4">{listing.sales}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/product/${listing.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/seller/listings/${listing.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing 1-{mockListings.length} of {mockListings.length} listings
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
