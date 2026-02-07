"use client";

import { useState, useEffect, useRef } from "react";
import {
  Star,
  PlusCircle,
  Leaf,
  ShieldCheck,
  FlaskRound,
  Pill,
  X
} from "lucide-react";
import AddToCartButton from "@/components/ui/addToCartBtn";
import Image from "next/image";
import Head from "next/head";
import { useCart } from "@/app/context/CartContext";
import axios from "axios";
import { Button } from "./ui/button";
import OTPOnClick from "@/lib/utils/MSG91";

/* Common Section with collapsible styling */
function DetailSection({ title, icon, children, collapsible = true }) {
  const [open, setOpen] = useState(true);
  
  return (
    <section className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => collapsible && setOpen(!open)}
        >
        <div className="flex items-center gap-2">
          <span className="p-2 bg-orange-100 rounded-full">{icon}</span>
          <h2 className="text-lg md:text-xl font-semibold font-serif border-b-2 border-orange-500 pb-1">
            {title}
          </h2>
        </div>
        {collapsible && (
          <span className="text-gray-500 md:hidden">{open ? "−" : "+"}</span>
        )}
      </div>

      {open && (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mt-3">
          <div className="text-gray-700 leading-relaxed">{children}</div>
        </div>
      )}
    </section>
  );
}

export default function ProductPageClient({ product, selectedVariant }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [variant, setVariant] = useState(selectedVariant);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleVariantChange = (e) => {
    const newSku = e.target.value;
    const found = product.variants.find((v) => v.sku === newSku);
    if (found) setVariant(found);
  };

  const { cart, clearCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  const handleRemove = () => {
    clearCart();
    setIsVisible(false);
  };

  useEffect(() => {
    setIsVisible(cart.length > 0);
  }, [cart]);

  if (!product || !variant) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex, nofollow" />
          <title>Product Not Found - BynaTablet.in</title>
        </Head>
        <div className="text-center py-20 px-4">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or is currently
            unavailable.
          </p>
          <button
            onClick={() => (window.location.href = "/shop-all")}
            className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Browse All Products
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="relative">
      <Head>
        <link rel="apple-touch-icon" href={product.images[0]} />
        <link rel="icon" href={product.images} sizes="any" />
      </Head>

      {/* Product Gallery + Info */}
      <section className="flex flex-col md:flex-row gap-8 p-4 sm:p-6 md:px-24 md:py-12">
        {/* Thumbnails */}
        <div className="flex flex-col md:flex-row w-full md:w-2/3 gap-4">
          <div className="hidden md:flex flex-col gap-4">
            {product.images.map((img, idx) => (
              <Image
                key={idx}
                src={img}
                height={200}
                width={200}
                alt={`${product.name} thumbnail ${idx + 1}`}
                className={`w-20 h-20 rounded-lg border object-cover cursor-pointer ${
                  currentIndex === idx
                    ? "border-orange-500"
                    : "border-gray-300"
                }`}
                onClick={() => setCurrentIndex(idx)}
                loading="lazy"
              />
            ))}
          </div>

          {/* Main Image Desktop */}
          <div className="hidden md:flex flex-1 justify-center">
            <Image
              height={500}
              width={500}
              src={product.images[currentIndex]}
              alt={product.name}
              className="rounded-2xl object-contain max-h-[26rem] border"
              loading="lazy"
            />
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden w-full relative">
            <div className="relative overflow-hidden rounded-2xl w-full h-80 border flex items-center justify-center">
              <Image
                height={200}
                width={200}
                src={product.images[currentIndex]}
                alt={product.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white"
                >
                  ❮
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white"
                >
                  ❯
                </button>
              </>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6 w-full md:w-1/3">
          <ProductInfo
            product={product}
            variant={variant}
            onVariantChange={handleVariantChange}
          />
        </div>
      </section>

      {/* Sticky Add to Cart for mobile */}
      <div className="md:bg-transparent md:border-none flex justify-evenly items-center fixed bottom-[80px] w-full bg-white border-t z-50">
        <div className="md:hidden flex justify-evenly items-center fixed bottom-0 left-0 w-full p-4 bg-white border-t z-50">
          <select
            className="p-2 border rounded-lg"
            onChange={handleVariantChange}
            value={variant.sku}
          >
            {product.variants.map((v) => (
              <option key={v.sku} value={v.sku}>
                {v.size} - ₹{v.price}
              </option>
            ))}
          </select>
          <AddToCartButton product={product} variantSku={variant.sku} />
        </div>
        <div className={`${isVisible ? "flex" : "hidden"} mx-auto`}>
          <div className=" bg-neutral-900 text-white flex items-center py-4 px-4 rounded-2xl shadow-xl w-[340px] justify-evenly">
            {/* Image */}
            <div className="img">
              <img
                src="/icons/cart.png"
                alt="Cart"
                className="h-7 rounded-full object-cover"
              />
            </div>
            {/* Cart Info */}
            <div className="txt">
              <p className="font-semibold text-white text-sm">
                {cart.length} Item{cart.length > 1 ? "s" : ""} In Your Cart
              </p>
            </div>
            {/* View Cart */}
            <div className="btn1">
              <button
                onClick={() => (window.location.href = "/cart")}
                className="bg-lime-500 text-black px-4 py-2 rounded-md text-sm font-semibold"
              >
                View Cart
              </button>
            </div>
            {/* Close */}
            <div className="btn2">
              <button onClick={handleRemove}>
                <X className="w-5 h-5 text-gray-300 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection
        product={product}
        showReviewModal={showReviewModal}
        setShowReviewModal={setShowReviewModal}
      />
    </div>
  );
}

function ProductInfo({ product, variant, onVariantChange }) {
  return (
    <div>
      {/* Name & Brand */}
      <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
      <p className="text-sm text-gray-500 mb-2">By {product.company}</p>

      {/* Price & Rating */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <p className="text-orange-600 font-bold text-2xl">
          ₹ {variant?.price}
          <span className="text-sm"> (Incl. Taxes)</span>
        </p>
        <div className="flex items-center gap-1">
          <Star className="text-yellow-500 fill-yellow-500" size={18} />
          {product.rating.toFixed(1)}
          <span className="text-gray-500 text-sm">
            ({product.reviews.length})
          </span>
        </div>
      </div>

      <RemedyList remedies={product.remedy_for} />

      {/* Variant selector (Desktop) */}
      <div className="hidden md:flex gap-2 md:gap-7 items-center my-4">
        <select
          className="p-2 border rounded-lg"
          onChange={onVariantChange}
          value={variant.sku}
        >
          {product.variants.map((v) => (
            <option key={v.sku} value={v.sku}>
              {v.size} - ₹{v.price}
            </option>
          ))}
        </select>
        <AddToCartButton product={product} variantSku={variant.sku} />
      </div>

      {/* Key Benefits */}
      {product.key_benefits?.length > 0 && (
        <DetailSection
          title="Key Benefits"
          icon={<Leaf className="text-green-600" size={20} />}
        >
          <ul className="space-y-2">
            {product.key_benefits.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">🍀</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* Safety Info */}
      {product.safety_info?.length > 0 && (
        <DetailSection
          title="Safety Info"
          icon={<ShieldCheck className="text-blue-500" size={20} />}
        >
          <ul className="space-y-2">
            {product.safety_info.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">⚠️</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* Dosage */}
      {product.dosage && (
        <DetailSection
          title="Dosage"
          icon={<Pill className="text-purple-500" size={20} />}
        >
          <p>{product.dosage}.</p>
        </DetailSection>
      )}

      {/* Ingredients */}
      {variant.ingredients && (
        <DetailSection
          title="Ingredients"
          icon={<FlaskRound className="text-pink-500" size={20} />}
        >
          <p>{variant.ingredients}.</p>
        </DetailSection>
      )}
    </div>
  );
}

function RemedyList({ remedies }) {
  return (
    <div className="bg-orange-100 flex flex-wrap gap-2 p-3 justify-center rounded-lg text-sm mb-4">
      <h2 className="font-semibold">Helps With:</h2>
      {remedies.map((remedy, idx) => (
        <span
          key={idx}
          className="px-2 py-1 bg-white rounded border text-gray-700"
        >
          {remedy}
        </span>
      ))}
    </div>
  );
}

function ReviewsSection({ product, showReviewModal, setShowReviewModal }) {
  const reviewRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (reviewRef.current && !reviewRef.current.contains(e.target)) {
        setShowReviewModal(false)
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [popup, setPopup] = useState({ type: "", message: "" }); // {type: 'success'|'error', message: ''}

  const showPopup = (type, message) => {
    setPopup({ type, message });
    setTimeout(() => {
      setPopup({ type: "", message: "" });
      if (type === "success") {
        window.location.reload();
      }
    }, 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem("isLoggedin")) {
      setShowLoginPopup(true);
    } else {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/users/review/${product._id}`,
          { name, rating: Number(rating), comment },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        setShowReviewModal(false);
        showPopup("success", "Review added successfully!");
      } catch (err) {
        console.error(err);
        showPopup(
          "error",
          err.response?.data?.message || "Error submitting review"
        );
      }
    }
  };

  const closeModal = () => setShowLoginPopup(false);

  return (
    <section className="p-4 sm:p-6 md:px-24 md:py-8 border-t mt-6">
      {/* Popup Notification */}
      {popup.message && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down text-white ${
            popup.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {popup.message}
        </div>
      )}

      {/* Reviews Header */}
      <div className="flex items-center justify-start gap-5 mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Star className="text-yellow-500 fill-yellow-500" /> Customer Reviews
        </h2>
        <button
          onClick={() => setShowReviewModal(true)}
          className="bg-orange-500 text-white px-4 py-1 rounded flex items-center gap-2 hover:bg-orange-600 text-sm"
        >
          <PlusCircle size={20} /> Add Review
        </button>
      </div>

      {/* Reviews List */}
      {product.reviews.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {product.reviews.map((review, idx) => (
            <div key={idx} className="p-4 border rounded-lg shadow-sm">
              <p className="font-semibold mb-3">{review.name}</p>
              <div className="flex items-center gap-1 text-yellow-500">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-500" />
                ))}
              </div>
              <p className="text-sm mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No reviews yet. Be the first one!</p>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed  inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white cursor-not-allowed  select-none rounded-xl p-6 w-full max-w-md shadow-lg" ref={reviewRef}>
          
            {/* <h3 className="text-lg font-bold mb-4">Submit Your Review</h3> */}
            <h3 className="text-lg font-bold mb-4">Reviews Are Currently Made Disabled. </h3>
            {/* <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Your Name"
                className="p-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <select
                className="p-2 border rounded"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              >
                <option value="">Rating</option>
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} Star{star > 1 && "s"}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Your Comment"
                className="p-2 border rounded h-24"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Submit
                </button>
              </div>
            </form> */}
          </div>
        </div>
      )}

      {/* Login Required Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white py-5 pt-1 rounded-lg shadow-lg w-[90%] max-w-md text-center">
            <Button
              onClick={closeModal}
              className="bg-transparent flex justify-end"
            >
              ❌
            </Button>
            <h2 className="text-2xl font-serif mb-4">Login Required !</h2>
            <p className="text-gray-600 mb-6">
              Please login first to make an order.
            </p>
            <OTPOnClick />
          </div>
        </div>
      )}
    </section>
  );
}
