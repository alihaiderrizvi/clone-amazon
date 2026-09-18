// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'customer' | 'seller' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  categoryId: string;
  priceCents: number;
  listPriceCents?: number;
  images: string[];
  bullets: string[];
  description: string;
  attributes: Record<string, string>;
  ratingAvg: number;
  ratingCount: number;
  stock: number;
  sellerId: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem {
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

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children?: Category[];
}

// Cart types
export interface CartItem {
  productId: string;
  quantity: number;
  product: ProductListItem;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotalCents: number;
  createdAt: string;
  updatedAt: string;
}

// Order types
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  priceCents: number;
  sellerId: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

// Address types
export interface Address {
  id?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

// Seller types
export interface Seller {
  id: string;
  userId: string;
  storeName: string;
  displayName: string;
  contactEmail: string;
  createdAt: string;
  isAdvertiser: boolean;
}

export interface SellerCreateData {
  storeName: string;
  displayName: string;
  contactEmail: string;
}

export interface SellerUpdateData {
  storeName?: string;
  displayName?: string;
  contactEmail?: string;
}

export interface SellerListing {
  id: string;
  slug: string;
  title: string;
  brand?: string;
  categoryId: string;
  priceCents: number;
  listPriceCents?: number;
  images: string[];
  mainImage?: string;
  bullets: string[];
  description?: string;
  attributes: Record<string, string>;
  stock: number;
  sellerId: string;
  status: 'draft' | 'published';
  ratingAvg?: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerListingCreate {
  title: string;
  slug?: string;
  brand?: string;
  categoryId: string;
  priceCents: number;
  listPriceCents?: number;
  images: string[];
  bullets: string[];
  description?: string;
  attributes?: Record<string, string>;
  stock: number;
  status?: 'draft' | 'published';
}

export interface SellerListingUpdate {
  title?: string;
  brand?: string;
  categoryId?: string;
  priceCents?: number;
  listPriceCents?: number;
  images?: string[];
  bullets?: string[];
  description?: string;
  attributes?: Record<string, string>;
  stock?: number;
  status?: 'draft' | 'published';
}

export interface SellerListingsResponse {
  products: SellerListing[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SellerStats {
  totalListings: number;
  publishedCount: number;
  draftCount: number;
  totalOrders: number;
  totalRevenueCents: number;
  lowStockCount: number;
  outOfStockCount: number;
}

// Ads types
export type CampaignStatus = 'active' | 'paused';

export interface AdCampaign {
  id: string;
  advertiserId: string;
  productId: string;
  keywords: string[];
  bidCents: number;
  dailyBudgetCents: number;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdCampaignWithStats extends AdCampaign {
  spentTodayCents: number;
  impressionsToday: number;
  clicksToday: number;
}

export interface SponsoredProductResult {
  campaignId: string;
  productId: string;
  bidCents: number;
  secondPriceCents: number;
}

// Legacy Campaign type for backward compatibility
export type CampaignType = 'sponsored_product' | 'sponsored_brand' | 'display';

export interface Campaign {
  id: string;
  sellerId: string;
  name: string;
  type: CampaignType;
  status: 'draft' | 'active' | 'paused' | 'ended';
  budgetCents: number;
  spentCents: number;
  startDate: string;
  endDate?: string;
  targetingKeywords?: string[];
  productIds: string[];
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
  updatedAt: string;
}

// Search types
export interface SearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  brand?: string[];
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: ProductListItem[];
  total: number;
  page: number;
  totalPages: number;
  facets: {
    brands: { name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
    categories: { id: string; name: string; count: number }[];
  };
}

// Wishlist types
export interface WishlistItem {
  id: string;
  productId: string;
  product: ProductListItem;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

// Create Order types
export interface CreateOrderData {
  shippingAddress: Omit<Address, 'id' | 'isDefault'>;
  paymentMethod: 'credit_card' | 'pay_on_delivery';
  paymentDetails?: {
    cardLastFour?: string;
  };
}

export interface OrderList {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}
