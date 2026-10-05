// ==UserScript==
// @name         Vinted ParcelPilot
// @namespace    https://www.vinted.nl/
// @version      1.0.0
// @description  Adds an orders shortcut and shows carrier, tracking ID and link, latest shipment update, estimated delivery, and shared seller location on Vinted orders.
// @license      MIT
// @include      /^https:\/\/(?:www\.)?vinted\.(?:at|be|com|com\.au|co\.uk|cz|de|dk|ee|es|fi|fr|gr|hr|hu|ie|it|lt|lu|lv|nl|pl|pt|ro|se|si|sk)\/.*$/
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
	'use strict';

	const vintedDomain = location.hostname.replace(/^www\./, '');
	const apiHost = vintedDomain === 'vinted.com' ? 'api.www.vinted.com' : `api.${vintedDomain}`;
	const API_ORIGIN = `https://${apiHost}`;
	const CONVERSATION_API = `${API_ORIGIN}/messaging/main/conversations/`;
	const orderResults = new Map();
	const pending = new Map();
	const sellerLocationResults = new Map();
	const pendingSellerLocations = new Map();
	const pageLocale = document.documentElement.lang || navigator.language || 'en';
	const language = pageLocale.toLowerCase().split(/[-_]/)[0];
	const apiLocale = pageLocale.replace('_', '-');
	const translations = {
		en: { trackingId: 'Tracking ID', trackingPage: 'Tracking page', latestUpdate: 'Latest update', estimatedDelivery: 'Estimated delivery', sellerLocation: 'Seller location', location: 'Location', myOrders: 'My orders', loading: 'Loading tracking information…', unavailable: 'Tracking code unavailable' },
		nl: { trackingId: 'Tracking-ID', trackingPage: 'Trackingpagina', latestUpdate: 'Laatste update', estimatedDelivery: 'Verwachte bezorging', sellerLocation: 'Locatie verkoper', location: 'Locatie', myOrders: 'Mijn bestellingen', loading: 'Trackinginformatie ophalen…', unavailable: 'Trackingcode niet beschikbaar' },
		fr: { trackingId: 'Numéro de suivi', trackingPage: 'Page de suivi', latestUpdate: 'Dernière mise à jour', estimatedDelivery: 'Livraison estimée', sellerLocation: 'Lieu du vendeur', location: 'Lieu', myOrders: 'Mes commandes', loading: 'Récupération des informations de suivi…', unavailable: 'Numéro de suivi indisponible' },
		et: { trackingId: 'Jälgimiskood', trackingPage: 'Jälgimisleht', latestUpdate: 'Viimane uuendus', estimatedDelivery: 'Eeldatav saabumine', sellerLocation: 'Müüja asukoht', location: 'Asukoht', myOrders: 'Minu tellimused', loading: 'Jälgimisandmete laadimine…', unavailable: 'Jälgimiskood pole saadaval' },
		es: { trackingId: 'Código de seguimiento', trackingPage: 'Página de seguimiento', latestUpdate: 'Última actualización', estimatedDelivery: 'Entrega estimada', sellerLocation: 'Ubicación del vendedor', location: 'Ubicación', myOrders: 'Mis pedidos', loading: 'Cargando información de seguimiento…', unavailable: 'Código de seguimiento no disponible' },
		lt: { trackingId: 'Siuntos sekimo numeris', trackingPage: 'Siuntos sekimo puslapis', latestUpdate: 'Paskutinis atnaujinimas', estimatedDelivery: 'Numatomas pristatymas', sellerLocation: 'Pardavėjo vieta', location: 'Vieta', myOrders: 'Mano užsakymai', loading: 'Įkeliama siuntos sekimo informacija…', unavailable: 'Sekimo numeris nepasiekiamas' },
		lv: { trackingId: 'Sūtījuma izsekošanas numurs', trackingPage: 'Izsekošanas lapa', latestUpdate: 'Pēdējais atjauninājums', estimatedDelivery: 'Paredzamā piegāde', sellerLocation: 'Pārdevēja atrašanās vieta', location: 'Atrašanās vieta', myOrders: 'Mani pasūtījumi', loading: 'Ielādē sūtījuma izsekošanas informāciju…', unavailable: 'Izsekošanas numurs nav pieejams' },
		de: { trackingId: 'Sendungsnummer', trackingPage: 'Sendungsverfolgung', latestUpdate: 'Letzte Aktualisierung', estimatedDelivery: 'Voraussichtliche Zustellung', sellerLocation: 'Standort des Verkäufers', location: 'Standort', myOrders: 'Meine Bestellungen', loading: 'Sendungsverfolgung wird geladen…', unavailable: 'Sendungsnummer nicht verfügbar' },
		it: { trackingId: 'Codice di tracciamento', trackingPage: 'Pagina di tracciamento', latestUpdate: 'Ultimo aggiornamento', estimatedDelivery: 'Consegna prevista', sellerLocation: 'Posizione del venditore', location: 'Posizione', myOrders: 'I miei ordini', loading: 'Caricamento delle informazioni di tracciamento…', unavailable: 'Codice di tracciamento non disponibile' },
		pt: { trackingId: 'Código de rastreamento', trackingPage: 'Página de rastreamento', latestUpdate: 'Última atualização', estimatedDelivery: 'Entrega prevista', sellerLocation: 'Localização do vendedor', location: 'Localização', myOrders: 'As minhas encomendas', loading: 'A carregar informações de rastreamento…', unavailable: 'Código de rastreamento indisponível' },
		cs: { trackingId: 'Sledovací číslo', trackingPage: 'Sledování zásilky', latestUpdate: 'Poslední aktualizace', estimatedDelivery: 'Odhadované doručení', sellerLocation: 'Místo prodejce', location: 'Poloha', myOrders: 'Moje objednávky', loading: 'Načítají se informace o zásilce…', unavailable: 'Sledovací číslo není k dispozici' },
		sk: { trackingId: 'Sledovacie číslo', trackingPage: 'Sledovanie zásielky', latestUpdate: 'Posledná aktualizácia', estimatedDelivery: 'Odhadované doručenie', sellerLocation: 'Miesto predajcu', location: 'Poloha', myOrders: 'Moje objednávky', loading: 'Načítavajú sa informácie o zásielke…', unavailable: 'Sledovacie číslo nie je k dispozícii' },
		pl: { trackingId: 'Numer przesyłki', trackingPage: 'Śledź przesyłkę', latestUpdate: 'Ostatnia aktualizacja', estimatedDelivery: 'Przewidywana dostawa', sellerLocation: 'Lokalizacja sprzedawcy', location: 'Lokalizacja', myOrders: 'Moje zamówienia', loading: 'Wczytywanie informacji o przesyłce…', unavailable: 'Numer przesyłki niedostępny' },
		sv: { trackingId: 'Spårningsnummer', trackingPage: 'Spåra paketet', latestUpdate: 'Senaste uppdateringen', estimatedDelivery: 'Beräknad leverans', sellerLocation: 'Säljarens plats', location: 'Plats', myOrders: 'Mina beställningar', loading: 'Hämtar spårningsinformation…', unavailable: 'Spårningsnummer saknas' },
		sl: { trackingId: 'Številka za sledenje', trackingPage: 'Sledenje pošiljki', latestUpdate: 'Zadnja posodobitev', estimatedDelivery: 'Predvidena dostava', sellerLocation: 'Lokacija prodajalca', location: 'Lokacija', myOrders: 'Moja naročila', loading: 'Nalaganje podatkov za sledenje…', unavailable: 'Številka za sledenje ni na voljo' },
		hu: { trackingId: 'Követési szám', trackingPage: 'Csomag nyomon követése', latestUpdate: 'Legutóbbi frissítés', estimatedDelivery: 'Várható kézbesítés', sellerLocation: 'Az eladó helye', location: 'Hely', myOrders: 'Rendeléseim', loading: 'A nyomon követési adatok betöltése…', unavailable: 'A követési szám nem érhető el' },
	};
	const labels = translations[language] ?? translations.en;
	let scanTimer;

	function orderIdFromHref(href) {
		const pathMatch = href.match(/\/(?:inbox|orders?|my_orders|transactions?)\/(\d+)(?:[/?#]|$)/i);
		if (pathMatch) return pathMatch[1];
		try {
			const url = new URL(href, location.origin);
			return url.searchParams.get('order_id') ?? url.searchParams.get('orderId');
		} catch {
			return null;
		}
	}

	function orderIdFromElement(element) {
		const fromHref = orderIdFromHref(element.href ?? '');
		if (fromHref) return fromHref;
		for (const name of ['data-order-id', 'data-orderid', 'data-transaction-id']) {
			const value = element.getAttribute(name);
			if (value && /^\d+$/.test(value)) return value;
		}
		const testId = element.getAttribute('data-testid') ?? '';
		return testId.match(/(?:order|transaction)[-_](\d+)/i)?.[1] ?? null;
	}

	function findOrderCard(orderElement) {
		let node = orderElement.parentElement;
		for (let depth = 0; node && depth < 9; depth += 1, node = node.parentElement) {
			const hasProduct = node.querySelector('a[href*="/items/"], img');
			const hasOrderId = orderIdFromElement(node)
				|| [...node.querySelectorAll('a[href], [data-order-id], [data-orderid], [data-transaction-id], [data-testid]')]
					.some((element) => orderIdFromElement(element));
			if (hasProduct && hasOrderId) return node;
		}
		return orderElement.closest('[data-testid*="order"], [role="listitem"], article, li')
			?? orderElement.parentElement;
	}

	function collectTracking(data) {
		const result = { code: '', url: '', carrier: '', carrierLogo: '', latestMessage: '', latestTimestamp: '', latestLocation: '', estimatedDelivery: '' };
		const visited = new WeakSet();

		function walk(value) {
			if (!value || typeof value !== 'object' || visited.has(value)) return;
			visited.add(value);

			for (const [key, entry] of Object.entries(value)) {
				const normalizedKey = key.toLowerCase();
				if (typeof entry === 'string') {
					if (!result.code && /tracking.*(?:code|number)|(?:code|number).*tracking/i.test(normalizedKey)) {
						result.code = entry.trim();
					}
					if (!result.url && /tracking.*(?:url|link)|(?:url|link).*tracking/i.test(normalizedKey)) {
						try {
							const url = new URL(entry, location.origin);
							if (url.protocol === 'https:' || url.protocol === 'http:') result.url = url.href;
						} catch {
							// Ignore malformed tracking links returned by the page API.
						}
					}
				} else {
					walk(entry);
				}
			}
		}

		walk(data);
		const updates = data?.journey_summary?.details;
		if (Array.isArray(updates)) {
			const latest = updates
				.filter((update) => update.message)
				.sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp))[0];
			if (latest) {
				result.latestMessage = latest.message;
				result.latestTimestamp = latest.timestamp ?? '';
				result.latestLocation = getUpdateLocation(latest);
			}
			const carrier = latest?.carrier ?? updates.find((update) => update.carrier)?.carrier;
			result.carrier = getCarrierName(carrier);
			result.carrierLogo = getCarrierLogo(carrier?.logo_url);
		}
		const estimatedPeriod = data?.journey_summary?.estimated_detail?.time_period;
		if (typeof estimatedPeriod === 'string') result.estimatedDelivery = estimatedPeriod.trim();
		return result;
	}

	async function loadSellerLocation(conversation) {
		if (new URLSearchParams(location.search).get('order_type') === 'sold') return null;
		const sellerId = conversation.opposite_users?.find((user) => user.type === 'member')?.data?.id;
		if (!sellerId) return null;
		const cacheKey = String(sellerId);
		if (sellerLocationResults.has(cacheKey)) return sellerLocationResults.get(cacheKey);
		if (pendingSellerLocations.has(cacheKey)) return pendingSellerLocations.get(cacheKey);

		const request = (async () => {
			try {
				const response = await fetch(`/api/v2/users/${encodeURIComponent(cacheKey)}`, {
					credentials: 'same-origin',
					headers: { Accept: 'application/json' },
				});
				if (!response.ok) return null;
				const payload = await response.json();
				const user = payload.user;
				if (!user) return null;
				const country = user.country_title_local ?? user.country_title;
				const city = user.expose_location === false
					? ''
					: typeof user.city === 'string' ? user.city.trim() : '';
				const location = {
					country: typeof country === 'string' ? country.trim() : '',
					city,
				};
				if (!location.country && !location.city) return null;
				sellerLocationResults.set(cacheKey, location);
				return location;
			} catch (error) {
				console.debug('[Vinted tracking] Locatie van verkoper niet beschikbaar.', error);
				return null;
			}
		})();
		pendingSellerLocations.set(cacheKey, request);
		try {
			return await request;
		} finally {
			pendingSellerLocations.delete(cacheKey);
		}
	}

	function getUpdateLocation(update) {
		const parts = [];
		const addText = (value) => {
			if (typeof value === 'string' && value.trim()) parts.push(value.trim());
		};
		const addCountry = (value) => {
			if (typeof value === 'string') addText(value);
			else if (value && typeof value === 'object') addText(value.name ?? value.label ?? value.code);
		};
		for (const source of [update, update.delivery_information]) {
			if (!source || typeof source !== 'object') continue;
			addText(source.city);
			addText(source.region);
			addText(source.country_name);
			addCountry(source.country);
			addText(source.country_code);
			for (const place of [source.location, source.place]) {
				if (typeof place === 'string') addText(place);
				else if (place && typeof place === 'object') {
					addText(place.city);
					addText(place.region);
					addText(place.name ?? place.label);
					addText(place.country_name);
					addCountry(place.country);
					addText(place.country_code);
				}
			}
		}
		return [...new Set(parts)].join(', ');
	}

	function getCarrierLogo(value) {
		if (typeof value !== 'string') return '';
		try {
			const url = new URL(value, location.origin);
			return url.protocol === 'https:' ? url.href : '';
		} catch {
			return '';
		}
	}

	function getCarrierName(carrier) {
		if (!carrier || typeof carrier !== 'object') return '';
		const explicitName = carrier.name ?? carrier.carrier_name ?? carrier.title;
		if (typeof explicitName === 'string' && explicitName.trim()) return explicitName.trim();
		const code = String(carrier.code ?? '').toUpperCase();
		const knownCarriers = [
			[/^DHL(?:[-_]|$)/, 'DHL'],
			[/^POST[-_]?NL(?:[-_]|$)/, 'PostNL'],
			[/^DPD(?:[-_]|$)/, 'DPD'],
			[/^GLS(?:[-_]|$)/, 'GLS'],
			[/^UPS(?:[-_]|$)/, 'UPS'],
			[/^BPOST(?:[-_]|$)/, 'bpost'],
			[/^INPOST(?:[-_]|$)/, 'InPost'],
			[/^MONDIAL(?:[-_]|$)/, 'Mondial Relay'],
			[/^HERMES(?:[-_]|$)|^EVRI(?:[-_]|$)/, 'Evri'],
		];
		return knownCarriers.find(([pattern]) => pattern.test(code))?.[1] ?? '';
	}

	function getCarrierAccent(carrierName) {
		const accents = {
			DHL: '#d40511',
			PostNL: '#f58220',
			DPD: '#dc0032',
			GLS: '#003da5',
			UPS: '#351c15',
			bpost: '#e30613',
			InPost: '#d49b00',
			'Mondial Relay': '#5d2f91',
			Evri: '#4a2278',
		};
		return accents[carrierName] ?? '';
	}

	function ensureTrackingStyles() {
		if (document.getElementById('vinted-tracking-styles')) return;
		const style = document.createElement('style');
		style.id = 'vinted-tracking-styles';
		style.textContent = `
			.vinted-tracking {
				box-sizing: border-box;
				margin: 0;
				padding: 10px 14px;
				display: grid;
				grid-template-columns: minmax(0, 1fr);
				gap: 0;
				border-top: 1px solid #e1e7e7;
				border-left: 3px solid #08a4aa;
				background: #f8fbfb;
				color: #293335;
				font: 13px/1.45 sans-serif;
			}
			.vinted-tracking__main {
				display: grid;
				grid-template-columns: max-content max-content minmax(0, 1fr) max-content;
				align-items: center;
				gap: 8px 12px;
				min-width: 0;
				padding-bottom: 8px;
				border-bottom: 1px solid #e3eaea;
			}
			.vinted-tracking__update {
				display: grid;
				grid-template-columns: minmax(140px, 190px) minmax(0, 1fr) max-content;
				align-items: baseline;
				gap: 8px 12px;
				min-width: 0;
				padding-top: 8px;
			}
			.vinted-tracking__estimate {
				display: grid;
				grid-template-columns: minmax(140px, 190px) minmax(0, 1fr);
				align-items: baseline;
				gap: 8px 12px;
				min-width: 0;
				padding-top: 8px;
				border-top: 1px solid #e3eaea;
			}
			.vinted-tracking__estimate-value {
				font-weight: 500;
				overflow-wrap: anywhere;
			}
			.vinted-tracking__label {
				color: #657275;
				font-size: 12px;
				font-weight: 600;
			}
			.vinted-tracking__carrier {
				display: inline-flex;
				align-items: center;
				gap: 5px;
				padding: 2px 6px;
				border: 1px solid #dbe5e5;
				border-radius: 3px;
				background: #fff;
				color: #293335;
				font-size: 12px;
				font-weight: 600;
				white-space: nowrap;
			}
			.vinted-tracking__carrier-logo {
				display: block;
				width: 18px;
				height: 18px;
				flex: 0 0 18px;
				object-fit: contain;
			}
			.vinted-tracking__code {
				min-width: 0;
				width: fit-content;
				max-width: 100%;
				padding: 3px 8px;
				border: 1px solid #e0e8e8;
				border-radius: 3px;
				background: #fff;
				font-family: ui-monospace, monospace;
				font-size: 13px;
				font-weight: 600;
				overflow-wrap: anywhere;
			}
			.vinted-tracking__link {
				justify-self: end;
				padding: 6px 10px;
				border: 1px solid #c3dddd;
				border-radius: 4px;
				background: #eff8f8;
				color: #007f84;
				font-weight: 600;
				text-decoration: none;
				white-space: nowrap;
			}
			.vinted-tracking__link:hover {
				background: #e1f2f2;
				text-decoration: underline;
			}
			.vinted-tracking__message {
				min-width: 0;
				font-weight: 600;
				overflow-wrap: anywhere;
			}
			.vinted-tracking__time {
				color: #687578;
				font-size: 12px;
				white-space: nowrap;
			}
			.vinted-tracking--loading {
				padding: 7px 14px;
				overflow: hidden;
			}
			.vinted-tracking__road {
				position: relative;
				width: 100%;
				height: 26px;
				overflow: hidden;
			}
			.vinted-tracking__road::before {
				position: absolute;
				right: 0;
				bottom: 3px;
				left: 0;
				border-bottom: 1px solid #cbdada;
				content: '';
			}
			.vinted-tracking__road::after {
				position: absolute;
				right: 0;
				bottom: 11px;
				left: 0;
				height: 2px;
				background: repeating-linear-gradient(90deg, #cbdada 0 9px, transparent 9px 18px);
				animation: vinted-tracking-road 0.7s linear infinite;
				content: '';
			}
			.vinted-tracking__van {
				position: absolute;
				bottom: 4px;
				left: -34px;
				width: 28px !important;
				height: 22px !important;
				min-width: 0;
				min-height: 0;
				color: #008f95;
				animation: vinted-tracking-drive 2.4s linear infinite;
			}
			@keyframes vinted-tracking-road {
				to { background-position: -18px 0; }
			}
			@keyframes vinted-tracking-drive {
				from { left: -34px; }
				to { left: calc(100% + 34px); }
			}
			@media (prefers-reduced-motion: reduce) {
				.vinted-tracking__van {
					left: calc(50% - 14px);
					animation: none;
				}
				.vinted-tracking__road::after { animation: none; }
			}
			@media (max-width: 600px) {
				.vinted-tracking:not(.vinted-tracking--loading) { padding: 8px 10px; }
				.vinted-tracking__main {
					grid-template-columns: max-content minmax(0, 1fr);
					gap: 7px 8px;
				}
				.vinted-tracking__update {
					grid-template-columns: minmax(0, 1fr) max-content;
					gap: 4px 8px;
				}
				.vinted-tracking__update .vinted-tracking__label {
					grid-column: 1 / -1;
				}
				.vinted-tracking__update .vinted-tracking__time {
					grid-column: 2;
					grid-row: 2;
				}
				.vinted-tracking__estimate {
					grid-template-columns: minmax(0, 1fr);
					gap: 2px;
				}
				.vinted-tracking__link {
					grid-column: 1 / -1;
					justify-self: start;
				}
			}
		`;
		document.head.append(style);
	}

	function addOrdersShortcut() {
		if (document.querySelector('[data-vinted-orders-shortcut]')) return;
		const favoritesLink = [...document.querySelectorAll('a[href]')]
			.find((link) => link.getAttribute('href') === '/member/items/favourite_list');
		const favoriteWrapper = favoritesLink?.parentElement;
		const actions = favoriteWrapper?.parentElement;
		if (!favoritesLink || !favoriteWrapper || !actions) return;

		const shortcutWrapper = favoriteWrapper.cloneNode(true);
		shortcutWrapper.dataset.vintedOrdersShortcut = 'true';
		const shortcut = shortcutWrapper.querySelector('a');
		if (!shortcut) return;
		shortcut.href = '/my_orders';
		shortcut.title = labels.myOrders;
		shortcut.setAttribute('aria-label', labels.myOrders);
		shortcut.setAttribute('aria-current', location.pathname === '/my_orders' ? 'page' : 'false');
		shortcut.removeAttribute('data-testid');

		let icon = shortcut.querySelector('svg');
		if (!icon) {
			icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			shortcut.querySelector('span')?.append(icon);
		}
		icon.setAttribute('viewBox', '0 0 24 24');
		icon.setAttribute('width', '24');
		icon.setAttribute('height', '24');
		icon.setAttribute('fill', 'none');
		icon.setAttribute('stroke', 'currentColor');
		icon.setAttribute('stroke-width', '1.7');
		icon.setAttribute('stroke-linecap', 'round');
		icon.setAttribute('stroke-linejoin', 'round');
		icon.setAttribute('aria-hidden', 'true');
		icon.replaceChildren();
		for (const pathData of [
			'M12 22V12',
			'm16.5 9.4-9-5.19',
			'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
			'm3.3 7 8.7 5 8.7-5',
		]) {
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', pathData);
			path.style.fill = 'none';
			path.style.stroke = 'currentColor';
			path.style.strokeWidth = '1.7';
			path.style.strokeLinecap = 'round';
			path.style.strokeLinejoin = 'round';
			icon.append(path);
		}

		actions.insertBefore(shortcutWrapper, favoriteWrapper.nextSibling);
	}

	function addTrackingRow(card, orderId, tracking) {
		card.querySelector(`[data-vinted-loading-id="${orderId}"]`)?.remove();
		if (card.querySelector(`[data-vinted-order-id="${orderId}"]`)) return;
		ensureTrackingStyles();
		const row = document.createElement('section');
		row.dataset.vintedOrderId = orderId;
		row.className = 'vinted-tracking';

		const main = document.createElement('div');
		main.className = 'vinted-tracking__main';
		const label = document.createElement('strong');
		label.className = 'vinted-tracking__label';
		label.textContent = labels.trackingId;
		main.append(label);
		if (tracking.carrier || tracking.carrierLogo) {
			const carrier = document.createElement('span');
			carrier.className = 'vinted-tracking__carrier';
			const brandColors = {
				DHL: ['#ffcc00', '#d40511'],
				PostNL: ['#f58220', '#fff'],
				DPD: ['#dc0032', '#fff'],
				GLS: ['#ffd500', '#003da5'],
				UPS: ['#351c15', '#fff'],
				bpost: ['#e30613', '#fff'],
				InPost: ['#ffca00', '#171717'],
				'Mondial Relay': ['#5d2f91', '#fff'],
				Evri: ['#4a2278', '#fff'],
			};
			const colors = brandColors[tracking.carrier];
			const applyBrandColors = () => {
				if (!colors) return;
				carrier.style.backgroundColor = colors[0];
				carrier.style.borderColor = colors[0];
				carrier.style.color = colors[1];
			};
			if (tracking.carrierLogo) {
				const logo = document.createElement('img');
				logo.className = 'vinted-tracking__carrier-logo';
				logo.src = tracking.carrierLogo;
				logo.alt = '';
				logo.addEventListener('error', () => {
					logo.remove();
					applyBrandColors();
				}, { once: true });
				carrier.append(logo);
			} else {
				applyBrandColors();
			}
			const carrierName = document.createElement('span');
			carrierName.textContent = tracking.carrier;
			if (tracking.carrier) carrier.append(carrierName);
			main.append(carrier);
		}

		if (tracking.code) {
			const code = document.createElement('span');
			code.className = 'vinted-tracking__code';
			code.textContent = tracking.code;
			main.append(code);
		} else {
			const unavailable = document.createElement('span');
			unavailable.textContent = labels.unavailable;
			main.append(unavailable);
		}

		if (tracking.url) {
			const link = document.createElement('a');
			link.className = 'vinted-tracking__link';
			link.href = tracking.url;
			link.textContent = labels.trackingPage;
			link.target = '_blank';
			link.rel = 'noopener noreferrer';
			main.append(link);
		}
		row.append(main);

		if (tracking.latestMessage) {
			const update = document.createElement('div');
			update.className = 'vinted-tracking__update';
			const updateLabel = document.createElement('span');
			updateLabel.className = 'vinted-tracking__label';
			updateLabel.textContent = labels.latestUpdate;
			const message = document.createElement('span');
			message.className = 'vinted-tracking__message';
			message.textContent = tracking.latestMessage;
			if (tracking.latestLocation) {
				message.textContent += ` · ${labels.location}: ${tracking.latestLocation}`;
			}
			update.append(updateLabel, message);

			if (tracking.latestTimestamp) {
				const date = new Date(tracking.latestTimestamp);
				if (!Number.isNaN(date.getTime())) {
					const time = document.createElement('time');
					time.className = 'vinted-tracking__time';
					time.dateTime = date.toISOString();
						time.textContent = new Intl.DateTimeFormat(pageLocale, {
						day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
					}).format(date);
					update.append(time);
				}
			}
			row.append(update);
		}

		if (tracking.estimatedDelivery) {
			const estimate = document.createElement('div');
			estimate.className = 'vinted-tracking__estimate';
			const estimateLabel = document.createElement('span');
			estimateLabel.className = 'vinted-tracking__label';
			estimateLabel.textContent = labels.estimatedDelivery;
			const estimateValue = document.createElement('span');
			estimateValue.className = 'vinted-tracking__estimate-value';
			estimateValue.textContent = tracking.estimatedDelivery;
			estimate.append(estimateLabel, estimateValue);
			row.append(estimate);
		}

		if (tracking.sellerCountry || tracking.sellerCity) {
			const country = document.createElement('div');
			country.className = 'vinted-tracking__estimate';
			const countryLabel = document.createElement('span');
			countryLabel.className = 'vinted-tracking__label';
			countryLabel.textContent = labels.sellerLocation;
			const countryValue = document.createElement('span');
			countryValue.className = 'vinted-tracking__estimate-value';
			countryValue.textContent = [tracking.sellerCity, tracking.sellerCountry].filter(Boolean).join(', ');
			country.append(countryLabel, countryValue);
			row.append(country);
		}

		card.append(row);
	}

	function addLoadingRow(card, orderId) {
		if (card.querySelector(`[data-vinted-order-id="${orderId}"], [data-vinted-loading-id="${orderId}"]`)) return;
		ensureTrackingStyles();
		const row = document.createElement('div');
		row.className = 'vinted-tracking vinted-tracking--loading';
		row.dataset.vintedLoadingId = orderId;
		row.setAttribute('role', 'status');
		row.setAttribute('aria-live', 'polite');
		row.setAttribute('aria-label', labels.loading);
		const road = document.createElement('div');
		road.className = 'vinted-tracking__road';
		road.setAttribute('aria-hidden', 'true');
		const van = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		van.classList.add('vinted-tracking__van');
		van.setAttribute('viewBox', '0 0 28 22');
		van.setAttribute('width', '28');
		van.setAttribute('height', '22');
		van.setAttribute('fill', 'none');
		van.setAttribute('stroke', 'currentColor');
		van.setAttribute('stroke-width', '2.2');
		van.setAttribute('stroke-linecap', 'round');
		van.setAttribute('stroke-linejoin', 'round');
		const vanShape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		vanShape.setAttribute('d', 'M2 5.5A1.5 1.5 0 0 1 3.5 4h12A1.5 1.5 0 0 1 17 5.5V17H2zM17 8h4l4 4v5h-8zM18 9.5h2.4l2.5 2.5H18z');
		const frontWheel = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		frontWheel.setAttribute('cx', '20.5');
		frontWheel.setAttribute('cy', '18');
		frontWheel.setAttribute('r', '2');
		const rearWheel = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		rearWheel.setAttribute('cx', '7');
		rearWheel.setAttribute('cy', '18');
		rearWheel.setAttribute('r', '2');
		van.append(vanShape, frontWheel, rearWheel);
		road.append(van);
		row.append(road);
		card.append(row);
	}

	async function loadOrder(orderId) {
		if (orderResults.has(orderId)) return orderResults.get(orderId);
		if (pending.has(orderId)) return pending.get(orderId);

		const request = (async () => {
			try {
				const conversationResponse = await fetch(
					`${CONVERSATION_API}${encodeURIComponent(orderId)}`,
					{
						credentials: 'include',
						headers: { Accept: 'application/json' },
					},
				);
				if (!conversationResponse.ok) return null;
				const conversation = await conversationResponse.json();
				const escrowOrderId = findEscrowOrderId(conversation);
				if (!escrowOrderId) return null;
				const sellerLocationPromise = loadSellerLocation(conversation);

				const response = await fetch(
					`/api/v2/transactions/${encodeURIComponent(escrowOrderId)}/shipment/journey_summary`,
					{
						credentials: 'same-origin',
						headers: {
							Accept: 'application/json',
							'Accept-Language': apiLocale,
							locale: apiLocale,
						},
					},
				);
				if (!response.ok) return null;
				const payload = await response.json();
				const tracking = collectTracking(payload);
				const sellerLocation = await sellerLocationPromise;
				tracking.sellerCountry = sellerLocation?.country ?? '';
				tracking.sellerCity = sellerLocation?.city ?? '';
				orderResults.set(orderId, tracking);
				return tracking;
			} catch (error) {
				console.debug('[Vinted tracking] Ordergegevens konden niet worden geladen.', error);
				return null;
			}
		})();
		pending.set(orderId, request);
		try {
			return await request;
		} finally {
			pending.delete(orderId);
		}
	}

	function findEscrowOrderId(data) {
		const visited = new WeakSet();
		function walk(value) {
			if (!value || typeof value !== 'object' || visited.has(value)) return null;
			visited.add(value);
			for (const [key, entry] of Object.entries(value)) {
				if (key.toLowerCase() === 'escrow_order_id' && (typeof entry === 'string' || typeof entry === 'number')) {
					return String(entry);
				}
				const found = walk(entry);
				if (found) return found;
			}
			return null;
		}
		return walk(data);
	}

	async function scanOrders() {
		if (location.pathname !== '/my_orders') return;
		const candidates = [...document.querySelectorAll(
			'a[href], [data-order-id], [data-orderid], [data-transaction-id], [data-testid*="order"], [data-testid*="transaction"]',
		)];
		const cards = new Map();
		for (const candidate of candidates) {
			const orderId = orderIdFromElement(candidate);
			if (!orderId) continue;
			const card = findOrderCard(candidate);
			if (card && !cards.has(orderId)) cards.set(orderId, card);
		}
		for (const [orderId, card] of cards) addLoadingRow(card, orderId);

		const loadedOrders = await Promise.all(
			[...cards].map(async ([orderId, card]) => ({
				orderId,
				card,
				tracking: await loadOrder(orderId),
			})),
		);
		const movingVanRows = [];
		for (const { card, tracking } of loadedOrders) {
			if (!card.isConnected) continue;
			const van = card.querySelector('.vinted-tracking__van');
			if (!van) continue;
			const accent = getCarrierAccent(tracking?.carrier);
			if (accent) van.style.color = accent;
			van.style.animationDuration = '1.6s';
			movingVanRows.push(van);
		}
		if (movingVanRows.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			await new Promise((resolve) => setTimeout(resolve, 1600));
		}
		for (const { orderId, card, tracking } of loadedOrders) {
			if (!card.isConnected) continue;
			card.querySelector(`[data-vinted-loading-id="${orderId}"]`)?.remove();
			if (!tracking) continue;
			if (tracking.code || tracking.url || tracking.latestMessage || tracking.estimatedDelivery || tracking.sellerCountry || tracking.sellerCity) {
				addTrackingRow(card, orderId, tracking);
			}
		}
	}

	function scheduleScan() {
		clearTimeout(scanTimer);
		scanTimer = setTimeout(() => void scanOrders(), 900);
	}

	new MutationObserver(() => {
		addOrdersShortcut();
		scheduleScan();
	}).observe(document.body, {
		childList: true,
		subtree: true,
	});
	addOrdersShortcut();
	scheduleScan();
})();
