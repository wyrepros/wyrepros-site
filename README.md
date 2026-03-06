# Wyre Pros Site

Frontend project for Wyre Pros marketing site (React + Vite).

## Local development

```bash
npm install
npm run dev
```

### Lead form webhook setup

Create `.env.local`:

```bash
VITE_LEAD_WEBHOOK_URL=https://your-webhook-endpoint.example.com/leads
```

The contact form posts JSON to this URL. If it is missing, the form will show a configuration warning instead of submitting.

### SEO quick-win pack

- `index.html` includes canonical, OG/Twitter tags, and JSON-LD schema (`Organization`, `LocalBusiness`, `WebSite`)
- `public/robots.txt` + `public/sitemap.xml` are included

If your production domain is not `https://wyrepros.com`, update those URLs before deployment.

## Build

```bash
npm run build
```

## Maintenance sweep

```bash
npm run maintain
```

This runs lint + build and syncs the output to the local preview target.
