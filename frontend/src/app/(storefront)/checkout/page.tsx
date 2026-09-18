'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const { items, subtotalCents, itemCount } = useCart();
  const [step, setStep] = useState(1);

  const shippingCents = 0; // Free shipping
  const taxCents = Math.round(subtotalCents * 0.08); // 8% tax
  const totalCents = subtotalCents + shippingCents + taxCents;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add some items to your cart to checkout.</p>
        <Link href="/search">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Checkout Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              amazon<span className="text-[#FF9900]">.clone</span>
            </Link>
            <h1 className="text-2xl">Checkout</h1>
            <Lock className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Checkout Steps */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Shipping Address */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#232F3E] text-white rounded-full text-sm flex items-center justify-center">
                    1
                  </span>
                  Shipping address
                </CardTitle>
                {step > 1 && (
                  <Button variant="link" onClick={() => setStep(1)}>
                    Change
                  </Button>
                )}
              </CardHeader>
              {step === 1 && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="First name" placeholder="John" required />
                    <Input label="Last name" placeholder="Doe" required />
                  </div>
                  <Input label="Address line 1" placeholder="123 Main Street" required />
                  <Input label="Address line 2 (optional)" placeholder="Apt, suite, unit, etc." />
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="City" placeholder="New York" required />
                    <Input label="State" placeholder="NY" required />
                    <Input label="ZIP Code" placeholder="10001" required />
                  </div>
                  <Input label="Phone number" type="tel" placeholder="(555) 123-4567" required />
                  <Button onClick={() => setStep(2)} className="mt-4">
                    Use this address
                  </Button>
                </CardContent>
              )}
              {step > 1 && (
                <CardContent>
                  <p className="text-sm text-gray-600">
                    John Doe<br />
                    123 Main Street<br />
                    New York, NY 10001<br />
                    (555) 123-4567
                  </p>
                </CardContent>
              )}
            </Card>

            {/* Step 2: Payment Method */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className={`w-6 h-6 ${step >= 2 ? 'bg-[#232F3E]' : 'bg-gray-300'} text-white rounded-full text-sm flex items-center justify-center`}>
                    2
                  </span>
                  Payment method
                </CardTitle>
                {step > 2 && (
                  <Button variant="link" onClick={() => setStep(2)}>
                    Change
                  </Button>
                )}
              </CardHeader>
              {step === 2 && (
                <CardContent className="space-y-4">
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <label className="flex items-center gap-3">
                      <input type="radio" name="payment" defaultChecked className="text-[#FF9900]" />
                      <span className="font-medium">Credit or Debit Card</span>
                    </label>
                    <div className="mt-4 space-y-4 pl-7">
                      <Input label="Card number" placeholder="1234 5678 9012 3456" required />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Expiration date" placeholder="MM/YY" required />
                        <Input label="CVV" placeholder="123" required />
                      </div>
                      <Input label="Name on card" placeholder="John Doe" required />
                    </div>
                  </div>
                  <Button onClick={() => setStep(3)} className="mt-4">
                    Use this payment method
                  </Button>
                </CardContent>
              )}
              {step > 2 && (
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Visa ending in 3456
                  </p>
                </CardContent>
              )}
            </Card>

            {/* Step 3: Review & Place Order */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className={`w-6 h-6 ${step >= 3 ? 'bg-[#232F3E]' : 'bg-gray-300'} text-white rounded-full text-sm flex items-center justify-center`}>
                    3
                  </span>
                  Review items and shipping
                </CardTitle>
              </CardHeader>
              {step === 3 && (
                <CardContent>
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <p className="text-green-700 font-medium mb-2">
                      Arriving: Tuesday, Jan 7
                    </p>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.productId} className="flex gap-4">
                          <Image
                            src={item.product.mainImage || '/placeholder-product.png'}
                            alt={item.product.title}
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                          <div className="flex-1">
                            <p className="text-sm line-clamp-2">{item.product.title}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium">{formatPrice(item.product.priceCents)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" size="lg">
                    Place your order
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    By placing your order, you agree to Amazon Clone&apos;s privacy notice and conditions of use.
                  </p>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                {step === 3 && (
                  <Button className="w-full mb-4" size="lg">
                    Place your order
                  </Button>
                )}

                <h2 className="text-lg font-bold mb-4">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Items ({itemCount}):</span>
                    <span>{formatPrice(subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping & handling:</span>
                    <span>{formatPrice(shippingCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated tax:</span>
                    <span>{formatPrice(taxCents)}</span>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="flex justify-between text-lg font-bold text-[#B12704]">
                  <span>Order total:</span>
                  <span>{formatPrice(totalCents)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
