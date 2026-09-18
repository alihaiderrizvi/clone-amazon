'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-green-500' };
  return { score, label: 'Very Strong', color: 'bg-green-600' };
}

export function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

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

    if (!acceptedTerms) {
      setError('You must accept the terms and conditions');
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

          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
            />
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full ${
                        level <= passwordStrength.score
                          ? passwordStrength.color
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${
                  passwordStrength.score <= 1 ? 'text-red-600' :
                  passwordStrength.score <= 2 ? 'text-orange-600' :
                  passwordStrength.score <= 3 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  Password strength: {passwordStrength.label}
                </p>
              </div>
            )}
          </div>

          <Input
            label="Re-enter password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {/* Terms Acceptance */}
          <label className="flex items-start gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-[#FF9900] focus:ring-[#FF9900]"
              required
            />
            <span className="text-gray-600">
              I agree to the{' '}
              <Link href="#" className="text-[#007185] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-[#007185] hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          <Button type="submit" className="w-full" isLoading={isLoading} disabled={!acceptedTerms}>
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
