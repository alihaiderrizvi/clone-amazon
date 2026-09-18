'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, MapPin, ChevronDown, User, Heart, Package, LogOut, Settings } from 'lucide-react';
import { SearchBar } from './search-bar';
import { CartBadge } from './cart-badge';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAccountMenuOpen(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header */}
      <div className="bg-[#131921] text-white">
        <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
          <div className="flex items-center h-[60px] gap-2 sm:gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 px-2 py-2 hover:outline hover:outline-1 hover:outline-white rounded"
            >
              <span className="text-xl font-bold text-white">
                amazon<span className="text-[#FF9900]">.clone</span>
              </span>
            </Link>

            {/* Deliver To */}
            <button className="hidden md:flex items-center px-2 py-2 hover:outline hover:outline-1 hover:outline-white rounded">
              <MapPin className="h-5 w-5 text-white" />
              <div className="ml-1 text-left">
                <span className="block text-xs text-gray-300">Deliver to</span>
                <span className="block text-sm font-bold">Select location</span>
              </div>
            </button>

            {/* Search */}
            <div className="flex-1 min-w-0">
              <SearchBar />
            </div>

            {/* Account */}
            <div className="relative flex items-center" ref={menuRef}>
              {isLoading ? (
                <div className="px-2 py-2">
                  <div className="h-4 w-16 bg-gray-600 animate-pulse rounded" />
                </div>
              ) : isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="hidden sm:flex flex-col px-2 py-2 hover:outline hover:outline-1 hover:outline-white rounded"
                  >
                    <span className="text-xs text-gray-300">
                      Hello, {user?.displayName || 'User'}
                    </span>
                    <span className="text-sm font-bold flex items-center">
                      Account & Lists <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>

                  {/* Account Dropdown Menu */}
                  {isAccountMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          Your Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4" />
                          Wishlist
                        </Link>
                        <Link
                          href="/seller"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Seller Dashboard
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex flex-col px-2 py-2 hover:outline hover:outline-1 hover:outline-white rounded"
                >
                  <span className="text-xs text-gray-300">Hello, sign in</span>
                  <span className="text-sm font-bold flex items-center">
                    Account & Lists <ChevronDown className="h-3 w-3 ml-1" />
                  </span>
                </Link>
              )}

              {/* Mobile Account Icon */}
              <Link
                href={isAuthenticated ? '/orders' : '/login'}
                className="sm:hidden p-2 hover:outline hover:outline-1 hover:outline-white rounded"
              >
                <User className="h-6 w-6" />
              </Link>
            </div>

            {/* Returns & Orders */}
            <Link
              href="/orders"
              className="hidden sm:flex flex-col px-2 py-2 hover:outline hover:outline-1 hover:outline-white rounded"
            >
              <span className="text-xs text-gray-300">Returns</span>
              <span className="text-sm font-bold">& Orders</span>
            </Link>

            {/* Cart */}
            <CartBadge />
          </div>
        </div>
      </div>

      {/* Sub Header / Navigation */}
      <div className="bg-[#232F3E] text-white">
        <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
          <div className="flex items-center h-[39px] gap-1 overflow-x-auto text-sm">
            <button className="flex items-center px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap">
              <Menu className="h-5 w-5 mr-1" />
              <span className="font-bold">All</span>
            </button>
            <Link
              href="/search?category=deals"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap"
            >
              Today&apos;s Deals
            </Link>
            <Link
              href="/search?category=bestsellers"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap"
            >
              Best Sellers
            </Link>
            <Link
              href="/search?category=electronics"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap"
            >
              Electronics
            </Link>
            <Link
              href="/search?category=fashion"
              className="hidden md:block px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap"
            >
              Fashion
            </Link>
            <Link
              href="/search?category=home"
              className="hidden md:block px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap"
            >
              Home & Kitchen
            </Link>
            <Link
              href="/seller"
              className="hidden lg:block px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded whitespace-nowrap"
            >
              Sell
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
