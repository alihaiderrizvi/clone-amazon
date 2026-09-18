'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Target, BarChart3, DollarSign, Zap } from 'lucide-react';

const benefits = [
  {
    icon: Target,
    title: 'Reach More Customers',
    description: 'Put your products in front of millions of shoppers actively searching for what you sell.',
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

const adTypes = [
  {
    name: 'Sponsored Products',
    description: 'Promote individual product listings to shoppers actively searching.',
    price: 'Pay-per-click',
  },
  {
    name: 'Sponsored Brands',
    description: 'Showcase your brand with a custom headline and logo.',
    price: 'Pay-per-click',
  },
  {
    name: 'Display Ads',
    description: 'Reach shoppers on and off Amazon Clone with display ads.',
    price: 'Pay-per-impression',
  },
];

export default function EnableAdsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Grow Your Sales with Advertising</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Reach millions of customers and boost your product visibility
        </p>
      </div>

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

      {/* Ad Types */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Choose Your Ad Type</CardTitle>
          <CardDescription>
            Select the advertising solution that fits your goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adTypes.map((adType) => (
              <div
                key={adType.name}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#FF9900] transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{adType.name}</h4>
                  <p className="text-sm text-gray-600">{adType.description}</p>
                </div>
                <span className="text-sm text-[#007185] font-medium">{adType.price}</span>
              </div>
            ))}
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
        <Link href="/seller/ads/campaigns/new">
          <Button size="lg" className="px-8">
            Create Your First Campaign
          </Button>
        </Link>
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
