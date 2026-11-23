[![Discord](https://img.shields.io/discord/1468295714961494029?color=7289da&label=Join%20Our%20Discord&logo=discord&logoColor=white&style=for-the-badge)](https://discord.gg/9F2NZuydXT)


<div align="center">

# 📦 Vinted ParcelPilot

[![Vibe Coded](https://img.shields.io/badge/Vibe_Coded-✨-8A2BE2?style=for-the-badge)](https://github.com)

**Turn Vinted's "My Orders" page into a powerful parcel-tracking dashboard.**

No more opening every order one by one — see carriers, tracking numbers, shipment status, delivery estimates and transit times at a glance.

[![Install on GreasyFork](https://img.shields.io/badge/⬇_Install-GreasyFork-670000?logo=greasyfork&logoColor=white&style=for-the-badge)](https://greasyfork.org/en/scripts/598835-vinted-parcelpilot)
[![Install from GitHub](https://img.shields.io/badge/⬇_Install-GitHub_Userscript-181717?logo=github&logoColor=white&style=for-the-badge)](https://raw.githubusercontent.com/Nigel1992/Vinted-ParcelPilot/main/vinted-parcelpilot.user.js)

[![Version](https://img.shields.io/badge/version-1.5.10-blue)](https://github.com/Nigel1992/Vinted-ParcelPilot/releases)
[![GitHub stars](https://img.shields.io/github/stars/Nigel1992/Vinted-ParcelPilot?style=social)](https://github.com/Nigel1992/Vinted-ParcelPilot/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Nigel1992/Vinted-ParcelPilot)](https://github.com/Nigel1992/Vinted-ParcelPilot/issues)
[![Last commit](https://img.shields.io/github/last-commit/Nigel1992/Vinted-ParcelPilot)](https://github.com/Nigel1992/Vinted-ParcelPilot/commits/main)
[![Userscript](https://img.shields.io/badge/type-Userscript-orange)](https://github.com/Nigel1992/Vinted-ParcelPilot)
[![License](https://img.shields.io/badge/license-Custom%20Non--Commercial-lightgrey)](https://github.com/Nigel1992/Vinted-ParcelPilot)

**[Install](#-installation) · [Features](#-features) · [Screenshots](#screenshots) · [Report an issue](https://github.com/Nigel1992/Vinted-ParcelPilot/issues) · [GreasyFork](https://greasyfork.org/en/scripts/598835-vinted-parcelpilot)**

</div>

---

**Vinted ParcelPilot** is a free userscript that adds parcel tracking to **Vinted**. It automatically detects tracking information, identifies **18+ carriers** (DHL, PostNL, DPD, GLS, UPS, InPost, bpost, Evri and more), shows shipment status and delivery estimates, tracks transit time, provides direct tracking links, and adds powerful **filtering, sorting, notes, tags, CSV export, caching and browser notifications**.

> Built for Vinted buyers and sellers who want better parcel tracking **without opening every order individually**.

### Why use ParcelPilot?

- 🔍 **All your Vinted parcels in one dashboard** — carrier, tracking number, status and ETA.
- 🚚 **Automatic carrier recognition** for 18+ shipping carriers and tracking links.
- 📊 **Filter, sort & export** — find delayed shipments fast and save records as CSV.
- 📝 **Local notes & tags** per parcel — stored privately in your browser.
- 🔔 **Optional notifications** when a shipment status changes.
- 🔐 **No account, no backend** — everything stays on your device.

---

## Screenshots

<details>
<summary><strong>Parcel Dashboard</strong></summary>

Shows the main ParcelPilot dashboard with parcel information, shipment status, tracking details, delivery estimates, and controls.

<img width="822" height="321" alt="image" src="https://github.com/user-attachments/assets/81afa125-1f45-4974-8147-ec56d7f9025c" />


</details>

<details>
<summary><strong>Parcel Details</strong></summary>

Shows the detailed shipment information displayed for an individual order.

<img width="798" height="402" alt="" src="https://github.com/user-attachments/assets/38c84fdf-92b1-47aa-85d3-810ba55de48e" />


</details>

<details>
<summary><strong>Options & Controls</strong></summary>

Shows the ParcelPilot options, filters, sorting controls, refresh settings, and other dashboard controls.

<img width="287" height="261" alt="" src="https://github.com/user-attachments/assets/eb4c12cf-b717-48ea-b3f6-96f1fec0f77c" />


</details>

---

## Overview

Vinted ParcelPilot enhances the Vinted **My Orders** page with a dedicated parcel-tracking layer.

Instead of opening each order separately, you can see important shipment information directly from one dashboard.

### What ParcelPilot can show

- Product name
- Product price
- Carrier
- Tracking number
- Shipment status
- Latest carrier update
- Estimated delivery
- Seller location
- Days in transit
- Time since the latest update
- Direct carrier tracking link
- Copy tracking-number button
- Notes
- Tags

It also provides filtering, sorting, automatic refreshing, caching, notifications, CSV export, compact mode, and more.

---

## Features

### 📦 Parcel Dashboard

ParcelPilot adds a dedicated parcel section to the Vinted orders page.

Each order can display:

- Product
- Price
- Carrier
- Tracking number
- Current shipment status
- Estimated delivery
- Latest tracking event
- Seller location
- Transit duration
- Time since the latest update
- Tracking link
- Copy tracking button

This makes it possible to quickly see the state of your shipments without opening every order individually.

---

### 🚚 Automatic Carrier Recognition

ParcelPilot automatically detects the shipping carrier associated with the tracking information.

Supported carriers currently include:

| Carrier | Supported |
|---|:---:|
| DHL | ✅ |
| PostNL | ✅ |
| DPD | ✅ |
| GLS | ✅ |
| UPS | ✅ |
| bpost | ✅ |
| InPost | ✅ |
| Homerr | ✅ |
| Relais Colis | ✅ |
| Chronopost | ✅ |
| Colissimo | ✅ |
| Royal Mail | ✅ |
| SEUR | ✅ |
| Correos | ✅ |
| Yodel | ✅ |
| Packeta | ✅ |
| Mondial Relay | ✅ |
| Evri | ✅ |

Carrier detection is based on the shipment and tracking information available from Vinted.

---

### 🔗 Automatic Tracking Links

When ParcelPilot recognizes a carrier, it can generate a direct tracking link.

Clicking the tracking link takes you directly to the carrier's tracking page with the shipment information.

No need to manually search for the carrier or copy the tracking number.

---

### 📋 Copy Tracking Number

A dedicated copy button makes it easy to copy a tracking number to the clipboard.

Useful when:

- Checking a shipment manually
- Contacting the carrier
- Sharing tracking information
- Searching for additional delivery information

---

### 📊 Smart Shipment Status

ParcelPilot organizes shipments into useful categories.

#### Shipment statuses

- **In transit**
- **Ready for pickup**
- **Label created**
- **Delayed**
- **Delivered**
- **Not shipped yet**
- **No tracking code**
- **Load failure**

When shipment information cannot be loaded, ParcelPilot provides a retry option instead of silently failing.

---

### ⏱️ Transit Time Tracking

ParcelPilot tracks how long a shipment has actually been in transit.

The transit counter starts from the **first real carrier scan**, rather than from label creation.

This prevents shipments from appearing to have been travelling for days when the carrier has not actually received the parcel yet.

For example:

```text
Label created
      ↓
Parcel handed to carrier
      ↓
First carrier scan  ← Transit timer starts here
      ↓
In transit
      ↓
Delivered
````

This also makes the transit-time information much more useful for comparing delivery performance.

---

### 🕒 Time Since Latest Update

ParcelPilot shows how long ago the latest carrier update occurred.

For example:

```text
Last update: 2 hours ago
```

or:

```text
Last update: 1 day ago
```

This makes it easier to spot shipments that have not received a recent tracking update.

---

### ⚠️ Stale Shipment Detection

If a shipment has not received a carrier update for an extended period, ParcelPilot can highlight it as stale.

By default, shipments can be considered stale after **5 days without a carrier update**.

This helps identify parcels that may require attention.

---

### 📍 Seller Location

When available, ParcelPilot also displays the seller's shared location.

This can provide useful context when estimating how long a shipment may take.

---

## 🔎 Filtering

ParcelPilot provides both Vinted's order-status filtering and its own parcel-status filtering.

### Order status

The order-status filter uses Vinted's own filtering system rather than attempting to recreate Vinted's order logic.

This helps keep the filtering behaviour consistent with Vinted itself.

### Parcel status

ParcelPilot adds shipment-specific filters:

* **All**
* **In transit**
* **Delayed**
* **Delivered**
* **No tracking**

The two filtering systems can be used together.

For example, you can show only:

```text
Vinted completed orders
+
Parcels currently in transit
```

### Compact toolbar layout

Both filter groups live in a single compact **FILTERS** section above your order list:

| Section  | Options |
| -------- | ------- |
| Filters  | Orders: Alles / In behandeling / Voltooid / Geannuleerd · Shipments: Alles / Onderweg / Vertraagd / Afgeleverd / Geen tracking |
| Overview | Total, On the way, Delayed, Delivered, No tracking counts + right-aligned **Export CSV** button |
| Controls | Refresh now, Sort, Direction, Auto refresh, Refresh interval, Notifications |

The Overview counts keep their semantic colours (for example, delayed shipments are shown in red), the selected filter chip is solid teal, and the whole toolbar wraps gracefully on smaller screens.

---

## ↕️ Sorting

ParcelPilot supports sorting your visible parcels by:

* Shipment status
* Latest update
* Estimated delivery
* Carrier
* Time in transit

Sorting can be performed:

* Ascending
* Descending

Estimated delivery dates are sorted using the underlying date value rather than the displayed text.

Shipments without an estimated delivery date are placed appropriately at the bottom of the list.

---

## 📝 Local Notes

You can add personal notes to individual parcels.

Examples:

```text
Gift for birthday
```

```text
Check package when delivered
```

```text
Seller said delivery may be delayed
```

Notes are stored locally in your browser.

They are not uploaded to a ParcelPilot server.

### Auto-save

Notes are automatically saved while you type.

The notes field also grows automatically to make longer notes easier to edit.

---

## 🏷️ Local Tags

Parcels can also be assigned custom tags.

For example:

```text
Gift
Important
Waiting
Problem
Personal
```

Tags are stored locally in your browser and remain associated with the corresponding shipment/order.

The tag field automatically adjusts to its contents while remaining compact.

---

## 📤 CSV Export

ParcelPilot can export the currently visible parcel information as a CSV file.

The export can include information such as:

* Product
* Price
* Carrier
* Tracking number
* Status
* Estimated delivery
* Latest update
* Seller location
* Transit time
* Notes
* Tags

Only the currently visible/filtered parcel data is exported.

This makes it useful for keeping your own shipment records or analysing delivery times.

---

## 🔄 Automatic Refresh

ParcelPilot can automatically refresh parcel information at a configurable interval.

This is useful when waiting for an important shipment because you do not have to manually reload the page.

The refresh interval can be configured in the ParcelPilot options.

---

## 🔔 Browser Notifications

Optional browser notifications can alert you when a cached parcel status changes.

For example:

```text
Shipment status changed
Your parcel has been delivered.
```

Notifications are optional and can be disabled.

ParcelPilot only checks for changes when shipment information is refreshed.

---

## 💾 Local Caching

ParcelPilot uses a local browser cache to reduce unnecessary requests.

The default cache duration is:

```text
5 minutes
```

This helps avoid repeatedly requesting the same tracking information when navigating around the page.

You can also manually clear the cache and force a fresh refresh.

### What is stored locally?

Depending on enabled features, ParcelPilot can store:

* Parcel tracking data
* Preferences
* Notes
* Tags
* Notification settings
* Cache information

This information stays in your browser.

---

## 🧹 Clear Cached Data

ParcelPilot provides a way to clear cached parcel information.

This is useful when:

* Tracking information appears outdated
* A carrier update has just happened
* You want to force a fresh lookup
* Troubleshooting tracking problems

After clearing the cache, ParcelPilot can retrieve fresh shipment information.

---

## 📱 Compact Mode

Compact mode reduces the amount of space used by the ParcelPilot interface.

This is useful when you have many orders and want to see more shipments on screen at once.

You can switch between the normal and compact layouts through the options.

---

## ⚙️ Options

ParcelPilot provides configurable options for its main features.

| Option           | Description                                     |
| ---------------- | ----------------------------------------------- |
| Auto refresh     | Automatically refresh parcel information        |
| Refresh interval | Controls how frequently automatic refresh runs  |
| Cache duration   | Controls how long parcel information is cached  |
| Notifications    | Enable or disable shipment status notifications |
| Compact mode     | Use a more compact parcel layout                |
| Debug mode       | Enable additional diagnostic logging            |
| Clear cache      | Remove locally cached tracking data             |

---

## 🐞 Debug Mode

ParcelPilot includes a debug mode for troubleshooting.

When enabled, additional information can be written to the browser console.

Debug information can include:

* Detected carrier
* Tracking information
* Shipment events
* Transit-start event
* Reason the transit counter started
* Detected Vinted order filter
* Cache behaviour
* Refresh behaviour
* Shipment parsing information

This can be useful when reporting a problem or investigating why a particular shipment is not being detected correctly.

---

## 🧠 Smart Transit Detection

ParcelPilot does not simply calculate transit time from the date a shipping label was created.

Instead, it attempts to identify the first meaningful carrier event indicating that the shipment has actually entered the carrier network.

For example:

```text
Shipping label created
        ↓
Waiting for parcel
        ↓
Parcel received by carrier
        ↓
Transit starts
        ↓
Parcel moving through network
        ↓
Delivered
```

This produces a more realistic transit duration.

Debug mode can show which event caused the transit timer to start and why it was selected.

---

## 💖 Support the Project

I build this project in my free time and don't need donations for myself. If you'd like to give something back, I'd kindly ask you to donate to a charity of your choice instead — they need it far more than I do. If you still prefer to support me directly in private, thank you so much; it's genuinely appreciated.

[![Ko-Fi](https://img.shields.io/badge/Ko--Fi-Support%20me-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/nigel1992)
[![PayPal](https://img.shields.io/badge/PayPal-Donate-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=KYV9ARF99ZSCE)
