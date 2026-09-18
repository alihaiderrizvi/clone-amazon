'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Target, BarChart3, DollarSign, Zap, Loader2, AlertCircle } from 'lucide-react';
import { getAdvertisingStatus, enableAdvertising } from '@/lib/api';

const benefits = [
  {
    icon: Target,
    title: 'Reach More Customers',
    description: 'Put your products in front of shoppers actively searching for what you sell.',
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    description: 'Track impressions, clicks, and conversions with comprehensive reporting tools.',
  },
  {
    icon: DollarSign,
    title: 'Control Your Budget',
    description: 'Set daily budgets and only pay when customers click on your ads.',
  },
  {
    icon: Zap,
    title: 'Quick Setup',
    description: 'Create your first campaign in minutes with our easy-to-use campaign builder.',
  },
];

export default function EnableAdsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ enabled: boolean; hasSeller?: boolean } | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const result = await getAdvertisingStatus();
        setStatus(result);
        
        // If already enabled, redirect to dashboard
        if (result.enabled) {
          router.push('/seller/ads');
        }
      } catch (err) {
        console.error('Failed to check advertising status:', err);
        setError('Failed to check advertising status');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkStatus();
  }, [router]);

  const handleEnable = async () => {
    setIsEnabling(true);
    setError(null);
    
    try {
      await enableAdvertising();
      router.push('/seller/ads');
    } catch (err) {
      console.error('Failed to enable advertising:', err);
      setError(err instanceof Error ? err.message : 'Failed to enable advertising');
    } finally {
      setIsEnabling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // User doesn't have a seller account
  if (status && !status.hasSeller) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Account Required</h1>
        <p className="text-gray-600 mb-6">
          You need a seller account to enable advertising. Complete your seller onboarding first.
        </p>
        <Link href="/seller/onboarding">
          <Button>Complete Seller Onboarding</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Grow Your Sales with Advertising</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Reach millions of customers and boost your product visibility
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <Card key={benefit.title}>
              <CardContent className="p-6 flex gap-4">
                <div className="h-12 w-12 bg-[#FFEFD6] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-[#C7511F]" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* How It Works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How Sponsored Products Work</CardTitle>
          <CardDescription>
            Our second-price auction ensures you get the best value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#FF9900] text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Set Your Bid</h4>
                <p className="text-sm text-gray-600">
                  Choose how much you're willing to pay per click. Higher bids = better placement.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#FF9900] text-white flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Target Keywords</h4>
                <p className="text-sm text-gray-600">
                  Select keywords that match your product. Your ad shows when customers search for those terms.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#FF9900] text-white flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Pay Second Price</h4>
                <p className="text-sm text-gray-600">
                  You only pay $0.01 more than the next highest bidder, not your full bid.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transparent Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              'No minimum spend required',
              'Set your own daily budget',
              'Pay only when customers click',
              'Pause or stop campaigns anytime',
              'No long-term commitments',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Button size="lg" className="px-8" onClick={handleEnable} disabled={isEnabling}>
          {isEnabling ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enabling...
            </>
          ) : (
            'Enable Advertising'
          )}
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          By enabling advertising, you agree to the{' '}
          <Link href="#" className="text-[#007185] hover:underline">
            Advertising Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
