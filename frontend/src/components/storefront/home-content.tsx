'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductListItem } from '@/types';
import { ProductRail, ProductRailSkeleton } from './product-rail';
import { mockProducts } from '@/lib/api';

// Hero banner slides
const heroSlides = [
  {
    id: 1,
    title: 'Welcome to AmazonClone',
    subtitle: 'Shop millions of products with fast delivery',
    gradient: 'from-[#232F3E] via-[#37475A] to-[#485769]',
    cta: 'Start Shopping',
    href: '/search',
  },
  {
    id: 2,
    title: 'Electronics Deals',
    subtitle: 'Up to 50% off on the latest tech',
    gradient: 'from-[#1E3A5F] via-[#2C5282] to-[#3B82F6]',
    cta: 'Shop Electronics',
    href: '/search?category=electronics',
  },
  {
    id: 3,
    title: 'New Arrivals',
    subtitle: 'Discover the latest trending products',
    gradient: 'from-[#5B21B6] via-[#7C3AED] to-[#A78BFA]',
    cta: 'Explore Now',
    href: '/search?sort=newest',
  },
];

// Category cards
const categories = [
  { name: 'Electronics', href: '/search?category=electronics', image: '🎧', bg: 'bg-blue-50' },
  { name: 'Fashion', href: '/search?category=fashion', image: '👕', bg: 'bg-pink-50' },
  { name: 'Home & Kitchen', href: '/search?category=home-kitchen', image: '🏠', bg: 'bg-amber-50' },
  { name: 'Books', href: '/search?category=books', image: '📚', bg: 'bg-green-50' },
  { name: 'Toys & Games', href: '/search?category=toys-games', image: '🎮', bg: 'bg-purple-50' },
  { name: 'Sports', href: '/search?category=sports-outdoors', image: '⚽', bg: 'bg-orange-50' },
  { name: 'Beauty', href: '/search?category=beauty-personal-care', image: '💄', bg: 'bg-rose-50' },
  { name: 'Groceries', href: '/search?category=groceries', image: '🛒', bg: 'bg-lime-50' },
];

interface ProductRailData {
  title: string;
  products: ProductListItem[];
  seeAllLink: string;
}

export function HomeContent() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [productRails, setProductRails] = useState<ProductRailData[]>([]);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Load products (with fallback to mock data)
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        // Try to fetch from API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/products?limit=24`);
        if (response.ok) {
          const data = await response.json();
          const products = data.data || data.products || data;
          
          // Split products into different rails
          setProductRails([
            {
              title: 'Top in Electronics',
              products: products.slice(0, 6),
              seeAllLink: '/search?category=electronics',
            },
            {
              title: 'Deals of the Day',
              products: products.slice(0, 6).filter((p: ProductListItem) => p.listPriceCents),
              seeAllLink: '/search?deals=true',
            },
            {
              title: 'Best Sellers',
              products: products.slice(2, 8),
              seeAllLink: '/search?sort=bestsellers',
            },
            {
              title: 'Recommended for You',
              products: products.slice(0, 6).reverse(),
              seeAllLink: '/search',
            },
          ]);
        } else {
          throw new Error('API not available');
        }
      } catch {
        // Fallback to mock data
        setProductRails([
          {
            title: 'Top in Electronics',
            products: mockProducts.slice(0, 6),
            seeAllLink: '/search?category=electronics',
          },
          {
            title: 'Deals of the Day',
            products: mockProducts.filter(p => p.listPriceCents).slice(0, 6),
            seeAllLink: '/search?deals=true',
          },
          {
            title: 'Best Sellers',
            products: mockProducts.slice(2, 8),
            seeAllLink: '/search?sort=bestsellers',
          },
          {
            title: 'Recommended for You',
            products: [...mockProducts].reverse().slice(0, 6),
            seeAllLink: '/search',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <>
      {/* Hero Banner Carousel */}
      <div className="relative h-[250px] sm:h-[350px] md:h-[400px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 bg-gradient-to-r ${slide.gradient} ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="max-w-[1500px] mx-auto px-4 h-full flex flex-col justify-center">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">
                {slide.title}
              </h1>
              <p className="text-gray-200 text-base sm:text-lg md:text-xl mb-4 sm:mb-6 max-w-xl">
                {slide.subtitle}
              </p>
              <Link
                href={slide.href}
                className="inline-block bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-md w-fit text-sm sm:text-base transition-colors"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-100 to-transparent" />
      </div>

      {/* Category Cards */}
      <div className="max-w-[1500px] mx-auto px-4 -mt-12 sm:-mt-16 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className={`${category.bg} rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-all hover:scale-105 text-center`}
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{category.image}</div>
              <h3 className="font-medium text-xs sm:text-sm text-gray-900 leading-tight">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Product Rails */}
      <div className="max-w-[1500px] mx-auto px-4 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {isLoading ? (
          <>
            <ProductRailSkeleton />
            <ProductRailSkeleton />
            <ProductRailSkeleton />
          </>
        ) : (
          productRails.map((rail, index) => (
            <ProductRail
              key={index}
              title={rail.title}
              products={rail.products}
              seeAllLink={rail.seeAllLink}
            />
          ))
        )}
      </div>

      {/* Deals Banner */}
      <section className="max-w-[1500px] mx-auto px-4 pb-6 sm:pb-8">
        <div className="relative bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-lg p-6 sm:p-8 text-white overflow-hidden">
          <div className="relative z-10">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-2 py-1 rounded mb-2">
              LIMITED TIME
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Up to 50% Off</h2>
            <p className="text-base sm:text-lg mb-4 opacity-90">
              Save big on top brands during our summer sale
            </p>
            <Link
              href="/search?deals=true"
              className="inline-block bg-white text-gray-900 font-medium px-4 sm:px-6 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              Shop Deals
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 right-20 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full translate-y-1/2" />
        </div>
      </section>

      {/* Sign In Banner (for non-authenticated users) */}
      <section className="max-w-[1500px] mx-auto px-4 pb-6 sm:pb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Sign in for the best experience</h3>
          <p className="text-gray-600 text-sm mb-4">
            Personalized recommendations, faster checkout, and more.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium px-8 py-2 rounded-md transition-colors"
          >
            Sign in securely
          </Link>
          <p className="text-xs text-gray-500 mt-3">
            New customer?{' '}
            <Link href="/signup" className="text-[#007185] hover:text-[#C7511F] hover:underline">
              Start here
            </Link>
          </p>
        </div>
      </section>

      {/* Become a Seller CTA */}
      <section className="max-w-[1500px] mx-auto px-4 pb-8 sm:pb-12">
        <div className="bg-[#232F3E] rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Become a Seller</h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Start selling your products to millions of customers today
            </p>
          </div>
          <Link
            href="/seller/onboarding"
            className="bg-[#FF9900] hover:bg-[#E88B00] text-white font-medium px-6 py-2.5 sm:py-3 rounded-md whitespace-nowrap transition-colors text-sm sm:text-base"
          >
            Start Selling
          </Link>
        </div>
      </section>
    </>
  );
}
