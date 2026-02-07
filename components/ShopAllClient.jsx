"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import ProductCard from "./ui/product_card";

/* 🔥 Debounce Hook */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/* ✅ HARD-CODED REMEDY CATEGORIES */
const REMEDY_CATEGORIES = [
  { label: "Stomach & Digestion", value: "digestion" },
  { label: "Piles & Constipation", value: "piles" },
  { label: "Joint Pain & Arthritis", value: "joint-pain" },
  { label: "Hair Fall & Hair Care", value: "hair" },
  { label: "Skin & Beauty", value: "skin" },
  { label: "Cold, Cough & Fever", value: "cold-cough" },
  { label: "Urine / UTI / Kidney", value: "urinary" },
  { label: "Women’s Health", value: "women" },
  { label: "Weakness & Immunity", value: "immunity" },
  { label: "Men’s Health", value: "men" },
  { label: "Mouth Ulcers", value: "oral" },
];

export default function ShopAllClient({
  initialProducts,
  initialPage,
  totalPages,
  initialFilters,
}) {
  const router = useRouter();

  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  /* 🔍 Search */
  const [searchInput, setSearchInput] = useState(initialFilters.q || "");
  const debouncedSearch = useDebounce(searchInput);

  /* 🔥 Debounced Search */
  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      const newFilters = { ...filters, q: debouncedSearch };
      setFilters(newFilters);
      setPage(1);
      pushUrl(1, newFilters);
    }
    // eslint-disable-next-line
  }, [debouncedSearch]);

  const pushUrl = (newPage, newFilters) => {
    const query = new URLSearchParams();

    if (newPage > 1) query.set("page", newPage);
    if (newFilters.category) query.set("category", newFilters.category);
    if (newFilters.price) query.set("price", newFilters.price);
    if (newFilters.q) query.set("q", newFilters.q);

    router.push(`/shop-all?${query.toString()}`, { scroll: false });
  };

  const handleFilterChange = (e) => {
    setSearchInput("")
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setPage(1);
    pushUrl(1, newFilters);
  };

  const handlePageChange = (dir) => {
    const newPage = dir === "next" ? page + 1 : page - 1;
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      pushUrl(newPage, filters);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-24 lg:pb-0">

      {/* 🔍 Search + Mobile Filter */}
      <div className="sticky top-28  bg-white py-2 px-2 mt-5 md:w-fit flex gap-3 justify-center items-center">
        <Search />
        <input
          value={searchInput}
          onChange={(e) => {
            setFilters("");
            setSearchInput(e.target.value);
          }}
          placeholder="Byna, digestion, joint pain..."
          className="p-2 border border-black rounded-full w-64"
        />

        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-full"
        >
          <Filter size={14} /> Filter
        </button>
      </div>

      <div className="flex gap-8 mt-6">

        {/* 🖥 Desktop Filter */}
        <aside className="hidden lg:block w-72">
          <div className="sticky top-24 bg-white p-6 rounded-3xl border">
            <FilterContent filters={filters} handleFilterChange={handleFilterChange} />
          </div>
        </aside>

        {/* 📦 Products */}
        <main className="flex-1">
          {initialProducts.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              No products found
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {initialProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-4 mt-12">
                <button disabled={page === 1} onClick={() => handlePageChange("prev")}>
                  <ChevronLeft />
                </button>

                <span className="font-bold">{page} / {totalPages}</span>

                <button disabled={page === totalPages} onClick={() => handlePageChange("next")}>
                  <ChevronRight />
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {/* 📱 Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X />
              </button>
            </div>

            <FilterContent filters={filters} handleFilterChange={handleFilterChange} />

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full mt-6 bg-lime-500 text-white py-3 rounded-xl font-bold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🔹 Shared Filter Content */
function FilterContent({ filters, handleFilterChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold">Health Concern</label>
        <select
          name="category"
          value={filters.category || ""}
          onChange={handleFilterChange}
          className="w-full p-3 border rounded-xl mt-2"
        >
          <option value="">All Categories</option>
          {REMEDY_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold">Price</label>
        <select
          name="price"
          value={filters.price || ""}
          onChange={handleFilterChange}
          className="w-full p-3 border rounded-xl mt-2"
        >
          <option value="">Featured</option>
          <option value="low">Low to High</option>
          <option value="high">High to Low</option>
        </select>
      </div>
    </div>
  );
}
