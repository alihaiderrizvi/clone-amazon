'use client';

import Link from 'next/link';
import { Plus, Search, Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

// Mock campaigns data
const mockCampaigns = [
  {
    id: '1',
    name: 'Holiday Electronics Sale',
    type: 'sponsored_product',
    status: 'active',
    budgetCents: 5000000,
    spentCents: 2345600,
    impressions: 456780,
    clicks: 12340,
    conversions: 234,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  },
  {
    id: '2',
    name: 'New Year Promotion',
    type: 'sponsored_brand',
    status: 'active',
    budgetCents: 3000000,
    spentCents: 1234500,
    impressions: 234560,
    clicks: 5670,
    conversions: 123,
    startDate: '2024-01-01',
    endDate: '2024-01-15',
  },
  {
    id: '3',
    name: 'Back to School',
    type: 'sponsored_product',
    status: 'paused',
    budgetCents: 2000000,
    spentCents: 890000,
    impressions: 123450,
    clicks: 2340,
    conversions: 67,
    startDate: '2023-08-01',
    endDate: '2023-09-15',
  },
  {
    id: '4',
    name: 'Summer Sale Campaign',
    type: 'display',
    status: 'ended',
    budgetCents: 1500000,
    spentCents: 1500000,
    impressions: 567890,
    clicks: 4560,
    conversions: 89,
    startDate: '2023-06-01',
    endDate: '2023-07-31',
  },
];

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  paused: { label: 'Paused', variant: 'warning' as const },
  ended: { label: 'Ended', variant: 'default' as const },
  draft: { label: 'Draft', variant: 'info' as const },
};

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage your advertising campaigns</p>
        </div>
        <Link href="/seller/ads/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
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
                <Input placeholder="Search campaigns..." className="pl-9" />
              </div>
            </div>
            <select className="h-10 px-3 border border-gray-300 rounded-md bg-white text-sm">
              <option>All Status</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Ended</option>
              <option>Draft</option>
            </select>
            <select className="h-10 px-3 border border-gray-300 rounded-md bg-white text-sm">
              <option>All Types</option>
              <option>Sponsored Product</option>
              <option>Sponsored Brand</option>
              <option>Display</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Campaign</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Budget</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Spent</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Impressions</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Clicks</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">CTR</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCampaigns.map((campaign) => {
                const status = statusConfig[campaign.status as keyof typeof statusConfig];
                const ctr = ((campaign.clicks / campaign.impressions) * 100).toFixed(2);
                
                return (
                  <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <Link
                        href={`/seller/ads/campaigns/${campaign.id}`}
                        className="font-medium text-[#007185] hover:text-[#C7511F] hover:underline"
                      >
                        {campaign.name}
                      </Link>
                      <p className="text-sm text-gray-500 capitalize">
                        {campaign.type.replace(/_/g, ' ')}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="py-4 px-4">{formatPrice(campaign.budgetCents)}</td>
                    <td className="py-4 px-4">{formatPrice(campaign.spentCents)}</td>
                    <td className="py-4 px-4">{campaign.impressions.toLocaleString()}</td>
                    <td className="py-4 px-4">{campaign.clicks.toLocaleString()}</td>
                    <td className="py-4 px-4">{ctr}%</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {campaign.status === 'active' ? (
                          <Button variant="ghost" size="sm" title="Pause campaign">
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : campaign.status === 'paused' ? (
                          <Button variant="ghost" size="sm" title="Resume campaign">
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing 1-{mockCampaigns.length} of {mockCampaigns.length} campaigns
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
