/**
 * Social Proof Configuration
 *
 * Customize these stats and badges for your business
 */

export interface SocialProofStat {
  value: string | number;
  label: string;
  icon?: string;
}

export interface TrustBadge {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  tooltip?: string;
}

// Stats displayed in the social proof bar
export const SOCIAL_PROOF_STATS: SocialProofStat[] = [
  {
    value: '4.9/5',
    label: 'Értékelés',
    icon: '⭐',
  },
  {
    value: '10+',
    label: 'Év tapasztalat',
    icon: '🏆',
  },
  {
    value: '500+',
    label: 'Elégedett ügyfél',
    icon: '😊',
  },
  {
    value: '24h',
    label: 'Válaszidő',
    icon: '⚡',
  },
];

// Trust badges (certifications, awards, etc.)
export const TRUST_BADGES: TrustBadge[] = [
  {
    id: 'secure',
    name: 'SSL Biztonságos',
    icon: '🔒',
    tooltip: 'Az adatait titkosítva tároljuk',
  },
  {
    id: 'gdpr',
    name: 'GDPR Megfelelő',
    icon: '🛡️',
    tooltip: 'Adatvédelmi szabályzatunk megfelel a GDPR követelményeknek',
  },
  {
    id: 'guarantee',
    name: 'Elégedettségi garancia',
    icon: '✅',
    tooltip: '30 napos pénzvisszafizetési garancia',
  },
  {
    id: 'local',
    name: 'Magyar vállalkozás',
    icon: '🇭🇺',
    tooltip: 'Helyi ügyfélszolgálattal',
  },
];

// Testimonials (optional - can be used on result/thank you page)
export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating: number;
  text: string;
  date?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Nagy Péter',
    role: 'Ügyvezető',
    company: 'Example Kft.',
    rating: 5,
    text: 'Professzionális munka, gyors válaszidő. Csak ajánlani tudom!',
  },
  {
    id: 'testimonial-2',
    name: 'Kiss Ágnes',
    role: 'Marketing vezető',
    company: 'Sample Zrt.',
    rating: 5,
    text: 'Nagyon elégedettek vagyunk az eredménnyel. Minden elvárásunkat teljesítették.',
  },
  {
    id: 'testimonial-3',
    name: 'Szabó János',
    role: 'Tulajdonos',
    rating: 5,
    text: 'Kiváló ár-érték arány, megbízható partner.',
  },
];
