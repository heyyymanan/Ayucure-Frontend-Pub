// lib/api/fetch-products.js

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchProducts({ tag, limit } = {}) {
  let url = `${BASE_URL}/general/fetch-product`;

  const params = new URLSearchParams();
  if (tag) params.append("tag", tag);
  if (limit) params.append("limit", limit);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    next: { revalidate: 60 }, // ✅ cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`API fetch failed: ${response.status}`);
  }

  const data = await response.json();
  return data.products ?? [];
}
