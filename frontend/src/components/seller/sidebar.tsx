'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Megaphone,
  BarChart3,
  Settings,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Seller } from '@/types';

interface SellerSidebarProps {
  seller?: Seller | null;
}

export function SellerSidebar({ seller }: SellerSidebarProps) {
  const pathname = usePathname();

  // Check if advertising is enabled (seller is also an advertiser)
  const isAdvertisingEnabled = seller?.isAdvertiser ?? false;

  const navigation = [
    {
      name: 'Dashboard',
      href: '/seller',
      icon: LayoutDashboard,
    },
    {
      name: 'Listings',
      href: '/seller/listings',
      icon: Package,
      children: [
        { name: 'All Listings', href: '/seller/listings' },
        { name: 'Add New Listing', href: '/seller/listings/new' },
      ],
    },
    {
      name: 'Advertising',
      href: isAdvertisingEnabled ? '/seller/ads' : '/seller/ads/enable',
      icon: Megaphone,
      disabled: !isAdvertisingEnabled,
      children: isAdvertisingEnabled
        ? [
            { name: 'Ad Dashboard', href: '/seller/ads' },
            { name: 'Campaigns', href: '/seller/ads/campaigns' },
            { name: 'Create Campaign', href: '/seller/ads/campaigns/new' },
          ]
        : undefined,
    },
    {
      name: 'Analytics',
      href: '/seller/analytics',
      icon: BarChart3,
      comingSoon: true,
    },
    {
      name: 'Settings',
      href: '/seller/settings',
      icon: Settings,
      comingSoon: true,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/seller" className="font-bold text-lg">
          <span className="text-[#232F3E]">Seller</span>
          <span className="text-[#FF9900]">Central</span>
        </Link>
      </div>

      {/* Store Info */}
      {seller && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-900 truncate">{seller.storeName}</p>
          <p className="text-xs text-gray-500">{seller.contactEmail}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.children && item.children.some((child) => pathname === child.href));
          const Icon = item.icon;
          const isDisabled = item.disabled || item.comingSoon;

          if (isDisabled) {
            return (
              <div key={item.name}>
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                  title={item.comingSoon ? 'Coming soon' : 'Enable advertising first'}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.disabled && !item.comingSoon && (
                    <Lock className="h-4 w-4" />
                  )}
                  {item.comingSoon && (
                    <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">Soon</span>
                  )}
                </div>
                
                {/* Show enable advertising link */}
                {item.disabled && !item.comingSoon && (
                  <Link
                    href="/seller/ads/enable"
                    className="block ml-8 mt-1 text-xs text-[#007185] hover:underline"
                  >
                    Enable Advertising →
                  </Link>
                )}
              </div>
            );
          }

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#FFEFD6] text-[#C7511F]'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {item.children && (
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isActive && 'rotate-90'
                    )}
                  />
                )}
              </Link>

              {/* Submenu */}
              {item.children && isActive && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block px-3 py-1.5 rounded text-sm transition-colors',
                        pathname === child.href
                          ? 'text-[#C7511F] font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Back to Store Link */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Store
        </Link>
      </div>
    </aside>
  );
}
