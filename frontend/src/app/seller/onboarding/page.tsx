'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Building2, User, FileText, CreditCard } from 'lucide-react';

const steps = [
  { id: 1, title: 'Account Type', icon: Building2 },
  { id: 2, title: 'Business Info', icon: FileText },
  { id: 3, title: 'Verification', icon: User },
  { id: 4, title: 'Payment', icon: CreditCard },
];

export default function SellerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<'individual' | 'business' | null>(null);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Become a Seller</h1>
        <p className="text-gray-600 mt-2">
          Start selling to millions of customers on Amazon Clone
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex flex-col items-center ${
                  isActive ? 'text-[#FF9900]' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive
                      ? 'border-[#FF9900] bg-[#FFEFD6]'
                      : isCompleted
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle>Choose your account type</CardTitle>
              <CardDescription>
                Select the type of account that best fits your selling needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={() => setAccountType('individual')}
                className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                  accountType === 'individual'
                    ? 'border-[#FF9900] bg-[#FFEFD6]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-[#C7511F]" />
                  <div>
                    <p className="font-medium">Individual</p>
                    <p className="text-sm text-gray-600">
                      Best for casual sellers. $0.99 per item sold.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAccountType('business')}
                className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                  accountType === 'business'
                    ? 'border-[#FF9900] bg-[#FFEFD6]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-[#C7511F]" />
                  <div>
                    <p className="font-medium">Professional</p>
                    <p className="text-sm text-gray-600">
                      Best for established businesses. $39.99/month, unlimited listings.
                    </p>
                  </div>
                </div>
              </button>

              <Button
                onClick={() => setCurrentStep(2)}
                className="w-full mt-4"
                disabled={!accountType}
              >
                Continue
              </Button>
            </CardContent>
          </>
        )}

        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Tell us about your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Business Name" placeholder="Your business name" />
              <Input label="Business Address" placeholder="123 Main Street" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" placeholder="New York" />
                <Input label="State" placeholder="NY" />
              </div>
              <Input label="Phone Number" type="tel" placeholder="(555) 123-4567" />
              <div className="flex gap-4 mt-4">
                <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>
                We need to verify your identity to protect buyers and sellers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Full Legal Name" placeholder="As it appears on your ID" />
              <Input label="Date of Birth" type="date" />
              <Input label="SSN / Tax ID (last 4 digits)" placeholder="XXXX" maxLength={4} />
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> This information is securely stored and used only for 
                  verification purposes. We comply with all privacy regulations.
                </p>
              </div>
              <div className="flex gap-4 mt-4">
                <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(4)} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 4 && (
          <>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Add a bank account to receive your earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Bank Name" placeholder="Your bank name" />
              <Input label="Account Holder Name" placeholder="Name on the account" />
              <Input label="Routing Number" placeholder="9 digit routing number" maxLength={9} />
              <Input label="Account Number" placeholder="Your account number" />
              <div className="flex gap-4 mt-4">
                <Button variant="secondary" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Link href="/seller" className="flex-1">
                  <Button className="w-full">Complete Registration</Button>
                </Link>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      <p className="text-center text-sm text-gray-500 mt-6">
        By registering, you agree to the{' '}
        <Link href="#" className="text-[#007185] hover:underline">
          Seller Agreement
        </Link>{' '}
        and{' '}
        <Link href="#" className="text-[#007185] hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
