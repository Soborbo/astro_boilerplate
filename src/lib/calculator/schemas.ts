import { z } from 'zod';
import { siteConfig } from '@/config/calculator/site';
import { i18n } from '@/config/calculator/i18n';

const locale = siteConfig.locale;
const errors = i18n[locale].errors;

// ============================================
// REUSABLE SCHEMAS
// ============================================

export const nameSchema = z
  .string()
  .min(2, errors.nameTooShort)
  .max(50, errors.nameTooLong)
  .regex(/^[\p{L}\s'-]+$/u, errors.nameTooShort);

export const emailSchema = z
  .string()
  .email(errors.emailInvalid)
  .max(100)
  .transform(val => val.toLowerCase().trim());

export const phoneSchema = z
  .string()
  .min(9, errors.phoneInvalid)
  .max(20, errors.phoneInvalid)
  .regex(/^[\d\s+()-]+$/, errors.phoneInvalid);

// ============================================
// LOCALE-AWARE POSTCODE SCHEMA
// ============================================

export const postcodeHUSchema = z
  .string()
  .length(4, errors.postcodeTooShort)
  .regex(/^\d{4}$/, errors.postcodeInvalid);

export const postcodeUKSchema = z
  .string()
  .min(5, errors.postcodeTooShort)
  .max(8)
  .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, errors.postcodeInvalid)
  .transform(val => val.toUpperCase().replace(/\s+/g, ' ').trim());

// RUNTIME SELECTION - based on siteConfig.locale
export const postcodeSchema = siteConfig.locale === 'en-GB'
  ? postcodeUKSchema
  : postcodeHUSchema;

export const citySchema = z
  .string()
  .min(2, errors.nameTooShort)
  .max(100);

// ============================================
// CONTACT FORM SCHEMA
// ============================================

export const contactFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  postcode: postcodeSchema,
  city: citySchema,

  // Honeypot - MUST be empty
  company: z
    .string()
    .max(0, errors.honeypotTriggered)
    .optional()
    .default(''),

  // Time check - use z.coerce for string→number conversion
  formStartTime: z.coerce
    .number()
    .refine(
      (start) => Date.now() - start >= siteConfig.minFormTime,
      errors.submissionTooFast
    ),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ============================================
// FULL SUBMISSION SCHEMA
// ============================================

export const submissionSchema = z.object({
  sessionId: z.string().min(10).max(50),
  answers: z.record(z.unknown()),
  contact: contactFormSchema,

  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
    gclid: z.string().optional(),
  }).optional(),

  meta: z.object({
    landingPage: z.string().optional(),
    referrer: z.string().optional(),
    userAgent: z.string().optional(),
  }).optional(),
});

export type SubmissionData = z.infer<typeof submissionSchema>;

// ============================================
// POSTCODE LOOKUP SCHEMA
// ============================================

export const postcodeLookupSchema = z.object({
  code: postcodeSchema,
});

export type PostcodeLookupData = z.infer<typeof postcodeLookupSchema>;
