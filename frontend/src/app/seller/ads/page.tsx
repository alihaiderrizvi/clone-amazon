'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  ShoppingCart,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Mock data
const stats = [
  { title: 'Impressions', value: '124,567', change: '+15.2%', icon: Eye },
  { title: 'Clicks', value: '3,456', change: '+8.7%', icon: MousePointer },
  { title: 'Conversions', value: '234', change: '+12.3%', icon: ShoppingCart },
  { title: 'Ad Spend', value: '$1,234.56', change: '-5.2%', icon: TrendingUp },
];

const activeCampaigns = [
  {
    id: '1',
    name: 'Holiday Electronics Sale',
    type: 'sponsored_product',
    status: 'active',
    budget: 50000,
    spent: 23456,
    impressions: 45678,
    clicks: 1234,
  },
  {
    id: '2',
    name: 'New Year Promotion',
    type: 'sponsored_brand',
    status: 'active',
    budget: 30000,
    spent: 12345,
    impressions: 23456,
    clicks: 567,
  },
];

export default function AdsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertising Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your advertising campaigns</p>
        </div>
        <Link href="/seller/ads/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith('+');
          
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className={`text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Campaigns</CardTitle>
          <Link href="/seller/ads/campaigns">
            <Button variant="link" className="text-[#007185]">
              View all campaigns
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Campaign</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Budget</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Spent</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {activeCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-100">
                    <td className="py-4">
                      <Link
                        href={`/seller/ads/campaigns/${campaign.id}`}
                        className="font-medium text-[#007185] hover:text-[#C7511F] hover:underline"
                      >
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="py-4 text-sm text-gray-600 capitalize">
                      {campaign.type.replace('_', ' ')}
                    </td>
                    <td className="py-4">
                      <Badge variant="success">{campaign.status}</Badge>
                    </td>
                    <td className="py-4">{formatPrice(campaign.budget)}</td>
                    <td className="py-4">{formatPrice(campaign.spent)}</td>
                    <td className="py-4 text-sm">
                      <span className="text-gray-600">
                        {campaign.impressions.toLocaleString()} imp • {campaign.clicks.toLocaleString()} clicks
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Advertising Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Optimize Keywords</h4>
              <p className="text-sm text-blue-700">
                Review your keyword performance and adjust bids for top performers.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">A/B Test Creatives</h4>
              <p className="text-sm text-green-700">
                Test different product images and copy to improve click-through rates.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Set Daily Budgets</h4>
              <p className="text-sm text-purple-700">
                Use daily budgets to control spending and maximize ROI.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
