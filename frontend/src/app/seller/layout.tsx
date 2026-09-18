'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SellerSidebar } from '@/components/seller/sidebar';
import { User, Bell, HelpCircle, LogOut } from 'lucide-react';
import { checkSellerStatus } from '@/lib/api';
import { Seller } from '@/types';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: authLoading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isCheckingSeller, setIsCheckingSeller] = useState(true);

  // Pages that don't require seller status
  const isOnboardingPage = pathname === '/seller/onboarding';

  useEffect(() => {
    async function checkSeller() {
      if (authLoading) return;
      
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/login?redirect=/seller');
        return;
      }

      // If on onboarding page, allow access
      if (isOnboardingPage) {
        setIsCheckingSeller(false);
        return;
      }

      try {
        const { isSeller, seller: sellerData } = await checkSellerStatus();
        
        if (!isSeller) {
          // Redirect to onboarding if not a seller
          router.push('/seller/onboarding');
          return;
        }
        
        setSeller(sellerData || null);
      } catch (err) {
        console.error('Failed to check seller status:', err);
        // On error, redirect to onboarding
        router.push('/seller/onboarding');
      } finally {
        setIsCheckingSeller(false);
      }
    }

    checkSeller();
  }, [authLoading, isAuthenticated, isOnboardingPage, router]);

  // Show loading while checking auth or seller status
  if (authLoading || (isCheckingSeller && !isOnboardingPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9900] mx-auto mb-4" />
          <p className="text-gray-600">Loading Seller Central...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - hide on onboarding */}
      {!isOnboardingPage && <SellerSidebar seller={seller} />}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isOnboardingPage ? '' : ''}`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/seller" className="font-bold text-lg">
              <span className="text-[#232F3E]">Seller</span>
              <span className="text-[#FF9900]">Central</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Help */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {seller?.displayName || user?.displayName || 'Seller'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="ml-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
