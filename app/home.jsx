// app/page.jsx ✅ SERVER COMPONENT (SSR) — NO "use client"

import Hero from "@/components/hero.jsx";
import Category from "@/components/category.jsx";
import ProductCard from "@/components/ui/product_card.jsx";
import { fetchProducts } from "@/lib/api/fetch-products.js";
import TrendingHeader from "@/components/trending-header";

export default async function Home() {
  let trendingProducts = [];
  let healthyProducts = [];
  let sexualWellness = [];
  let skinCare = [];
  let womenSpecial = [];

  try {
    const [trending, healthy, sexual, women, skin] = await Promise.all([
      fetchProducts({ tag: "trending", limit: 7 }),
      fetchProducts({ tag: "healthy", limit: 7 }),
      fetchProducts({ tag: "sexual-wellness", limit: 7 }),
      fetchProducts({ tag: "women", limit: 7 }),
      fetchProducts({ tag: "skin-care", limit: 7 }),
    ]);

    trendingProducts = trending ?? [];
    healthyProducts = healthy ?? [];
    sexualWellness = sexual ?? [];
    womenSpecial = women ?? [];
    skinCare = skin ?? [];
  } catch (err) {
    console.log("Home SSR fetch error:", err);
  }

  const ProductSection = ({ title, products }) => (
    <>
      <h1 className="text-center text-white lg:text-5xl text-3xl mt-5 lg:mt-10 font-serif">
        {title}
      </h1>

      <div className="flex overflow-x-auto whitespace-nowrap gap-x-5 gap-y-5 p-4 md:p-10 justify-evenly">
        {products.length === 0 ? (
          <div className="text-gray-500 text-lg italic">
            No products found in this category.
          </div>
        ) : (
          products
            .filter((product) => product.isShowing)
            .map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
        )}
      </div>
    </>
  );

  return (
    <div className="bg-gradient-to-t from-slate-100 to-[#222831]">
      <Hero />
      <hr className="border-t border-gray-500" />
      <h1 className="w-full flex justify-center text-white py-1 font-serif text-sm">Shop By Concerns</h1>
      
      <Category />
      <hr className="border-t border-gray-400" />

      {/* ✅ client wrapper for fire + scroll */}
      <TrendingHeader />

      {/* ✅ SSR products */}
      <div className="flex overflow-x-auto whitespace-nowrap gap-x-5 gap-y-5 p-4 md:p-10 justify-evenly">
        {trendingProducts.length === 0 ? (
          <div className="text-white italic text-lg">
            No trending products available.
          </div>
        ) : (
          trendingProducts
            .filter((product) => product.isShowing)
            .map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
        )}
      </div>

      <ProductSection title="Womens Special" products={womenSpecial} />
      <ProductSection title="Sexual Wellness" products={sexualWellness} />
      <ProductSection title="Skin Care & Hair Care" products={skinCare} />
      <ProductSection title="Want A Healthy Life?" products={healthyProducts} />
    </div>
  );
}
