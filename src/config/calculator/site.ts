import type { Locale } from './i18n';

export const siteConfig = {
  name: 'Lead Gen Calculator',
  locale: 'hu-HU' as Locale,  // VÁLTOZTATHATÓ: 'hu-HU' | 'en-GB'

  contact: {
    email: 'info@example.com',
    phone: '+36 1 234 5678',
  },

  gtm: {
    id: 'GTM-XXXXXX',
    enabled: false, // Set to true when GTM is configured
  },

  emails: {
    from: 'noreply@example.com',
    fromName: 'Lead Gen Calculator',
    admin: 'admin@example.com',
  },

  // Rate limits
  rateLimit: {
    submit: { perMinute: 5, perDay: 20 },
    postcode: { perMinute: 30 },
  },

  // Payload limits
  maxPayloadSize: 20 * 1024, // 20KB

  // Form timing
  minFormTime: 3000, // 3 seconds minimum to fill form (bot protection)

  // Session storage
  storageKeys: {
    state: 'calculator_state',
    utm: 'calculator_utm',
  },
} as const;
