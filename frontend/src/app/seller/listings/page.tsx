'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Eye, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { getSellerListings, deleteListing } from '@/lib/api';
import { SellerListing } from '@/types';

type StatusFilter = 'all' | 'published' | 'draft';

export default function ListingsPage() {
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: { page: number; limit: number; status?: 'draft' | 'published' } = {
        page,
        limit: 20,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const data = await getSellerListings(params);
      setListings(data.products);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    setDeletingId(listingId);
    try {
      await deleteListing(listingId);
      // Refresh listings
      await fetchListings();
    } catch (err) {
      console.error('Failed to delete listing:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter listings by search query (client-side)
  const filteredListings = listings.filter((listing) =>
    searchQuery === '' ||
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <Input
                  placeholder="Search listings..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select
              className="h-10 px-3 border border-gray-300 rounded-md bg-white text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9900]" />
        </div>
      ) : filteredListings.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter !== 'all' ? `No ${statusFilter} listings` : 'No listings yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {statusFilter !== 'all'
                ? 'Try changing the filter or create a new listing'
                : 'Create your first product listing to start selling'}
            </p>
            <Link href="/seller/listings/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Listings Table */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Stock</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                          {listing.images?.[0] ? (
                            <Image
                              src={listing.images[0]}
                              alt={listing.title}
                              width={48}
                              height={48}
                              className="object-contain"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1 max-w-[300px]">
                            {listing.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {listing.brand || 'No brand'} • ID: {listing.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={listing.status === 'published' ? 'success' : 'warning'}
                      >
                        {listing.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      {formatPrice(listing.priceCents)}
                      {listing.listPriceCents && listing.listPriceCents > listing.priceCents && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          {formatPrice(listing.listPriceCents)}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={listing.stock < 10 ? 'text-red-600 font-medium' : ''}>
                        {listing.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {listing.status === 'published' && (
                          <Link href={`/product/${listing.slug}`}>
                            <Button variant="ghost" size="sm" title="View on store">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/seller/listings/${listing.id}`}>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(listing.id)}
                          disabled={deletingId === listing.id}
                          title="Delete"
                        >
                          {deletingId === listing.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total} listings
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
