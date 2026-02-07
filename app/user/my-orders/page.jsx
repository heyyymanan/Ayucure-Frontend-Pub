"use client";

import { useState } from "react";
import axios from "axios";
import {
  FaBoxOpen,
  FaSearch,
  FaArrowLeft,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPhoneAlt
} from 'react-icons/fa';
import Image from "next/image";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [inputError, setInputError] = useState("");

  // --- Validation Logic ---
  const validatePhone = (number) => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!number) return "Phone number is required.";
    if (number.length !== 10) return "Phone number must be 10 digits.";
    if (!indianPhoneRegex.test(number)) return "Invalid mobile number format.";
    return "";
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);

    if (value.length === 10) {
      setInputError("");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const validationError = validatePhone(phone);
    if (validationError) {
      setInputError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setInputError("");
    setHasSearched(true);
    setOrders([]);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/orders/search`,
        { phone }
      );

      const sortedOrders = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sortedOrders);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setOrders([]);
      } else {
        setError("Unable to fetch orders. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setHasSearched(false);
    setOrders([]);
    setPhone("");
    setError("");
    setInputError("");
  };

  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'canceled': return 'bg-red-100 text-red-700 border-red-200';
      case 'shipped':
      case 'in-transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <FaCheckCircle className="mr-1.5" />;
      case 'canceled': return <FaTimesCircle className="mr-1.5" />;
      case 'shipped':
      case 'in-transit': return <FaShippingFast className="mr-1.5" />;
      default: return <FaClock className="mr-1.5" />;
    }
  };

  return (
    // Main Container: Full screen height, Flex row
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans">

      {/* LEFT SIDE: Content Area (Scrollable) */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center py-12 px-6 sm:px-12 lg:min-h-screen">
        <div className={`w-full transition-all duration-500 my-auto ${hasSearched ? 'max-w-2xl' : 'max-w-md'}`}>

          {/* HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Track Your <span className="text-lime-500">Orders</span>
            </h1>
            <p className="text-gray-500 text-base">
              {hasSearched
                ? "Here are the details of your recent purchases."
                : "Enter your registered mobile number to view history."
              }
            </p>
          </div>

          {/* --- SEARCH FORM SECTION --- */}
          {!hasSearched ? (
            <div className="space-y-8">
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-medium border-r border-gray-200 pr-3">+91</span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={handleInputChange}
                      placeholder="Enter Phone Number"
                      className={`block w-full pl-16 pr-4 py-4 border rounded-xl text-lg transition-all duration-200 outline-none
                        ${inputError
                          ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-300 focus:border-lime-500 focus:ring-4 focus:ring-lime-100 bg-white'
                        }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                      <FaPhoneAlt />
                    </div>
                  </div>
                  {inputError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-pulse font-medium">
                      <FaTimesCircle className="mr-1.5" /> {inputError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-lime-500/30 text-base font-bold text-black bg-lime-500 hover:bg-lime-400 focus:outline-none focus:ring-4 focus:ring-lime-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch className="mr-2" /> Find Orders
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (

            /* --- RESULTS SECTION --- */
            <div className="animate-fade-in-up space-y-8 pb-10">

              {/* Navigation Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                <button
                  onClick={resetSearch}
                  className="group flex items-center text-sm font-semibold text-gray-600 hover:text-black transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-full mr-3 group-hover:bg-lime-100 group-hover:text-lime-700 transition-colors">
                    <FaArrowLeft />
                  </div>
                  Search Another
                </button>
                <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  Results for: <span className="font-bold text-gray-900 font-mono">{phone}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center shadow-sm">
                  <p className="font-semibold">{error}</p>
                </div>
              )}

              {/* No Orders State */}
              {!loading && orders.length === 0 && !error && (
                <div className="text-center py-10">
                  <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaBoxOpen className="text-5xl text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                    We couldn't find any orders linked to this number.
                  </p>
                  <button
                    onClick={resetSearch}
                    className="text-lime-600 font-bold hover:underline"
                  >
                    Try a different number
                  </button>
                </div>
              )}

              {/* Loading Skeleton */}
              {loading && (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              )}

              {/* Order Cards List */}
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-lime-200 group"
                  >
                    {/* Card Header */}
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Order ID</span>
                        <div className="text-gray-900 font-mono font-bold text-lg">#{order.orderId}</div>
                      </div>

                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1.5">{order.status}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="flex flex-col gap-6">

                        {/* Order Items */}
                        <div>
                          <ul className="space-y-3">
                            {order.orderItems?.map((item, i) => (
                              <li key={i} className="flex justify-between items-center text-sm pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="font-medium text-gray-800">
                                  {item.name}
                                  {item.size && <span className="text-gray-400 text-xs ml-1 font-normal">({item.size})</span>}
                                </div>
                                <span className="font-mono text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded">x{item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Order Details Footer */}
                        <div className="bg-lime-50/50 rounded-xl p-4 border border-lime-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</span>
                            <span className="text-lime-700 font-extrabold text-xl">₹{order.order_amount}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                             <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                             <span>{order.paymentMethod}</span>
                          </div>
                        </div>

                      </div>

                      {/* Track Button */}
                      {order.tracking_link && order.status !== 'Pending' && order.status !== 'Canceled' && (
                        <div className="mt-5">
                          <a
                            href={order.tracking_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-black bg-lime-400 hover:bg-lime-500 transition-colors"
                          >
                            <FaShippingFast className="mr-2" /> Track Package
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Need Help Section */}
              {orders.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900 mb-0.5">Need help?</p>
                    <p className="text-sm text-amber-800/80 mb-1">
                      Share your Order ID with our support team.
                    </p>
                    <a href="mailto:support@bynatablet.in" className="text-sm font-bold text-amber-700 hover:text-amber-900 underline decoration-2 underline-offset-2">
                      support@bynatablet.in
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Image Area (Fixed Sticky) */}
      <div className="hidden lg:flex lg:w-1/2 bg-lime-50 top-0 h-screen items-center justify-center overflow-hidden">
         {/* Decorative Blobs */}
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-lime-200/50 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-lime-300/50 rounded-full blur-3xl"></div>
         
         <div className="relative  w-full max-w-lg p-12">
            <Image
              src="/order_ill.svg"
              alt="Order Tracking Illustration"
              width={600}
              height={600}
              className="object-contain drop-shadow-2xl"
              priority
            />
         </div>
      </div>

    </div>
  );
};

export default UserOrders;