'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Play, Pause, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { 
  getAdvertisingStatus, 
  getCampaigns, 
  updateCampaign, 
  deleteCampaign,
  type CampaignWithStats 
} from '@/lib/api';

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  paused: { label: 'Paused', variant: 'warning' as const },
};

export default function CampaignsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignWithStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const status = await getAdvertisingStatus();
        if (!status.enabled) {
          router.push('/seller/ads/enable');
          return;
        }

        const data = await getCampaigns({
          page,
          limit: 20,
          status: statusFilter !== 'all' ? (statusFilter as 'active' | 'paused') : undefined,
        });

        setCampaigns(data.campaigns);
        setFilteredCampaigns(data.campaigns);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to load campaigns:', err);
        setError(err instanceof Error ? err.message : 'Failed to load campaigns');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router, page, statusFilter]);

  // Filter campaigns by search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCampaigns(campaigns);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCampaigns(
        campaigns.filter(c => 
          c.keywords.some(k => k.toLowerCase().includes(query)) ||
          c.id.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, campaigns]);

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

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await deleteCampaign(campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete campaign:', err);
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
                <Input 
                  placeholder="Search by keywords..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select 
              className="h-10 px-3 border border-gray-300 rounded-md bg-white text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'No campaigns match your filters' 
                : 'No campaigns yet'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/seller/ads/campaigns/new">
                <Button>Create your first campaign</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Campaign</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Bid</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Daily Budget</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Spent Today</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Impressions</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Clicks</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">CTR</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => {
                  const status = statusConfig[campaign.status];
                  const ctr = campaign.impressionsToday > 0 
                    ? ((campaign.clicksToday / campaign.impressionsToday) * 100).toFixed(2)
                    : '0.00';
                  
                  return (
                    <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link
                          href={`/seller/ads/campaigns/${campaign.id}`}
                          className="font-medium text-[#007185] hover:text-[#C7511F] hover:underline"
                        >
                          {campaign.id.slice(-8).toUpperCase()}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1 max-w-[200px] truncate">
                          {campaign.keywords.join(', ')}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-4 px-4">{formatPrice(campaign.bidCents)}</td>
                      <td className="py-4 px-4">{formatPrice(campaign.dailyBudgetCents)}</td>
                      <td className="py-4 px-4">{formatPrice(campaign.spentTodayCents)}</td>
                      <td className="py-4 px-4">{campaign.impressionsToday.toLocaleString()}</td>
                      <td className="py-4 px-4">{campaign.clicksToday.toLocaleString()}</td>
                      <td className="py-4 px-4">{ctr}%</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title={campaign.status === 'active' ? 'Pause campaign' : 'Resume campaign'}
                            onClick={() => handleToggleStatus(campaign)}
                          >
                            {campaign.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(campaign.id)}
                          >
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total} campaigns
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
