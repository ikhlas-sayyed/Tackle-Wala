'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../../lib/api-client';
import { Edit2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const user = useAuthStore((state) => state.user);

  const [mounted, setMounted] = useState(false);
  const [hasStoredAddress, setHasStoredAddress] = useState(false);
  const [storedAddressId, setStoredAddressId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for stored address in localStorage
    const storedAddress = localStorage.getItem('checkout_address');
    const storedId = localStorage.getItem('checkout_address_id');
    
    if (storedAddress && storedId) {
      try {
        const parsedAddress = JSON.parse(storedAddress);
        setFormData(parsedAddress);
        setStoredAddressId(storedId);
        setHasStoredAddress(true);
      } catch (error) {
        console.error('Error parsing stored address:', error);
        localStorage.removeItem('checkout_address');
        localStorage.removeItem('checkout_address_id');
      }
    }
  }, []);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if (window.Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (orderId: string, razorOrderId: string) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setErrorMessage('Failed to load Razorpay SDK. Please try again.');
      setIsProcessing(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: totalPrice() * 100,
      currency: 'INR',
      name: 'My Store',
      description: 'Order Payment',
      order_id: razorOrderId,
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: '#3399cc',
      },
      handler: async function (response: any) {
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, orderId }),
          });

          const result = await verifyRes.json();

          if (result.success) {
            clearCart();
            router.push(`/payment/success/`);
          } else {
            setErrorMessage(result.error || 'Payment verification failed.');
            setIsProcessing(false);
          }
        } catch (err) {
          console.error('Payment verification error:', err);
          setErrorMessage('Error verifying payment. Please contact support.');
          setIsProcessing(false);
        }
      },
      modal: {
        ondismiss: function () {
          setErrorMessage('Payment was cancelled. Please try again.');
          setIsProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleEditAddress = () => {
    localStorage.removeItem('checkout_address');
    localStorage.removeItem('checkout_address_id');
    setHasStoredAddress(false);
    setStoredAddressId(null);
    setErrorMessage('');
  };

  if (!mounted) return null;
  if (items.length === 0 && !isProcessing) {
    router.push('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      let addressId = storedAddressId;

      // Create new address if not stored
      if (!storedAddressId || !hasStoredAddress) {
        const addressResp = await apiClient.createAddress({
          fullName: formData.fullName,
          phone: formData.phone,
          line1: formData.line1,
          line2: formData.line2 || '',
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        });

        if (!addressResp.success || !addressResp.data) {
          throw new Error(addressResp.error || 'Failed to create address');
        }

        addressId = addressResp.data.id;

        // Save to localStorage
        localStorage.setItem('checkout_address', JSON.stringify(formData));
        localStorage.setItem('checkout_address_id', addressId);
      }

      // Validate prices
      const itemsPayload = items.map(item => {
        const price = Number(item.price);
        if (!price || price <= 0) {
          throw new Error(`Invalid price for item ${item.name}`);
        }
        return {
          productId: item.productId,
          ...(item.variantId ? { variantId: item.variantId } : {}),
          quantity: item.quantity,
          price,
        };
      });

      // Create order
      const orderResp = user
        ? await apiClient.createOrder({ customerId: user.id, addressId, items: itemsPayload })
        : await apiClient.createGuestOrder({
          addressId,
          guestName: formData.fullName,
          guestEmail: formData.email || formData.fullName.replace(/\s+/g, '') + '@guest.com',
          guestPhone: formData.phone,
          items: itemsPayload,
        });

      if (!orderResp.success || !orderResp.data) {
        throw new Error(orderResp.error || 'Failed to create order');
      }

      const orderId = orderResp.data.id;

      // Initiate payment
      const paymentResp = await apiClient.initiatePayment({
        orderId,
        amount: totalPrice(),
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      });

      if (paymentResp.success && paymentResp.data) {
        await handlePayment(
          paymentResp.data.orderId,
          paymentResp.data.razorOrder.id,
        );
      } else {
        throw new Error(paymentResp.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'There was an error processing your order. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Shipping Information</h2>
                {hasStoredAddress && (
                  <button
                    type="button"
                    onClick={handleEditAddress}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Edit2 size={16} />
                    Edit Address
                  </button>
                )}
              </div>

              {hasStoredAddress ? (
                <form onSubmit={handleSubmit}>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Saved Address</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                      <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                      <p><span className="font-medium">Address:</span> {formData.line1}{formData.line2 ? `, ${formData.line2}` : ''}</p>
                      <p><span className="font-medium">City:</span> {formData.city}, {formData.state} {formData.postalCode}</p>
                      <p><span className="font-medium">Country:</span> {formData.country}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                  >
                    {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      required
                      value={formData.line1}
                      onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.line2}
                      onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                  >
                    {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                    {item.image && (
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        ₹{((item.price ?? 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{totalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}