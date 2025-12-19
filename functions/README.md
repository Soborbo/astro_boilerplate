# Functions API Directory

## FIX-003: Form Handler Strategy

### Calculator Forms
**Location:** `src/pages/api/calculator/submit.ts`

Az új lead generation kalkulátor a natív Astro API routes-ot használja:
- `/api/calculator/submit` - Kalkulátor form beküldés
- `/api/calculator/postcode` - Postcode lookup

**Features:**
- Zod validation
- Rate limiting (Cloudflare KV)
- Dual email provider (Resend + SendGrid)
- Structured logging
- Locale-aware

### Legacy Forms (submit-form-legacy.ts)
Ez a handler a **NEM-kalkulátor** formokhoz való (pl. contact page, newsletter).

Ha szükséged van rá, nevezd vissza `submit-form.ts`-re.
Ha nem, törölheted.

## Recommendation
- **Kalkulátor**: Használd a `src/pages/api/calculator/*` endpointokat
- **Egyéb formok**: Használd a legacy handlert vagy migráld az Astro API routes-ra
