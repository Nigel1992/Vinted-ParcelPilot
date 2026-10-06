// ==UserScript==
// @name         Vinted ParcelPilot
// @namespace    https://github.com/Nigel1992/Vinted-ParcelPilot
// @version      1.4.0
// @description  Adds shipment dashboards, filters, sorting, local notes, exports, notifications, caching and tracking details to Vinted orders.
// @license      Custom Non-Commercial Attribution License
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
	const LOAD_FAILED = Object.freeze({ loadFailed: true });
	const orderResults = new Map();
	let orderFilterControl = null;
	const pending = new Map();
	const sellerLocationResults = new Map();
	const pendingSellerLocations = new Map();
	const SETTINGS_KEY = 'vintedParcelPilotSettings';
	const CACHE_KEY = 'vintedParcelPilotCache';
	const NOTES_KEY = 'vintedParcelPilotNotes';
	const defaultSettings = {
		compact: false,
		showAnimation: true,
		showSellerLocation: true,
		showCarrierLogo: true,
		debug: false,
		filter: 'all',
		autoRefresh: true,
		refreshMinutes: 10,
		cacheMinutes: 5,
		staleDays: 5,
		sort: 'none',
		sortDirection: 'asc',
		notifications: false,
	};
	const settings = loadSettings();
	const notes = loadNotes();
	const pageLocale = document.documentElement.lang || navigator.language || 'en';
	const language = pageLocale.toLowerCase().split(/[-_]/)[0];
	const apiLocale = pageLocale.replace('_', '-');
	const translations = {
en: { trackingId: 'Tracking ID', trackingPage: 'Tracking page', latestUpdate: 'Latest update', estimatedDelivery: 'Estimated delivery', sellerLocation: 'Seller location', location: 'Location', myOrders: 'My orders', loading: 'Loading tracking information…', unavailable: 'Tracking code unavailable', notShipped: 'Not shipped yet', loadFailed: 'Could not load tracking', retry: 'Retry', copy: 'Copy', copied: 'Copied', all: 'All', active: 'On the way', delayed: 'Delayed', delivered: 'Delivered', noTracking: 'No tracking', compact: 'Compact', animation: 'Animation', seller: 'Seller location', logo: 'Carrier logos', debug: 'Debug', settings: 'ParcelPilot settings', inTransit: 'On the way', readyForPickup: 'Ready for pickup', labelCreated: 'Label created', exception: 'Issue', unknown: 'Unknown', daysInTransit: 'days in transit', dayInTransit: 'day in transit', details: 'Delivery details', orderStatus: 'Order status', shipmentStatus: 'Parcel status', options: 'Options', orderStatusUnavailable: 'Not found on this page', updatedAgo: 'updated', overdue: 'Delivery estimate passed' },
		nl: { trackingId: 'Tracking-ID', trackingPage: 'Trackingpagina', latestUpdate: 'Laatste update', estimatedDelivery: 'Verwachte bezorging', sellerLocation: 'Locatie verkoper', location: 'Locatie', myOrders: 'Mijn bestellingen', loading: 'Trackinginformatie ophalen…', unavailable: 'Trackingcode niet beschikbaar', notShipped: 'Nog niet verzonden', loadFailed: 'Tracking kon niet worden geladen', retry: 'Opnieuw', copy: 'Kopieer', copied: 'Gekopieerd', all: 'Alles', active: 'Onderweg', delayed: 'Vertraagd', delivered: 'Afgeleverd', noTracking: 'Geen tracking', compact: 'Compact', animation: 'Animatie', seller: 'Verkoperlocatie', logo: 'Vervoerderslogo’s', debug: 'Debug', settings: 'ParcelPilot-instellingen', inTransit: 'Onderweg', readyForPickup: 'Afhaalpunt', labelCreated: 'Label aangemaakt', exception: 'Probleem', unknown: 'Onbekend', daysInTransit: 'dagen onderweg', dayInTransit: 'dag onderweg', details: 'Bezorggegevens', orderStatus: 'Bestelstatus', shipmentStatus: 'Zendstatus', options: 'Opties', orderStatusUnavailable: 'Niet gevonden op deze pagina', updatedAgo: 'bijgewerkt', overdue: 'Bezorgschatting verlopen' },
		fr: { trackingId: 'Numéro de suivi', trackingPage: 'Page de suivi', latestUpdate: 'Dernière mise à jour', estimatedDelivery: 'Livraison estimée', sellerLocation: 'Lieu du vendeur', location: 'Lieu', myOrders: 'Mes commandes', loading: 'Récupération des informations de suivi…', unavailable: 'Numéro de suivi indisponible', notShipped: 'Pas encore expédié', loadFailed: 'Impossible de charger le suivi', retry: 'Réessayer', copy: 'Copier', copied: 'Copié', all: 'Tout', active: 'En route', delayed: 'Retardé', delivered: 'Livré', noTracking: 'Sans suivi', compact: 'Compact', animation: 'Animation', seller: 'Lieu du vendeur', logo: 'Logos des transporteurs', debug: 'Débogage', settings: 'Paramètres de ParcelPilot', inTransit: 'En route', readyForPickup: 'Prêt à être retiré', labelCreated: 'Étiquette créée', exception: 'Problème', unknown: 'Inconnu', daysInTransit: 'jours de transport', dayInTransit: 'jour de transport', details: 'Détails de livraison', orderStatus: 'Statut de la commande', shipmentStatus: 'Statut du colis', options: 'Options', orderStatusUnavailable: 'Introuvable sur cette page', updatedAgo: 'mis à jour', overdue: 'Estimation de livraison dépassée' },
		et: { trackingId: 'Jälgimiskood', trackingPage: 'Jälgimisleht', latestUpdate: 'Viimane uuendus', estimatedDelivery: 'Eeldatav saabumine', sellerLocation: 'Müüja asukoht', location: 'Asukoht', myOrders: 'Minu tellimused', loading: 'Jälgimisandmete laadimine…', unavailable: 'Jälgimiskood pole saadaval', notShipped: 'Pole veel saadetud', loadFailed: 'Jälgimise laadimine ebaõnnestus', retry: 'Proovi uuesti', copy: 'Kopeeri', copied: 'Kopeeritud', all: 'Kõik', active: 'Teel', delayed: 'Hilinenud', delivered: 'Kohale jõudnud', noTracking: 'Jälgimiseta', compact: 'Kompaktne', animation: 'Animatsioon', seller: 'Müüja asukoht', logo: 'Transpordiettevõtete logod', debug: 'Silumine', settings: 'ParcelPilot seaded', inTransit: 'Teel', readyForPickup: 'Valmis kättevõtuks', labelCreated: 'Etikett loodud', exception: 'Probleem', unknown: 'Tundmatu', daysInTransit: 'päeva liikumisel', dayInTransit: 'päev liikumisel', details: 'Tarneandmed', orderStatus: 'Tellimuse staatus', shipmentStatus: 'Saadetise staatus', options: 'Valikud', orderStatusUnavailable: 'Sellel lehel ei leitud', updatedAgo: 'uuendatud', overdue: 'Kohaletoimetamise hinnang möödus' },
		es: { trackingId: 'Código de seguimiento', trackingPage: 'Página de seguimiento', latestUpdate: 'Última actualización', estimatedDelivery: 'Entrega estimada', sellerLocation: 'Ubicación del vendedor', location: 'Ubicación', myOrders: 'Mis pedidos', loading: 'Cargando información de seguimiento…', unavailable: 'Código de seguimiento no disponible', notShipped: 'Aún no enviado', loadFailed: 'No se pudo cargar el seguimiento', retry: 'Reintentar', copy: 'Copiar', copied: 'Copiado', all: 'Todos', active: 'En camino', delayed: 'Retrasado', delivered: 'Entregado', noTracking: 'Sin seguimiento', compact: 'Compacto', animation: 'Animación', seller: 'Ubicación del vendedor', logo: 'Logotipos de transportistas', debug: 'Depuración', settings: 'Ajustes de ParcelPilot', inTransit: 'En camino', readyForPickup: 'Listo para recoger', labelCreated: 'Etiqueta creada', exception: 'Incidencia', unknown: 'Desconocido', daysInTransit: 'días en tránsito', dayInTransit: 'día en tránsito', details: 'Detalles de entrega', orderStatus: 'Estado del pedido', shipmentStatus: 'Estado del paquete', options: 'Opciones', orderStatusUnavailable: 'No se encuentra en esta página', updatedAgo: 'actualizado', overdue: 'Entrega estimada superada' },
		lt: { trackingId: 'Siuntos sekimo numeris', trackingPage: 'Siuntos sekimo puslapis', latestUpdate: 'Paskutinis atnaujinimas', estimatedDelivery: 'Numatomas pristatymas', sellerLocation: 'Pardavėjo vieta', location: 'Vieta', myOrders: 'Mano užsakymai', loading: 'Įkeliama siuntos sekimo informacija…', unavailable: 'Sekimo numeris nepasiekiamas', notShipped: 'Dar neišsiųsta', loadFailed: 'Nepavyko įkelti sekimo duomenų', retry: 'Bandyti dar kartą', copy: 'Kopijuoti', copied: 'Nukopijuota', all: 'Visos', active: 'Kelyje', delayed: 'Vėlinama', delivered: 'Pristatyta', noTracking: 'Be sekimo', compact: 'Kompaktinis', animation: 'Animacija', seller: 'Pardavėjo vieta', logo: 'Pervežėjų logotipai', debug: 'Derinimas', settings: 'ParcelPilot nustatymai', inTransit: 'Kelyje', readyForPickup: 'Paruošta atsiimti', labelCreated: 'Etiketė sukurta', exception: 'Problema', unknown: 'Nežinoma', daysInTransit: 'dienos kelje', dayInTransit: 'diena kelje', details: 'Pristatymo duomenys', orderStatus: 'Užsakymo būsena', shipmentStatus: 'Siuntos būsena', options: 'Parinktys', orderStatusUnavailable: 'Šiame puslapyje nerasta', updatedAgo: 'atnaujinta', overdue: 'Pristatymo prognozė praėjo' },
		lv: { trackingId: 'Sūtījuma izsekošanas numurs', trackingPage: 'Izsekošanas lapa', latestUpdate: 'Pēdējais atjauninājums', estimatedDelivery: 'Paredzamā piegāde', sellerLocation: 'Pārdevēja atrašanās vieta', location: 'Atrašanās vieta', myOrders: 'Mani pasūtījumi', loading: 'Ielādē sūtījuma izsekošanas informāciju…', unavailable: 'Izsekošanas numurs nav pieejams', notShipped: 'Vēl nav nosūtīts', loadFailed: 'Neizdevās ielādēt izsekošanas datus', retry: 'Mēģināt vēlreiz', copy: 'Kopēt', copied: 'Kopēts', all: 'Visas', active: 'Ceļā', delayed: 'Kavējas', delivered: 'Piegādāts', noTracking: 'Bez izsekošanas', compact: 'Kompaktais', animation: 'Animācija', seller: 'Pārdevēja atrašanās vieta', logo: 'Pārvadātāju logotipi', debug: 'Atkļūnošana', settings: 'ParcelPilot iestatījumi', inTransit: 'Ceļā', readyForPickup: 'Gatavs paņemšanai', labelCreated: 'Etiķete izveidota', exception: 'Problēma', unknown: 'Nezināms', daysInTransit: 'dienas ceļā', dayInTransit: 'diena ceļā', details: 'Piegādes informācija', orderStatus: 'Pasūtījuma statuss', shipmentStatus: 'Sūtījuma statuss', options: 'Iespējas', orderStatusUnavailable: 'Nav atrasts šajā lapā', updatedAgo: 'atjaunināts', overdue: 'Piegādes prognoze izteikusi' },
		de: { trackingId: 'Sendungsnummer', trackingPage: 'Sendungsverfolgung', latestUpdate: 'Letzte Aktualisierung', estimatedDelivery: 'Voraussichtliche Zustellung', sellerLocation: 'Standort des Verkäufers', location: 'Standort', myOrders: 'Meine Bestellungen', loading: 'Sendungsverfolgung wird geladen…', unavailable: 'Sendungsnummer nicht verfügbar', notShipped: 'Noch nicht versendet', loadFailed: 'Sendungsverfolgung konnte nicht geladen werden', retry: 'Erneut versuchen', copy: 'Kopieren', copied: 'Kopiert', all: 'Alle', active: 'Unterwegs', delayed: 'Verzögert', delivered: 'Zugestellt', noTracking: 'Ohne Tracking', compact: 'Kompakt', animation: 'Animation', seller: 'Standort des Verkäufers', logo: 'Versandlogos', debug: 'Debug', settings: 'ParcelPilot-Einstellungen', inTransit: 'Unterwegs', readyForPickup: 'Abholbereit', labelCreated: 'Label erstellt', exception: 'Problem', unknown: 'Unbekannt', daysInTransit: 'Tage unterwegs', dayInTransit: 'Tag unterwegs', details: 'Lieferdetails', orderStatus: 'Bestellstatus', shipmentStatus: 'Paketstatus', options: 'Optionen', orderStatusUnavailable: 'Auf dieser Seite nicht gefunden', updatedAgo: 'aktualisiert', overdue: 'Zustellschätzung überschritten' },
		it: { trackingId: 'Codice di tracciamento', trackingPage: 'Pagina di tracciamento', latestUpdate: 'Ultimo aggiornamento', estimatedDelivery: 'Consegna prevista', sellerLocation: 'Posizione del venditore', location: 'Posizione', myOrders: 'I miei ordini', loading: 'Caricamento delle informazioni di tracciamento…', unavailable: 'Codice di tracciamento non disponibile', notShipped: 'Non ancora spedito', loadFailed: 'Impossibile caricare il tracciamento', retry: 'Riprova', copy: 'Copia', copied: 'Copiato', all: 'Tutti', active: 'In transito', delayed: 'In ritardo', delivered: 'Consegnato', noTracking: 'Senza tracciamento', compact: 'Compatto', animation: 'Animazione', seller: 'Posizione del venditore', logo: 'Loghi dei corrieri', debug: 'Debug', settings: 'Impostazioni di ParcelPilot', inTransit: 'In transito', readyForPickup: 'Pronto per il ritiro', labelCreated: 'Etichetta creata', exception: 'Problema', unknown: 'Sconosciuto', daysInTransit: 'giorni di transito', dayInTransit: 'giorno di transito', details: 'Dettagli di consegna', orderStatus: 'Stato dell’ordine', shipmentStatus: 'Stato del pacco', options: 'Opzioni', orderStatusUnavailable: 'Non trovato in questa pagina', updatedAgo: 'aggiornato', overdue: 'Stima di consegna superata' },
		pt: { trackingId: 'Código de rastreamento', trackingPage: 'Página de rastreamento', latestUpdate: 'Última atualização', estimatedDelivery: 'Entrega prevista', sellerLocation: 'Localização do vendedor', location: 'Localização', myOrders: 'As minhas encomendas', loading: 'A carregar informações de rastreamento…', unavailable: 'Código de rastreamento indisponível', notShipped: 'Ainda não enviado', loadFailed: 'Não foi possível carregar o rastreamento', retry: 'Tentar novamente', copy: 'Copiar', copied: 'Copiado', all: 'Todos', active: 'Em trânsito', delayed: 'Atrasado', delivered: 'Entregue', noTracking: 'Sem rastreamento', compact: 'Compacto', animation: 'Animação', seller: 'Localização do vendedor', logo: 'Logótipos das transportadoras', debug: 'Depuração', settings: 'Definições do ParcelPilot', inTransit: 'Em trânsito', readyForPickup: 'Pronto para levantar', labelCreated: 'Etiqueta criada', exception: 'Problema', unknown: 'Desconhecido', daysInTransit: 'dias em trânsito', dayInTransit: 'dia em trânsito', details: 'Detalhes da entrega', orderStatus: 'Estado da encomenda', shipmentStatus: 'Estado do pacote', options: 'Opções', orderStatusUnavailable: 'Não encontrado nesta página', updatedAgo: 'atualizado', overdue: 'Estimativa de entrega ultrapassada' },
		cs: { trackingId: 'Sledovací číslo', trackingPage: 'Sledování zásilky', latestUpdate: 'Poslední aktualizace', estimatedDelivery: 'Odhadované doručení', sellerLocation: 'Místo prodejce', location: 'Poloha', myOrders: 'Moje objednávky', loading: 'Načítají se informace o zásilce…', unavailable: 'Sledovací číslo není k dispozici', notShipped: 'Zatím neodesláno', loadFailed: 'Sledování se nepodařilo načíst', retry: 'Zkusit znovu', copy: 'Kopírovat', copied: 'Zkopírováno', all: 'Vše', active: 'Na cestě', delayed: 'Zpožděno', delivered: 'Doručeno', noTracking: 'Bez sledování', compact: 'Kompaktní', animation: 'Animace', seller: 'Místo prodejce', logo: 'Loga dopravců', debug: 'Ladění', settings: 'Nastavení ParcelPilot', inTransit: 'Na cestě', readyForPickup: 'Připraveno k vyzvednutí', labelCreated: 'Štítek vytvořen', exception: 'Problém', unknown: 'Neznámé', daysInTransit: 'dní v cestě', dayInTransit: 'den v cestě', details: 'Podrobnosti doručení', orderStatus: 'Stav objednávky', shipmentStatus: 'Stav zásilky', options: 'Možnosti', orderStatusUnavailable: 'Na této stránce nenalezeno', updatedAgo: 'aktualizováno', overdue: 'Termín doručení vypršel' },
		sk: { trackingId: 'Sledovacie číslo', trackingPage: 'Sledovanie zásielky', latestUpdate: 'Posledná aktualizácia', estimatedDelivery: 'Odhadované doručenie', sellerLocation: 'Miesto predajcu', location: 'Poloha', myOrders: 'Moje objednávky', loading: 'Načítavajú sa informácie o zásielke…', unavailable: 'Sledovacie číslo nie je k dispozícii', notShipped: 'Zatiaľ neodoslané', loadFailed: 'Sledovanie sa nepodarilo načítať', retry: 'Skúsiť znova', copy: 'Kopírovať', copied: 'Skopírované', all: 'Všetko', active: 'Na ceste', delayed: 'Mešká', delivered: 'Doručené', noTracking: 'Bez sledovania', compact: 'Kompaktné', animation: 'Animácia', seller: 'Miesto predajcu', logo: 'Logá dopravcov', debug: 'Ladenie', settings: 'Nastavenia ParcelPilot', inTransit: 'Na ceste', readyForPickup: 'Pripravené na vyzdvihnutie', labelCreated: 'Štítok vytvorený', exception: 'Problém', unknown: 'Neznáme', daysInTransit: 'dní v ceste', dayInTransit: 'deň v ceste', details: 'Podrobnosti doručenia', orderStatus: 'Stav objednávky', shipmentStatus: 'Stav zásielky', options: 'Možnosti', orderStatusUnavailable: 'Na tejto stránke sa nenašlo', updatedAgo: 'aktualizované', overdue: 'Termín doručenia uplynul' },
		pl: { trackingId: 'Numer przesyłki', trackingPage: 'Śledź przesyłkę', latestUpdate: 'Ostatnia aktualizacja', estimatedDelivery: 'Przewidywana dostawa', sellerLocation: 'Lokalizacja sprzedawcy', location: 'Lokalizacja', myOrders: 'Moje zamówienia', loading: 'Wczytywanie informacji o przesyłce…', unavailable: 'Numer przesyłki niedostępny', notShipped: 'Jeszcze nie wysłano', loadFailed: 'Nie udało się wczytać śledzenia', retry: 'Spróbuj ponownie', copy: 'Kopiuj', copied: 'Skopiowano', all: 'Wszystkie', active: 'W drodze', delayed: 'Opóźnione', delivered: 'Dostarczone', noTracking: 'Bez śledzenia', compact: 'Zwarty', animation: 'Animacja', seller: 'Lokalizacja sprzedawcy', logo: 'Logotypy przewoźników', debug: 'Tryb debugowania', settings: 'Ustawienia ParcelPilot', inTransit: 'W drodze', readyForPickup: 'Gotowe do odbioru', labelCreated: 'Etykieta utworzona', exception: 'Problem', unknown: 'Nieznany', daysInTransit: 'dni w trasie', dayInTransit: 'dzień w trasie', details: 'Szczegóły dostawy', orderStatus: 'Status zamówienia', shipmentStatus: 'Status przesyłki', options: 'Opcje', orderStatusUnavailable: 'Nie znaleziono na tej stronie', updatedAgo: 'zaktualizowano', overdue: 'Termin dostawy minął' },
		sv: { trackingId: 'Spårningsnummer', trackingPage: 'Spåra paketet', latestUpdate: 'Senaste uppdateringen', estimatedDelivery: 'Beräknad leverans', sellerLocation: 'Säljarens plats', location: 'Plats', myOrders: 'Mina beställningar', loading: 'Hämtar spårningsinformation…', unavailable: 'Spårningsnummer saknas', notShipped: 'Inte skickat än', loadFailed: 'Kunde inte hämta spårningen', retry: 'Försök igen', copy: 'Kopiera', copied: 'Kopierat', all: 'Alla', active: 'Under väg', delayed: 'Försenad', delivered: 'Levererad', noTracking: 'Ingen spårning', compact: 'Kompakt', animation: 'Animation', seller: 'Säljarens plats', logo: 'Bärarlogos', debug: 'Felsökning', settings: 'ParcelPilot-inställningar', inTransit: 'Under väg', readyForPickup: 'Redo för hämtning', labelCreated: 'Etikett skapad', exception: 'Problem', unknown: 'Okänt', daysInTransit: 'dagar under väg', dayInTransit: 'dag under väg', details: 'Leveransdetaljer', orderStatus: 'Orderstatus', shipmentStatus: 'Paketstatus', options: 'Alternativ', orderStatusUnavailable: 'Hittades inte på den här sidan', updatedAgo: 'uppdaterad', overdue: 'Leveranstidsuppskattningen har passerat' },
		sl: { trackingId: 'Številka za sledenje', trackingPage: 'Sledenje pošiljke', latestUpdate: 'Zadnja posodobitev', estimatedDelivery: 'Predvidena dostava', sellerLocation: 'Lokacija prodajalca', location: 'Lokacija', myOrders: 'Moja naročila', loading: 'Nalaganje podatkov za sledenje…', unavailable: 'Številka za sledenje ni na voljo', notShipped: 'Še ni poslano', loadFailed: 'Sledenja ni bilo mogoče naložiti', retry: 'Poskusi znova', copy: 'Kopiraj', copied: 'Kopirano', all: 'Vse', active: 'Na poti', delayed: 'Zamikšano', delivered: 'Dostavljeno', noTracking: 'Brez sledenja', compact: 'Zgoščeno', animation: 'Animacija', seller: 'Lokacija prodajalca', logo: 'Logotipi prevoznikov', debug: 'Razhroščevanje', settings: 'Nastavitve ParcelPilot', inTransit: 'Na poti', readyForPickup: 'Pripravljeno za prevzem', labelCreated: 'Etiketa ustvarjena', exception: 'Težava', unknown: 'Neznano', daysInTransit: 'dni na poti', dayInTransit: 'dan na poti', details: 'Podrobnosti dostave', orderStatus: 'Stanje naročila', shipmentStatus: 'Stanje pošiljke', options: 'Možnosti', orderStatusUnavailable: 'Ni najdeno na tej strani', updatedAgo: 'posodobljeno', overdue: 'Napovedana dostava je potekla' },
		hu: { trackingId: 'Követési szám', trackingPage: 'Csomag nyomon követése', latestUpdate: 'Legutóbbi frissítés', estimatedDelivery: 'Várható kézbesítés', sellerLocation: 'Az eladó helye', location: 'Hely', myOrders: 'Rendeléseim', loading: 'A nyomon követési adatok betöltése…', unavailable: 'A követési szám nem érhető el', notShipped: 'Még nincs feladva', loadFailed: 'A nyomon követés nem tölthető be', retry: 'Újrapróbálkozás', copy: 'Másolás', copied: 'Másolva', all: 'Összes', active: 'Úton', delayed: 'Késésben', delivered: 'Kézbesítve', noTracking: 'Nyomkövetés nélkül', compact: 'Tömör', animation: 'Animáció', seller: 'Az eladó helye', logo: 'Futárszervezetek logói', debug: 'Hibakeresés', settings: 'ParcelPilot beállítások', inTransit: 'Úton', readyForPickup: 'Átvételre kész', labelCreated: 'Címke létrehozva', exception: 'Probléma', unknown: 'Ismeretlen', daysInTransit: 'nap az úton', dayInTransit: 'nap az úton', details: 'Szállítási adatok', orderStatus: 'Rendelés állapota', shipmentStatus: 'Csomag állapota', options: 'Beállítások', orderStatusUnavailable: 'Nem található ezen az oldalon', updatedAgo: 'frissítve', overdue: 'A kézbesítési becslés lejárt' },
	};
	const labels = { ...translations.en, ...(translations[language] ?? {}) };
	Object.assign(labels, {
		dashboard: language === 'nl' ? 'Overzicht' : 'Overview',
		sort: language === 'nl' ? 'Sorteren' : 'Sort',
		sortDirection: language === 'nl' ? 'Volgorde' : 'Direction',
		ascending: language === 'nl' ? 'Oplopend (laag naar hoog)' : 'Ascending (low to high)',
		descending: language === 'nl' ? 'Aflopend (hoog naar laag)' : 'Descending (high to low)',
		orderFilterHelp: language === 'nl' ? 'Welke bestellingen wil je zien?' : 'Which orders should be shown?',
		parcelFilterHelp: language === 'nl' ? 'Filter op de status van het pakket' : 'Filter by parcel status',
		optionsHelp: language === 'nl' ? 'Weergave en laadopties' : 'Display and loading options',
		toolsHelp: language === 'nl' ? 'Overzicht, sorteren en hulpmiddelen' : 'Overview, sorting and tools',
		floatingToolbar: language === 'nl' ? 'ParcelPilot-menu' : 'ParcelPilot menu',
		export: language === 'nl' ? 'Exporteer CSV' : 'Export CSV',
		refresh: language === 'nl' ? 'Nu vernieuwen' : 'Refresh now',
		autoRefresh: language === 'nl' ? 'Auto vernieuwen' : 'Auto refresh',
		notes: language === 'nl' ? 'Notitie' : 'Note',
		save: language === 'nl' ? 'Opslaan' : 'Save',
		saved: language === 'nl' ? 'Opgeslagen' : 'Saved',
		stale: language === 'nl' ? 'Geen update' : 'No recent update',
		notification: language === 'nl' ? 'Meldingen' : 'Notifications',
	});
	const preShipmentPattern = /order (?:placed|received|confirmed|created|cancelled|paid|awaiting)|payment (?:pending|received|failed)|\b(?:paid|facture|invoice|factuur|factura|fattura|rechnung|fakt[uú]ra)\b|being prepared|preparing|under preparation|wird vorbereitet|wordt (?:voorbereid|verpakt)|voorbereid\w*|\bverpakt\b|bestelling (?:geplaatst|ontvangen|bevestigd|geannuleerd|aangemaakt)|\b(?:betal\w*|betaald)\b|commande (?:pass[ée]e|confirm[ée]e|re[çc]ue|annul[ée]e|cr[ée]e[ée]e)|\b(?:paiement|pay[ée]e)\b|en pr[ée]paration|bestellung (?:aufgegeben|eingegangen|best[äa]tigt|erstellt)|\b(?:zahlung|bezahlt)\b|in vorbereitung|pedido (?:realizado|confirmado|recibido|creado)|\b(?:pago|pagado)\b|preparando|prepar[áa]ndose|ordine (?:effettuato|confermato|creato)|\b(?:pagamento|pagato)\b|in preparazione|zam[oó]wienie (?:z[łl]o[żz]one|potwierdzone|utworzone)|\b(?:p[łl]atno[śs][cć]\w*|op[łl]acone)\b|w przygotowaniu|objedn[aá]vka (?:vytvo[řr]en\w*|potvrzena)|\b(?:platb\w*|zaplaceno)\b|v p[řr][íi]prav[ěe]|objedn[aá]vka (?:vytvoren\w*|potvrden\w*)|\b(?:zaplate[nń][ée]|fakt[uú]ra)\b|v pr[íi]prave|best[äa]llning (?:lagd|mottagen|bekr[äa]ftad)|\b(?:betalning|betald)\b|f[öo]rberer|naro[čc]ilo (?:oddano|prejeto|potrjeno)|\b(?:pla[čc]il\w*|pla[čc]an\w*|ra[čc]un)\b|v pripravi|tellimus (?:tehtud|vastu v[õo]etud)|\b(?:makse|tasutud)\b|valmistamisel|u[žz]sakymas (?:pateiktas|gautas)|\b(?:mok[ėe]jim\w*|apmok[ėe]ta)\b|ruo[šs]ioma|pas[uū]t[īi]jums (?:izdar[īi]ts|sa[ņņ]emts)|\b(?:maks[aā]jum\w*|apmaks[aā]ts|r[ēe]kins)\b|sagatavo[šs][aā]n[aā]|rendel[ée]s (?:leadva|be[ée]rkezett)|\b(?:fizet[ée]s|sz[aá]mla)\b|el[őo]k[ée]sz[íi]t[ée]s alatt/;
	const shipmentEventPattern = /\blabel\b|shipped|dispatched|handed over|handed to|picked up|collected|in transit|out for delivery|on its way|arriv\w*|departed|with (?:the )?(?:courier|carrier)|shipment information|tracking information|verzonden|verstuurd|overgedragen|onderweg|afgehaald|gegevens ontvangen|exp[ée]di[ée]|remis|confi[ée]|en route|en camino|reparto|versandt|verschickt|[üu]bergeben|unterwegs|abgeholt|enviado|entregado al transportador|spedito|consegnato al (?:corriere|trasportatore)|in viaggio|wys[łl]ano|nadano|w tranzycie|w drodze|odesl[aá]no|p[řr]ed[aá]no|v tranzit|na cest[ěe]|skickad|[öo]verl[äa]mnad|under v[äa]g|poslano|oddano|v prometi|na poti|saadetud|[üu]le antud|teel|i[šs]si[ųu]sta|perduota|	kelyje|nos[uū]t[īi]ts|nodots|ce[ļl][aā]|feladva|[áa]tadva|[úu]ton/;
	// A tracking code or shipping label being created is seller-side preparation, not a carrier
	// hand-over. These events often carry a carrier stamp and occasionally a location, so they
	// have to be recognised explicitly to keep "days in transit" from starting too early.
	const labelCreatedPattern = /\b(?:tracking|shipment|shipping)?\s*(?:code|number|label|etikett\w*|etiquette\w*|etichetta|n[uú]mero|numero|num[eé]ro)\b[^\n]{0,40}\b(?:created|generated|issued|registered)\b|\b(?:aangemaakt|gegenereerd|aangemaakt|erstellt|ausgedruckt)\b|code de suivi cr[ée][ée]|\b(?:num[eé]ro de suivi|etiquette d['’]exp[ée]dition|exp[ée]dition cr[ée][ée]e?)\b|(?:sendungsnummer|sendungscode|versand(?:label|etikett)\w*|frachtbrief)\s+(?:erstellt|ausgedruckt)|c[óo]digo de (?:seguimiento|rastreo)\s+(?:creado|generado)|etiqueta de (?:env[ií]o|remesa)\s+(?:creada|generada)|codice di (?:tracciamento|spedizione)\s+(?:creato|generato)|etichetta di spedizione\s+(?:creata|generata)|c[óo]digo de (?:rastreamento|seguimento)\s+criado|etiqueta de (?:envio|remessa)\s+(?:criada|gerada)|numer przesy[łl]ki utworzon\w*|etykieta wysy[łl]kowa (?:utworzona|wygenerowana)|sledovac[íi] [čc][íi]slo vytvo[řr]en\w*|p[řr]epravn[íi] [šs][tíi]tek (?:vytvo[řr]en\w*|vyti[šs][tĕě]n\w*)|sledovacie [čc][íi]slo vytvoren[ée]|prepren[ýy] [šs][tíi]tok vytvoren[ýy]|sp[åa]rningsnummer (?:skapat|skapades)|fraktetikett (?:skapad|skapades)|[šs]tevilka za sledenje (?:ustvarjena|ustvarjena)|dostavna etiketa (?:ustvarjena|ustvarjena)|j[äa]lgimiskood (?:loodud|genereritud)|saadetise silt (?:loodud|genereritud)|sekimo numeris sukurtas|siuntimo etiket[ėe] sukurta|izseko[šs]anas numurs izveidots|s[ūu]t[īi]juma etiķete izveidota|kovet[ée]si sz[áa]m l[ée]trehozva|sz[áa]ll[íi]t[áa]si c[íi]mke l[ée]trehozva/;
	let scanTimer;
	let refreshTimer;
	let lastNotificationState = new Map();
	const noteSaveTimers = new Map();

	function loadSettings() {
		try {
			const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
			return { ...defaultSettings, ...saved };
		} catch {
			return { ...defaultSettings };
		}
	}

	function saveSettings() {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	}

	function loadNotes() {
		try {
			const saved = JSON.parse(localStorage.getItem(NOTES_KEY) ?? '{}');
			return saved && typeof saved === 'object' ? saved : {};
		} catch {
			return {};
		}
	}

	function saveNotes() {
		localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
	}

	function saveOrderNote(orderId, text, tagText) {
		notes[orderId] = {
			text: text.trim(),
			tags: tagText.split(',').map((tag) => tag.trim()).filter(Boolean),
		};
		saveNotes();
	}

	function scheduleNoteSave(orderId, text, tagText) {
		clearTimeout(noteSaveTimers.get(orderId));
		noteSaveTimers.set(orderId, setTimeout(() => {
			saveOrderNote(orderId, text, tagText);
			noteSaveTimers.delete(orderId);
		}, 350));
	}

	function startAutoRefresh() {
		clearInterval(refreshTimer);
		if (!settings.autoRefresh || location.pathname !== '/my_orders') return;
		refreshTimer = setInterval(() => {
			clearTrackingCache();
			orderResults.clear();
			document.querySelectorAll('[data-vinted-order-id], [data-vinted-loading-id]').forEach((row) => row.remove());
			scheduleScan();
		}, Math.max(1, Number(settings.refreshMinutes) || 10) * 60000);
	}

	function loadCachedOrder(orderId) {
		try {
			const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
			const entry = cache[orderId];
			if (!entry || Date.now() - entry.cachedAt > Number(settings.cacheMinutes) * 60000) return null;
			return entry.tracking;
		} catch {
			return null;
		}
	}

	function cacheOrder(orderId, tracking) {
		try {
			const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
			cache[orderId] = { cachedAt: Date.now(), tracking };
			const keys = Object.keys(cache);
			for (const key of keys.slice(0, Math.max(0, keys.length - 100))) delete cache[key];
			localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
		} catch (error) {
			debugLog('Cache write failed', error);
		}
	}

	function clearTrackingCache() {
		localStorage.removeItem(CACHE_KEY);
		orderResults.clear();
	}

	function debugLog(...args) {
		// console.log, not console.debug: browsers such as Firefox hide debug output by default.
		if (settings.debug) console.log('[Vinted ParcelPilot]', ...args);
	}

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
		const result = { code: '', url: '', carrier: '', carrierLogo: '', latestMessage: '', latestTimestamp: '', latestLocation: '', currentLocation: '', estimatedDelivery: '', estimatedTimestamp: '', shippedTimestamp: '', status: 'unknown', statusLabel: labels.unknown, delayed: false };
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
			// Sort only datable events: a NaN from the comparator makes the sort order arbitrary.
			const dated = updates
				.filter((update) => typeof update?.timestamp === 'string' && !Number.isNaN(Date.parse(update.timestamp)))
				.sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp));
			const latest = dated.find((update) => update.message) ?? dated[0];
			if (latest) {
				result.latestMessage = latest.message ?? '';
				result.latestTimestamp = latest.timestamp;
				result.latestLocation = getUpdateLocation(latest);
			} else if (Array.isArray(updates) && updates.length) {
				const any = updates[0];
				result.latestLocation = getUpdateLocation(any);
			}
			result.shippedTimestamp = getShipmentStart(updates);
			const carrier = latest?.carrier ?? updates.find((update) => update.carrier)?.carrier;
			result.carrier = getCarrierName(carrier);
			result.carrierLogo = getCarrierLogo(carrier?.logo_url);
		}
		const js = data?.journey_summary || {};
		let estimated = '';
		let currentLoc = '';
		const locationCandidates = [
			js?.current_location,
			js?.currentLocation,
			js?.last_location,
			js?.lastLocation,
			js?.location,
			js?.current_position,
			js?.position,
			js?.current_place,
			js?.last_place,
			js?.place,
			js?.destination,
			js?.destination_location,
			js?.drop_off_location,
			js?.pickup_location,
			js?.delivery?.location,
			js?.delivery?.destination,
			js?.delivery?.place,
			js?.delivery_location,
			js?.shipment?.current_location,
			js?.shipment?.location,
			js?.shipment?.destination,
			js?.shipment?.dropoff_location,
			js?.parcel?.location,
			js?.parcel?.current_location,
			js?.parcel?.last_location,
			js?.track?.current_location,
			js?.track?.location,
			js?.tracking?.current_location,
			js?.tracking?.location,
			js?.carrier?.location,
			js?.last_known_location,
			js?.lastKnownLocation,
		];
		for (const c of locationCandidates) {
			if (typeof c === 'string' && c.trim()) {
				currentLoc = c.trim();
				break;
			}
			if (c && typeof c === 'object') {
				const l = getUpdateLocation({ location: c, place: c, city: c.city, country: c.country, country_name: c.country_name, region: c.region });
				if (l) {
					currentLoc = l;
					break;
				}
			}
		}
		const candidates = [
			js?.estimated_detail?.time_period,
			js?.estimated_detail?.time_range,
			js?.estimated_detail?.date,
			js?.estimated_detail?.end_date,
			js?.estimated_detail?.start_date,
			js?.estimated_delivery_date,
			js?.estimated_delivery,
			js?.delivery_date,
			js?.expected_delivery,
			js?.eta,
			js?.estimated_arrival,
			js?.arrival_date,
			js?.delivery_estimate,
			js?.delivery?.estimated_delivery_date,
			js?.delivery?.delivery_date,
			js?.delivery?.eta,
		];
		for (const c of candidates) {
			if (typeof c === 'string' && c.trim()) {
				estimated = c.trim();
				break;
			}
		}
		const updatesArr = Array.isArray(js?.details) ? js.details : [];
		if (!estimated) {
			for (let i = 0; i < updatesArr.length; i++) {
				const u = updatesArr[i] || {};
				const ecand = [u.estimated_delivery, u.delivery_date, u.eta, u.expected_delivery, u.arrival_date];
				for (const c of ecand) {
					if (typeof c === 'string' && c.trim()) {
						estimated = c.trim();
						break;
					}
				}
				if (estimated) break;
			}
		}
		if (!currentLoc) {
			for (let i = 0; i < updatesArr.length; i++) {
				const u = updatesArr[i] || {};
				const l = getUpdateLocation(u);
				if (l) {
					currentLoc = l;
					break;
				}
			}
		}
		// Fallback: scan entire journey_summary recursively for any location-like string
		if (!currentLoc) {
			const visited2 = new WeakSet();
			let found = false;
			const scan = (obj) => {
				if (found || !obj || typeof obj !== 'object' || visited2.has(obj)) return;
				visited2.add(obj);
				for (const [k, v] of Object.entries(obj)) {
					if (found) break;
					const kl = k.toLowerCase();
					if ((kl.includes('loc') || kl.includes('place') || kl.includes('city') || kl.includes('country') || kl.includes('region') || kl.includes('position')) && typeof v === 'string' && v.trim()) {
						if (v.trim().length < 80) {
							currentLoc = v.trim();
							found = true;
							return;
						}
					}
					if (v && typeof v === 'object') scan(v);
				}
			};
			scan(js);
		}
		if (estimated) {
			const isoLike = /^\d{4}-\d{2}-\d{2}(?:[T ]|$)/.test(estimated);
			let d = null;
			if (isoLike) {
				d = new Date(estimated);
			} else {
				const parsed = Date.parse(estimated);
				if (!Number.isNaN(parsed)) {
					d = new Date(parsed);
				}
			}
			if (d && !Number.isNaN(d.getTime())) {
				result.estimatedTimestamp = d.toISOString();
				try {
					estimated = new Intl.DateTimeFormat(pageLocale, { dateStyle: 'medium' }).format(d);
				} catch (e) {
					// keep as-is if formatting fails
				}
			}
		}
		result.estimatedDelivery = estimated;
		if (currentLoc) {
			result.currentLocation = currentLoc;
			if (!result.latestLocation) result.latestLocation = currentLoc;
		}
		const status = getShipmentStatus(result);
		result.status = status.key;
		result.statusLabel = status.label;
		result.delayed = status.delayed;
		if (!result.url) result.url = getCarrierTrackingUrl(result.carrier, result.code);
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
				debugLog('Seller location unavailable', cacheKey, error);
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
		for (const source of [
			update,
			update?.delivery_information,
			update?.delivery,
			update?.shipment,
			update?.parcel,
			update?.location_info,
			update?.locationInfo,
			update?.track_info,
			update?.tracking_info,
			update?.event,
		]) {
			if (!source || typeof source !== 'object') continue;
			addText(source.city);
			addText(source.region);
			addText(source.state);
			addText(source.province);
			addText(source.zip_code);
			addText(source.postcode);
			addText(source.country_name);
			addCountry(source.country);
			addText(source.country_code);
			addText(source.name);
			addText(source.label);
			for (const place of [
				source.location,
				source.place,
				source.address,
				source.drop_off_location,
				source.pickup_location,
				source.current_location,
				source.last_location,
				source.location_name,
				source.locationName,
				source.city_name,
			]) {
				if (typeof place === 'string') addText(place);
				else if (place && typeof place === 'object') {
					addText(place.city);
					addText(place.region);
					addText(place.state);
					addText(place.province);
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
			[/^HOMERR(?:[-_]|$)/, 'Homerr'],
			[/^RELAIS[-_]?COLIS(?:[-_]|$)/, 'Relais Colis'],
			[/^CHRONOPOST(?:[-_]|$)/, 'Chronopost'],
			[/^COLISSIMO(?:[-_]|$)|^LA[-_]?POSTE(?:[-_]|$)/, 'Colissimo'],
			[/^ROYAL[-_]?MAIL(?:[-_]|$)/, 'Royal Mail'],
			[/^SEUR(?:[-_]|$)/, 'SEUR'],
			[/^CORREOS(?:[-_]|$)/, 'Correos'],
			[/^YODEL(?:[-_]|$)/, 'Yodel'],
			[/^PACKETA(?:[-_]|$)|^ZASILKOVNA(?:[-_]|$)/, 'Packeta'],
			[/^POST[-_]?NL(?:[-_]|$)/, 'PostNL'],
			[/^DPD(?:[-_]|$)/, 'DPD'],
			[/^GLS(?:[-_]|$)/, 'GLS'],
			[/^UPS(?:[-_]|$)/, 'UPS'],
			[/^BPOST(?:[-_]|$)/, 'bpost'],
			[/^INPOST(?:[-_]|$)/, 'InPost'],
			[/^MONDIAL[-_]?RELAY|^MONDIAL(?:[-_]|$)/, 'Mondial Relay'],
			[/^HERMES(?:[-_]|$)|^EVRI(?:[-_]|$)/, 'Evri'],
		];
		return knownCarriers.find(([pattern]) => pattern.test(code))?.[1] ?? '';
	}

	function getCarrierAccent(carrierName) {
			const accents = {
				DHL: '#d40511',
				Homerr: '#00a76f',
				'Relais Colis': '#e30613',
				Chronopost: '#005baa',
				Colissimo: '#ffc928',
				'Royal Mail': '#da202a',
				SEUR: '#d71920',
				Correos: '#ffd200',
				Yodel: '#742774',
				Packeta: '#ba0c2f',
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

	function getCarrierTrackingUrl(carrierName, code) {
		if (!carrierName || !code) return '';
		const encoded = encodeURIComponent(code.trim());
		const trackingPages = {
			DHL: `https://www.dhl.com/global-en/home/tracking/tracking-parcel.html?submit=1&tracking-id=${encoded}`,
			PostNL: `https://jouw.postnl.nl/track-and-trace/${encoded}`,
			DPD: `https://www.dpd.com/tracking?parcelNumber=${encoded}`,
			GLS: `https://gls-group.com/NL/nl/pakket-traceren?match=${encoded}`,
			UPS: `https://www.ups.com/track?tracknum=${encoded}`,
			bpost: `https://track.bpost.cloud/btr/web/#/search?itemCode=${encoded}`,
			InPost: `https://inpost.pl/sledzenie-przesylek?number=${encoded}`,
			'Mondial Relay': `https://www.mondialrelay.fr/suivi-de-colis?numeroExpedition=${encoded}`,
			Evri: `https://www.evri.com/track-a-parcel?parcel=${encoded}`,
			'Homerr': `https://www.homerr.com/track-trace/?trackingCode=${encoded}`,
			'Relais Colis': `https://www.relaiscolis.com/suivi-colis/?numeroColis=${encoded}`,
			Chronopost: `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${encoded}`,
			Colissimo: `https://www.laposte.fr/outils/suivre-vos-envois?code=${encoded}`,
			'Royal Mail': `https://www.royalmail.com/track-your-item#/tracking-results/${encoded}`,
			SEUR: `https://www.seur.com/livetracking/pages/seguimiento-online-busqueda.do?segOnlineIdentificador=${encoded}`,
			Correos: `https://www.correos.es/es/en/tools/tracker/items/details?tracking-number=${encoded}`,
			Yodel: `https://www.yodel.co.uk/track/${encoded}`,
			Packeta: `https://tracking.packeta.com/en/?id=${encoded}`,
		};
		return trackingPages[carrierName] ?? '';
	}

	function hasCarrierInfo(carrier) {
		if (!carrier || typeof carrier !== 'object') return false;
		return ['name', 'carrier_name', 'title', 'code', 'logo_url']
			.some((key) => typeof carrier[key] === 'string' && carrier[key].trim());
	}

	// Vinted ships capitalised messages, so every pattern below is matched case-insensitively.
	function normalizeEventMessage(message) {
		return typeof message === 'string' ? message.toLowerCase() : '';
	}

	function isPreShipmentEvent(message) {
		return preShipmentPattern.test(normalizeEventMessage(message));
	}

	function isLabelCreatedEvent(message) {
		return labelCreatedPattern.test(normalizeEventMessage(message));
	}

	// Lower is a better proof that the parcel physically left the seller. A carrier scan (a
	// stamped and located event) is the only signal that cannot be mistaken for preparation, so
	// it wins outright. Anything that is not seller-side preparation outranks a label event,
	// because Vinted always creates the label before the parcel moves. A label or tracking code
	// being created is seller-side work: it carries a carrier stamp but proves nothing about the
	// parcel moving, so it is only used when no better event exists at all.
	function getShipmentConfidence(update, message) {
		if (isPreShipmentEvent(message)) return 7;
		const labelCreated = isLabelCreatedEvent(message);
		const carrier = hasCarrierInfo(update?.carrier);
		const location = Boolean(getUpdateLocation(update));
		const shipped = shipmentEventPattern.test(normalizeEventMessage(message));
		if (!labelCreated) {
			if (carrier && location) return 0;
			if (carrier || location) return 1;
			if (shipped) return 2;
			return 3;
		}
		if (carrier || location) return 4;
		if (shipped) return 5;
		return 6;
	}

	function getShipmentStart(updates) {
		if (!Array.isArray(updates)) return '';
		const messageOf = (update) => (typeof update?.message === 'string' ? update.message : '');
		const dated = updates
			.filter((update) => typeof update?.timestamp === 'string' && !Number.isNaN(Date.parse(update.timestamp)))
			.map((update) => ({
				update,
				time: Date.parse(update.timestamp),
				confidence: getShipmentConfidence(update, messageOf(update)),
			}))
			.sort((left, right) => left.confidence - right.confidence || left.time - right.time);
		if (!dated.length) return '';
		const confidenceNames = {
			0: 'carrier scan', 1: 'carrier or location', 2: 'shipped wording',
			3: 'not an order event', 4: 'label created with carrier',
			5: 'label created wording', 6: 'label created', 7: 'pre-shipment event',
		};
		const start = dated[0];
		const usedTier = start.confidence;
		debugLog(`Days in transit counts from: ${messageOf(start.update)} [${start.update.timestamp}] via tier ${usedTier} = ${confidenceNames[usedTier]}`);
		debugLog('Shipment events', dated.map(({ update, confidence }) => ({
			timestamp: update.timestamp,
			message: messageOf(update),
			carrier: hasCarrierInfo(update?.carrier),
			location: Boolean(getUpdateLocation(update)),
			tier: confidence,
		})));
		return new Date(start.time).toISOString();
	}

	function getShipmentStatus(tracking) {
		const text = `${tracking.latestMessage} ${tracking.estimatedDelivery}`.toLowerCase();
		const delivered = /delivered|afgeleverd|bezorgd|livr[eé]|entregado|zugestellt|consegnat|dostarcz|doru[cč]en|pristatyt|pieg[aā]d[aā]t|levererad/.test(text);
		const pickup = /pickup|pick-up|afhalen|afhaal|ophalen|point relais|relay|parcelshop|locker|pakketpunt|ready for collection/.test(text);
		const label = /label|aangemaakt|announced|voorgemeld|created|shipment information|gegevens ontvangen/.test(text);
		const issue = /delay|delayed|vertraagd|failed|mislukt|exception|incident|problem|retour|returned|niet gelukt|on hold/.test(text);
		const hasUpdate = Boolean(tracking.latestMessage || tracking.latestTimestamp);
		const delayed = issue || isEstimatedDeliveryOverdue(tracking.estimatedDelivery, delivered);
		if (delivered) return { key: 'delivered', label: labels.delivered, delayed: false };
		if (delayed) return { key: 'delayed', label: labels.delayed, delayed: true };
		if (pickup) return { key: 'pickup', label: labels.readyForPickup, delayed: false };
		if (label) return { key: 'label', label: labels.labelCreated, delayed: false };
		if (hasUpdate) return { key: 'active', label: labels.inTransit, delayed: false };
		return { key: 'unknown', label: labels.unknown, delayed: false };
	}

	function isEstimatedDeliveryOverdue(value, delivered) {
		if (delivered || !value) return false;
		const matches = [...value.matchAll(/\b(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?\b/g)];
		if (!matches.length) return false;
		const now = new Date();
		const currentYear = now.getFullYear();
		const latest = matches
			.map((match) => {
				const day = Number(match[1]);
				const month = Number(match[2]) - 1;
				const year = match[3] ? Number(match[3].length === 2 ? `20${match[3]}` : match[3]) : currentYear;
				return new Date(year, month, day, 23, 59, 59);
			})
			.filter((date) => !Number.isNaN(date.getTime()))
			.sort((left, right) => right - left)[0];
		return latest ? latest < now : false;
	}

	function getRelativeAge(timestamp) {
		const date = new Date(timestamp);
		if (Number.isNaN(date.getTime())) return '';
		const seconds = Math.round((date.getTime() - Date.now()) / 1000);
		const units = [
			['year', 31536000],
			['month', 2592000],
			['week', 604800],
			['day', 86400],
			['hour', 3600],
			['minute', 60],
		];
		const [unit, value] = units.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds) ?? ['second', 1];
		return new Intl.RelativeTimeFormat(pageLocale, { numeric: 'auto' }).format(Math.round(seconds / value), unit);
	}

	function getDaysInTransit(tracking) {
		const start = Date.parse(tracking.shippedTimestamp || tracking.latestTimestamp);
		if (Number.isNaN(start) || tracking.status === 'delivered') return '';
		const days = Math.max(1, Math.floor((Date.now() - start) / 86400000) + 1);
		return `${days} ${days === 1 ? labels.dayInTransit : labels.daysInTransit}`;
	}

	function wrapOrderCard(card) {
		if (!(card instanceof HTMLElement)) return;
		if (card.dataset.vintedWrapped === 'true') return;
		card.dataset.vintedWrapped = 'true';
		card.style.border = '1px solid #dde7e7';
		card.style.borderRadius = '8px';
		if (!card.style.padding || parseInt(card.style.padding) === 0) {
			card.style.padding = '8px 10px';
		}
		if (!card.style.backgroundColor) {
			card.style.backgroundColor = '#fff';
		}
	}

	function ensureTrackingStyles() {
		if (document.getElementById('vinted-tracking-styles')) return;
		const style = document.createElement('style');
		style.id = 'vinted-tracking-styles';
		style.textContent = `
			.vinted-tracking {
				box-sizing: border-box;
				margin: 10px 0 0;
				padding: 12px 14px;
				display: flex;
				flex-direction: column;
				gap: 10px;
				border: 1px solid #dde7e7;
				border-left: 4px solid #08a4aa;
				border-radius: 8px;
				background: #fff;
				color: #293335;
				font: 13px/1.45 sans-serif;
				box-shadow: 0 1px 2px rgba(16, 40, 44, 0.06);
			}
			.vinted-tracking--delayed {
				border-left-color: #b42318;
				background: #fffaf9;
			}
			.vinted-tracking--stale:not(.vinted-tracking--delayed) {
				border-left-color: #d5a400;
				background: #fffdf5;
			}
			.vinted-tracking__note {
				display: flex;
				flex-wrap: wrap;
				gap: 6px;
				border-top: 1px solid #eef2f2;
				padding-top: 8px;
			}
			.vinted-tracking__note input,
			.vinted-tracking__note textarea {
				box-sizing: border-box;
				min-width: 120px;
				flex: 1 1 180px;
				padding: 6px 8px;
				border: 1px solid #8da4a6;
				border-radius: 4px;
				background: #fff;
				color: #172326;
				font: 14px/1.4 sans-serif;
				opacity: 1;
			}
			.vinted-tracking__note textarea {
				min-height: 38px;
				resize: vertical;
			}
			.vinted-tracking__note input::placeholder,
			.vinted-tracking__note textarea::placeholder {
				color: #526568;
				opacity: 1;
			}
			.vinted-tracking__note input:focus,
			.vinted-tracking__note textarea:focus {
				border-color: #007782;
				outline: 2px solid rgba(0, 119, 130, 0.22);
				outline-offset: 1px;
			}
			.vinted-tracking__note button {
				padding: 5px 9px;
				border: 1px solid #c3dddd;
				border-radius: 4px;
				background: #eff8f8;
				color: #007f84;
				cursor: pointer;
			}
			.vinted-tracking--compact {
				padding: 8px 12px;
				gap: 6px;
			}
			.vinted-tracking__headline {
				display: flex;
				flex-wrap: wrap;
				align-items: baseline;
				gap: 4px 10px;
				min-width: 0;
			}
			.vinted-tracking__product {
				display: flex;
				flex-wrap: wrap;
				align-items: baseline;
				gap: 4px 10px;
				min-width: 0;
				flex: 1 1 auto;
			}
			.vinted-tracking__product-name {
				font-size: 14px;
				font-weight: 700;
				overflow-wrap: anywhere;
			}
			.vinted-tracking__product-link {
				color: inherit;
				text-decoration: none;
			}
			.vinted-tracking__product-link:hover {
				text-decoration: underline;
			}
			.vinted-tracking__price {
				color: #657275;
				font-size: 13px;
				font-weight: 600;
				white-space: nowrap;
			}
			.vinted-tracking__bar {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 8px;
				min-width: 0;
				padding: 8px 10px;
				border: 1px solid #e4ebeb;
				border-radius: 6px;
				background: #f7fafa;
			}
			.vinted-tracking__id {
				display: flex;
				flex: 1 1 260px;
				flex-wrap: wrap;
				align-items: center;
				gap: 8px;
				min-width: 0;
			}
			.vinted-tracking__details {
				display: grid;
				/* The label column is sized by the stylesheet, not by the data, so rows stay
				   aligned whether two or four of them are present. */
				grid-template-columns: minmax(96px, 34%) minmax(0, 1fr);
				margin: 0;
				border-top: 1px solid #eef2f2;
				padding-top: 8px;
			}
			.vinted-tracking__detail {
				display: contents;
			}
			.vinted-tracking__detail-term {
				padding: 3px 12px 3px 0;
				color: #657275;
				font-size: 12px;
				font-weight: 600;
			}
			.vinted-tracking__detail-value {
				display: flex;
				flex-wrap: wrap;
				align-items: baseline;
				gap: 4px 8px;
				min-width: 0;
				margin: 0;
				padding: 3px 0;
				font-weight: 500;
				overflow-wrap: anywhere;
			}
			.vinted-tracking__detail-body {
				/* Stacked so the update message and its timestamp never run together on one line,
				   for every order and every locale. */
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				gap: 2px;
				min-width: 0;
				overflow-wrap: anywhere;
			}
			.vinted-tracking__warning {
				color: #b42318;
				font-weight: 700;
			}
			.vinted-tracking--compact .vinted-tracking__details {
				display: none;
			}
			.vinted-tracking__status {
				display: inline-flex;
				align-items: center;
				width: fit-content;
				padding: 3px 8px;
				border: 1px solid #b9dddd;
				border-radius: 999px;
				background: #eaf8f8;
				color: #007782;
				font-size: 12px;
				font-weight: 700;
				white-space: nowrap;
			}
			.vinted-tracking__status--delivered {
				border-color: #b7dfc2;
				background: #edf9f0;
				color: #1d7a3a;
			}
			.vinted-tracking__status--delayed,
			.vinted-tracking__status--exception {
				border-color: #ffd1c8;
				background: #fff0ec;
				color: #b42318;
			}
			.vinted-tracking__status--pickup {
				border-color: #d4c6ff;
				background: #f4f0ff;
				color: #5a35a5;
			}
			.vinted-tracking__status--label,
			.vinted-tracking__status--unknown {
				border-color: #d7dde2;
				background: #f5f7f8;
				color: #5d6870;
			}
			.vinted-tracking__carrier {
				display: inline-flex;
				align-items: center;
				gap: 5px;
				padding: 2px 8px;
				border: 1px solid #dbe5e5;
				border-radius: 999px;
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
				flex: 1 1 auto;
				max-width: 100%;
				padding: 4px 10px;
				border: 1px solid #dfe8e8;
				border-radius: 5px;
				background: #fff;
				color: #12282b;
				font-family: ui-monospace, monospace;
				font-size: 15px;
				font-weight: 700;
				letter-spacing: 0.04em;
				overflow-wrap: anywhere;
			}
			.vinted-tracking__copy {
				width: 30px;
				height: 30px;
				flex: 0 0 30px;
				display: inline-grid;
				place-items: center;
				border: 1px solid #d5e1e1;
				border-radius: 5px;
				background: #fff;
				color: #007f84;
				cursor: pointer;
			}
			.vinted-tracking__copy:hover {
				background: #edf8f8;
			}
			.vinted-tracking__copy svg {
				width: 15px;
				height: 15px;
			}
			.vinted-tracking__link {
				margin-left: auto;
				flex: 0 0 auto;
				padding: 6px 10px;
				border: 1px solid #c3dddd;
				border-radius: 5px;
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
				display: block;
				min-width: 0;
				font-weight: 600;
				overflow-wrap: anywhere;
			}
			.vinted-tracking__time {
				display: block;
				color: #687578;
				font-size: 12px;
				white-space: nowrap;
			}
			.vinted-tracking__meta {
				padding: 3px 8px;
				border: 1px solid #e4ebeb;
				border-radius: 999px;
				background: #f2f7f7;
				color: #00666b;
				font-size: 12px;
				font-weight: 700;
				white-space: nowrap;
			}
			.vinted-tracking__empty {
				color: #687578;
				font-weight: 600;
			}
			.vinted-tracking--notice {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 8px;
				padding: 8px 14px;
				color: #657275;
			}
			.vinted-tracking--notice--failed {
				border-left-color: #d5a400;
				background: #fffdf5;
				color: #7a5b00;
			}
			.vinted-tracking__notice-icon {
				width: 16px;
				height: 16px;
				flex: 0 0 16px;
			}
			.vinted-tracking__notice-text {
				min-width: 0;
				font-weight: 600;
			}
			.vinted-tracking__retry {
				margin-left: auto;
				padding: 3px 9px;
				border: 1px solid #e0d3a8;
				border-radius: 4px;
				background: #fff;
				color: #7a5b00;
				font: inherit;
				font-weight: 600;
				cursor: pointer;
			}
			.vinted-tracking__retry:hover {
				background: #fff4d6;
			}
			.vinted-tracking__loading-text {
				color: #687578;
				font-size: 12px;
			}
			.vinted-tracking-toolbar {
				position: sticky;
				top: 12px;
				z-index: 20;
				box-sizing: border-box;
				display: flex;
				flex-wrap: wrap;
				align-items: flex-start;
				gap: 8px 20px;
				width: min(100%, 1180px);
				margin: 12px auto 16px;
				padding: 12px;
				border: 1px solid #cbdada;
				border-radius: 10px;
				background: rgba(255, 255, 255, 0.97);
				color: #293335;
				font: 13px/1.4 sans-serif;
				box-shadow: 0 8px 24px rgba(16, 40, 44, 0.12);
				backdrop-filter: blur(8px);
			}
			.vinted-tracking-toolbar__group {
				flex: 1 1 210px;
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 4px 10px;
				padding: 8px 10px;
				border: 1px solid #e1e9e9;
				border-radius: 6px;
				background: #fbfdfd;
			}
			.vinted-tracking-toolbar__tools {
				flex-basis: 100%;
			}
			.vinted-tracking-toolbar__group--stacked {
				align-items: flex-start;
				flex-direction: column;
				gap: 6px;
			}
			.vinted-tracking-toolbar__group-label {
				color: #687578;
				font-size: 11px;
				font-weight: 700;
				letter-spacing: 0.04em;
				text-transform: uppercase;
			}
			.vinted-tracking-toolbar__group-help {
				flex-basis: 100%;
				color: #526568;
				font-size: 12px;
			}
			.vinted-tracking-toolbar__filters--empty {
				color: #687578;
				font-style: italic;
			}
			.vinted-tracking-vinted-filter-hidden {
				display: none !important;
			}
			.vinted-tracking-toolbar__filters {
				display: inline-flex;
				flex-wrap: wrap;
				gap: 4px;
			}
			.vinted-tracking-toolbar button,
			.vinted-tracking-toolbar label,
			.vinted-tracking-toolbar select,
			.vinted-tracking-toolbar input[type="number"] {
				min-height: 30px;
				border: 1px solid #d5e1e1;
				border-radius: 4px;
				background: #fff;
				color: #293335;
				font: inherit;
			}
			.vinted-tracking-toolbar select,
			.vinted-tracking-toolbar input[type="number"] {
				padding: 5px 8px;
				background: #fff;
			}
			.vinted-tracking-toolbar__control {
				display: inline-flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 5px;
				color: #293335;
				font-size: 12px;
				font-weight: 600;
			}
			.vinted-tracking-toolbar button {
				padding: 5px 9px;
				cursor: pointer;
			}
			.vinted-tracking-toolbar button[aria-pressed="true"] {
				border-color: #007f84;
				background: #e8f7f7;
				color: #00666b;
				font-weight: 700;
			}
			.vinted-tracking-toolbar__toggle {
				display: inline-flex;
				align-items: center;
				gap: 6px;
				padding: 4px 8px;
				cursor: pointer;
			}
			.vinted-tracking-toolbar__toggle input {
				margin: 0;
				accent-color: #007f84;
			}
			.vinted-tracking-card-hidden {
				display: none !important;
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
				.vinted-tracking-toolbar {
					top: 4px;
					margin: 8px 0 12px;
					padding: 8px;
				}
				.vinted-tracking:not(.vinted-tracking--loading) { padding: 10px; }
				.vinted-tracking__product-name { font-size: 13px; }
				.vinted-tracking__bar { gap: 6px; }
				.vinted-tracking__id { flex: 1 1 100%; }
				.vinted-tracking__details {
					grid-template-columns: minmax(0, 1fr);
				}
				.vinted-tracking__detail-term {
					padding: 6px 0 0;
				}
				.vinted-tracking__link {
					margin-left: 0;
				}
				.vinted-tracking__time { white-space: normal; }
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

	function createIcon(paths) {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('stroke', 'currentColor');
		svg.setAttribute('stroke-width', '2');
		svg.setAttribute('stroke-linecap', 'round');
		svg.setAttribute('stroke-linejoin', 'round');
		svg.setAttribute('aria-hidden', 'true');
		for (const pathData of paths) {
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', pathData);
			svg.append(path);
		}
		return svg;
	}

	function createCopyButton(value) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'vinted-tracking__copy';
		button.title = labels.copy;
		button.setAttribute('aria-label', labels.copy);
		button.append(createIcon(['M8 8h11v11H8z', 'M5 15H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1']));
		button.addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText(value);
				button.title = labels.copied;
				button.setAttribute('aria-label', labels.copied);
				setTimeout(() => {
					button.title = labels.copy;
					button.setAttribute('aria-label', labels.copy);
				}, 1400);
			} catch (error) {
				debugLog('Copy failed', error);
			}
		});
		return button;
	}

	function getBrandColors(carrierName) {
		return {
			DHL: ['#ffcc00', '#d40511'],
			Homerr: ['#00a76f', '#fff'],
			'Relais Colis': ['#e30613', '#fff'],
			Chronopost: ['#005baa', '#fff'],
			Colissimo: ['#ffc928', '#17233c'],
			'Royal Mail': ['#da202a', '#fff'],
			SEUR: ['#d71920', '#fff'],
			Correos: ['#ffd200', '#002b6c'],
			Yodel: ['#742774', '#fff'],
			Packeta: ['#ba0c2f', '#fff'],
			PostNL: ['#f58220', '#fff'],
			DPD: ['#dc0032', '#fff'],
			GLS: ['#ffd500', '#003da5'],
			UPS: ['#351c15', '#fff'],
			bpost: ['#e30613', '#fff'],
			InPost: ['#ffca00', '#171717'],
			'Mondial Relay': ['#5d2f91', '#fff'],
			Evri: ['#4a2278', '#fff'],
		}[carrierName];
	}

	function isOrderStatusActive(element) {
		if (!element) return false;
		if (element.getAttribute('aria-selected') === 'true') return true;
		if (element.getAttribute('aria-pressed') === 'true') return true;
		if (element.getAttribute('aria-current') === 'true') return true;
		if (element.getAttribute('aria-current') === 'page') return true;
		return /\b(?:--active|--selected|is-active|is-selected|selected|active|current)\b/i.test(element.className ?? '');
	}

	// Vinted ships its own order-status filter ("Alles, In behandeling, Voltooid, Geannuleerd").
	// That control knows which orders count as completed or cancelled, and this script only sees
	// shipment events, so the original control is located and reused instead of re-implemented.
	// Its own labels are copied too, which keeps the wording identical to the page language.
	const orderFilterFingerprints = {
		all: /^(?:all|alles|alle|todo|todos|tutti|kaikki|vše|wszystkie|všetko|vsem|vsak|allt|все|összes|всички|toate|in alles|in everything)$/i,
		inProgress: /^(?:in progress|pending|in behandeling|en cours|in bearbeitung|en curso|in corso|em curso|w realizacji|probíhá|probíhá|prebieha|pågående|v teku|töötlemisel|apdorojama|apstrādē|folyamatban|w toku)$/i,
		completed: /^(?:completed|complete|done|voltooid|afgerond|terminé|abgeschlossen|completado|completato|concluído|concluido|zakończone|dokončeno|dokončené|slutförd|zaključeno|lõpetatud|baigta|pabeigts|teljesítve)$/i,
		cancelled: /^(?:cancelled|canceled|geannuleerd|annulé|storniert|cancelado|annullato|anulowane|zrušeno|zrušené|avbruten|preklicano|tühistatud|atšauktas|atcelts|törölve)$/i,
	};
	const orderFilterFallbackOrder = ['all', 'inProgress', 'completed', 'cancelled'];

	function findOrderStatusGroups() {
		const selector = 'button, a, [role="tab"], [role="radio"]';
		const candidates = [...document.querySelectorAll(selector)].filter((element) => {
			if (!element.isConnected) return false;
			// Never touch our own toolbar, the site header, or the cart and menu buttons.
			if (element.closest('[data-vinted-tracking-toolbar], header, [data-testid*="header"], [data-testid*="nav"], [data-testid*="cart"]')) return false;
			const text = (element.textContent ?? '').trim();
			return Boolean(text) && text.length <= 40;
		});
		const countWithin = (node) => candidates.filter((candidate) => node === candidate || node.contains(candidate)).length;
		// Vinted renders these options either as sibling buttons or as links wrapped in their own
		// list items, so group each option with the closest ancestor holding a believable number
		// of them instead of assuming a shared parent.
		const groups = new Map();
		for (const candidate of candidates) {
			let node = candidate.parentElement;
			for (let depth = 0; node && depth < 5; depth += 1, node = node.parentElement) {
				const total = countWithin(node);
				if (total < 3) continue;
				if (total > 6) break;
				if (!groups.has(node)) groups.set(node, []);
				groups.get(node).push(candidate);
				break;
			}
		}
		return [...groups.entries()]
			.map(([parent, items]) => {
				// Drop wrappers that contain another option, so nested markup yields one entry each.
				const options = items.filter((item) => !items.some((other) => other !== item && item.contains(other)));
				return { parent, options };
			})
			.filter(({ options }) => options.length >= 3);
	}

	function findVintedOrderFilter() {
		const groups = findOrderStatusGroups();
		if (!groups.length) return null;
		const scored = groups.map((group) => {
			const texts = group.options.map((option) => (option.textContent ?? '').trim());
			const matched = new Set();
			for (const text of texts) {
				for (const [key, pattern] of Object.entries(orderFilterFingerprints)) {
					if (pattern.test(text)) matched.add(key);
				}
			}
			// A group that names all four statuses is almost certainly the order filter.
			let score = matched.size * 10;
			if (matched.has('completed')) score += 25;
			if (matched.has('all')) score += 10;
			// Prefer the group closest to the order list, since that is where Vinted puts it.
			const anchor = document.querySelector('[data-vinted-order-id], [data-vinted-loading-id]');
			if (anchor?.parentElement && anchor.parentElement.contains(group.parent)) score += 20;
			if (group.parent.querySelector('a[href*="/items/"]')) score -= 30;
			return { ...group, texts, score };
		});
		scored.sort((left, right) => right.score - left.score);
		const best = scored[0];
		// Without a name match this is a guess, so only accept an unambiguous structural match.
		if (best.score < 20) return null;
		const keys = orderFilterFallbackOrder.filter((key) => best.texts.some((text) => orderFilterFingerprints[key].test(text)));
		if (keys.length < 3) return null;
		// Match each option to a status by its own text, and fall back to the order Vinted renders
		// them in so an unknown language still ends up with four distinct buttons.
		const usedKeys = new Set();
		const options = best.options.map((element) => {
			const text = (element.textContent ?? '').trim();
			const unused = (pattern) => orderFilterFallbackOrder.filter((key) => !usedKeys.has(key) && (!pattern || pattern.test(text)));
			const key = unused(orderFilterFingerprints.all)[0]
				?? unused(orderFilterFingerprints.inProgress)[0]
				?? unused(orderFilterFingerprints.completed)[0]
				?? unused(orderFilterFingerprints.cancelled)[0]
				?? unused()[0]
				?? 'cancelled';
			usedKeys.add(key);
			return { element, text, key };
		});
		return { container: best.parent, options };
	}

	function hideVintedOrderFilter(control) {
		const { container, options } = control;
		for (const { element } of options) element.classList.add('vinted-tracking-vinted-filter-hidden');
		// Hide the surrounding bar too, but only when it holds nothing but the filter itself.
		const holdsOrders = container.querySelector('a[href*="/items/"], [data-vinted-order-id], [data-vinted-loading-id], img');
		if (!holdsOrders && container.children.length <= options.length + 2) {
			container.classList.add('vinted-tracking-vinted-filter-hidden');
		}
	}

	function readActiveOrderFilter(control) {
		for (const { element, key } of control.options) {
			if (isOrderStatusActive(element)) return key;
		}
		return 'all';
	}

	function applyVintedOrderFilter(control, key) {
		const option = control?.options.find((entry) => entry.key === key);
		if (!option || isOrderStatusActive(option.element)) return false;
		option.element.click();
		return true;
	}

	function markActiveOrderFilterButtons(activeKey) {
		for (const button of document.querySelectorAll('[data-vinted-tracking-toolbar] [data-order-filter]')) {
			button.setAttribute('aria-pressed', String(button.dataset.orderFilter === activeKey));
		}
	}

	// Re-detected on every scan, because Vinted replaces its own control when the list re-renders.
	function ensureVintedOrderFilter() {
		const control = findVintedOrderFilter();
		if (!control) {
			orderFilterControl = null;
			return null;
		}
		orderFilterControl = control;
		hideVintedOrderFilter(control);
		debugLog(`Reusing Vinted order filter: ${control.options.map(({ key, text }) => `${key}="${text}"`).join(', ')}`);
		return control;
	}

	// Vinted filters server-side and replaces the whole list, so anything our own filter hid has
	// to be released first. The orders that remain after Vinted reloads the list get hidden again
	// once their tracking data is back, which applyFilters handles.
	function releaseFilteredOrders() {
		for (const row of document.querySelectorAll('[data-vinted-order-id]')) {
			const card = row.parentElement;
			if (card?.classList.contains('vinted-tracking-card-hidden')) card.classList.remove('vinted-tracking-card-hidden');
		}
	}

	function applyFilters() {
		for (const row of document.querySelectorAll('[data-vinted-order-id]')) {
			const card = row.parentElement;
			if (!card) continue;
			const status = row.dataset.vintedStatus ?? 'unknown';
			const hasTracking = row.dataset.vintedHasTracking === 'true';
			const visible = settings.filter === 'all'
				|| (settings.filter === 'active' && !['delivered', 'delayed'].includes(status) && hasTracking)
				|| (settings.filter === 'delayed' && status === 'delayed')
				|| (settings.filter === 'delivered' && status === 'delivered')
				|| (settings.filter === 'missing' && !hasTracking);
			card.classList.toggle('vinted-tracking-card-hidden', !visible);
		}
		updateDashboard();
		applySort();
	}

	function createToolbarGroupLabel(text) {
		const label = document.createElement('span');
		label.className = 'vinted-tracking-toolbar__group-label';
		label.textContent = text;
		return label;
	}

	function createToolbarGroupHelp(text) {
		const help = document.createElement('span');
		help.className = 'vinted-tracking-toolbar__group-help';
		help.textContent = text;
		return help;
	}

	function getOrderRows() {
		return [...document.querySelectorAll('[data-vinted-order-id]')];
	}

	function updateDashboard() {
		const rows = getOrderRows();
		const counts = { total: rows.length, active: 0, delayed: 0, delivered: 0, missing: 0, pickup: 0 };
		for (const row of rows) {
			const status = row.dataset.vintedStatus ?? 'unknown';
			if (status === 'delivered') counts.delivered += 1;
			else if (status === 'delayed') counts.delayed += 1;
			else if (status === 'pickup') counts.pickup += 1;
			else if (row.dataset.vintedHasTracking === 'true') counts.active += 1;
			else counts.missing += 1;
		}
		const dashboard = document.querySelector('[data-vinted-tracking-dashboard]');
		if (dashboard) dashboard.textContent = `${labels.dashboard}: ${counts.total} · ${labels.active}: ${counts.active} · ${labels.delayed}: ${counts.delayed} · ${labels.delivered}: ${counts.delivered} · ${labels.noTracking}: ${counts.missing}`;
	}

	function applySort() {
		const rows = getOrderRows();
		if (!rows.length || settings.sort === 'none') return;
		const cards = rows.map((row) => row.parentElement).filter(Boolean);
		const list = cards[0]?.parentElement;
		if (!list) return;
		const value = (row) => {
			const tracking = orderResults.get(row.dataset.vintedOrderId);
			if (settings.sort === 'carrier') return { value: tracking?.carrier ?? '', missing: !tracking?.carrier };
			if (settings.sort === 'status') {
				const statusRank = { delayed: 0, pickup: 1, active: 2, label: 3, unknown: 4, delivered: 5 };
				const status = row.dataset.vintedStatus ?? 'unknown';
				return { value: statusRank[status] ?? statusRank.unknown, missing: false };
			}
			if (settings.sort === 'updated') {
				const timestamp = Date.parse(tracking?.latestTimestamp ?? '');
				return { value: Number.isNaN(timestamp) ? 0 : timestamp, missing: Number.isNaN(timestamp) };
			}
			if (settings.sort === 'estimate') {
				const timestamp = Date.parse(tracking?.estimatedTimestamp ?? '');
				return { value: Number.isNaN(timestamp) ? 0 : timestamp, missing: Number.isNaN(timestamp) };
			}
			if (settings.sort === 'transit') {
				const timestamp = Date.parse(tracking?.shippedTimestamp ?? '');
				return { value: Number.isNaN(timestamp) ? 0 : timestamp, missing: Number.isNaN(timestamp) };
			}
			return { value: '', missing: true };
		};
		cards.sort((left, right) => {
			const a = value(left.querySelector('[data-vinted-order-id]'));
			const b = value(right.querySelector('[data-vinted-order-id]'));
			if (a.missing !== b.missing) return a.missing ? 1 : -1;
			const comparison = typeof a.value === 'number'
				? a.value - b.value
				: String(a.value).localeCompare(String(b.value), pageLocale);
			return settings.sortDirection === 'desc' ? -comparison : comparison;
		}).forEach((card) => list.append(card));
	}

	function exportOrders() {
		const header = ['Product', 'Tracking ID', 'Carrier', 'Status', 'Latest update', 'Estimated delivery', 'Seller location', 'Note', 'Tags'];
		const lines = [header];
		for (const row of getOrderRows()) {
			const tracking = orderResults.get(row.dataset.vintedOrderId) ?? {};
			const product = getProductInfo(row.parentElement ?? row);
			const note = notes[row.dataset.vintedOrderId] ?? {};
			lines.push([product.name, tracking.code, tracking.carrier, tracking.statusLabel, tracking.latestMessage, tracking.estimatedDelivery, [tracking.sellerCity, tracking.sellerCountry].filter(Boolean).join(', '), note.text ?? '', (note.tags ?? []).join(', ')]);
		}
		const csv = lines.map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
		const link = document.createElement('a');
		link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
		link.download = `vinted-parcelpilot-${new Date().toISOString().slice(0, 10)}.csv`;
		link.click();
		setTimeout(() => URL.revokeObjectURL(link.href), 1000);
	}

	function requestNotificationPermission() {
		if (!('Notification' in window)) return;
		if (Notification.permission === 'default') void Notification.requestPermission();
	}

	function notifyStatusChange(orderId, tracking) {
		if (!settings.notifications || !tracking?.status) return;
		const previous = lastNotificationState.get(orderId);
		lastNotificationState.set(orderId, tracking.status);
		if (!previous || previous === tracking.status || !('Notification' in window) || Notification.permission !== 'granted') return;
		new Notification(`Vinted ParcelPilot: ${tracking.statusLabel}`, {
			body: tracking.latestMessage || tracking.code || labels.dashboard,
			tag: `vinted-parcel-${orderId}`,
		});
	}

	function addNoteEditor(row, orderId) {
		if (row.querySelector('[data-vinted-note-editor]')) return;
		const saved = notes[orderId] ?? { text: '', tags: [] };
		const wrapper = document.createElement('div');
		wrapper.dataset.vintedNoteEditor = 'true';
		wrapper.className = 'vinted-tracking__note';
		const input = document.createElement('textarea');
		input.value = saved.text ?? '';
		input.placeholder = labels.notes;
		input.setAttribute('aria-label', labels.notes);
		input.rows = 1;
		input.addEventListener('mousedown', (event) => event.stopPropagation());
		input.addEventListener('click', (event) => event.stopPropagation());
		const tags = document.createElement('input');
		tags.type = 'text';
		tags.value = (saved.tags ?? []).join(', ');
		tags.placeholder = 'Tags';
		tags.setAttribute('aria-label', 'Tags');
		tags.addEventListener('mousedown', (event) => event.stopPropagation());
		tags.addEventListener('click', (event) => event.stopPropagation());
		const save = document.createElement('button');
		save.type = 'button';
		save.textContent = labels.save;
		const queueSave = () => scheduleNoteSave(orderId, input.value, tags.value);
		input.addEventListener('input', queueSave);
		tags.addEventListener('input', queueSave);
		save.addEventListener('click', () => {
			clearTimeout(noteSaveTimers.get(orderId));
			noteSaveTimers.delete(orderId);
			saveOrderNote(orderId, input.value, tags.value);
			save.textContent = labels.saved;
			setTimeout(() => { save.textContent = labels.save; }, 1200);
		});
		wrapper.append(input, tags, save);
		row.append(wrapper);
	}

	function addToolbar(cards) {
		if (location.pathname !== '/my_orders' || document.querySelector('[data-vinted-tracking-toolbar]')) return;
		ensureTrackingStyles();
		const anchor = [...cards.values()][0];
		if (!anchor?.parentElement) return;
		const toolbar = document.createElement('div');
		toolbar.dataset.vintedTrackingToolbar = 'true';
		toolbar.className = 'vinted-tracking-toolbar';
		toolbar.setAttribute('role', 'group');
		toolbar.setAttribute('aria-label', labels.floatingToolbar);

		const orderGroup = document.createElement('div');
		orderGroup.className = 'vinted-tracking-toolbar__group vinted-tracking-toolbar__group--stacked';
		orderGroup.append(createToolbarGroupLabel(labels.orderStatus), createToolbarGroupHelp(labels.orderFilterHelp));
		const orderButtons = document.createElement('div');
		orderButtons.className = 'vinted-tracking-toolbar__filters';
		orderGroup.append(orderButtons);

		const vintedFilter = ensureVintedOrderFilter();
		if (vintedFilter) {
			// Vinted's own labels are reused so the wording always matches the page language.
			for (const { key, text } of vintedFilter.options) {
				const button = document.createElement('button');
				button.type = 'button';
				button.textContent = text;
				button.dataset.orderFilter = key;
				button.title = `${labels.orderStatus}: ${text}`;
				orderButtons.append(button);
			}
			orderButtons.addEventListener('click', (event) => {
				const button = event.target.closest('button');
				if (!button) return;
				markActiveOrderFilterButtons(button.dataset.orderFilter);
				// Hand the list over to Vinted in a clean state, since it reloads it server-side.
				releaseFilteredOrders();
				applyVintedOrderFilter(orderFilterControl, button.dataset.orderFilter);
				debugLog('Order filter', button.dataset.orderFilter);
			});
		} else {
			// Without Vinted's control there is nothing trustworthy to filter on, so say so
			// instead of showing buttons that silently do nothing.
			orderButtons.classList.add('vinted-tracking-toolbar__filters--empty');
			orderButtons.textContent = labels.orderStatusUnavailable;
		}
		toolbar.append(orderGroup);

		const shipmentGroup = document.createElement('div');
		shipmentGroup.className = 'vinted-tracking-toolbar__group vinted-tracking-toolbar__group--stacked';
		shipmentGroup.append(createToolbarGroupLabel(labels.shipmentStatus), createToolbarGroupHelp(labels.parcelFilterHelp));
		const filters = document.createElement('div');
		filters.className = 'vinted-tracking-toolbar__filters';
		for (const [value, label] of [['all', labels.all], ['active', labels.active], ['delayed', labels.delayed], ['delivered', labels.delivered], ['missing', labels.noTracking]]) {
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = label;
			button.dataset.filter = value;
			button.title = `${labels.shipmentStatus}: ${label}`;
			button.setAttribute('aria-pressed', String(settings.filter === value));
			button.addEventListener('click', () => {
				settings.filter = value;
				saveSettings();
				for (const filterButton of filters.querySelectorAll('button')) {
					filterButton.setAttribute('aria-pressed', String(filterButton.dataset.filter === value));
				}
				applyFilters();
				debugLog('Shipment filter', value);
			});
			filters.append(button);
		}
		shipmentGroup.append(filters);
		toolbar.append(shipmentGroup);

		const optionsGroup = document.createElement('div');
		optionsGroup.className = 'vinted-tracking-toolbar__group vinted-tracking-toolbar__group--stacked';
		optionsGroup.append(createToolbarGroupLabel(labels.options), createToolbarGroupHelp(labels.optionsHelp));
		toolbar.append(optionsGroup);

		for (const [key, label] of [['compact', labels.compact], ['showAnimation', labels.animation], ['showSellerLocation', labels.seller], ['showCarrierLogo', labels.logo], ['debug', labels.debug]]) {
			const wrapper = document.createElement('label');
			wrapper.className = 'vinted-tracking-toolbar__toggle';
			const input = document.createElement('input');
			input.type = 'checkbox';
			input.checked = Boolean(settings[key]);
			input.addEventListener('change', () => {
				settings[key] = input.checked;
				saveSettings();
				debugLog('Setting', key, settings[key]);
				if (key === 'compact') {
					document.querySelectorAll('[data-vinted-order-id]').forEach((row) => {
						row.classList.toggle('vinted-tracking--compact', settings.compact);
					});
					return;
				}
				if (key === 'debug') {
					// Parsed orders are cached, so drop them to make the log appear right away.
					if (!settings.debug) return;
					orderResults.clear();
					debugLog('Debug enabled, reloading tracking data');
				}
				for (const row of document.querySelectorAll('[data-vinted-order-id], [data-vinted-loading-id]')) row.remove();
				scheduleScan();
			});
			wrapper.append(input, document.createTextNode(label));
			optionsGroup.append(wrapper);
		}

		const toolsGroup = document.createElement('div');
		toolsGroup.className = 'vinted-tracking-toolbar__group vinted-tracking-toolbar__tools vinted-tracking-toolbar__group--stacked';
		toolsGroup.append(createToolbarGroupLabel(labels.dashboard), createToolbarGroupHelp(labels.toolsHelp));
		const dashboard = document.createElement('span');
		dashboard.dataset.vintedTrackingDashboard = 'true';
		toolsGroup.append(dashboard);
		const exportButton = document.createElement('button');
		exportButton.type = 'button';
		exportButton.textContent = labels.export;
		exportButton.addEventListener('click', exportOrders);
		toolsGroup.append(exportButton);
		const refreshButton = document.createElement('button');
		refreshButton.type = 'button';
		refreshButton.textContent = labels.refresh;
		refreshButton.addEventListener('click', () => {
			clearTrackingCache();
			getOrderRows().forEach((row) => row.remove());
			scheduleScan();
		});
		toolsGroup.append(refreshButton);
		const sortControl = document.createElement('label');
		sortControl.className = 'vinted-tracking-toolbar__control';
		sortControl.textContent = `${labels.sort}:`;
		const sort = document.createElement('select');
		sort.setAttribute('aria-label', labels.sort);
		[['none', labels.all], ['status', labels.shipmentStatus], ['updated', labels.latestUpdate], ['estimate', labels.estimatedDelivery], ['carrier', 'Carrier'], ['transit', labels.daysInTransit]].forEach(([value, text]) => {
			const option = document.createElement('option');
			option.value = value;
			option.textContent = text;
			option.selected = settings.sort === value;
			sort.append(option);
		});
		sort.addEventListener('change', () => {
			settings.sort = sort.value;
			saveSettings();
			applySort();
		});
		sortControl.append(sort);
		toolsGroup.append(sortControl);
		const directionControl = document.createElement('label');
		directionControl.className = 'vinted-tracking-toolbar__control';
		directionControl.textContent = `${labels.sortDirection}:`;
		const direction = document.createElement('select');
		direction.setAttribute('aria-label', labels.sortDirection);
		[['asc', labels.ascending], ['desc', labels.descending]].forEach(([value, text]) => {
			const option = document.createElement('option');
			option.value = value;
			option.textContent = text;
			option.selected = settings.sortDirection === value;
			direction.append(option);
		});
		direction.addEventListener('change', () => {
			settings.sortDirection = direction.value;
			saveSettings();
			applySort();
		});
		directionControl.append(direction);
		toolsGroup.append(directionControl);
		const refreshMinutes = document.createElement('input');
		refreshMinutes.type = 'number';
		refreshMinutes.min = '1';
		refreshMinutes.max = '120';
		refreshMinutes.value = settings.refreshMinutes;
		refreshMinutes.title = `${labels.autoRefresh} (minutes)`;
		refreshMinutes.addEventListener('change', () => {
			settings.refreshMinutes = Math.min(120, Math.max(1, Number(refreshMinutes.value) || 10));
			refreshMinutes.value = settings.refreshMinutes;
			saveSettings();
			startAutoRefresh();
		});
		toolsGroup.append(refreshMinutes);
		const autoRefresh = document.createElement('label');
		autoRefresh.className = 'vinted-tracking-toolbar__toggle';
		const autoRefreshInput = document.createElement('input');
		autoRefreshInput.type = 'checkbox';
		autoRefreshInput.checked = settings.autoRefresh;
		autoRefreshInput.addEventListener('change', () => {
			settings.autoRefresh = autoRefreshInput.checked;
			saveSettings();
			startAutoRefresh();
		});
		autoRefresh.append(autoRefreshInput, document.createTextNode(labels.autoRefresh));
		toolsGroup.append(autoRefresh);
		const notification = document.createElement('label');
		notification.className = 'vinted-tracking-toolbar__toggle';
		const notificationInput = document.createElement('input');
		notificationInput.type = 'checkbox';
		notificationInput.checked = settings.notifications;
		notificationInput.addEventListener('change', () => {
			settings.notifications = notificationInput.checked;
			saveSettings();
			if (settings.notifications) requestNotificationPermission();
		});
		notification.append(notificationInput, document.createTextNode(labels.notification));
		toolsGroup.append(notification);
		toolbar.append(toolsGroup);

		const list = anchor.parentElement;
		const target = list.children.length > 1 ? list : anchor;
		target.parentElement?.insertBefore(toolbar, target);
		// Only now that the toolbar is in the document can its buttons be marked.
		if (orderFilterControl) markActiveOrderFilterButtons(readActiveOrderFilter(orderFilterControl));
	}

	// Product name and price already live in the order card, so read them from there instead of
	// duplicating a second API request per order.
	function getProductInfo(card) {
		const result = { name: '', price: '', href: '' };
		const productLink = [...card.querySelectorAll('a[href*="/items/"]')]
			.find((link) => !link.closest('[data-vinted-order-id], [data-vinted-loading-id]'));
		if (productLink) {
			result.href = productLink.href;
			const image = productLink.querySelector('img[alt]');
			const candidate = productLink.getAttribute('title')
				|| productLink.getAttribute('aria-label')
				|| image?.getAttribute('alt')
				|| productLink.textContent
				|| '';
			result.name = candidate.replace(/\s+/g, ' ').trim().slice(0, 120);
		}
		if (!result.name) {
			const image = [...card.querySelectorAll('img[alt]')]
				.find((node) => !node.closest('[data-vinted-order-id], [data-vinted-loading-id]'));
			result.name = image?.getAttribute('alt')?.replace(/\s+/g, ' ').trim().slice(0, 120) ?? '';
		}
		// A price is a short string that starts or ends with a currency amount. Cards that were
		// reduced often show the original amount too, so struck-through and "was" prices are
		// skipped to keep the price that is actually being charged.
		const pricePattern = /(?:^|\s)(?:€|\$|£|zł|zl)\s?\d|\d[\d.,]*\s?(?:€|\$|£|zł|zl)(?:\s|$)/i;
		const isOriginalPrice = (node) => {
			if (/line-through|strikethrough/i.test(node.getAttribute('style') ?? '')) return true;
			const context = `${node.className ?? ''} ${node.closest('[class]')?.className ?? ''}`;
			return /\b(?:old|original|was|strike|struck|before|list|crossed|discount-from|from-price)\b/i.test(context);
		};
		const priceCandidates = [...card.querySelectorAll('*')]
			.filter((node) => node.children.length === 0
				&& !node.closest('[data-vinted-order-id], [data-vinted-loading-id]')
				&& pricePattern.test(node.textContent ?? ''));
		const priceNode = priceCandidates.find((node) => !isOriginalPrice(node)) ?? priceCandidates[0];
		result.price = priceNode ? (priceNode.textContent ?? '').replace(/\s+/g, ' ').trim() : '';
		return result;
	}

	// The carrier chip is a self-contained field: it falls back from logo to brand colour to the
	// plain name, and returns null when the payload carries neither a name nor a logo.
	function createCarrierChip(tracking) {
		if (!tracking.carrier && !tracking.carrierLogo) return null;
		const chip = document.createElement('span');
		chip.className = 'vinted-tracking__carrier';
		const colors = getBrandColors(tracking.carrier);
		const applyBrandColors = () => {
			if (!colors) return;
			chip.style.backgroundColor = colors[0];
			chip.style.borderColor = colors[0];
			chip.style.color = colors[1];
		};
		if (tracking.carrierLogo && settings.showCarrierLogo) {
			const logo = document.createElement('img');
			logo.className = 'vinted-tracking__carrier-logo';
			logo.src = tracking.carrierLogo;
			logo.alt = '';
			logo.addEventListener('error', () => {
				logo.remove();
				applyBrandColors();
			}, { once: true });
			chip.append(logo);
		} else {
			applyBrandColors();
		}
		if (tracking.carrier) {
			const name = document.createElement('span');
			name.textContent = tracking.carrier;
			chip.append(name);
		}
		return chip;
	}

	function createDetailRow(labelText, valueNode) {
		const row = document.createElement('div');
		row.className = 'vinted-tracking__detail';
		const term = document.createElement('dt');
		term.className = 'vinted-tracking__detail-term';
		term.textContent = labelText;
		const definition = document.createElement('dd');
		definition.className = 'vinted-tracking__detail-value';
		definition.append(valueNode);
		row.append(term, definition);
		return row;
	}

	function createTimeNode(timestamp) {
		const date = new Date(timestamp);
		if (Number.isNaN(date.getTime())) return null;
		const time = document.createElement('time');
		time.className = 'vinted-tracking__time';
		time.dateTime = date.toISOString();
		const absolute = new Intl.DateTimeFormat(pageLocale, {
			day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
		}).format(date);
		const relative = getRelativeAge(timestamp);
		time.textContent = relative ? `${absolute} (${labels.updatedAgo} ${relative})` : absolute;
		return time;
	}

	function addTrackingRow(card, orderId, tracking) {
		card.querySelector(`[data-vinted-loading-id="${orderId}"]`)?.remove();
		if (card.querySelector(`[data-vinted-order-id="${orderId}"]`)) return;
		if (!hasShipmentInfo(tracking)) {
			addNoticeRow(card, orderId, 'notShipped');
			return;
		}
		ensureTrackingStyles();
		const row = document.createElement('section');
		row.dataset.vintedOrderId = orderId;
		row.dataset.vintedStatus = tracking.status ?? 'unknown';
		row.dataset.vintedHasTracking = String(Boolean(tracking.code || tracking.url));
		const stale = tracking.latestTimestamp && Date.now() - Date.parse(tracking.latestTimestamp) > Number(settings.staleDays) * 86400000;
		row.className = `vinted-tracking${tracking.delayed ? ' vinted-tracking--delayed' : ''}${stale ? ' vinted-tracking--stale' : ''}${settings.compact ? ' vinted-tracking--compact' : ''}`;
		row.setAttribute('aria-label', `${labels.details}: ${tracking.statusLabel ?? labels.unknown}`);

		// Top group: what was bought. Only the fields that exist are rendered, so any item shape
		// from the page works without changing the markup.
		const product = getProductInfo(card);
		const headline = document.createElement('div');
		headline.className = 'vinted-tracking__headline';
		if (product.name || product.price) {
			const title = document.createElement('div');
			title.className = 'vinted-tracking__product';
			if (product.name) {
				const name = document.createElement('span');
				name.className = 'vinted-tracking__product-name';
				name.textContent = product.name;
				if (product.href) {
					const link = document.createElement('a');
					link.className = 'vinted-tracking__product-link';
					link.href = product.href;
					link.target = '_blank';
					link.rel = 'noopener noreferrer';
					link.append(name);
					title.append(link);
				} else {
					title.append(name);
				}
			}

			headline.append(title);
		}
		if (headline.childElementCount) row.append(headline);

		// One uniform bar carrying the shipment identity: carrier, status, tracking ID, and the
		// actions on that ID. Every part is optional, and the bar keeps its shape either way.
		const bar = document.createElement('div');
		bar.className = 'vinted-tracking__bar';
		const carrierChip = createCarrierChip(tracking);
		if (carrierChip) bar.append(carrierChip);

		const status = document.createElement('span');
		status.className = `vinted-tracking__status vinted-tracking__status--${tracking.status ?? 'unknown'}`;
		status.textContent = tracking.statusLabel ?? labels.unknown;
		bar.append(status);

		const transitAge = getDaysInTransit(tracking);
		if (transitAge) {
			const meta = document.createElement('span');
			meta.className = 'vinted-tracking__meta';
			meta.textContent = transitAge;
			bar.append(meta);
		}

		const idGroup = document.createElement('div');
		idGroup.className = 'vinted-tracking__id';
		if (tracking.code) {
			const code = document.createElement('code');
			code.className = 'vinted-tracking__code';
			code.textContent = tracking.code;
			idGroup.append(code, createCopyButton(tracking.code));
		} else {
			const unavailable = document.createElement('span');
			unavailable.className = 'vinted-tracking__empty';
			unavailable.textContent = labels.unavailable;
			idGroup.append(unavailable);
		}
		if (tracking.url) {
			const link = document.createElement('a');
			link.className = 'vinted-tracking__link';
			link.href = tracking.url;
			link.textContent = labels.trackingPage;
			link.target = '_blank';
			link.rel = 'noopener noreferrer';
			idGroup.append(link);
		}
		bar.append(idGroup);
		row.append(bar);

		// Bottom group: logistics as a label/value list. Rows are added per available field, and
		// the label column is provided by the stylesheet, so missing data cannot break alignment.
		const detailRows = [];
		// Built from whatever parts arrived: the message, the time, or either one alone. An event
		// with an unparsable timestamp still contributes its message rather than disappearing.
		const hasLocationInfo = Boolean(tracking.currentLocation || tracking.latestLocation);
		if (tracking.latestMessage || tracking.latestTimestamp || hasLocationInfo) {
			const value = document.createElement('span');
			value.className = 'vinted-tracking__detail-body';
			if (tracking.latestMessage) {
				const message = document.createElement('span');
				message.className = 'vinted-tracking__message';
				message.textContent = tracking.latestMessage;
				const locInline = tracking.currentLocation || tracking.latestLocation;
				if (locInline) message.textContent += ` · ${labels.location}: ${locInline}`;
				value.append(message);
			} else if (hasLocationInfo) {
				const message = document.createElement('span');
				message.className = 'vinted-tracking__message';
				message.textContent = `${labels.location}: ${tracking.currentLocation || tracking.latestLocation}`;
				value.append(message);
			}
			const time = tracking.latestTimestamp ? createTimeNode(tracking.latestTimestamp) : null;
			if (time) value.append(time);
			detailRows.push([labels.latestUpdate, value]);
		}
		if (tracking.estimatedDelivery) {
			const estimate = document.createElement('span');
			estimate.className = 'vinted-tracking__detail-body';
			estimate.textContent = tracking.estimatedDelivery;
			detailRows.push([labels.estimatedDelivery, estimate]);
		}
		if (settings.showSellerLocation && (tracking.sellerCountry || tracking.sellerCity)) {
			const seller = document.createElement('span');
			seller.className = 'vinted-tracking__detail-body';
			seller.textContent = [tracking.sellerCity, tracking.sellerCountry].filter(Boolean).join(', ');
			detailRows.push([labels.sellerLocation, seller]);
		}
		if (tracking.delayed && tracking.estimatedDelivery) {
			const warning = document.createElement('span');
			warning.className = 'vinted-tracking__detail-body vinted-tracking__warning';
			warning.textContent = labels.overdue;
			detailRows.push([labels.exception, warning]);
		}
		if (detailRows.length) {
			const detailsList = document.createElement('dl');
			detailsList.className = 'vinted-tracking__details';
			for (const [termText, valueNode] of detailRows) detailsList.append(createDetailRow(termText, valueNode));
			row.append(detailsList);
		}
		addNoteEditor(row, orderId);
		notifyStatusChange(orderId, tracking);

		card.append(row);
		row.style.marginTop = '0';
		wrapOrderCard(card);
		updateDashboard();
	}

	function hasShipmentInfo(tracking) {
		return Boolean(
			tracking.code
			|| tracking.url
			|| tracking.carrier
			|| tracking.latestMessage
			|| tracking.latestTimestamp
			|| tracking.estimatedDelivery,
		);
	}

	function addNoticeRow(card, orderId, kind) {
		card.querySelector(`[data-vinted-loading-id="${orderId}"]`)?.remove();
		if (card.querySelector(`[data-vinted-order-id="${orderId}"]`)) return;
		ensureTrackingStyles();
		const failed = kind === 'failed';
		const row = document.createElement('section');
		row.dataset.vintedOrderId = orderId;
		row.dataset.vintedStatus = 'unknown';
		row.dataset.vintedHasTracking = 'false';
		row.className = `vinted-tracking vinted-tracking--notice vinted-tracking--notice--${kind}`;

		const icon = createIcon(failed
			? ['M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01']
			: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2']);
		icon.classList.add('vinted-tracking__notice-icon');
		row.append(icon);

		const text = document.createElement('span');
		text.className = 'vinted-tracking__notice-text';
		text.textContent = failed ? labels.loadFailed : labels.notShipped;
		row.append(text);

		if (failed) {
			const retry = document.createElement('button');
			retry.type = 'button';
			retry.className = 'vinted-tracking__retry';
			retry.textContent = labels.retry;
			retry.addEventListener('click', () => {
				orderResults.delete(orderId);
				row.remove();
				scheduleScan();
			});
			row.append(retry);
		}

		card.append(row);
		row.style.marginTop = '0';
		wrapOrderCard(card);
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
		if (settings.showAnimation) {
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
		} else {
			const text = document.createElement('span');
			text.className = 'vinted-tracking__loading-text';
			text.textContent = labels.loading;
			row.append(text);
		}
		card.append(row);
		row.style.marginTop = '0';
		wrapOrderCard(card);
	}

	async function loadOrder(orderId) {
		if (orderResults.has(orderId)) return orderResults.get(orderId);
		if (pending.has(orderId)) return pending.get(orderId);
		const cached = loadCachedOrder(orderId);
		if (cached) {
			orderResults.set(orderId, cached);
			return cached;
		}

		const fail = (reason) => {
			debugLog('Tracking load failed', orderId, reason);
			orderResults.set(orderId, LOAD_FAILED);
			return LOAD_FAILED;
		};

		const request = (async () => {
			try {
				const conversationResponse = await fetch(
					`${CONVERSATION_API}${encodeURIComponent(orderId)}`,
					{
						credentials: 'include',
						headers: { Accept: 'application/json' },
					},
				);
				if (!conversationResponse.ok) return fail(`conversation ${conversationResponse.status}`);
				const conversation = await conversationResponse.json();
				const escrowOrderId = findEscrowOrderId(conversation);
				if (!escrowOrderId) return fail('no escrow order id');
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
				if (!response.ok) return fail(`journey_summary ${response.status}`);
				const payload = await response.json();
				const tracking = collectTracking(payload);
				const sellerLocation = await sellerLocationPromise;
				tracking.sellerCountry = sellerLocation?.country ?? '';
				tracking.sellerCity = sellerLocation?.city ?? '';
				tracking.fetchedAt = new Date().toISOString();
				orderResults.set(orderId, tracking);
				cacheOrder(orderId, tracking);
				return tracking;
			} catch (error) {
				debugLog('Tracking request threw', orderId, error);
				return fail(error);
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
		// Vinted replaces its filter control whenever the list re-renders, so keep ours in step.
		const orderFilter = ensureVintedOrderFilter();
		if (orderFilter) markActiveOrderFilterButtons(readActiveOrderFilter(orderFilter));
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
		if (!cards.size) return;
		addToolbar(cards);
		debugLog(`Scanning ${cards.size} orders on ${vintedDomain} (${pageLocale})`);
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
			if (!card.isConnected || tracking === LOAD_FAILED) continue;
			const van = card.querySelector('.vinted-tracking__van');
			if (!van) continue;
			const accent = getCarrierAccent(tracking?.carrier);
			if (accent) van.style.color = accent;
			van.style.animationDuration = '1.6s';
			movingVanRows.push(van);
		}
		if (movingVanRows.length && settings.showAnimation && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			await new Promise((resolve) => setTimeout(resolve, 1600));
		}
		for (const { orderId, card, tracking } of loadedOrders) {
			if (!card.isConnected) continue;
			card.querySelector(`[data-vinted-loading-id="${orderId}"]`)?.remove();
			if (tracking === LOAD_FAILED) {
				addNoticeRow(card, orderId, 'failed');
			} else {
				addTrackingRow(card, orderId, tracking);
			}
		}
		applyFilters();
		updateDashboard();
		startAutoRefresh();
		debugLog(`Scan finished: ${loadedOrders.length} orders, ${loadedOrders.filter(({ tracking }) => hasShipmentInfo(tracking)).length} with shipment data`);
	}

	function scheduleScan() {
		clearTimeout(scanTimer);
		scanTimer = setTimeout(() => void scanOrders(), 900);
	}

	new MutationObserver(() => {
		addOrdersShortcut();
		if (document.activeElement?.closest('[data-vinted-note-editor]')) return;
		scheduleScan();
	}).observe(document.body, {
		childList: true,
		subtree: true,
	});
	addOrdersShortcut();
	scheduleScan();
	startAutoRefresh();
})();
