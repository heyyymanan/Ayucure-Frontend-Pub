/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://bynatablet.in',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,

  exclude: [
    '/cart',
    '/checkout',
    '/thank-you',
    '/payment-failed',
    '/payment-pending',
    '/test',
    '/order-success',
    '/checkout-fallback',
    '/onboarding',
    '/user/my-orders',
    '/user/my-wishlist',
    '/user/my-profile',
    '/user'

  ],

  additionalPaths: async () => {
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/general/fetchsku`);
    const data = await res.json();
    const { skus } = data;

    // Map SKUs to /[sku]/pages URL paths
    return skus.map((sku) => ({
      loc: `/products/${sku}`,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }));
  },
};
