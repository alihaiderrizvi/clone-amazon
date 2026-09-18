'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trash2, AlertCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { ListingForm } from '@/components/seller/listing-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getListing, updateListing, deleteListing } from '@/lib/api';
import { SellerListing, SellerListingUpdate } from '@/types';

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  
  const [listing, setListing] = useState<SellerListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        const data = await getListing(listingId);
        setListing(data);
      } catch (err) {
        console.error('Failed to fetch listing:', err);
        setError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    }

    fetchListing();
  }, [listingId]);

  const handleSubmit = async (data: SellerListingUpdate, publish: boolean) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const updateData = {
        ...data,
        status: publish ? 'published' : 'draft',
      } as SellerListingUpdate;
      
      await updateListing(listingId, updateData);
      router.push('/seller/listings');
    } catch (err) {
      console.error('Failed to update listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteListing(listingId);
      router.push('/seller/listings');
    } catch (err) {
      console.error('Failed to delete listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!listing) return;
    
    const newStatus = listing.status === 'published' ? 'draft' : 'published';
    
    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateListing(listingId, { status: newStatus });
      setListing(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9900]" />
      </div>
    );
  }

  if (!listing && !error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
        <p className="text-gray-600 mb-4">This listing doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link href="/seller/listings">
          <Button variant="outline">Back to Listings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/seller/listings"
          className="inline-flex items-center text-[#007185] hover:text-[#C7511F] mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Listings
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
            <p className="text-gray-600 mt-1">Update your product listing</p>
          </div>
          
          {listing && (
            <div className="flex items-center gap-3">
              <Badge variant={listing.status === 'published' ? 'success' : 'warning'}>
                {listing.status}
              </Badge>
              
              {listing.status === 'published' && (
                <Link href={`/product/${listing.slug}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {listing && (
        <>
          {/* Quick Actions */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Quick Actions:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                disabled={isSaving}
              >
                {listing.status === 'published' ? 'Unpublish' : 'Publish'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>

          <ListingForm
            initialData={{
              title: listing.title,
              brand: listing.brand,
              categoryId: listing.categoryId,
              priceCents: listing.priceCents,
              listPriceCents: listing.listPriceCents,
              description: listing.description,
              bullets: listing.bullets,
              images: listing.images,
              attributes: listing.attributes,
              stock: listing.stock,
              status: listing.status,
            }}
            onSubmit={handleSubmit}
            isLoading={isSaving}
            isEdit
          />
        </>
      )}
    </div>
  );
}
