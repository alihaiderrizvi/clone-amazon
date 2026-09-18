'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ListingForm } from '@/components/seller/listing-form';

export default function NewListingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: unknown) => {
    setIsLoading(true);
    try {
      // TODO: Submit to API
      console.log('Creating listing:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      router.push('/seller/listings');
    } catch (error) {
      console.error('Failed to create listing:', error);
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

      <ListingForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
