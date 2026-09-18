import { createClient } from './supabase/client';
import { 
  Product, 
  ProductListItem, 
  Category, 
  SearchResult, 
  SearchFilters,
  PaginatedResponse 
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
    
    const response = await fetch(`${this.baseUrl}${path}`, {
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

export const api = new ApiClient(API_URL);

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
    mainImage: '/placeholder-product.svg',
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
    mainImage: '/placeholder-product.svg',
    ratingAvg: 4.2,
    ratingCount: 1892,
  },
  {
    id: '3',
    slug: 'portable-bluetooth-speaker',
    title: 'Portable Bluetooth Speaker Waterproof with 24Hr Playtime',
    brand: 'SoundWave',
    priceCents: 3499,
    mainImage: '/placeholder-product.svg',
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
    mainImage: '/placeholder-product.svg',
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
    mainImage: '/placeholder-product.svg',
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
    mainImage: '/placeholder-product.svg',
    ratingAvg: 4.8,
    ratingCount: 2156,
  },
  {
    id: '7',
    slug: 'laptop-stand-adjustable',
    title: 'Laptop Stand Adjustable Aluminum Ergonomic for 10-17 inch',
    brand: 'ErgoDesk',
    priceCents: 3999,
    mainImage: '/placeholder-product.svg',
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
    mainImage: '/placeholder-product.svg',
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
  images: ['/placeholder-product.svg', '/placeholder-product.svg', '/placeholder-product.svg', '/placeholder-product.svg'],
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
