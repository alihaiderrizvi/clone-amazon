'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Store, User, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { createSellerAccount } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [storeName, setStoreName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill email from user profile
  useState(() => {
    if (user?.email) {
      setContactEmail(user.email);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      await createSellerAccount({
        storeName,
        displayName,
        contactEmail,
      });
      
      // Redirect to seller dashboard on success
      router.push('/seller');
    } catch (err) {
      console.error('Failed to create seller account:', err);
      setError(err instanceof Error ? err.message : 'Failed to create seller account');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9900]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
        <p className="text-gray-600 mb-6">
          You need to be signed in to become a seller.
        </p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="h-16 w-16 bg-[#FFEFD6] rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="h-8 w-8 text-[#C7511F]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Become a Seller</h1>
        <p className="text-gray-600 mt-2">
          Start selling to millions of customers on Amazon Clone
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set Up Your Store</CardTitle>
          <CardDescription>
            Tell us about your store to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Store className="h-4 w-4 inline mr-1" />
                  Store Name
                </label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g., TechGadgets Store"
                  required
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be visible to customers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Display Name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., TechGadgets"
                  required
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  A short name for your seller profile
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@yourstore.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  For customer inquiries and important updates
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FF9900] focus:ring-[#FF9900]"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="#" className="text-[#007185] hover:underline">
                    Seller Agreement
                  </Link>
                  {' '}and{' '}
                  <Link href="#" className="text-[#007185] hover:underline">
                    Privacy Policy
                  </Link>
                  . I understand that I am responsible for complying with all applicable laws and regulations.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !termsAccepted}
              isLoading={isLoading}
            >
              Create Seller Account
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Why Sell on Amazon Clone?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium">Reach Millions</p>
            <p className="text-xs text-gray-500">Access our large customer base</p>
          </div>
          <div className="text-center p-4">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium">Easy Management</p>
            <p className="text-xs text-gray-500">Powerful seller tools</p>
          </div>
          <div className="text-center p-4">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium">Grow Your Business</p>
            <p className="text-xs text-gray-500">Advertising & analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
