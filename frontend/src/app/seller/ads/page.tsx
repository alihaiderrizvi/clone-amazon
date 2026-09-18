'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Plus,
  ArrowUpRight,
  Loader2,
  Play,
  Pause
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { 
  getAdvertisingStatus, 
  getAdsOverview, 
  getCampaigns, 
  updateCampaign,
  type CampaignWithStats,
  type AdsOverview 
} from '@/lib/api';

export default function AdsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<AdsOverview | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Check if advertising is enabled
        const status = await getAdvertisingStatus();
        if (!status.enabled) {
          router.push('/seller/ads/enable');
          return;
        }

        // Load overview and campaigns
        const [overviewData, campaignsData] = await Promise.all([
          getAdsOverview(),
          getCampaigns({ limit: 5 }),
        ]);

        setOverview(overviewData);
        setCampaigns(campaignsData.campaigns);
      } catch (err) {
        console.error('Failed to load ads data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleToggleStatus = async (campaign: CampaignWithStats) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      await updateCampaign(campaign.id, { status: newStatus });
      setCampaigns(prev =>
        prev.map(c =>
          c.id === campaign.id ? { ...c, status: newStatus } : c
        )
      );
    } catch (err) {
      console.error('Failed to update campaign:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Impressions', 
      value: overview?.totalImpressions.toLocaleString() || '0', 
      icon: Eye 
    },
    { 
      title: 'Clicks', 
      value: overview?.totalClicks.toLocaleString() || '0', 
      icon: MousePointer 
    },
    { 
      title: 'CTR', 
      value: `${overview?.avgCtr.toFixed(2) || '0'}%`, 
      icon: TrendingUp 
    },
    { 
      title: 'Ad Spend', 
      value: formatPrice(overview?.totalSpendCents || 0), 
      icon: TrendingUp 
    },
  ];

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
          
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500">Last 30 days</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Campaign Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{overview?.activeCampaigns || 0}</p>
                <p className="text-sm text-gray-600">Active Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Pause className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{overview?.pausedCampaigns || 0}</p>
                <p className="text-sm text-gray-600">Paused Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Campaigns</CardTitle>
          <Link href="/seller/ads/campaigns">
            <Button variant="link" className="text-[#007185]">
              View all campaigns
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No campaigns yet</p>
              <Link href="/seller/ads/campaigns/new">
                <Button>Create your first campaign</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Campaign</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Daily Budget</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Spent Today</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Today's Performance</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => {
                    const ctr = campaign.impressionsToday > 0 
                      ? ((campaign.clicksToday / campaign.impressionsToday) * 100).toFixed(2)
                      : '0.00';
                    
                    return (
                      <tr key={campaign.id} className="border-b border-gray-100">
                        <td className="py-4">
                          <Link
                            href={`/seller/ads/campaigns/${campaign.id}`}
                            className="font-medium text-[#007185] hover:text-[#C7511F] hover:underline"
                          >
                            Campaign {campaign.id.slice(-6)}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">
                            {campaign.keywords.slice(0, 3).join(', ')}
                            {campaign.keywords.length > 3 && '...'}
                          </p>
                        </td>
                        <td className="py-4">
                          <Badge variant={campaign.status === 'active' ? 'success' : 'warning'}>
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="py-4">{formatPrice(campaign.dailyBudgetCents)}</td>
                        <td className="py-4">{formatPrice(campaign.spentTodayCents)}</td>
                        <td className="py-4 text-sm">
                          <span className="text-gray-600">
                            {campaign.impressionsToday.toLocaleString()} imp • {campaign.clicksToday.toLocaleString()} clicks • {ctr}% CTR
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(campaign)}
                            title={campaign.status === 'active' ? 'Pause campaign' : 'Resume campaign'}
                          >
                            {campaign.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
              <h4 className="font-medium text-green-900 mb-2">Monitor CTR</h4>
              <p className="text-sm text-green-700">
                A healthy CTR (above 1%) indicates your ads are relevant to searchers.
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
