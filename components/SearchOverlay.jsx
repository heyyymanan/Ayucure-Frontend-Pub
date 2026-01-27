"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LIMIT = 8;

// ✅ popular tags UI (remedy_for)
const POPULAR_CHOICES = [
  { label: "Hair Care", value: "Hair Care" },
  { label: "Skin Care", value: "Skin Care" },
  { label: "Makeup", value: "Makeup" },
];

async function fetchShopAllProducts({ page = 1, remedy_for = "", price = "" }) {
  const base = process.env.NEXT_PUBLIC_API_URL;

  const url =
    `${base}/general/shop-all` +
    `?page=${page}&limit=${LIMIT}` +
    `&remedy_for=${encodeURIComponent(remedy_for || "")}` +
    `&price=${encodeURIComponent(price || "")}`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return { products: [], totalCount: 0 };
  return res.json();
}

export default function SearchOverlay({ open, onClose, mode = "mobile" }) {
  const isMobile = mode === "mobile";
  const router = useRouter();

  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [loading, setLoading] = useState(false);

  const [recommended, setRecommended] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // ✅ focus input when open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setActiveTag("");
      setSuggestions([]);
    }
  }, [open]);

  // ✅ Load recommended products initially
  useEffect(() => {
    if (!open) return;

    const loadRecommended = async () => {
      try {
        setLoading(true);
        const data = await fetchShopAllProducts({ page: 1 });
        setRecommended(data?.products || []);
      } catch (e) {
        console.log("Recommended fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadRecommended();
  }, [open]);

  // ✅ Tag click -> fetch products for that remedy_for
  const handleTagClick = async (tagValue) => {
    setActiveTag(tagValue);
    setQuery("");

    try {
      setLoading(true);
      const data = await fetchShopAllProducts({
        page: 1,
        remedy_for: tagValue,
      });
      setRecommended(data?.products || []);
      setSuggestions([]);
    } catch (e) {
      console.log("Tag fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ live suggestions from current recommended list
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const q = query.toLowerCase();

    const filtered = (recommended || [])
      .filter((p) => {
        const name = (p?.product_name || "").toLowerCase();
        const remedy = (p?.remedy_for || "").toLowerCase();
        const desc = (p?.short_description || "").toLowerCase();
        return name.includes(q) || remedy.includes(q) || desc.includes(q);
      })
      .slice(0, 6);

    setSuggestions(filtered);
  }, [query, recommended]);

  // ✅ go product page
  const handleOpenProduct = (product) => {
    const slug = product?.slug || product?._id; // adjust if needed
    onClose?.();
    router.push(`/product/${slug}`);
  };

  if (!open) return null;

  return (
    <div
      className={
        isMobile
          ? "fixed inset-0 z-[999] bg-[#dff6f7]"
          : "absolute top-full left-0 right-0 z-[50] bg-white border border-black/10 rounded-2xl shadow-xl"
      }
    >
      {/* ✅ MOBILE FULL SCREEN UI */}
      {isMobile ? (
        <div className="h-full w-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-[#dff6f7] px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 transition active:scale-95"
              >
                <ArrowLeft size={24} />
              </button>

              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search For"
                  className="w-full rounded-2xl bg-white px-5 py-3 pr-12 text-lg outline-none border border-black/10"
                />
                <Search
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/70"
                  size={22}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-black/70"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Popular Choices */}
          <div className="px-4 mt-4">
            <h2 className="text-2xl font-semibold">Popular Choices</h2>

            <div className="flex gap-3 mt-4 flex-wrap">
              {POPULAR_CHOICES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTagClick(t.value)}
                  className={`px-5 py-2 rounded-xl border-2 transition
                    ${
                      activeTag === t.value
                        ? "border-black bg-black text-white"
                        : "border-teal-600 text-black bg-white"
                    }
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div className="px-4 mt-8 pb-24">
            <h2 className="text-2xl font-semibold">
              {query ? "Search Results" : "Recommended For You"}
            </h2>

            {loading ? (
              <div className="mt-6 text-center text-black/70">Loading...</div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-6">
                {(query ? suggestions : recommended).map((p) => (
                  <button
                    key={p?._id}
                    onClick={() => handleOpenProduct(p)}
                    className="bg-white rounded-2xl overflow-hidden border border-black/10 text-left"
                  >
                    {/* Image */}
                    <div className="relative w-full h-40 bg-white">
                      <Image
                        src={p?.images?.[0] || "/placeholder.png"}
                        alt={p?.product_name || "product"}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-semibold line-clamp-2">
                        {p?.product_name}
                      </p>

                      <p className="text-black/60 text-xs mt-1 line-clamp-1">
                        {p?.remedy_for}
                      </p>

                      <p className="mt-2 font-bold text-lg">
                        From ₹{p?.price || p?.mrp || "—"}
                      </p>

                      <div className="mt-3 bg-yellow-400 text-black w-full rounded-xl py-2 text-center font-semibold">
                        Add To Cart →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ✅ DESKTOP DROPDOWN UI (Suggestions under search bar) */
        <div className="p-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border">
            <Search size={18} className="text-black/60" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={18} className="text-black/60" />
              </button>
            )}
          </div>

          {/* Suggestions */}
          <div className="mt-2 max-h-80 overflow-auto">
            {(query ? suggestions : recommended).map((p) => (
              <button
                key={p?._id}
                onClick={() => handleOpenProduct(p)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 transition text-left"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border">
                  <Image
                    src={p?.images?.[0] || "/placeholder.png"}
                    alt={p?.product_name || "product"}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">
                    {p?.product_name}
                  </p>
                  <p className="text-xs text-black/60 line-clamp-1">
                    {p?.remedy_for}
                  </p>
                </div>

                <p className="font-semibold text-sm">
                  ₹{p?.price || p?.mrp || "—"}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
