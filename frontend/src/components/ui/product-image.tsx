'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

type ProductImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string | null;
  alt: string;
};

/**
 * Next/Image wrapper that falls back to a local placeholder when a remote
 * product photo 404s (otherwise browsers show the alt/title text).
 */
export function ProductImage({ src, alt, ...props }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? '/placeholder-product.svg' : src;

  return (
    <Image
      {...props}
      src={resolved}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}
