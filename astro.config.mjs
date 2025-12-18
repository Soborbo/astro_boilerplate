import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import partytown from '@astrojs/partytown';

// Site URL - VÁLTOZTASD MEG
const siteUrl = 'https://example.com';

export default defineConfig({
  site: siteUrl,
  output: 'static', // Cloudflare Pages static site
  adapter: cloudflare({
    imageService: 'cloudflare',
  }),
  
  integrations: [
    tailwind(),
    
    sitemap({
      filter: (page) => 
        !page.includes('/koszonjuk') && 
        !page.includes('/thank-you') &&
        !page.includes('/404'),
      i18n: {
        defaultLocale: 'hu',
        locales: {
          hu: 'hu-HU',
          en: 'en-GB',
        },
      },
    }),
    
    // Partytown: GTM és egyéb 3rd party scriptek Web Worker-ben
    partytown({
      config: {
        forward: ['dataLayer.push', 'fbq'], // GTM + FB Pixel
        debug: import.meta.env.DEV,
      },
    }),
  ],
  
  image: {
    // Cloudflare Image Resizing
    service: {
      entrypoint: 'astro/assets/services/cloudflare',
    },
    // Retina támogatás
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  vite: {
    build: {
      // Cloudflare Pages optimalizálás
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    // ENV változók kezelése - NE EXPONÁLD a titkokat!
    define: {
      'import.meta.env.PUBLIC_SITE_URL': JSON.stringify(siteUrl),
    },
  },
  
  // Prefetch for View Transitions
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
