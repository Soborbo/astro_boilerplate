export type Locale = 'hu-HU' | 'en-GB';

export const i18n: Record<Locale, {
  // Form labels
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postcode: string;
  city: string;
  required: string;

  // Buttons
  next: string;
  back: string;
  submit: string;
  loading: string;

  // Validation errors
  errors: {
    required: string;
    emailInvalid: string;
    phoneInvalid: string;
    postcodeTooShort: string;
    postcodeInvalid: string;
    nameTooShort: string;
    nameTooLong: string;
    submissionTooFast: string;
    honeypotTriggered: string;
    rateLimitExceeded: string;
    serverError: string;
  };

  // Social proof
  reviews: string;
  yearsExperience: string;
  satisfiedClients: string;
  responseTime: string;

  // Messages
  emailSuggestion: string;
  thankYouTitle: string;
  thankYouMessage: string;
  processingRequest: string;
  formSuccess: string;

  // Progress
  step: string;
  of: string;

  // Calculator specific
  selectOption: string;
  selectMultiple: string;
  yourDetails: string;
  quoteNumber: string;

  // Currency
  currency: 'HUF' | 'GBP';
  currencyLocale: string;
}> = {
  'hu-HU': {
    firstName: 'Keresztnév',
    lastName: 'Vezetéknév',
    email: 'Email cím',
    phone: 'Telefonszám',
    postcode: 'Irányítószám',
    city: 'Város',
    required: '*',

    next: 'Tovább',
    back: 'Vissza',
    submit: 'Ajánlatot kérek',
    loading: 'Feldolgozás...',

    errors: {
      required: 'Kötelező mező',
      emailInvalid: 'Érvénytelen email cím',
      phoneInvalid: 'Érvénytelen telefonszám',
      postcodeTooShort: 'Az irányítószám 4 számjegy',
      postcodeInvalid: 'Érvénytelen irányítószám',
      nameTooShort: 'Minimum 2 karakter',
      nameTooLong: 'Maximum 50 karakter',
      submissionTooFast: 'Kérjük, töltse ki gondosan a formot',
      honeypotTriggered: 'Érvénytelen beküldés',
      rateLimitExceeded: 'Túl sok kérés. Kérjük, várjon egy percet.',
      serverError: 'Hiba történt. Kérjük, próbálja újra később.',
    },

    reviews: 'értékelés',
    yearsExperience: 'Év tapasztalat',
    satisfiedClients: 'Elégedett ügyfél',
    responseTime: 'Válaszidő',

    emailSuggestion: 'Erre gondolt:',
    thankYouTitle: 'Köszönjük!',
    thankYouMessage: 'Ajánlatát megkaptuk. Hamarosan felvesszük Önnel a kapcsolatot.',
    processingRequest: 'Kérése feldolgozása...',
    formSuccess: 'Sikeres beküldés',

    step: 'Lépés',
    of: '/',

    selectOption: 'Válasszon egyet',
    selectMultiple: 'Válasszon egyet vagy többet',
    yourDetails: 'Az Ön adatai',
    quoteNumber: 'Ajánlat azonosító',

    currency: 'HUF',
    currencyLocale: 'hu-HU',
  },

  'en-GB': {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email address',
    phone: 'Phone number',
    postcode: 'Postcode',
    city: 'City',
    required: '*',

    next: 'Next',
    back: 'Back',
    submit: 'Get quote',
    loading: 'Processing...',

    errors: {
      required: 'Required field',
      emailInvalid: 'Invalid email address',
      phoneInvalid: 'Invalid phone number',
      postcodeTooShort: 'Postcode too short',
      postcodeInvalid: 'Invalid postcode',
      nameTooShort: 'Minimum 2 characters',
      nameTooLong: 'Maximum 50 characters',
      submissionTooFast: 'Please fill in carefully',
      honeypotTriggered: 'Invalid submission',
      rateLimitExceeded: 'Too many requests. Please wait.',
      serverError: 'An error occurred. Please try again later.',
    },

    reviews: 'reviews',
    yearsExperience: 'Years experience',
    satisfiedClients: 'Satisfied clients',
    responseTime: 'Response time',

    emailSuggestion: 'Did you mean:',
    thankYouTitle: 'Thank you!',
    thankYouMessage: 'We have received your request. We will contact you shortly.',
    processingRequest: 'Processing your request...',
    formSuccess: 'Successfully submitted',

    step: 'Step',
    of: 'of',

    selectOption: 'Select one',
    selectMultiple: 'Select one or more',
    yourDetails: 'Your details',
    quoteNumber: 'Quote number',

    currency: 'GBP',
    currencyLocale: 'en-GB',
  },
};

// Helper function - MINDIG EZT HASZNÁLD
export function t(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = i18n[locale];

  for (const k of keys) {
    value = value?.[k];
  }

  return value ?? key;
}

// Price formatter - MINDIG EZT HASZNÁLD
export function formatPrice(amount: number, locale: Locale): string {
  const config = i18n[locale];
  return new Intl.NumberFormat(config.currencyLocale, {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
