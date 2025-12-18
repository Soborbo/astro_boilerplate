# Astro Laszlo Starter

Enterprise-grade Astro starter template lead generation oldalakhoz.

## ✨ Features

### Performance
- ⚡ Astro 4 + View Transitions
- 🖼️ Képoptimalizálás (AVIF/WebP, retina)
- 🏃 Partytown (GTM Web Worker-ben)
- 📊 Web Vitals monitoring
- 🎯 LCP optimalizálás (eager loading, fetchpriority)

### SEO
- 📋 Schema.org (Organization, LocalBusiness, FAQPage, Review)
- 🗺️ Automatikus sitemap
- 🤖 robots.txt + llms.txt (AI crawlerek)
- 🌍 i18n ready (hreflang)
- 🔗 Canonical URLs

### Lead Generation
- 📝 Form handler (Google Sheets + Email + Slack)
- 🚪 Exit intent popup
- 📱 Sticky mobile CTA
- 🔄 UTM tracking
- ❓ FAQ komponens
- ⭐ Testimonials komponens

### Developer Experience
- 🚀 Cloudflare Pages native
- 🔄 GitHub Actions CI/CD
- 🔦 Lighthouse CI
- 📝 TypeScript
- 🎨 Tailwind CSS

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/your-username/astro-laszlo-starter.git my-project
cd my-project

# 2. Install
npm install

# 3. Configure
# - Edit src/config/site.config.ts (colors, company info)
# - Edit src/config/i18n.ts (translations)

# 4. Develop
npm run dev

# 5. Deploy
npm run cf:deploy
```

## 📁 Project Structure

```
├── .github/workflows/    # CI/CD
├── functions/api/        # Cloudflare Workers (form handler)
├── src/
│   ├── config/
│   │   ├── site.config.ts   # 🎨 Colors, company info, SEO
│   │   └── i18n.ts          # 🌍 Translations
│   ├── components/
│   │   ├── ui/              # Buttons, Cards, Toast, etc.
│   │   ├── sections/        # Header, Footer, Hero, FAQ, Testimonials
│   │   ├── seo/             # Breadcrumb
│   │   └── scripts/         # ExitIntent
│   ├── layouts/
│   │   └── Base.astro       # Main layout (SEO, GTM, etc.)
│   └── pages/
├── wrangler.toml            # Cloudflare config
└── CLAUDE.md                # AI assistant instructions
```

## ⚙️ Configuration

### 1. Colors (site.config.ts)

```typescript
colors: {
  primary: {
    DEFAULT: '#0ea5e9',   // Main color
    light: '#38bdf8',
    dark: '#0369a1',
  },
  // ...
}
```

> ⚠️ Also update `tailwind.config.mjs` to match!

### 2. Company Info (site.config.ts)

```typescript
company: {
  legalName: 'Your Company Kft.',
  registrationNumber: '01-09-123456',
  vatNumber: 'HU12345678',
  address: { ... },
  contact: { phone, email },
}
```

### 3. Environment Variables

Set these in Cloudflare Dashboard (Settings > Environment Variables):

| Variable | Description |
|----------|-------------|
| `GTM_ID` | Google Tag Manager ID |
| `GOOGLE_SHEETS_API_KEY` | For form submissions |
| `GOOGLE_SHEET_ID` | Target spreadsheet |
| `RESEND_API_KEY` | Email notifications |
| `NOTIFICATION_EMAIL` | Where to send notifications |
| `SLACK_WEBHOOK_URL` | Slack notifications (optional) |

## 📝 Form Handler

The form handler (`functions/api/submit-form.ts`) provides:

- ✅ Honeypot spam protection
- ✅ Time-to-submit validation (bot detection)
- ✅ Rate limiting (5 requests/hour/IP)
- ✅ Google Sheets integration
- ✅ Email notifications (Resend)
- ✅ Slack notifications

### Usage

```html
<form action="/api/submit-form" method="POST">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <input type="text" name="website" class="honeypot" /> <!-- Spam trap -->
  <input type="hidden" name="form_start_time" /> <!-- Bot detection -->
  <button type="submit">Submit</button>
</form>
```

## 🚀 Deployment

### Automatic (GitHub Actions)

1. Add secrets to GitHub repo:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

2. Push to `main` → Auto deploy
3. Open PR → Preview deployment + Lighthouse audit

### Manual

```bash
npm run cf:deploy
```

## 📊 Lighthouse Targets

| Metric | Target |
|--------|--------|
| Performance | ≥ 90 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |

## 🤖 AI Assistant (Claude Code)

This project includes a `CLAUDE.md` file with instructions for Claude Code. It ensures consistent code quality and adherence to project standards.

## 📄 License

MIT
