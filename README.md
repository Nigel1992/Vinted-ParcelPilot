# Vinted ParcelPilot

Vinted ParcelPilot is a userscript that makes Vinted's orders page more useful by showing parcel details directly inside each order card.

It adds a quick **My Orders** shortcut and displays available shipment information such as the carrier, tracking ID, tracking page, latest shipment update, estimated delivery, and seller location when Vinted shares it.

[Install on GreasyFork](https://greasyfork.org/en/scripts/598835-vinted-parcelpilot)

![Vinted ParcelPilot screenshot](https://greasyfork.s3.us-east-2.amazonaws.com/w0fgyilq7ap421pngq4f79ablh8t)

## Features

- Adds a convenient **My Orders** shortcut to the Vinted header.
- Shows parcel tracking details directly on `/my_orders`.
- Displays carrier name, carrier branding, tracking ID, and a tracking page link when available.
- Shows the latest shipment update and estimated delivery period.
- Shows the seller's shared location for bought orders when Vinted provides it.
- Supports many Vinted country domains.
- Uses localized interface labels based on the current Vinted page language.

## Supported Sites

The script runs on many Vinted domains, including:

`vinted.nl`, `vinted.be`, `vinted.de`, `vinted.fr`, `vinted.es`, `vinted.it`, `vinted.co.uk`, `vinted.com`, and more.

## Installation

1. Install a userscript manager such as Tampermonkey or Violentmonkey.
2. Install [Vinted ParcelPilot from GreasyFork](https://greasyfork.org/en/scripts/598835-vinted-parcelpilot), or add `vinted.js` manually to your userscript manager.
3. Open Vinted while logged in and go to **My Orders**.

## FAQ

### Why do some tracking updates appear in another language?

Vinted ParcelPilot asks Vinted for shipment information using the current page language, but the actual tracking message is provided by Vinted or the shipping carrier. Sometimes that source data is returned in another language.

### Why is some information missing?

The script can only display information that Vinted makes available for that order. If there is no tracking ID, estimated delivery, carrier update, or shared seller location, the script cannot invent it.

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
