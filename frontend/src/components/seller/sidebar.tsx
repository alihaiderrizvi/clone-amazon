'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Megaphone,
  BarChart3,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    href: '/seller/ads',
    icon: Megaphone,
    children: [
      { name: 'Ad Dashboard', href: '/seller/ads' },
      { name: 'Campaigns', href: '/seller/ads/campaigns' },
      { name: 'Create Campaign', href: '/seller/ads/campaigns/new' },
    ],
  },
  {
    name: 'Analytics',
    href: '/seller/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/seller/settings',
    icon: Settings,
  },
];

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/seller" className="font-bold text-lg">
          <span className="text-[#232F3E]">Seller</span>
          <span className="text-[#FF9900]">Central</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.children && item.children.some((child) => pathname === child.href));
          const Icon = item.icon;

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
      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200">
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
