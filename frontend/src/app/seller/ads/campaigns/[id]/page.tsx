'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Loader2, Play, Pause, Trash2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { getProductImage } from '@/lib/api-url';
import {
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
  type CampaignWithStats,
  type CampaignStatsResponse,
} from '@/lib/api';
import { ProductListItem } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [campaign, setCampaign] = useState<CampaignWithStats | null>(null);
  const [product, setProduct] = useState<ProductListItem | null>(null);
  const [stats, setStats] = useState<CampaignStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Edit form state
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [bidCents, setBidCents] = useState(0);
  const [dailyBudgetCents, setDailyBudgetCents] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [campaignData, statsData] = await Promise.all([
          getCampaign(id),
          getCampaignStats(id),
        ]);

        setCampaign(campaignData.campaign);
        setProduct(campaignData.product as ProductListItem);
        setStats(statsData);
        
        // Initialize form state
        setKeywords(campaignData.campaign.keywords);
        setBidCents(campaignData.campaign.bidCents);
        setDailyBudgetCents(campaignData.campaign.dailyBudgetCents);
      } catch (err) {
        console.error('Failed to load campaign:', err);
        setError(err instanceof Error ? err.message : 'Failed to load campaign');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleSave = async () => {
    if (!campaign) return;
    
    setIsSaving(true);
    try {
      const result = await updateCampaign(campaign.id, {
        keywords,
        bidCents,
        dailyBudgetCents,
      });
      setCampaign(result.campaign);
    } catch (err) {
      console.error('Failed to update campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!campaign) return;
    
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      const result = await updateCampaign(campaign.id, { status: newStatus });
      setCampaign(result.campaign);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async () => {
    if (!campaign || !confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await deleteCampaign(campaign.id);
      router.push('/seller/ads/campaigns');
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  const addKeyword = () => {
    const kw = newKeyword.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Campaign not found'}</p>
        <Link href="/seller/ads/campaigns">
          <Button>Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/seller/ads/campaigns"
            className="inline-flex items-center text-[#007185] hover:text-[#C7511F] mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Campaigns
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Details</h1>
          <p className="text-gray-600 mt-1">ID: {campaign.id}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleToggleStatus}
          >
            {campaign.status === 'active' ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <Badge variant={campaign.status === 'active' ? 'success' : 'warning'}>
          {campaign.status.toUpperCase()}
        </Badge>
        <span className="text-sm text-gray-500">
          Created {new Date(campaign.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Product Info */}
      {product && (
        <Card>
          <CardHeader>
            <CardTitle>Advertised Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={getProductImage(product)}
                  alt={product.title}
                  fill
                  className="object-contain rounded"
                />
              </div>
              <div>
                <Link
                  href={`/product/${product.slug}`}
                  className="font-medium text-[#007185] hover:underline"
                >
                  {product.title}
                </Link>
                <p className="text-lg font-bold mt-1">{formatPrice(product.priceCents)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.stats.impressions.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">Impressions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.stats.clicks.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">Clicks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.stats.ctr || 0}%
              </p>
              <p className="text-sm text-gray-600">CTR</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats?.stats.spendCents || 0)}
              </p>
              <p className="text-sm text-gray-600">Total Spend</p>
            </div>
          </div>

          {/* Today's Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Today</h4>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {campaign.impressionsToday.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Impressions</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {campaign.clicksToday.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Clicks</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(campaign.spentTodayCents)} / {formatPrice(campaign.dailyBudgetCents)}
                </p>
                <p className="text-sm text-gray-600">Spent / Budget</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Settings</CardTitle>
          <CardDescription>Update your campaign targeting and budget</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Keywords
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="max-w-xs"
              />
              <Button type="button" variant="outline" onClick={addKeyword}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bid per Click (cents)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={bidCents}
                  onChange={(e) => setBidCents(parseInt(e.target.value) || 0)}
                  className="max-w-[120px]"
                />
                <span className="text-gray-500">= {formatPrice(bidCents)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Budget (cents)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="100"
                  step="100"
                  value={dailyBudgetCents}
                  onChange={(e) => setDailyBudgetCents(parseInt(e.target.value) || 0)}
                  className="max-w-[120px]"
                />
                <span className="text-gray-500">= {formatPrice(dailyBudgetCents)}</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.daily && stats.daily.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Date</th>
                    <th className="text-right py-2 font-medium text-gray-600">Impressions</th>
                    <th className="text-right py-2 font-medium text-gray-600">Clicks</th>
                    <th className="text-right py-2 font-medium text-gray-600">Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.daily.slice(-7).reverse().map((day) => (
                    <tr key={day.date} className="border-b border-gray-100">
                      <td className="py-2">{day.date}</td>
                      <td className="text-right py-2">{day.impressions.toLocaleString()}</td>
                      <td className="text-right py-2">{day.clicks.toLocaleString()}</td>
                      <td className="text-right py-2">{formatPrice(day.spentCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No performance data yet. Stats will appear after your campaign runs.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
