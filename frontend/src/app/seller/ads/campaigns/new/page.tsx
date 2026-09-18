'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NewCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [campaignType, setCampaignType] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // TODO: Submit to API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/seller/ads/campaigns');
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/seller/ads/campaigns"
          className="inline-flex items-center text-[#007185] hover:text-[#C7511F] mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Campaigns
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
        <p className="text-gray-600 mt-1">Set up a new advertising campaign</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                s <= step
                  ? 'bg-[#FF9900] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  s < step ? 'bg-[#FF9900]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Campaign Type</CardTitle>
              <CardDescription>
                Select the type of advertising campaign you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  id: 'sponsored_product',
                  name: 'Sponsored Products',
                  description: 'Promote individual product listings in search results and product pages.',
                },
                {
                  id: 'sponsored_brand',
                  name: 'Sponsored Brands',
                  description: 'Showcase your brand with a custom headline, logo, and multiple products.',
                },
                {
                  id: 'display',
                  name: 'Display Ads',
                  description: 'Reach audiences with display ads on and off Amazon Clone.',
                },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setCampaignType(type.id)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                    campaignType === type.id
                      ? 'border-[#FF9900] bg-[#FFEFD6]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{type.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </button>
              ))}
              <Button
                type="button"
                onClick={() => setStep(2)}
                className="w-full mt-4"
                disabled={!campaignType}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Set up your campaign name, budget, and duration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Campaign Name" placeholder="e.g., Holiday Sale 2024" required />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Daily Budget ($)"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="50.00"
                  required
                />
                <Input
                  label="Total Budget ($) - Optional"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="500.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="date" required />
                <Input label="End Date (Optional)" type="date" />
              </div>

              <div className="flex gap-4 mt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(3)} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Targeting & Products</CardTitle>
              <CardDescription>
                Choose which products to advertise and how to target customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Targeting Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="targeting" value="automatic" defaultChecked />
                    <div>
                      <p className="font-medium">Automatic Targeting</p>
                      <p className="text-sm text-gray-600">
                        Amazon Clone will target relevant keywords automatically
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="targeting" value="manual" />
                    <div>
                      <p className="font-medium">Manual Targeting</p>
                      <p className="text-sm text-gray-600">
                        Choose your own keywords and set individual bids
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (for manual targeting)
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Enter keywords, one per line..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Products to Advertise
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center">
                  <p className="text-gray-600">
                    Product selector coming soon. For now, all active listings will be included.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" isLoading={isLoading}>
                  Create Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
