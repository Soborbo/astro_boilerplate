/**
 * Email typo detection
 * Suggests corrections for common email domain typos
 */

// Common email domains
const COMMON_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'me.com',
  'freemail.hu',
  'citromail.hu',
  't-online.hu',
  'gmail.hu',
];

// Common typos mapping
const DOMAIN_TYPOS: Record<string, string> = {
  // Gmail variations
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gamil.com': 'gmail.com',

  // Yahoo variations
  'yaho.com': 'yahoo.com',
  'yahho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',

  // Hotmail/Outlook variations
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',

  // Hungarian domains
  'fremail.hu': 'freemail.hu',
  'fremeail.hu': 'freemail.hu',
  'citromal.hu': 'citromail.hu',
  'citromaill.hu': 'citromail.hu',
};

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function getSuggestion(email: string): string | null {
  if (!email || !email.includes('@')) {
    return null;
  }

  const [localPart, domain] = email.toLowerCase().split('@');

  if (!domain) {
    return null;
  }

  // Check exact typo match
  if (DOMAIN_TYPOS[domain]) {
    return `${localPart}@${DOMAIN_TYPOS[domain]}`;
  }

  // Check fuzzy match against common domains
  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  for (const commonDomain of COMMON_DOMAINS) {
    const distance = levenshteinDistance(domain, commonDomain);

    // Only suggest if distance is 1-2 (minor typo)
    if (distance > 0 && distance <= 2 && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = commonDomain;
    }
  }

  if (bestMatch && bestDistance <= 2) {
    return `${localPart}@${bestMatch}`;
  }

  return null;
}
