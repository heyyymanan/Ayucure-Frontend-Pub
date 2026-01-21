// app/shop-all/page.jsx ✅ SERVER COMPONENT (SSR)

import ShopAllClient from "@/components/ShopAllClient";

const LIMIT = 10;

async function fetchShopAllProducts({ page, remedy_for, price }) {
  const base = process.env.NEXT_PUBLIC_API_URL;

  const url =
    `${base}/general/shop-all` +
    `?page=${page}&limit=${LIMIT}` +
    `&remedy_for=${encodeURIComponent(remedy_for || "")}` +
    `&price=${encodeURIComponent(price || "")}`;

  const res = await fetch(url, {
    next: { revalidate: 60 }, // ✅ cache 60 seconds (fast + SEO)
  });

  if (!res.ok) {
    return { products: [], totalCount: 0 };
  }

  return res.json();
}

export default async function ShopAllPage({ searchParams }) {
  const page = Number(searchParams?.page || 1);
  const remedy_for = searchParams?.remedy_for || "";
  const price = searchParams?.price || "";

  const data = await fetchShopAllProducts({ page, remedy_for, price });

  const products = data?.products || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  const noProducts = products.length === 0;

  return (
    <ShopAllClient
      initialProducts={products}
      initialPage={page}
      totalPages={totalPages}
      initialFilters={{ remedy_for, price }}
      noProducts={noProducts}
    />
  );
}
