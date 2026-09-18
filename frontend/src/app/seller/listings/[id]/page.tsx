'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ListingForm } from '@/components/seller/listing-form';

// Mock listing data
const mockListing = {
  title: 'Wireless Bluetooth Headphones with Active Noise Cancelling',
  brand: 'AudioTech',
  priceCents: 7999,
  listPriceCents: 12999,
  description: 'Experience premium audio with our flagship wireless headphones.',
  bullets: [
    'Industry-leading Active Noise Cancellation technology',
    '40 hours of battery life with quick charging',
    'Hi-Res Audio certified for exceptional sound quality',
  ],
  stock: 45,
};

export default function EditListingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: unknown) => {
    setIsLoading(true);
    try {
      // TODO: Submit to API
      console.log('Updating listing:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      router.push('/seller/listings');
    } catch (error) {
      console.error('Failed to update listing:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-600 mt-1">Update your product listing</p>
      </div>

      <ListingForm initialData={mockListing} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
