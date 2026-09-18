import { createClient } from './supabase/client';
import { 
  Product, 
  ProductListItem, 
  Category, 
  SearchResult, 
  SearchFilters,
  PaginatedResponse,
  Cart,
  Wishlist,
  Order,
  OrderList,
  CreateOrderData,
  Seller,
  SellerCreateData,
  SellerUpdateData,
  SellerListing,
  SellerListingCreate,
  SellerListingUpdate,
  SellerListingsResponse,
  SellerStats,
} from '@/types';
import { getApiUrl } from './api-url';

type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
    
    return {};
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const authHeader = await this.getAuthHeader();
    
        const response = await fetch(`${getApiUrl()}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: options.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || error.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

export const api = new ApiClient('');

// ============================================================================
// Product API Functions
// ============================================================================

export interface ProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'relevance';
}

export interface SearchParams extends ProductsParams {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  brands?: string[];
}

/**
 * Get paginated list of products
 */
export async function getProducts(
  params: ProductsParams = {}
): Promise<PaginatedResponse<ProductListItem>> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.category) searchParams.set('category', params.category);
  if (params.sortBy) searchParams.set('sort_by', params.sortBy);

  const queryString = searchParams.toString();
  const path = `/products${queryString ? `?${queryString}` : ''}`;
  
  return api.get<PaginatedResponse<ProductListItem>>(path);
}

/**
 * Search products with filters
 */
export async function searchProducts(
  query: string,
  params: SearchParams = {}
): Promise<SearchResult> {
  const searchParams = new URLSearchParams();
  
  if (query) searchParams.set('q', query);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.category) searchParams.set('category', params.category);
  if (params.sortBy) searchParams.set('sort_by', params.sortBy);
  if (params.minPrice !== undefined) searchParams.set('min_price', params.minPrice.toString());
  if (params.maxPrice !== undefined) searchParams.set('max_price', params.maxPrice.toString());
  if (params.minRating !== undefined) searchParams.set('min_rating', params.minRating.toString());
  if (params.brands?.length) searchParams.set('brands', params.brands.join(','));

  const queryString = searchParams.toString();
  const path = `/products/search${queryString ? `?${queryString}` : ''}`;
  
  return api.get<SearchResult>(path);
}

/**
 * Get a single product by slug
 */
export async function getProduct(slug: string): Promise<Product> {
  return api.get<Product>(`/products/${slug}`);
}

/**
 * Get products by category (for home page rails)
 */
export async function getProductsByCategory(
  category: string,
  limit: number = 6
): Promise<ProductListItem[]> {
  const response = await api.get<PaginatedResponse<ProductListItem>>(
    `/products?category=${category}&limit=${limit}`
  );
  return response.data;
}

/**
 * Get featured/deal products
 */
export async function getFeaturedProducts(limit: number = 8): Promise<ProductListItem[]> {
  const response = await api.get<PaginatedResponse<ProductListItem>>(
    `/products?featured=true&limit=${limit}`
  );
  return response.data;
}

/**
 * Get deal products
 */
export async function getDealProducts(limit: number = 8): Promise<ProductListItem[]> {
  const response = await api.get<PaginatedResponse<ProductListItem>>(
    `/products?deals=true&limit=${limit}`
  );
  return response.data;
}

// ============================================================================
// Category API Functions
// ============================================================================

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  return api.get<Category[]>('/categories');
}

/**
 * Get category by slug
 */
export async function getCategory(slug: string): Promise<Category> {
  return api.get<Category>(`/categories/${slug}`);
}

// ============================================================================
// Mock Data for Development (used when API is unavailable)
// ============================================================================

export const mockProducts: ProductListItem[] = [
  {
    id: '1',
    slug: 'wireless-bluetooth-headphones',
    title: 'Wireless Bluetooth Headphones with Active Noise Cancelling',
    brand: 'AudioTech',
    priceCents: 7999,
    listPriceCents: 12999,
    mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    ratingAvg: 4.5,
    ratingCount: 2341,
  },
  {
    id: '2',
    slug: 'smart-watch-fitness-tracker',
    title: 'Smart Watch Fitness Tracker with Heart Rate Monitor',
    brand: 'FitGear',
    priceCents: 4999,
    listPriceCents: 6999,
    mainImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    ratingAvg: 4.2,
    ratingCount: 1892,
  },
  {
    id: '3',
    slug: 'portable-bluetooth-speaker',
    title: 'Portable Bluetooth Speaker Waterproof with 24Hr Playtime',
    brand: 'SoundWave',
    priceCents: 3499,
    mainImage: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    ratingAvg: 4.7,
    ratingCount: 5621,
  },
  {
    id: '4',
    slug: 'usb-c-hub-multiport',
    title: 'USB-C Hub Multiport Adapter 7-in-1 for MacBook Pro',
    brand: 'TechConnect',
    priceCents: 2999,
    listPriceCents: 4999,
    mainImage: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80',
    ratingAvg: 4.4,
    ratingCount: 987,
  },
  {
    id: '5',
    slug: 'mechanical-gaming-keyboard',
    title: 'Mechanical Gaming Keyboard RGB Backlit with Cherry MX Switches',
    brand: 'GameMaster',
    priceCents: 8999,
    listPriceCents: 11999,
    mainImage: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80',
    ratingAvg: 4.6,
    ratingCount: 3421,
  },
  {
    id: '6',
    slug: 'wireless-gaming-mouse',
    title: 'Wireless Gaming Mouse Ultra Lightweight with 16000 DPI',
    brand: 'GameMaster',
    priceCents: 5999,
    listPriceCents: 7999,
    mainImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    ratingAvg: 4.8,
    ratingCount: 2156,
  },
  {
    id: '7',
    slug: 'laptop-stand-adjustable',
    title: 'Laptop Stand Adjustable Aluminum Ergonomic for 10-17 inch',
    brand: 'ErgoDesk',
    priceCents: 3999,
    mainImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    ratingAvg: 4.3,
    ratingCount: 1567,
  },
  {
    id: '8',
    slug: '4k-webcam-streaming',
    title: '4K Webcam with Microphone for Streaming and Video Calls',
    brand: 'StreamPro',
    priceCents: 9999,
    listPriceCents: 14999,
    mainImage: 'https://images.unsplash.com/photo-1587826080692-f439cd7437ea?auto=format&fit=crop&w=800&q=80',
    ratingAvg: 4.5,
    ratingCount: 892,
  },
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics' },
  { id: '2', name: 'Computers', slug: 'computers' },
  { id: '3', name: 'Home & Kitchen', slug: 'home-kitchen' },
  { id: '4', name: 'Fashion', slug: 'fashion' },
  { id: '5', name: 'Books', slug: 'books' },
  { id: '6', name: 'Toys & Games', slug: 'toys-games' },
  { id: '7', name: 'Sports & Outdoors', slug: 'sports-outdoors' },
  { id: '8', name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
];

export const mockSearchResult: SearchResult = {
  products: mockProducts,
  total: 156,
  page: 1,
  totalPages: 20,
  facets: {
    brands: [
      { name: 'AudioTech', count: 23 },
      { name: 'FitGear', count: 18 },
      { name: 'SoundWave', count: 31 },
      { name: 'TechConnect', count: 15 },
      { name: 'GameMaster', count: 42 },
      { name: 'ErgoDesk', count: 12 },
      { name: 'StreamPro', count: 15 },
    ],
    priceRanges: [
      { min: 0, max: 2500, count: 24 },
      { min: 2500, max: 5000, count: 45 },
      { min: 5000, max: 10000, count: 52 },
      { min: 10000, max: 20000, count: 28 },
      { min: 20000, max: 100000, count: 7 },
    ],
    categories: [
      { id: '1', name: 'Electronics', count: 89 },
      { id: '2', name: 'Computers', count: 45 },
      { id: '3', name: 'Home & Kitchen', count: 22 },
    ],
  },
};

export const mockProduct: Product = {
  id: '1',
  slug: 'wireless-bluetooth-headphones',
  title: 'Wireless Bluetooth Headphones with Active Noise Cancelling, 40H Playtime, Hi-Res Audio, Deep Bass, Memory Foam Ear Cups',
  brand: 'AudioTech',
  categoryId: 'electronics',
  priceCents: 7999,
  listPriceCents: 12999,
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
  ],
  bullets: [
    'Industry-leading Active Noise Cancellation technology',
    '40 hours of battery life with quick charging (10 min = 5 hours)',
    'Hi-Res Audio certified for exceptional sound quality',
    'Premium memory foam ear cups for all-day comfort',
    'Multi-device connectivity with Bluetooth 5.2',
    'Built-in microphone with AI noise reduction for clear calls',
  ],
  description: 'Experience premium audio with our flagship wireless headphones. Featuring industry-leading active noise cancellation, these headphones let you immerse yourself in your music, podcasts, or calls without distraction. The Hi-Res Audio certification ensures you hear every detail as the artist intended. With 40 hours of battery life and quick charging capability, you\'ll never be without your music. The premium memory foam ear cups provide all-day comfort, while Bluetooth 5.2 ensures a stable, low-latency connection to all your devices.',
  attributes: {
    'Color': 'Midnight Black',
    'Connectivity': 'Bluetooth 5.2, 3.5mm AUX',
    'Battery Life': '40 hours (ANC on), 60 hours (ANC off)',
    'Driver Size': '40mm',
    'Frequency Response': '4Hz - 40kHz',
    'Weight': '250g',
    'Noise Cancellation': 'Hybrid Active Noise Cancellation',
    'Charging': 'USB-C, Fast Charging',
  },
  ratingAvg: 4.5,
  ratingCount: 2341,
  stock: 15,
  sellerId: 'seller-1',
  status: 'published',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================================================
// Cart API Functions
// ============================================================================

/**
 * Get the current user's cart
 */
export async function getCart(): Promise<Cart> {
  return api.get<Cart>('/cart');
}

/**
 * Add an item to the cart
 */
export async function addToCart(productId: string, quantity: number = 1): Promise<Cart> {
  return api.post<Cart>('/cart/items', { productId, quantity });
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(productId: string, quantity: number): Promise<Cart> {
  return api.patch<Cart>(`/cart/items/${productId}`, { quantity });
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem(productId: string): Promise<Cart> {
  return api.delete<Cart>(`/cart/items/${productId}`);
}

/**
 * Clear all items from the cart
 */
export async function clearCart(): Promise<void> {
  return api.delete<void>('/cart');
}

/**
 * Merge local cart with server cart (called after login)
 */
export async function mergeCart(items: { productId: string; quantity: number }[]): Promise<Cart> {
  return api.post<Cart>('/cart/merge', { items });
}

// ============================================================================
// Wishlist API Functions
// ============================================================================

/**
 * Get the current user's wishlist
 */
export async function getWishlist(): Promise<Wishlist> {
  return api.get<Wishlist>('/wishlist');
}

/**
 * Add an item to the wishlist
 */
export async function addToWishlist(productId: string): Promise<Wishlist> {
  return api.post<Wishlist>('/wishlist/items', { productId });
}

/**
 * Remove an item from the wishlist
 */
export async function removeFromWishlist(productId: string): Promise<Wishlist> {
  return api.delete<Wishlist>(`/wishlist/items/${productId}`);
}

/**
 * Move an item from wishlist to cart
 */
export async function moveToCart(productId: string): Promise<void> {
  return api.post<void>(`/wishlist/items/${productId}/move-to-cart`, {});
}

// ============================================================================
// Order API Functions
// ============================================================================

/**
 * Create a new order from the current cart
 */
export async function createOrder(data: CreateOrderData): Promise<Order> {
  return api.post<Order>('/orders', data);
}

/**
 * Get the current user's orders
 */
export async function getOrders(page: number = 1): Promise<OrderList> {
  return api.get<OrderList>(`/orders?page=${page}`);
}

/**
 * Get a specific order by ID
 */
export async function getOrder(orderId: string): Promise<Order> {
  return api.get<Order>(`/orders/${orderId}`);
}

// ============================================================================
// Advertising API Functions
// ============================================================================

export interface AdvertiserStatus {
  enabled: boolean;
  hasSeller?: boolean;
  advertiserId?: string;
  sellerId?: string;
}

export interface CampaignWithStats {
  id: string;
  advertiserId: string;
  productId: string;
  keywords: string[];
  bidCents: number;
  dailyBudgetCents: number;
  status: 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
  spentTodayCents: number;
  impressionsToday: number;
  clicksToday: number;
}

export interface CampaignListResponse {
  campaigns: CampaignWithStats[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CampaignCreateData {
  productId: string;
  keywords: string[];
  bidCents: number;
  dailyBudgetCents: number;
}

export interface CampaignUpdateData {
  keywords?: string[];
  bidCents?: number;
  dailyBudgetCents?: number;
  status?: 'active' | 'paused';
}

export interface CampaignStats {
  impressions: number;
  clicks: number;
  ctr: number;
  spendCents: number;
  orders: number;
  revenueCents: number;
  acos: number | null;
}

export interface CampaignStatsResponse {
  campaignId: string;
  startDate: string;
  endDate: string;
  stats: CampaignStats;
  daily: Array<{
    date: string;
    impressions: number;
    clicks: number;
    spentCents: number;
  }>;
}

export interface AdsOverview {
  totalSpendCents: number;
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  activeCampaigns: number;
  pausedCampaigns: number;
}

export interface SellerProduct {
  id: string;
  title: string;
  slug: string;
  mainImage: string;
  priceCents: number;
}

export interface SponsoredProductDetails {
  id: string;
  slug: string;
  title: string;
  brand: string;
  priceCents: number;
  listPriceCents?: number;
  mainImage: string;
  ratingAvg: number;
  ratingCount: number;
}

export interface SponsoredProduct {
  campaignId: string;
  productId: string;
  bidCents: number;
  secondPriceCents: number;
  product: SponsoredProductDetails | null;
}

export interface SponsoredProductsResponse {
  sponsoredProducts: SponsoredProduct[];
  query: string;
}

/**
 * Enable advertising for the current seller
 */
export async function enableAdvertising(): Promise<{ advertiserId: string; enabled: boolean }> {
  return api.post('/seller/ads/enable');
}

/**
 * Get advertising status for the current seller
 */
export async function getAdvertisingStatus(): Promise<AdvertiserStatus> {
  return api.get('/seller/ads/status');
}

/**
 * Get campaigns for the current advertiser
 */
export async function getCampaigns(params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'paused';
}): Promise<CampaignListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.status) searchParams.set('status', params.status);
  
  const query = searchParams.toString();
  return api.get(`/seller/ads/campaigns${query ? `?${query}` : ''}`);
}

/**
 * Create a new campaign
 */
export async function createCampaign(data: CampaignCreateData): Promise<{ campaign: CampaignWithStats }> {
  return api.post('/seller/ads/campaigns', data);
}

/**
 * Get a campaign by ID
 */
export async function getCampaign(campaignId: string): Promise<{ campaign: CampaignWithStats; product: ProductListItem | null }> {
  return api.get(`/seller/ads/campaigns/${campaignId}`);
}

/**
 * Update a campaign
 */
export async function updateCampaign(campaignId: string, data: CampaignUpdateData): Promise<{ campaign: CampaignWithStats }> {
  return api.patch(`/seller/ads/campaigns/${campaignId}`, data);
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  return api.delete(`/seller/ads/campaigns/${campaignId}`);
}

/**
 * Get campaign stats
 */
export async function getCampaignStats(
  campaignId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<CampaignStatsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  
  const query = searchParams.toString();
  return api.get(`/seller/ads/campaigns/${campaignId}/stats${query ? `?${query}` : ''}`);
}

/**
 * Get overview stats for ads dashboard
 */
export async function getAdsOverview(): Promise<AdsOverview> {
  return api.get('/seller/ads/overview');
}

/**
 * Get seller's products for campaign creation
 */
export async function getSellerProductsForAds(): Promise<{ products: SellerProduct[] }> {
  return api.get('/seller/ads/products');
}

/**
 * Serve sponsored products for a search query
 */
export async function serveAds(query: string, limit?: number): Promise<SponsoredProductsResponse> {
  const params = new URLSearchParams();
  params.set('q', query);
  if (limit) params.set('limit', limit.toString());
  return api.get(`/ads/serve?${params.toString()}`);
}

/**
 * Record an ad click
 */
export async function recordAdClick(data: {
  campaignId: string;
  productId: string;
  query: string;
}): Promise<{ charged: boolean; costCents?: number }> {
  return api.post('/ads/click', data);
}

// ============================================================================
// Seller API Functions
// ============================================================================

/**
 * Create a new seller account for the current user
 */
export async function createSellerAccount(data: SellerCreateData): Promise<Seller> {
  return api.post<Seller>('/sellers', data);
}

/**
 * Get the current user's seller profile
 */
export async function getMySellerProfile(): Promise<Seller> {
  return api.get<Seller>('/sellers/me');
}

/**
 * Update the current user's seller profile
 */
export async function updateMySellerProfile(data: SellerUpdateData): Promise<Seller> {
  return api.patch<Seller>('/sellers/me', data);
}

/**
 * Check if current user is a seller
 */
export async function checkSellerStatus(): Promise<{ isSeller: boolean; seller?: Seller }> {
  try {
    const seller = await getMySellerProfile();
    return { isSeller: true, seller };
  } catch {
    return { isSeller: false };
  }
}

/**
 * Get seller dashboard statistics
 */
export async function getSellerStats(): Promise<SellerStats> {
  return api.get<SellerStats>('/seller/stats');
}

/**
 * Get seller's product listings
 */
export async function getSellerListings(
  params: { page?: number; limit?: number; status?: 'draft' | 'published' } = {}
): Promise<SellerListingsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.status) searchParams.set('status', params.status);
  
  const queryString = searchParams.toString();
  const path = `/seller/listings${queryString ? `?${queryString}` : ''}`;
  
  return api.get<SellerListingsResponse>(path);
}

/**
 * Create a new product listing
 */
export async function createListing(data: SellerListingCreate): Promise<SellerListing> {
  return api.post<SellerListing>('/seller/listings', data);
}

/**
 * Get a single listing by ID
 */
export async function getListing(listingId: string): Promise<SellerListing> {
  return api.get<SellerListing>(`/seller/listings/${listingId}`);
}

/**
 * Update a listing
 */
export async function updateListing(
  listingId: string,
  data: SellerListingUpdate
): Promise<SellerListing> {
  return api.patch<SellerListing>(`/seller/listings/${listingId}`, data);
}

/**
 * Delete a listing
 */
export async function deleteListing(listingId: string): Promise<void> {
  return api.delete<void>(`/seller/listings/${listingId}`);
}
