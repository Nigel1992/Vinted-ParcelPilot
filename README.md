# Vinted ParcelPilot

[![GreasyFork](https://img.shields.io/badge/Install-GreasyFork-670000?logo=greasyfork&logoColor=white)](https://greasyfork.org/en/scripts/598835-vinted-parcelpilot)
[![Version](https://img.shields.io/badge/version-1.5.5-blue)](https://github.com/Nigel1992/Vinted-ParcelPilot)
[![Userscript](https://img.shields.io/badge/type-Userscript-orange)](https://github.com/Nigel1992/Vinted-ParcelPilot)
[![License](https://img.shields.io/badge/license-Custom%20Non--Commercial-lightgrey)](https://github.com/Nigel1992/Vinted-ParcelPilot)

**Vinted ParcelPilot** is a feature-rich userscript that turns Vinted's order page into a much more useful parcel tracking dashboard.

It automatically detects tracking information, identifies carriers, shows shipment status and delivery estimates, tracks transit time, provides direct tracking links, and adds powerful filtering, sorting, notes, tags, CSV export, caching, notifications, and more.

> Built for Vinted users who want more useful parcel tracking without having to open every order individually.

---

## Screenshots

<details>
<summary><strong>Parcel Dashboard</strong></summary>

Shows the main ParcelPilot dashboard with parcel information, shipment status, tracking details, delivery estimates, and controls.

<img width="816" height="307" alt="Vinted ParcelPilot parcel dashboard" src="https://github.com/user-attachments/assets/249ec24d-43fe-4182-bd49-73d83957cd5e" />

</details>

<details>
<summary><strong>Parcel Details</strong></summary>

Shows the detailed shipment information displayed for an individual order.

<img width="287" height="261" alt="Vinted ParcelPilot parcel details" src="https://github.com/user-attachments/assets/eb4c12cf-b717-48ea-b3f6-96f1fec0f77c" />

</details>

<details>
<summary><strong>Options & Controls</strong></summary>

Shows the ParcelPilot options, filters, sorting controls, refresh settings, and other dashboard controls.

<img width="798" height="402" alt="Vinted ParcelPilot options and controls" src="https://github.com/user-attachments/assets/38c84fdf-92b1-47aa-85d3-810ba55de48e" />

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

## 🌍 Supported Vinted Sites

ParcelPilot is designed to work across Vinted's supported country domains.

The interface follows the language of the current Vinted page where possible.

This means ParcelPilot can adapt its labels to the language Vinted is currently using rather than forcing a separate language configuration.

---

## 🔐 Privacy

ParcelPilot does **not** require a ParcelPilot account.

There is no ParcelPilot backend collecting your shipment data.

Your local preferences, notes, tags, cache, and notification settings are stored in your browser.

Parcel tracking information is retrieved as required by the userscript and Vinted's available shipment information.

### No external ParcelPilot database

There is no central ParcelPilot database containing:

* Your orders
* Your tracking numbers
* Your notes
* Your tags
* Your Vinted account information

Local data remains on your device/browser.

---

## 🛠️ Installation

### Recommended: GreasyFork

Install the latest release directly from GreasyFork:

**[https://greasyfork.org/en/scripts/598835-vinted-parcelpilot](https://greasyfork.org/en/scripts/598835-vinted-parcelpilot)**

You will need a userscript manager such as:

* Tampermonkey
* Violentmonkey
* Another compatible userscript manager

After installing the script:

1. Open Vinted.
2. Go to **My Orders**.
3. Open the ParcelPilot dashboard.
4. ParcelPilot will begin processing the available orders.

---

## 🧩 Development Installation

If you want to develop or test ParcelPilot directly from GitHub:

```bash
git clone https://github.com/Nigel1992/Vinted-ParcelPilot.git
```

Then install the userscript from the repository using your preferred userscript manager.

Repository:

**[https://github.com/Nigel1992/Vinted-ParcelPilot](https://github.com/Nigel1992/Vinted-ParcelPilot)**

---

## 🐛 Reporting Issues

Before reporting an issue, try the following:

1. Make sure you are using the latest ParcelPilot version.
2. Refresh the Vinted page.
3. Clear the ParcelPilot cache.
4. Check whether the issue affects one shipment or multiple shipments.
5. Enable debug mode if necessary.
6. Check the browser console for relevant errors.

When reporting an issue, please include:

* ParcelPilot version
* Browser
* Userscript manager
* Vinted country/domain
* Carrier
* Whether the shipment has a tracking number
* What ParcelPilot displays
* What you expected to happen
* Relevant console/debug information

Avoid posting personal information or complete tracking details publicly.

---

## 📝 Changelog

### 1.5.5

* Redesigned the dashboard toolbar to be more compact and easier to scan.
* Combined the order and parcel status filters into one **FILTERS** section.
* Replaced the large bordered stat badges with a compact, color-coded overview line.
* Consolidated sorting, refresh, auto-refresh and notification controls into a single toolbar row.
* Moved the CSV export action into the Overview header.
* Reduced nested borders and removed unused styles for a lighter layout.
* Added clearer selected, hover and focus button states.
* Improved wrapping and touch-friendly behaviour on mobile and tablet screens.

### 1.5.4

* Improved interaction between Vinted order cards and ParcelPilot inputs.
* Prevented scheduled page scans while Notes or Tags fields are focused.
* Prevented Vinted order-card handlers from receiving typing events from Notes and Tags.
* Prevented Vinted order-card handlers from receiving focus events from Notes and Tags.
* Prevented Vinted order-card handlers from receiving pointer events from Notes and Tags.
* Improved editing reliability for local notes and tags.
* Preserved normal ParcelPilot interaction while editing fields.

### 1.5.x

* Improved parcel dashboard.
* Improved shipment filtering.
* Improved sorting.
* Improved local notes and tags.
* Improved caching.
* Improved refresh handling.
* Improved carrier detection.
* Improved shipment status handling.
* Improved transit-time calculation.
* Improved debug logging.
* Improved Vinted integration.

### 1.4.x

* Added additional carrier support.
* Improved tracking links.
* Improved shipment status detection.
* Added additional filtering and sorting functionality.
* Improved delivery estimates.
* Improved parcel information display.

### 1.3.x

* Added local notes.
* Added local tags.
* Added CSV export.
* Added automatic refresh options.
* Added configurable caching.
* Added compact mode.
* Added additional shipment information.

### 1.2.x

* Added improved carrier recognition.
* Added tracking links.
* Added copy tracking functionality.
* Improved shipment information handling.
* Improved order-page integration.

### 1.1.x

* Improved shipment detection.
* Improved parcel status handling.
* Improved error handling.
* Improved compatibility with Vinted's order page.

### 1.0.x

Initial public ParcelPilot release with the core parcel tracking functionality.

---

## 🗺️ Roadmap

Possible future improvements include:

* Additional carrier integrations
* More advanced shipment analytics
* More delivery-history statistics
* Improved international carrier detection
* Additional notification options
* Further dashboard customization
* Additional export formats
* More detailed shipment-event history
* Continued compatibility improvements as Vinted changes its website

The roadmap may change depending on Vinted's website and API changes.

---

## 🤝 Contributing

Contributions, bug reports, feature requests, and improvements are welcome.

Repository:

**[https://github.com/Nigel1992/Vinted-ParcelPilot](https://github.com/Nigel1992/Vinted-ParcelPilot)**

If you want to contribute code:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the userscript on Vinted.
5. Submit a pull request.

Please keep changes focused and avoid introducing unnecessary dependencies.

---

## 📄 License

Vinted ParcelPilot is released under the **Custom Non-Commercial Attribution License**.

### You may

* Use the project for personal purposes.
* Modify the project.
* Share modified versions.
* Study and adapt the source code.

### You may not

* Sell ParcelPilot itself.
* Use ParcelPilot or modified versions for commercial purposes without permission.
* Remove the original attribution.

Modified versions must retain credit to **Nigel1992** and include a link to the original repository.

For the complete license terms, see the repository's license file.

---

## 🔗 Links

* **GreasyFork:** [https://greasyfork.org/en/scripts/598835-vinted-parcelpilot](https://greasyfork.org/en/scripts/598835-vinted-parcelpilot)
* **GitHub:** [https://github.com/Nigel1992/Vinted-ParcelPilot](https://github.com/Nigel1992/Vinted-ParcelPilot)

---

## ⭐ Support the Project

If ParcelPilot is useful to you, consider:

* ⭐ Starring the GitHub repository
* 🐛 Reporting bugs
* 💡 Suggesting improvements
* 🔧 Contributing code
* 📣 Sharing the project with other Vinted users

Every bit of feedback helps improve ParcelPilot.

---

<p align="center">
  <strong>Vinted ParcelPilot</strong><br>
  Better parcel tracking directly inside Vinted.
</p>
```
