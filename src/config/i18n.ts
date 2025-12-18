/**
 * i18n Configuration
 * Többnyelvűsítés by design
 */

import { siteConfig, type Locale } from './site.config';

export const defaultLocale = siteConfig.defaultLocale;
export const locales = siteConfig.locales;

// Fordítások
export const translations = {
  hu: {
    // Meta
    locale: 'hu_HU',
    lang: 'hu',
    hreflang: 'hu',
    
    // Navigation
    nav: {
      home: 'Főoldal',
      services: 'Szolgáltatások',
      about: 'Rólunk',
      contact: 'Kapcsolat',
      pricing: 'Árak',
    },
    
    // Common
    common: {
      readMore: 'Bővebben',
      learnMore: 'Tudjon meg többet',
      getQuote: 'Ajánlatot kérek',
      callUs: 'Hívjon minket',
      sendMessage: 'Üzenet küldése',
      sending: 'Küldés...',
      loading: 'Betöltés...',
      error: 'Hiba történt',
      success: 'Sikeres',
      required: 'Kötelező mező',
      submit: 'Küldés',
      cancel: 'Mégse',
      close: 'Bezárás',
      backToHome: 'Vissza a főoldalra',
      backToTop: 'Vissza a tetejére',
      skipToContent: 'Ugrás a tartalomhoz',
    },
    
    // Forms
    form: {
      name: 'Név',
      namePlaceholder: 'Az Ön neve',
      email: 'Email',
      emailPlaceholder: 'pelda@email.hu',
      phone: 'Telefonszám',
      phonePlaceholder: '+36 30 123 4567',
      message: 'Üzenet',
      messagePlaceholder: 'Miben segíthetünk?',
      privacyConsent: 'Elfogadom az adatvédelmi tájékoztatót',
      submitSuccess: 'Köszönjük! Hamarosan felvesszük Önnel a kapcsolatot.',
      submitError: 'Hiba történt. Kérjük próbálja újra.',
      validation: {
        required: 'Ez a mező kötelező',
        email: 'Érvényes email címet adjon meg',
        phone: 'Érvényes telefonszámot adjon meg',
        minLength: 'Minimum {min} karakter szükséges',
      },
    },
    
    // 404
    error404: {
      title: 'Oldal nem található',
      heading: 'Hoppá! Ez az oldal nem található',
      description: 'A keresett oldal lehet, hogy törölve lett, megváltozott a címe, vagy ideiglenesen nem elérhető.',
      searchPlaceholder: 'Keresés az oldalon...',
      suggestions: 'Talán ezeket kereste:',
      notFound: 'Nem találja amit keres?',
      contactUs: 'Lépjen kapcsolatba velünk!',
    },
    
    // Thank you page
    thankYou: {
      title: 'Köszönjük az érdeklődést!',
      description: 'Megkaptuk üzenetét és 24 órán belül felvesszük Önnel a kapcsolatot.',
      whatNext: 'Mi történik most?',
      steps: [
        'Átnézzük az Ön igényeit',
        'Személyre szabott ajánlatot készítünk',
        'Felvesszük Önnel a kapcsolatot telefonon vagy emailben',
      ],
      alsoInterested: 'Addig is érdekelheti:',
    },
    
    // Exit intent
    exitIntent: {
      title: 'Várjon, ne menjen el!',
      description: 'Kérjen ingyenes árajánlatot most, és 10% kedvezményt adunk.',
      cta: 'Igen, kérek ajánlatot',
      dismiss: 'Nem, köszönöm',
      confirmSubmit: 'Kattintson újra a megerősítéshez',
      sending: 'Küldés...',
    },
    
    // Footer
    footer: {
      companyInfo: 'Cégadatok',
      showContact: 'Kapcsolat megjelenítése',
      hideContact: 'Elrejtés',
      registrationNumber: 'Cégjegyzékszám',
      vatNumber: 'Adószám',
      copyright: '© {year} {company}. Minden jog fenntartva.',
      privacyPolicy: 'Adatvédelem',
      terms: 'ÁSZF',
    },
    
    // Toast notifications
    toast: {
      copied: 'Másolva a vágólapra',
      saved: 'Mentve',
      error: 'Hiba történt',
    },
  },
  
  en: {
    locale: 'en_GB',
    lang: 'en',
    hreflang: 'en',
    
    nav: {
      home: 'Home',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
      pricing: 'Pricing',
    },
    
    common: {
      readMore: 'Read more',
      learnMore: 'Learn more',
      getQuote: 'Get a quote',
      callUs: 'Call us',
      sendMessage: 'Send message',
      sending: 'Sending...',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      required: 'Required field',
      submit: 'Submit',
      cancel: 'Cancel',
      close: 'Close',
      backToHome: 'Back to homepage',
      backToTop: 'Back to top',
      skipToContent: 'Skip to content',
    },
    
    form: {
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'example@email.com',
      phone: 'Phone number',
      phonePlaceholder: '+36 30 123 4567',
      message: 'Message',
      messagePlaceholder: 'How can we help?',
      privacyConsent: 'I accept the privacy policy',
      submitSuccess: 'Thank you! We will contact you soon.',
      submitError: 'An error occurred. Please try again.',
      validation: {
        required: 'This field is required',
        email: 'Please enter a valid email',
        phone: 'Please enter a valid phone number',
        minLength: 'Minimum {min} characters required',
      },
    },
    
    error404: {
      title: 'Page not found',
      heading: 'Oops! This page was not found',
      description: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
      searchPlaceholder: 'Search the site...',
      suggestions: 'You might be looking for:',
      notFound: "Can't find what you're looking for?",
      contactUs: 'Contact us!',
    },
    
    thankYou: {
      title: 'Thank you for your interest!',
      description: 'We have received your message and will contact you within 24 hours.',
      whatNext: 'What happens next?',
      steps: [
        'We review your requirements',
        'We prepare a personalized offer',
        'We contact you by phone or email',
      ],
      alsoInterested: 'You might also be interested in:',
    },
    
    exitIntent: {
      title: 'Wait, before you go!',
      description: 'Request a free quote now and get 10% off.',
      cta: 'Yes, I want a quote',
      dismiss: 'No, thanks',
      confirmSubmit: 'Click again to confirm',
      sending: 'Sending...',
    },
    
    footer: {
      companyInfo: 'Company info',
      showContact: 'Show contact',
      hideContact: 'Hide',
      registrationNumber: 'Registration number',
      vatNumber: 'VAT number',
      copyright: '© {year} {company}. All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms & Conditions',
    },
    
    toast: {
      copied: 'Copied to clipboard',
      saved: 'Saved',
      error: 'An error occurred',
    },
  },
} as const;

// Helper: Get translation
export function t(locale: Locale) {
  return translations[locale] || translations[defaultLocale];
}

// Helper: Get current locale from URL
export function getLocaleFromUrl(url: URL): Locale {
  const [, locale] = url.pathname.split('/');
  if (locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  return defaultLocale;
}

// Helper: Generate localized path
export function localePath(path: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return path;
  }
  return `/${locale}${path}`;
}

// Helper: Generate hreflang links
export function generateHreflangLinks(currentPath: string, currentLocale: Locale) {
  return locales.map(locale => ({
    locale,
    href: `${siteConfig.url}${localePath(currentPath, locale)}`,
    hreflang: translations[locale].hreflang,
    isCurrent: locale === currentLocale,
  }));
}
