/**
 * Postcode lookup utilities
 * Supports Hungarian and UK postcodes
 */

import type { Locale } from '@/config/calculator/i18n';
// FIX-001: Static import instead of require() for browser compatibility
import huPostcodesData from '@/data/hu-postcodes.json';

const huPostcodes: Record<string, string> = huPostcodesData;

/**
 * Synchronous lookup for Hungarian postcodes
 * Uses local data for instant response
 */
export function lookupCitySync(postcode: string): string | null {
  return huPostcodes[postcode] || null;
}

/**
 * Async lookup for UK postcodes using external API
 * Falls back to graceful degradation if API fails
 */
export async function lookupCityAsync(postcode: string, locale: Locale): Promise<string | null> {
  if (locale === 'hu-HU') {
    return lookupCitySync(postcode);
  }

  // UK postcode lookup via api.postcodes.io
  if (locale === 'en-GB') {
    try {
      const cleanPostcode = postcode.replace(/\s+/g, '');
      const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.status === 200 && data.result) {
        return data.result.admin_district || data.result.parish || null;
      }

      return null;
    } catch (error) {
      console.error('UK postcode lookup failed:', error);
      return null;
    }
  }

  return null;
}
