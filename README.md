# Vinted ParcelPilot

Vinted ParcelPilot is a userscript that makes Vinted's orders page more useful by showing parcel details directly inside each order card.

It adds a quick **My Orders** shortcut and displays available shipment information such as the carrier, tracking ID, tracking page, latest shipment update, estimated delivery, and seller location when Vinted shares it.

[Install on GreasyFork](https://greasyfork.org/en/scripts/598835-vinted-parcelpilot)

![Vinted ParcelPilot screenshot](https://greasyfork.s3.us-east-2.amazonaws.com/w0fgyilq7ap421pngq4f79ablh8t)

## What's new in 1.3.0

Compared with 1.2.2, this release improves the toolbar:

- Parcel status, order status, options and tools now have separate visual panels with explanatory text.
- Sort controls are explicitly labelled and support both ascending (low to high) and descending (high to low) order.
- The selected sort direction is remembered locally.

Compared with 1.2.1, this patch:

- Keeps the cursor in the note and tag fields while typing, even when Vinted updates the page.
- Stops order-card click handlers from interfering with note and tag input.
- Removes the theme selector and all ParcelPilot light/dark mode logic.

Compared with 1.2.0, this patch improves local notes and tags:

- Notes use a readable multi-line field with stronger contrast and visible focus styling.
- Notes and tags are saved automatically while typing, with the button still available for immediate saving.

Compared with 1.1.0, this release adds:

- A local dashboard with shipment counts, manual refresh, automatic refresh and configurable refresh intervals.
- A local cache to reduce repeated Vinted API requests, with a manual cache-clearing refresh.
- Sorting by status, latest update, estimated delivery, carrier or time in transit.
- CSV export of the visible parcel data, including local notes and tags.
- Per-order local notes and comma-separated local tags, stored only in this browser.
- Optional browser notifications when a cached parcel changes status.
- Stale-update highlighting for parcels without a recent carrier update.

Compared with the remote 1.0.0 baseline, this release adds:

- A complete parcel card with product, price, carrier, shipment status, tracking details, delivery estimate, latest update, and seller location.
- Status badges, transit-day counts, overdue-delivery highlighting, carrier logos, and carrier tracking-link fallbacks.
- One-click tracking-number copying and clear empty/error states with retry support.
- Combined order-status and parcel-status filtering in a single toolbar.
- Compact mode, animation controls, seller-location and carrier-logo toggles, debug logging, and remembered settings.
- Broader carrier recognition and localized labels across supported Vinted domains.

## Features

- Adds a convenient **My Orders** shortcut to the Vinted header.
- Shows a parcel card on `/my_orders` per order: product and price on top, a uniform shipment bar with carrier, status, tracking ID, copy button and tracking link, then a delivery details list. Every field is filled from the data available for that order, so partial records still render cleanly.
- Displays carrier name, carrier branding, tracking ID, and a tracking page link when available.
- Shows a status badge per parcel: on the way, ready for pickup, label created, delayed, or delivered.
- Copies the tracking number to your clipboard with one click, handy when contacting a seller or support.
- Builds a carrier tracking link for you when Vinted does not supply one, based on the carrier and tracking code.
- Shows how long a parcel has been in transit and how long ago the last update was.
- Counts transit days from the first real carrier scan, so creating a tracking code or label does not start the count early.
- Uses the singular form for one day ("1 dag onderweg", "1 day in transit").
- Highlights parcels whose estimated delivery date has passed without a delivery.
- Recognises 18 carriers with their branding, including DHL, PostNL, DPD, GLS, UPS, bpost, InPost, Homerr, Relais Colis, Chronopost, Colissimo, Royal Mail, SEUR, Correos, Yodel, Packeta, Mondial Relay and Evri.
- Explains empty states instead of staying silent: not shipped yet, no tracking code, or a load failure with a retry button.
- Adds a toolbar above `/my_orders` that combines Vinted's own order status filter with parcel status filters and settings, so there is only one menu.
- Includes a compact mode for users with many orders.
- Shows the seller's shared location for bought orders when Vinted provides it.
- Supports many Vinted country domains.
- Uses localized interface labels based on the current Vinted page language.
- Keeps preferences, cache, notes, tags and notification settings locally in the browser; no ParcelPilot server is used.

## Settings

A toolbar appears above your order list on `/my_orders`, divided into three labelled groups:

| Group | Options | Description |
| --- | --- | --- |
| Order status | Alles / In behandeling / Voltooid / Geannuleerd | Vinted's own order filter, moved into this toolbar. Vinted's original bar is hidden so there is only one menu. The buttons keep Vinted's exact wording in your page language. |
| Parcel status | Alles / Onderweg / Vertraagd / Afgeleverd / Geen tracking | Show only the parcels you care about. |
| Options | Compact, Animation, Seller location, Carrier logos, Debug | Display and loading preferences. |

The two status groups work together: pick a parcel status first, then narrow it down by order status, or the other way round.

| Option | Description |
| --- | --- |
| Compact | One line per order with carrier, status, tracking code and estimate. The detail list is hidden. |
| Animation | Play the loading animation. Turn off to load parcels without motion. |
| Seller location | Show the seller's shared location for bought orders. |
| Carrier logos | Use carrier logos when Vinted provides them, otherwise fall back to carrier colours. |
| Debug | Log extra information to the browser console, including which shipment event started the "days in transit" count and why, plus the detected Vinted order filter. |
| Auto refresh | Refresh active order data at the configured interval. |
| Refresh interval | Choose how often automatic refresh runs, in minutes. |
| Notifications | Ask for browser permission and notify you when a parcel status changes. |

The toolbar also provides sorting, a dashboard, a manual refresh button and CSV export. Parcel data is cached locally for five minutes by default. A parcel with no carrier update for five days is highlighted as stale; these thresholds and local settings can be changed in the userscript settings object.

If Vinted's order filter cannot be found on the page, the toolbar says so instead of showing buttons that would do nothing, and Vinted's own bar stays visible.

Settings are remembered in `localStorage` and reused the next time you open Vinted.

## Supported Sites

The script runs on many Vinted domains, including:

`vinted.nl`, `vinted.be`, `vinted.de`, `vinted.fr`, `vinted.es`, `vinted.it`, `vinted.co.uk`, `vinted.com`, and more.

## Installation

1. Install a userscript manager such as Tampermonkey or Violentmonkey.
2. Install [Vinted ParcelPilot from GreasyFork](https://greasyfork.org/en/scripts/598835-vinted-parcelpilot), or add `vinted.js` manually to your userscript manager.
3. Open Vinted while logged in and go to **My Orders**.

## FAQ

### What does a parcel card look like?

Each order gets one card, in three regions:

1. **Headline** — product name and price, read from the order card itself and linked to the listing. Omitted entirely when the order has no product data.
2. **Shipment bar** — one row carrying the carrier chip, the status badge, the days in transit, the tracking ID with its copy button, and a link to the carrier's tracking page. The bar keeps its shape whatever is missing: no carrier, no code, or no estimate.
3. **Delivery details** — a label/value list holding latest update, estimated delivery, and the seller's location. Each row is added only when that data exists, so the list never shows an empty line. The update message and its date always sit on separate lines, so they never run together.

Nothing is hardcoded into the layout. The product falls back from the link title to the image alt text to the link text; the price skips struck-through original amounts and picks the one actually charged; the latest update shows a message without a time, a time without a message, or both. Rows that are missing are left out rather than rendered blank.

Delivered parcels show no days-in-transit counter, and a parcel with no shipment data at all becomes a short notice row instead of a card. Compact mode keeps the headline and shipment bar and hides the detail list.

### How does the order status filter work?

Only Vinted knows which orders count as completed or cancelled, so the toolbar reuses Vinted's own filter control instead of guessing. Clicking a button in the *Order status* group drives that same control, which makes Vinted reload the list. Vinted's original filter bar is hidden so you have a single menu.

Your *Parcel status* choice is remembered separately and re-applied after each reload, so the two groups combine.

### Why do some tracking updates appear in another language?

Vinted ParcelPilot asks Vinted for shipment information using the current page language, but the actual tracking message is provided by Vinted or the shipping carrier. Sometimes that source data is returned in another language.

### Why is some information missing?

The script can only display information that Vinted makes available for that order. If there is no tracking ID, estimated delivery, carrier update, or shared seller location, the script cannot invent it. In that case it tells you which situation applies: not shipped yet, no tracking code, or a failed load.

### Does this script collect or send my data elsewhere?

No. The script runs in your browser and uses Vinted's own pages and APIs while you are logged in. It does not send your order or tracking information to any external server.

### Why do I need to be logged in?

Your order and shipment information is only available through your own Vinted account, so the script can only show it when Vinted can access your orders.

### Is the screenshot real order data?

No. The screenshot uses mock or hidden data and does not show real tracking IDs, names, addresses, or private order details.

## Privacy

Vinted ParcelPilot does not use third-party servers, analytics, tracking pixels, or external data collection. All displayed data comes from Vinted pages and Vinted API responses available to your logged-in browser session.

## License

Custom Non-Commercial Attribution License.

You may use, modify, and share this project for personal and non-commercial purposes. You may not sell it or use it commercially. Modified versions must keep credit to Nigel1992 and link back to the original repository:

https://github.com/Nigel1992/Vinted-ParcelPilot
