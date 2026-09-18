'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { 
  getAdvertisingStatus, 
  getSellerProductsForAds, 
  createCampaign,
  type SellerProduct 
} from '@/lib/api';

export default function NewCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  
  // Form state
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [bidCents, setBidCents] = useState(50); // Default $0.50
  const [dailyBudgetCents, setDailyBudgetCents] = useState(1000); // Default $10

  useEffect(() => {
    async function loadData() {
      try {
        // Check if advertising is enabled
        const status = await getAdvertisingStatus();
        if (!status.enabled) {
          router.push('/seller/ads/enable');
          return;
        }

        // Load seller's products
        const productsData = await getSellerProductsForAds();
        setProducts(productsData.products);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }
    
    if (keywords.length === 0) {
      setError('Please add at least one keyword');
      return;
    }
    
    if (bidCents < 1) {
      setError('Bid must be at least 1 cent');
      return;
    }
    
    if (dailyBudgetCents < 100) {
      setError('Daily budget must be at least $1.00');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createCampaign({
        productId: selectedProduct.id,
        keywords,
        bidCents,
        dailyBudgetCents,
      });
      router.push('/seller/ads/campaigns');
    } catch (err) {
      console.error('Failed to create campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
        <p className="text-gray-600 mt-1">Set up a sponsored product campaign</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Product */}
        <Card>
          <CardHeader>
            <CardTitle>1. Select Product</CardTitle>
            <CardDescription>
              Choose which product you want to advertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You don't have any published products to advertise.
                </p>
                <Link href="/seller/listings/new">
                  <Button variant="outline">Create a Product Listing</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors flex gap-3 ${
                      selectedProduct?.id === product.id
                        ? 'border-[#FF9900] bg-[#FFEFD6]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={product.mainImage || '/placeholder-product.svg'}
                        alt={product.title}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-2">
                        {product.title}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {formatPrice(product.priceCents)}
                      </p>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <Check className="h-5 w-5 text-[#FF9900] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>2. Target Keywords</CardTitle>
            <CardDescription>
              Add keywords that customers might search for. Your ad appears when searches match these keywords.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
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
              {keywords.length === 0 && (
                <span className="text-gray-400 text-sm">No keywords added yet</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addKeyword}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tip: Use relevant keywords like product type, brand, features, or use cases.
            </p>
          </CardContent>
        </Card>

        {/* Step 3: Budget */}
        <Card>
          <CardHeader>
            <CardTitle>3. Set Your Budget</CardTitle>
            <CardDescription>
              Control how much you spend on advertising
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bid per Click
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Maximum amount you're willing to pay when someone clicks your ad. 
                You'll often pay less (second-price auction).
              </p>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={(bidCents / 100).toFixed(2)}
                    onChange={(e) => setBidCents(Math.round(parseFloat(e.target.value) * 100) || 0)}
                    className="pl-7 w-32"
                  />
                </div>
                <span className="text-gray-500">= {bidCents} cents</span>
              </div>
              <div className="mt-2 flex gap-2">
                {[25, 50, 100, 200].map((cents) => (
                  <button
                    key={cents}
                    type="button"
                    onClick={() => setBidCents(cents)}
                    className={`px-3 py-1 text-sm rounded border ${
                      bidCents === cents
                        ? 'border-[#FF9900] bg-[#FFEFD6] text-[#C7511F]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {formatPrice(cents)}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Budget
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Maximum amount you'll spend per day. Once reached, your ads stop showing for that day.
              </p>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={(dailyBudgetCents / 100).toFixed(0)}
                    onChange={(e) => setDailyBudgetCents(Math.round(parseFloat(e.target.value) * 100) || 0)}
                    className="pl-7 w-32"
                  />
                </div>
                <span className="text-gray-500">per day</span>
              </div>
              <div className="mt-2 flex gap-2">
                {[500, 1000, 2500, 5000].map((cents) => (
                  <button
                    key={cents}
                    type="button"
                    onClick={() => setDailyBudgetCents(cents)}
                    className={`px-3 py-1 text-sm rounded border ${
                      dailyBudgetCents === cents
                        ? 'border-[#FF9900] bg-[#FFEFD6] text-[#C7511F]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {formatPrice(cents)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">
                  {selectedProduct?.title.slice(0, 40) || 'Not selected'}
                  {(selectedProduct?.title?.length || 0) > 40 && '...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Keywords:</span>
                <span className="font-medium">{keywords.length} keyword(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bid per Click:</span>
                <span className="font-medium">{formatPrice(bidCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Budget:</span>
                <span className="font-medium">{formatPrice(dailyBudgetCents)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Est. Max Clicks/Day:</span>
                <span className="font-medium">
                  ~{Math.floor(dailyBudgetCents / bidCents)} clicks
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Link href="/seller/ads/campaigns" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSubmitting || !selectedProduct || keywords.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Campaign'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
