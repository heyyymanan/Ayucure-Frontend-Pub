import { Suspense } from "react";
import ShopAllClient from "@/components/ShopAllClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Explore Remedies | Shreeji Remedies",
  description:
    "Search and browse our premium collection of health and wellness products.",
};

const LIMIT = 12;

async function fetchShopAllProducts({ page, remedy_for, price, q }) {
  const base = process.env.NEXT_PUBLIC_API_URL;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(LIMIT),
  });

  if (remedy_for) params.set("remedy_for", remedy_for);
  if (price) params.set("price", price);
  if (q) params.set("q", q);

  try {
    const res = await fetch(`${base}/general/shop-all?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return { products: [], totalCount: 0 };
  }
}

export default async function ShopAllPage({ searchParams }) {
  const sp = await searchParams;

  const page = Math.max(Number(sp?.page || 1), 1);
  const remedy_for = sp?.remedy_for || "";
  const price = sp?.price || "";
  const q = sp?.q || "";

  const { products, totalCount } = await fetchShopAllProducts({
    page,
    remedy_for,
    price,
    q,
  });

  const totalPages = Math.ceil(totalCount / LIMIT) || 1;

  return (
    <main className="min-h-screen">
      {/* Hero (NO SEARCH HERE) */}
      <section className="pt-5  border-slate-100  md:py-12">
        <div className="container mx-auto px-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">
              Our <span className="text-lime-500">Remedies</span>
            </h1>
            <p className="text-slate-500 mt-2 max-w-md">
              Find the right natural solution for your health needs.
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="container">
        <Suspense fallback={<ShopSkeleton />}>
          <ShopAllClient
            initialProducts={products}
            initialPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            initialFilters={{ remedy_for, price, q }}
          />
        </Suspense>
      </div>
    </main>
  );
}

function ShopSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
      ))}
    </div>
  );
}
