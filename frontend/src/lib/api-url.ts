/**
 * Browser requests on the deployed site go through a same-origin rewrite
 * (`/backend/*` → FastAPI) so CORS does not block catalog calls.
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '/backend';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

export function getProductImage(product: {
  mainImage?: string | null;
  images?: string[] | null;
} | null | undefined): string {
  return product?.mainImage || product?.images?.[0] || '/placeholder-product.svg';
}

export function withMainImage<T extends { mainImage?: string; images?: string[] }>(
  product: T
): T & { mainImage: string } {
  return {
    ...product,
    mainImage: getProductImage(product),
  };
}
