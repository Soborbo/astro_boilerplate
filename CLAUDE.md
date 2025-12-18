# CLAUDE.md - Laszlo Astro Projekt Standardok

## Alapelvek

- **Human Interface Guidelines** követése minden platformon
- **Mobile-first** megközelítés - mindig mobilról indulunk
- Progresszív enhancement: JS nélkül is működő alapfunkciók
- Lead generation fókusz minden design döntésnél
- **API kulcsokat SOHA ne hardcode-olj** - Cloudflare ENV vars-ból!

---

## Központi Konfiguráció

Minden projekt a `src/config/site.config.ts` fájlból olvassa:
- 3 fő szín (primary, secondary, accent)
- Cégadatok (Schema.org + Footer)
- SEO alapértékek
- Tracking beállítások

**⚠️ Ha változtatod a színeket, frissítsd a `tailwind.config.mjs`-t is!**

---

## Design Szabályok

### Hero Section (KÖTELEZŐ)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌─────────────────────┬─────────────────────┐    │
│   │                     │                     │    │
│   │   SZÖVEG (60%)      │    KÉP (40%)       │    │
│   │                     │    (kitölti)        │    │
│   │   H1 + leírás       │                     │    │
│   │   + CTA gombok      │                     │    │
│   │                     │                     │    │
│   └─────────────────────┴─────────────────────┘    │
│                                                     │
│   ┌──────┬──────┬──────┬──────┐  ← Stats/USP sor   │
│   │  1   │  2   │  3   │  4   │    Desktop: 4 col  │
│   └──────┴──────┴──────┴──────┘    Mobil: 2x2      │
│                                                     │
│   ↑ ABOVE THE FOLD - görgetés nélkül látható
└─────────────────────────────────────────────────────┘
```

- Szöveg/kép arány: **60% / 40%** (desktop)
- Kép: `loading="eager"`, `fetchpriority="high"`, `decoding="sync"`
- Retina: `densities={[1, 2]}` a Picture komponensben
- Stats sor MINDIG above the fold, képernyő aljához igazítva
- **NINCS animáció a fold felett!** Csak interakciók.

### LCP Optimalizálás (Hero Kép)

```astro
<Picture
  src={heroImage}
  formats={['avif', 'webp']}
  loading="eager"
  fetchpriority="high"
  decoding="sync"
  densities={[1, 2]}
  widths={[400, 600, 800, 1200, 1600]}
/>
```

### Header Viselkedés

**Desktop scroll animáció:**
- Lefelé görgetéskor (50px+): menü → CTA sor (Logo | Cím | Telefon | CTA)
- Felfelé görgetéskor: visszaáll teljes menüre
- Smooth transition (300ms ease)

**Mobil menü:**
- Fancy slide-in animáció jobbról
- Focus trap (keyboard a11y)
- Staggered animáció a menü elemeken
- Overlay + blur háttér

### Card Komponensek

```
┌─────────────────────┐
│   Tartalom          │
│   (flex-grow)       │
├─────────────────────┤
│   [ CTA Gomb ]      │  ← margin-top: auto
└─────────────────────┘    Vertikálisan centered szöveg
```

### Animációk

- **Fold FELETT**: NINCS betöltési animáció, csak hover/click interakciók
- **Fold ALATT**: `<InView>` komponens Intersection Observer-rel
- `prefers-reduced-motion` mindig tiszteletben tartva

### Magyar Tipográfia

Csak `lang="hu"` oldalakon:
```css
p, li, td, th { hyphens: auto; }
```

---

## Footer Cégadatok

- Név, cím kötelező
- Email + telefon **rejtett** reveal gombbal (bot védelem)
- Reveal kattintás → GTM conversion event
- Cégjegyzékszám, adószám megjelenítve

---

## Kötelező Feature-ök (40+)

### Képek/Média
- [ ] `<Picture />` komponens AVIF/WebP + retina (densities)
- [ ] Hero kép: `loading="eager"`, `fetchpriority="high"`
- [ ] YouTube/iframe lazy load

### SEO
- [ ] Schema.org teljes körű (Organization + WebSite + page-specific)
- [ ] Skip-to-content link
- [ ] Sitemap.xml (@astrojs/sitemap)
- [ ] Canonical URL minden oldalon
- [ ] hreflang (ha többnyelvű)
- [ ] Open Graph + Twitter Cards meta
- [ ] Breadcrumb + schema
- [ ] llms.txt AI crawlereknek
- [ ] robots.txt dinamikus
- [ ] FAQ komponens (Schema.org FAQPage)
- [ ] Testimonials komponens (Schema.org Review)

### Performance
- [ ] View Transitions (Astro)
- [ ] Partytown (GTM Web Worker-ben)
- [ ] font-display: swap + latin-ext subset
- [ ] Above-the-fold CSS inline
- [ ] DNS prefetch/preconnect
- [ ] Loading skeleton kalkulátoroknál
- [ ] Performance budget warning (dev: >100kb JS)
- [ ] Web Vitals monitoring (LCP, CLS)
- [ ] scroll-padding-top (80px)

### Forms
- [ ] Progresszív (JS nélkül is működő)
- [ ] Honeypot spam védelem
- [ ] Time-to-submit védelem (3mp+)
- [ ] Natív + custom validation (magyar/angol)
- [ ] Dedikált thank you page
- [ ] **Form Handler** (Google Sheets + Email + Slack)
- [ ] Rate limiting (5 req/hour/IP)

### Tracking
- [ ] UTM paraméterek session szintű megőrzése
- [ ] GTM via Partytown
- [ ] Footer reveal konverzió mérés

### Security
- [ ] CSP headers (wrangler.toml)
- [ ] noindex staging/dev URL-ekre
- [ ] rel="noopener noreferrer" külső linkekre
- [ ] API kulcsok CSAK Cloudflare ENV-ből

### UX
- [ ] Custom 404 oldal (lead gen)
- [ ] Print stylesheet
- [ ] prefers-reduced-motion támogatás
- [ ] Exit intent popup (6 szabály)
- [ ] Sticky mobile CTA (egységes design)
- [ ] Back to top button
- [ ] Focus-visible styles
- [ ] Focus trap (menü, modal)
- [ ] Toast notifications
- [ ] In-view animációk (csak fold alatt!)

### Accessibility
- [ ] aria-labels minden ikon-alapú gombon
- [ ] aria-expanded hamburger menün
- [ ] Skip to content link
- [ ] Focus trap modalokon

### Technikai
- [ ] Favicon set (apple-touch-icon, webmanifest)
- [ ] Error boundary
- [ ] Cloudflare Pages native

### CI/CD
- [ ] GitHub Actions auto-deploy
- [ ] PR preview deployments
- [ ] Lighthouse CI (90+ score target)

### i18n (Többnyelvűsítésre felkészítve)
- [ ] Központi fordítások (`src/config/i18n.ts`)
- [ ] hreflang automatikus
- [ ] Magyar hyphens csak hu oldalakon

---

## Exit Intent Szabályok

Csak akkor triggerel ha MIND igaz:
1. Desktop (mobilon NEM)
2. Session-ben még nem látta
3. Legalább 30mp eltelt
4. Nem töltötte ki a formot
5. Egér a viewport TETEJE felé megy
6. Gyors mozgás (>100px/sec)

---

## Form Handler

A `/functions/api/submit-form.ts` kezeli a form beküldéseket:

```
Form Submit → Honeypot check → Time-to-submit check → Rate limit
    ↓
    ├── Google Sheets (lead tárolás)
    ├── Email (Resend - értesítés)
    └── Slack (azonnali notification)
```

ENV változók (Cloudflare Dashboard):
- `GOOGLE_SHEETS_API_KEY`
- `GOOGLE_SHEET_ID`
- `RESEND_API_KEY`
- `NOTIFICATION_EMAIL`
- `SLACK_WEBHOOK_URL`

---

## Cloudflare Pages

- `output: 'static'` az astro.config.mjs-ben
- `wrangler.toml` tartalmazza a headers-t
- ENV változók a dashboard-on, NE a kódban!
- `.env.example` dokumentálja mi kell
- KV Namespace rate limiting-hez

---

## CI/CD (GitHub Actions)

```
Push to main     → Auto deploy to production
Open PR          → Preview deployment + Lighthouse audit
Lighthouse < 90  → Warning comment on PR
```

Szükséges GitHub Secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## Fájl Struktúra

```
├── .github/workflows/
│   └── deploy.yml        # CI/CD
├── functions/api/
│   └── submit-form.ts    # Form handler
├── src/
│   ├── config/
│   │   ├── site.config.ts    # Központi konfig
│   │   └── i18n.ts           # Fordítások
│   ├── components/
│   │   ├── ui/               # Atomi elemek
│   │   │   ├── BackToTop.astro
│   │   │   ├── Card.astro
│   │   │   ├── InView.astro
│   │   │   ├── SkipToContent.astro
│   │   │   ├── StickyMobileCTA.astro
│   │   │   └── Toast.astro
│   │   ├── sections/         # Nagyobb blokkok
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Hero.astro
│   │   │   ├── FAQ.astro
│   │   │   └── Testimonials.astro
│   │   ├── seo/
│   │   │   └── Breadcrumb.astro
│   │   └── scripts/
│   │       └── ExitIntent.astro
│   ├── layouts/
│   │   └── Base.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   ├── koszonjuk.astro
│   │   ├── robots.txt.ts
│   │   └── llms.txt.ts
│   └── styles/
│       └── global.css
├── .lighthouserc.json    # Lighthouse CI config
├── wrangler.toml         # Cloudflare config
└── CLAUDE.md             # Ez a fájl
```
