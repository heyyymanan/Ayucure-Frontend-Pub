import { notFound } from "next/navigation";
import ProductPageClient from "@/components/product-page";

/* ----------------------------------------
   Fetch product by SKU
----------------------------------------- */
async function getProductBySKU(sku) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/general/products/${sku}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

/* ----------------------------------------
   Convert relative image to absolute
----------------------------------------- */
function toAbsoluteUrl(imgUrl) {
  if (!imgUrl) return "";
  if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
    return imgUrl;
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  return base.replace(/\/$/, "") + "/" + imgUrl.replace(/^\//, "");
}

/* ----------------------------------------
   SEO Metadata
----------------------------------------- */
export async function generateMetadata({ params }) {
  const { sku } = await params;

  const product = await getProductBySKU(sku);
  const variant = product?.variants?.find(v => v.sku === sku);

  if (!product || !variant) {
    return {
      title: "Product Not Found - BynaTablet.in",
      description: "This product was not found or is unavailable.",
      robots: "noindex, nofollow",
    };
  }

  const siteName = "Byna Tablet";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://bynatablet.in";
  const productUrl = `${siteUrl}/products/${sku}`;

  const shortDesc = product.short_description || "";
  const remedyFor = (product.remedy_for || []).join(", ");
  const keyBenefits = (product.key_benefits || []).join(", ");

  const rawImageUrl =
    variant.image || product.images?.[0] || "";
  const imageUrl = toAbsoluteUrl(rawImageUrl);

  const priceAmount = variant.price || product.price || "";
  const priceCurrency = "INR";

  return {
    title: `${product.name} - ${shortDesc} - ${siteName}`,
    description: `${shortDesc} | ${remedyFor} | ${keyBenefits} | ${siteName}`,
    keywords: `${product.name}, ${shortDesc}, ${remedyFor}, ${keyBenefits}, ${product.keywords}, Byna Tablet`,

    alternates: {
      canonical: productUrl,
    },

    metadataBase: new URL(siteUrl),

    openGraph: {
      siteName,
      url: productUrl,
      title: product.name,
      description: shortDesc,
      type: "website",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 300,
              height: 300,
              alt: product.name,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      site: "@vyas_mitra",
      title: product.name,
      description: shortDesc,
      images: imageUrl ? [imageUrl] : [],
    },

    icons: {
      icon: "/icons/favicon.ico",
      shortcut: "/icons/favicon.ico",
    },

    other: {
      "product:price:amount": String(priceAmount),
      "product:price:currency": priceCurrency,
      "og:image:secure_url": imageUrl,
      "og:image:width": "300",
      "og:image:height": "300",
    },
  };
}

/* ----------------------------------------
   Page Component
----------------------------------------- */
export default async function ProductPage({ params }) {
  const { sku } = await params;

  const product = await getProductBySKU(sku);
  const variant = product?.variants?.find(v => v.sku === sku);

  if (!product || !variant) {
    return notFound();
  }

  return (
    <ProductPageClient
      product={product}
      selectedVariant={variant}
    />
  );
}
