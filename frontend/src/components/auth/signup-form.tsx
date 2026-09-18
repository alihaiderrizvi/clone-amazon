'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

export function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, name);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[350px]">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold text-[#232F3E]">
              amazon<span className="text-[#FF9900]">.clone</span>
            </span>
          </Link>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6 text-center">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-medium mb-2">Check your email</h2>
          <p className="text-gray-600 mb-4">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>
          </p>
          <Link href="/login">
            <Button variant="secondary" className="w-full">
              Back to Sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[350px]">
      {/* Logo */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block">
          <span className="text-3xl font-bold text-[#232F3E]">
            amazon<span className="text-[#FF9900]">.clone</span>
          </span>
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h1 className="text-2xl font-normal mb-4">Create account</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First and last name"
            required
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            autoComplete="new-password"
          />

          <Input
            label="Re-enter password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create your Amazon Clone account
          </Button>
        </form>

        <p className="text-xs text-gray-600 mt-4">
          By creating an account, you agree to Amazon Clone&apos;s{' '}
          <Link href="#" className="text-[#007185] hover:underline">
            Conditions of Use
          </Link>{' '}
          and{' '}
          <Link href="#" className="text-[#007185] hover:underline">
            Privacy Notice
          </Link>
          .
        </p>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#007185] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
