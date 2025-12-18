/**
 * SITE CONFIGURATION
 * Központi konfiguráció - egy helyen változtatható minden
 * 
 * ⚠️ API kulcsokat NE ide! Cloudflare ENV vars-ból mennek.
 */

export const siteConfig = {
  // Alap beállítások
  name: 'Cégnév',
  tagline: 'Rövid szlogen',
  url: 'https://example.com',
  defaultLocale: 'hu' as const,
  locales: ['hu', 'en'] as const,

  // Színek (Tailwind-ben használva)
  colors: {
    primary: {
      DEFAULT: '#0ea5e9',   // Fő szín
      light: '#38bdf8',     // Hover, világos variáns
      dark: '#0369a1',      // Active, sötét variáns
    },
    secondary: {
      DEFAULT: '#64748b',   // Másodlagos szín
      light: '#94a3b8',
      dark: '#475569',
    },
    accent: {
      DEFAULT: '#f59e0b',   // Kiemelő szín (CTA, badge)
      light: '#fbbf24',
      dark: '#d97706',
    },
  },

  // Cégadatok (Schema.org + Footer)
  company: {
    legalName: 'Cégnév Kft.',
    registrationNumber: '01-09-123456',  // Cégjegyzékszám
    vatNumber: 'HU12345678',              // Adószám
    
    address: {
      street: 'Példa utca 123.',
      city: 'Budapest',
      postalCode: '1234',
      country: 'HU',
      countryName: 'Magyarország',
    },
    
    contact: {
      phone: '+36 1 234 5678',
      phoneRaw: '+3612345678',  // Linkhez
      email: 'info@example.com',
    },
    
    social: {
      facebook: 'https://facebook.com/example',
      instagram: 'https://instagram.com/example',
      linkedin: '',
    },
    
    openingHours: [
      { days: 'Mo-Fr', hours: '09:00-17:00' },
      { days: 'Sa', hours: '09:00-13:00' },
    ],
  },

  // SEO alapértékek
  seo: {
    titleTemplate: '%s | Cégnév',
    defaultDescription: 'Meta description az oldalhoz. Max 155-160 karakter.',
    defaultOgImage: '/og-image.jpg',
  },

  // Tracking (ID-k ENV-ből jönnek, itt csak flag-ek)
  tracking: {
    enableGTM: true,
    enableAnalytics: true,
    enableFBPixel: false,
  },
} as const;

// Schema.org típusok
export type SchemaType = 
  | 'LocalBusiness' 
  | 'Service' 
  | 'Product' 
  | 'Organization'
  | 'WebSite'
  | 'FAQPage'
  | 'BreadcrumbList';

// Nyelv típus
export type Locale = typeof siteConfig.locales[number];

// Helper: Schema.org generálás
export function generateSchema(type: SchemaType, customData?: Record<string, unknown>) {
  const { company, url, name } = siteConfig;
  
  const baseSchemas: Record<string, object> = {
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: company.legalName,
      url,
      logo: `${url}/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: company.contact.phone,
        email: company.contact.email,
        contactType: 'customer service',
        availableLanguage: ['Hungarian', 'English'],
      },
      sameAs: Object.values(company.social).filter(Boolean),
    },
    
    LocalBusiness: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${url}/#localbusiness`,
      name: company.legalName,
      description: siteConfig.seo.defaultDescription,
      url,
      telephone: company.contact.phone,
      email: company.contact.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: company.address.street,
        addressLocality: company.address.city,
        postalCode: company.address.postalCode,
        addressCountry: company.address.country,
      },
      geo: {
        '@type': 'GeoCoordinates',
        // latitude: 47.4979,  // Töltsd ki ha kell
        // longitude: 19.0402,
      },
      openingHoursSpecification: company.openingHours.map(oh => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: oh.days.split('-').map(d => {
          const dayMap: Record<string, string> = {
            Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday',
            Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday'
          };
          return dayMap[d] || d;
        }),
        opens: oh.hours.split('-')[0],
        closes: oh.hours.split('-')[1],
      })),
      priceRange: '$$',
      image: `${url}/og-image.jpg`,
      sameAs: Object.values(company.social).filter(Boolean),
    },
    
    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${url}/#website`,
      name,
      url,
      inLanguage: siteConfig.defaultLocale,
      publisher: {
        '@id': `${url}/#organization`,
      },
    },
  };

  const baseSchema = baseSchemas[type] || {};
  return { ...baseSchema, ...customData };
}

// Helper: Teljes oldal schema (több típus kombinálva)
export function generateFullPageSchema(pageType: SchemaType = 'LocalBusiness', pageData?: Record<string, unknown>) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      generateSchema('Organization'),
      generateSchema('WebSite'),
      generateSchema(pageType, pageData),
    ],
  };
}
