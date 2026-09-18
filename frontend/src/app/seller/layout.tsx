'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SellerSidebar } from '@/components/seller/sidebar';
import { User, Bell, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9900]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <SellerSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium text-gray-800">Seller Central</h1>
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
                  {user?.displayName || 'Seller'}
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
