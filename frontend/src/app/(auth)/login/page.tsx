import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Sign In - Amazon Clone',
};

function LoginFormFallback() {
  return (
    <div className="w-full max-w-[350px] animate-pulse">
      <div className="h-12 bg-gray-200 rounded mb-6 mx-auto w-48" />
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="h-8 bg-gray-200 rounded mb-4 w-24" />
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
