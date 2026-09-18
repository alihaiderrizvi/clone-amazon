'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ListingForm } from '@/components/seller/listing-form';
import { createListing } from '@/lib/api';
import { SellerListingCreate, SellerListingUpdate } from '@/types';

export default function NewListingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: SellerListingCreate | SellerListingUpdate, publish: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const listingData = {
        ...data,
        status: publish ? 'published' : 'draft',
      } as SellerListingCreate;
      
      await createListing(listingData);
      router.push('/seller/listings');
    } catch (err) {
      console.error('Failed to create listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Add New Listing</h1>
        <p className="text-gray-600 mt-1">Create a new product listing to sell on Amazon Clone</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <ListingForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
