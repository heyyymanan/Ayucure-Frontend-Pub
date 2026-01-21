import SkeletonCard from "@/components/ui/skeleton-card";

export default function Loading() {
  return (
    <div className="p-2 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Shop All Products
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
