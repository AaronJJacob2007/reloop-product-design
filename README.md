# ReLoop

![ReLoop leaf-loop wordmark](public/brand/reloop-wordmark.svg)

A responsive marketplace for sustainable everyday essentials, built with React and TypeScript. Includes an installable PWA, a photo-based product catalog and a complete simulated shopping journey.

The approved brand uses a thin wordmark with a leaf-loop replacing the two adjacent o's. Shared SVG assets live in `public/brand/`; the same symbol supplies the favicon, regular and maskable PWA icons, and Apple touch icon. Use the light wordmark on dark backgrounds. Earlier design drafts are preserved in Figma.

[Live website](https://reloop-product-design.vercel.app) · [Editable Figma designs](https://www.figma.com/design/dheQsHggvMFP4XUWhjAURe?node-id=32-2)

## Features

- Catalog, search, category/price/Eco-Score filters and sorting
- Product details, materials and care information
- Persistent wishlist and shopping cart with quantity controls
- Validated delivery and separate billing forms
- Standard, Express and Overnight shipping selections
- Simulated UPI, card and cash-on-delivery choices
- Order history and expandable delivery-stage preview controls
- Illustrative environmental impact dashboard
- Responsive layouts, keyboard navigation and offline PWA routes

## Stack

React 19, TypeScript, Vite, Tailwind CSS, React Router, Lucide icons and vite-plugin-pwa. Product data comes from local JSON; browser state uses localStorage. Hosted on Vercel. No backend or secret environment variables are required.

## Run locally

Use Node.js 22 or 24 LTS.

```sh
npm ci
npm run dev
```

Open the address printed in the terminal. For the production build and offline PWA:

```sh
npm run build
npm run preview
```

Open http://127.0.0.1:4173. The Windows launcher `Start ReLoop.cmd` can serve the built app after running `npm run build`. Build output and dependencies are intentionally excluded from Git.

## Tests

```sh
npm test
npm run build
npm run preview
```

With preview running, use a second terminal:

```sh
npm run test:browser
```

Browser checks currently use Microsoft Edge (`channel: msedge`). Install Edge or adjust the channel in `playwright.config.ts`. The suites cover checkout, wishlist/cart persistence, shipping calculations, payment choices, order-stage previews, responsive overflow, accessibility scans and offline routes. Automated scans do not replace physical-device or assistive-technology testing.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Routing, navigation, footer and installation help |
| `src/pages/` | Storefront, catalog, product, bag, checkout, orders and impact views |
| `src/components.tsx` | Shared product cards, forms and dialogs |
| `src/model.ts` | Prices, validation, Eco-Scores and storage sanitization |
| `src/store.tsx` | Cart, wishlist and order state |
| `src/data/products.json` | Mock product dataset |
| `public/photos/` | Optimized product photographs |
| `tests/` | Model and browser verification |

## Data and presentation limits

This is an academic prototype. Products, prices, scores, environmental inputs and delivery assumptions are illustrative. No payment is processed, no shipment is arranged, and no verified certification or environmental savings are claimed. Footer contact details are fictional placeholders.

Cart, wishlist and up to 200 orders stay in this browser. Delivery and billing details are held only in memory and are not saved or transmitted. Data does not sync across devices. Order-stage previews are manually advanced, with no courier integration. Use sample addresses for demonstrations.

Prices use integer paise. Standard shipping is ₹60 below ₹999 and free from ₹999; Express is ₹120 and Overnight is ₹180. Illustrative tax is 18% of product subtotal. Eco-Scores average four equally weighted inputs from 1–5.

## Deployment and attribution

Vercel settings: Vite framework, `npm ci`, build `npm run build`, output `dist`. The included `vercel.json` supports client-side routes. No local `.vercel` settings or credentials belong in the repository.

See [PHOTO-CREDITS.md](PHOTO-CREDITS.md) for Pexels sources and licensing information. Font and icon license copies are included in `public/licenses/`. Original product SVG illustrations are preserved in `public/art/`.
