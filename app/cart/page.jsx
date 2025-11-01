"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";
import Image from "next/image";
import Link from "next/link.js";
import { Button } from "@/components/ui/button.jsx";
import { useRouter } from "next/navigation.js";
import CheckoutComponent from "@/components/shprkt_chkout_btn.jsx";

const CartPage = () => {
  const router = useRouter();
  const {
    cart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    getTotalPrice,
  } = useCart();

  const [isLoading, setIsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const total = getTotalPrice();
  const delivery = cart.length > 0 ? "Calculated at checkout" : "—";
  const tax = Math.round((total / 100) * 12);

  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-10">
      {[1, 2].map((i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // 🧩 Generate Shiprocket Token
  const getToken = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty 🛒");
      return false;
    }

    try {
      setSummaryLoading(true);

      const cartItems = cart.map((item) => ({
        variant_id: item.shprkt_id,
        quantity: item.quantity,
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/general/shiprocket/generate-access-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart_data: { items: cartItems },
            redirect_url: "http://localhost:3000/order-success", // ✅ Change this when deployed
            timestamp: new Date().toISOString(),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || !data?.data?.token) {
        throw new Error(data?.message || "Failed to generate token");
      }

      setToken(data.data.token);
      return true;
    } catch (error) {
      console.error("Error during checkout:", error);
      alert(error.message || "Something went wrong during checkout");
      return false;
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleProceed = async (e) => {
    e.preventDefault();
    const success = await getToken();
    if (success) setShowSummary(true);
  };

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16 pt-0">
      <div className="mx-auto mt-5 max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          Shopping Cart
        </h2>
        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          {/* 🛒 Cart Items */}
          <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl md:justify-center">
            <div className="space-y-5">
              {isLoading ? (
                <SkeletonLoader />
              ) : cart.length === 0 ? (
                <p className="text-2xl font-serif text-center">
                  Your cart is empty.
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.variantSku}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-800 md:p-6"
                  >
                    <div className="div flex md:flex-col justify-start">
                      <div className="flex order-2 items-start md:w-full justify-end">
                        <button
                          onClick={() => removeFromCart(item.variantSku)}
                          type="button"
                          className="inline-flex items-center text-sm font-medium text-red-600 hover:underline dark:text-red-500"
                        >
                          <svg
                            className="me-1.5 h-5 w-4 md:w-5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M6 18 17.94 6M18 18 6.06 6"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="md:order-2 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                        <div className="div flex items-center gap-5">
                          <Link
                            href={`/products/${item.variantSku}`}
                            className="w-20 shrink-0 md:order-1"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={250}
                              height={250}
                              objectFit="contain"
                              className="size-20"
                            />
                          </Link>
                          <div className="w-full min-w-0 flex-1 space-y-4 sm:order-2 md:max-w-md">
                            <Link
                              href={`/products/${item.variantSku}`}
                              className="text-xl font-semibold uppercase text-gray-900 hover:underline dark:text-white"
                            >
                              {item.name + " - " + item.size}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-between md:order-3 md:justify-end">
                      <div className="flex order-2 sm:order-1 items-center gap-3">
                        <p className="text-base hidden sm:block">
                          Choose quantity :
                        </p>
                        <button
                          onClick={() => decrementQuantity(item.variantSku)}
                          className="p-2 text-base font-bold border"
                        >
                          ➖
                        </button>
                        <span className="mx-2 text-lg">{item.quantity}</span>
                        <button
                          onClick={() => incrementQuantity(item.variantSku)}
                          className="p-2 text-base font-bold border"
                        >
                          ➕
                        </button>
                      </div>
                      <div className="text-end order-1 sm:order-2 md:order-4 md:w-32 mr-0">
                        <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                          {"₹ " + item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 📦 Order Summary Section */}
          <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                Order Summary
              </p>
              <div className="space-y-4">
                <dl className="flex items-center justify-between gap-4">
                  <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Total Price :
                  </dt>
                  <dd className="text-base font-medium text-gray-900 dark:text-white">
                    ₹ {total}
                  </dd>
                </dl>
                <dl className="flex items-center justify-between gap-4">
                  <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Delivery Charges :
                  </dt>
                  <dd className="text-[12px] font-medium text-gray-900 dark:text-white">
                    {delivery}
                  </dd>
                </dl>
                <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
                  <dt className="text-base font-bold text-gray-900 dark:text-white">
                    Total (Inclusive Tax)
                  </dt>
                  <dd className="text-base font-bold text-gray-900 dark:text-white">
                    ₹ {Math.floor(total)}
                  </dd>
                </dl>
              </div>

              <Button
                disabled={cart.length === 0 || summaryLoading}
                onClick={handleProceed}
                className="flex w-full items-center justify-center rounded-lg bg-lime-500 p-2 text-lg font-semibold"
              >
                {summaryLoading ? "Loading..." : "Proceed to Checkout"}
              </Button>

              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  or
                </span>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline dark:text-primary-500"
                >
                  Continue Shopping
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 12H5m14 0-4 4m4-4-4-4"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 💳 Checkout Summary Modal */}
      {showSummary && token && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative">
            <button
              onClick={() => setShowSummary(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Checkout Summary
            </h3>

            <div className="space-y-3 text-gray-700 dark:text-gray-300 mb-5">
              <p>Total Items : {cart.length}</p>
              <p>Delivery : {delivery}</p>
              <hr className="my-3 border-gray-300 dark:border-gray-700" />
              <p className="text-xl font-bold">Total : ₹ {total}</p>
            </div>

            <CheckoutComponent token={token} />
          </div>
        </div>
      )}
    </section>
  );
};

export default CartPage;
