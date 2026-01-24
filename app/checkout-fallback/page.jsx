'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function CheckoutFallbackPage() {
  const router = useRouter();
  const { cart, getTotalPrice } = useCart();


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Checkout Interrupted 😕
        </h1>
        <p className="text-gray-600 mb-6">
          Something went wrong while opening the checkout. Don’t worry — your
          cart is still safe.
        </p>

        {cart.length > 0 ? (
          <>
            <p className="text-lg font-semibold mb-4">
              Cart Total: ₹{getTotalPrice().toFixed(2)}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={()=>{router.push('/cart')}}
                className="bg-lime-500 hover:bg-lime-600 text-white font-medium px-5 py-2 rounded-lg transition-all"
              >
                 Try Checkout Again
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-5 py-2 rounded-lg transition-all"
              >
                Back to Cart
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => router.push('/')}
            className="bg-lime-500 hover:bg-lime-600 text-white font-medium px-5 py-2 rounded-lg transition-all"
          >
            Go to Home
          </button>
        )}
      </div>
      <p className="text-gray-400 text-sm mt-6">
        © {new Date().getFullYear()} BynaTablet.in
      </p>
    </div>
  );
}
