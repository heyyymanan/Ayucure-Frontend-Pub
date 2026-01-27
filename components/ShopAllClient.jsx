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
import ProductCardForShopAll from "./ui/productCardForShopAll";

/* 🔥 Debounce Hook */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function ShopAllClient({
  initialProducts,
  initialPage,
  totalPages,
  initialFilters,
}) {
  const router = useRouter();

  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [remedyOptions, setRemedyOptions] = useState([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  /* 🔍 Search */
  const [searchInput, setSearchInput] = useState(initialFilters.q || "");
  const debouncedSearch = useDebounce(searchInput);

  /* ✅ Fetch remedies */
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/general/remedy-options`)
      .then(res => res.json())
      .then(data => setRemedyOptions(data))
      .catch(() => setRemedyOptions([]));
  }, []);

  /* 🔥 Debounced search trigger */
  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      const newFilters = { ...filters, q: debouncedSearch };
      setFilters(newFilters);
      setPage(1);
      pushUrl(1, newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const pushUrl = (newPage, newFilters) => {
    const query = new URLSearchParams();

    if (newPage > 1) query.set("page", newPage);
    if (newFilters.remedy_for) query.set("remedy_for", newFilters.remedy_for);
    if (newFilters.price) query.set("price", newFilters.price);
    if (newFilters.q) query.set("q", newFilters.q);

    router.push(`/shop-all?${query.toString()}`, { scroll: false });
  };

  const handleFilterChange = (e) => {
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

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-[1440px] mx-auto pb-24 lg:pb-0">



      {/* 🔍 Search */}
      <div className="mb-8 sticky  shadow-md  bg-white py-2 rounded-full  top-28 z-20 mt-5 justify-evenly md:justify-center md:w-fit md:gap-5 md:px-4 md:border md:border-black flex items-center ">
        <Search className="" />
        <div className="serch border border-1  rounded-full  flex justify-center items-center">

          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Gas, Digestion,..."
            className="w-full p-2 border border-1 border-black  text-black  rounded-2xl focus:ring-lime-500 focus:ring-2   outline-none  "
          />

        </div>

        {/* 📱 Mobile Floating Filter Bar */}

        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-full"
        >
          <Filter size={14} /> Filter
        </button>

      </div>

      <div className="flex gap-8">
        {/* 🖥 Desktop Sidebar */}
        <aside className="hidden lg:block w-72">
          <div className="sticky top-24 bg-white p-6 rounded-3xl border">
            <FilterContent
              filters={filters}
              remedyOptions={remedyOptions}
              handleFilterChange={handleFilterChange}
            />
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
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                {initialProducts.map((p) => (
                  <ProductCardForShopAll key={p._id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange("prev")}
                  className="p-3 border rounded-full disabled:opacity-30"
                >
                  <ChevronLeft />
                </button>

                <span className="font-bold">
                  {page} / {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange("next")}
                  className="p-3 border rounded-full disabled:opacity-30"
                >
                  <ChevronRight />
                </button>
              </div>
            </>
          )}
        </main>
      </div>



      {/* 📱 Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X />
              </button>
            </div>

            <FilterContent
              filters={filters}
              remedyOptions={remedyOptions}
              handleFilterChange={handleFilterChange}
            />

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full mt-8 bg-lime-500 text-white py-4 rounded-2xl font-bold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Filter Content (Shared) ---------------- */

function FilterContent({ filters, remedyOptions, handleFilterChange }) {
  return (
    <div className="space-y-6">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <Filter size={18} /> Filters
      </h2>

      <div>
        <label className="text-xs font-bold text-slate-400">Remedy</label>
        <select
          name="remedy_for"
          value={filters.remedy_for}
          onChange={handleFilterChange}
          className="w-full mt-2 p-3 rounded-xl border"
        >
          <option value="">All Remedies</option>
          {remedyOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-400">Price</label>
        <select
          name="price"
          value={filters.price}
          onChange={handleFilterChange}
          className="w-full mt-2 p-3 rounded-xl border"
        >
          <option value="">Featured</option>
          <option value="low">Low to High</option>
          <option value="high">High to Low</option>
        </select>
      </div>
    </div>
  );
}
