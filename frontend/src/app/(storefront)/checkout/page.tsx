'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronRight, Lock, CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice } from '@/lib/utils';
import { getProductImage } from '@/lib/api-url';
import { Address, CreateOrderData } from '@/types';
import * as api from '@/lib/api';

type PaymentMethod = 'credit_card' | 'pay_on_delivery';

interface ShippingFormData {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, itemCount, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Form state
  const [shippingAddress, setShippingAddress] = useState<ShippingFormData>({
    fullName: user?.displayName || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [saveAddress, setSaveAddress] = useState(false);

  const shippingCents = 0; // Free shipping
  const taxCents = Math.round(subtotalCents * 0.08); // 8% tax
  const totalCents = subtotalCents + shippingCents + taxCents;

  const handleShippingChange = (field: keyof ShippingFormData, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateShipping = (): boolean => {
    const required: (keyof ShippingFormData)[] = [
      'fullName', 'addressLine1', 'city', 'state', 'postalCode', 'phone'
    ];
    return required.every(field => shippingAddress[field].trim() !== '');
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setOrderError('');

    try {
      const orderData: CreateOrderData = {
        shippingAddress: {
          fullName: shippingAddress.fullName,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || undefined,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
        paymentMethod,
        paymentDetails: paymentMethod === 'credit_card' ? {
          cardLastFour: '4242', // Demo card
        } : undefined,
      };

      const order = await api.createOrder(orderData);
      setOrderId(order.id);
      await clearCart();
      setStep(4); // Order confirmation step
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderError(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order confirmation view
  if (step === 4 && orderId) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                amazon<span className="text-[#FF9900]">.clone</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-green-700 mb-2">Order Placed Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your order. Your order number is <strong>{orderId}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-8">
                We&apos;ve sent a confirmation email with order details and tracking information.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href={`/orders/${orderId}`}>
                  <Button variant="secondary">
                    <Package className="h-4 w-4 mr-2" />
                    View Order
                  </Button>
                </Link>
                <Link href="/search">
                  <Button>Continue Shopping</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl">Checkout ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h1>
            <Lock className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {orderError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {orderError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Checkout Steps */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Shipping Address */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className={`w-6 h-6 ${step >= 1 ? 'bg-[#232F3E]' : 'bg-gray-300'} text-white rounded-full text-sm flex items-center justify-center`}>
                    {step > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
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
                    <div className="col-span-2 sm:col-span-1">
                      <Input
                        label="Full name"
                        value={shippingAddress.fullName}
                        onChange={(e) => handleShippingChange('fullName', e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Input
                        label="Phone number"
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => handleShippingChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>
                  <Input
                    label="Address line 1"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => handleShippingChange('addressLine1', e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                  <Input
                    label="Address line 2 (optional)"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => handleShippingChange('addressLine2', e.target.value)}
                    placeholder="Apt, suite, unit, etc."
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="City"
                      value={shippingAddress.city}
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                      placeholder="New York"
                      required
                    />
                    <Input
                      label="State"
                      value={shippingAddress.state}
                      onChange={(e) => handleShippingChange('state', e.target.value)}
                      placeholder="NY"
                      required
                    />
                    <Input
                      label="ZIP Code"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                      placeholder="10001"
                      required
                    />
                  </div>
                  <Input
                    label="Country"
                    value={shippingAddress.country}
                    onChange={(e) => handleShippingChange('country', e.target.value)}
                    placeholder="United States"
                    required
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Save this address to my profile
                  </label>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!validateShipping()}
                    className="mt-4"
                  >
                    Continue to payment
                  </Button>
                </CardContent>
              )}
              {step > 1 && (
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {shippingAddress.fullName}<br />
                    {shippingAddress.addressLine1}<br />
                    {shippingAddress.addressLine2 && <>{shippingAddress.addressLine2}<br /></>}
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                    {shippingAddress.phone}
                  </p>
                </CardContent>
              )}
            </Card>

            {/* Step 2: Payment Method */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className={`w-6 h-6 ${step >= 2 ? 'bg-[#232F3E]' : 'bg-gray-300'} text-white rounded-full text-sm flex items-center justify-center`}>
                    {step > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
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
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer ${paymentMethod === 'credit_card' ? 'border-[#FF9900] bg-orange-50' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'credit_card'}
                        onChange={() => setPaymentMethod('credit_card')}
                        className="text-[#FF9900]"
                      />
                      <div className="flex-1">
                        <span className="font-medium">Credit or Debit Card</span>
                        <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                        <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer ${paymentMethod === 'pay_on_delivery' ? 'border-[#FF9900] bg-orange-50' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'pay_on_delivery'}
                        onChange={() => setPaymentMethod('pay_on_delivery')}
                        className="text-[#FF9900]"
                      />
                      <div className="flex-1">
                        <span className="font-medium">Pay on Delivery</span>
                        <p className="text-sm text-gray-500">Cash or card payment on delivery</p>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'credit_card' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Demo Mode:</strong> No actual payment will be processed.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Using test card ending in 4242
                      </div>
                    </div>
                  )}

                  <Button onClick={() => setStep(3)} className="mt-4">
                    Review your order
                  </Button>
                </CardContent>
              )}
              {step > 2 && (
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === 'credit_card' ? 'Credit Card ending in 4242' : 'Pay on Delivery'}
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
                      Estimated delivery: 3-5 business days
                    </p>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.productId} className="flex gap-4">
                          <Image
                            src={getProductImage(item.product)}
                            alt={item.product.title}
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                          <div className="flex-1">
                            <p className="text-sm line-clamp-2">{item.product.title}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium">{formatPrice(item.product.priceCents * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
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
                  <Button
                    className="w-full mb-4"
                    size="lg"
                    onClick={handlePlaceOrder}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
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
                    <span className="text-green-600">{shippingCents === 0 ? 'FREE' : formatPrice(shippingCents)}</span>
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
