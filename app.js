const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_API = "https://geocoding-api.open-meteo.com/v1/search";

const AIRPORTS = [
    { name: "Addis Ababa", am: "አዲስ አበባ", code: "HAAB", airport: "Bole International", lat: 8.98, lon: 38.80, fallbackTemp: 22 },
    { name: "Dire Dawa", am: "ድሬዳዋ", code: "HADR", airport: "Aba Tenna Dejazmach Yilma", lat: 9.62, lon: 41.85, fallbackTemp: 31 },
    { name: "Bahir Dar", am: "ባሕር ዳር", code: "HABD", airport: "Bahir Dar Airport", lat: 11.60, lon: 37.32, fallbackTemp: 26 },
    { name: "Hawassa", am: "ሐዋሳ", code: "HALA", airport: "Hawassa Airport", lat: 7.06, lon: 38.48, fallbackTemp: 27 },
    { name: "Mekelle", am: "መቀሌ", code: "HAMK", airport: "Alula Aba Nega", lat: 13.47, lon: 39.53, fallbackTemp: 25 },
    { name: "Gondar", am: "ጎንደር", code: "HAGN", airport: "Atse Tewodros", lat: 12.52, lon: 37.43, fallbackTemp: 24 },
    { name: "Jimma", am: "ጅማ", code: "HAJM", airport: "Aba Segud", lat: 7.67, lon: 36.82, fallbackTemp: 23 },
    { name: "Lalibela", am: "ላሊበላ", code: "HALL", airport: "Lalibela Airport", lat: 11.98, lon: 38.98, fallbackTemp: 23 },
    { name: "Jijiga", am: "ጅግጅጋ", code: "HAJJ", airport: "Wilwal International", lat: 9.33, lon: 42.91, fallbackTemp: 28 },
    { name: "Arba Minch", am: "አርባ ምንጭ", code: "HAAM", airport: "Arba Minch Airport", lat: 6.06, lon: 37.59, fallbackTemp: 29 }
];

const COPY = {
    en: {
        langButton: "AM",
        unitC: "C",
        unitF: "F",
        subtitle: "Search a city or choose an Ethiopian airport to view live conditions, a 7-day forecast, and aviation risk guidance.",
        searchPlaceholder: "Search city or airport, e.g. Addis Ababa",
        search: "Search",
        location: "Use my area",
        readyRoutes: "Ready routes",
        forecast: "7-day forecast",
        stations: "Airport weather board",
        note: "Tap a station to open full conditions.",
        emptyTitle: "Choose an airport to begin",
        emptyBody: "Live weather loads from Open-Meteo. If the network is unavailable, the app keeps a practical offline estimate ready.",
        humidity: "Humidity",
        wind: "Wind",
        gust: "Gust",
        visibility: "Visibility",
        pressure: "Pressure",
        cloud: "Cloud cover",
        precipitation: "Precipitation",
        apparent: "Feels like",
        updated: "Updated",
        low: "Good for operations",
        medium: "Monitor conditions",
        high: "Operational caution",
        live: "Live Open-Meteo data",
        offline: "Offline estimate",
        loading: "Loading live weather...",
        notFound: "I could not find that city. Try Addis Ababa, Hawassa, or Bahir Dar.",
        locationDenied: "Location was not available, so Addis Ababa is shown instead."
    },
    am: {
        langButton: "EN",
        unitC: "ሴ",
        unitF: "ፋ",
        subtitle: "ከተማ ይፈልጉ ወይም የኢትዮጵያ አየር ማረፊያ ይምረጡ፤ የቀጥታ አየር ሁኔታ፣ የ7 ቀን ትንበያ እና የበረራ ስጋት መመሪያ ያያሉ።",
        searchPlaceholder: "ከተማ ወይም አየር ማረፊያ ይፈልጉ፣ ለምሳሌ አዲስ አበባ",
        search: "ፈልግ",
        location: "አካባቢዬ",
        readyRoutes: "ዝግጁ መስመሮች",
        forecast: "የ7 ቀን ትንበያ",
        stations: "የአየር ማረፊያ ሰሌዳ",
        note: "ሙሉ መረጃ ለማየት ጣቢያ ይጫኑ።",
        emptyTitle: "ለመጀመር አየር ማረፊያ ይምረጡ",
        emptyBody: "የቀጥታ መረጃው Open-Meteo ነው። ኔትወርክ ከሌለ ግምታዊ መረጃ ይታያል።",
        humidity: "እርጥበት",
        wind: "ነፋስ",
        gust: "ከፍተኛ ነፋስ",
        visibility: "እይታ",
        pressure: "ግፊት",
        cloud: "ደመና",
        precipitation: "ዝናብ",
        apparent: "የሚሰማው",
        updated: "የተዘመነው",
        low: "ለስራ ጥሩ",
        medium: "ሁኔታውን ይከታተሉ",
        high: "የስራ ጥንቃቄ",
        live: "የቀጥታ Open-Meteo መረጃ",
        offline: "ግምታዊ መረጃ",
        loading: "የቀጥታ አየር መረጃ በመጫን ላይ...",
        notFound: "ያንን ከተማ ማግኘት አልቻልኩም። አዲስ አበባ፣ ሐዋሳ ወይም ባሕር ዳር ይሞክሩ።",
        locationDenied: "አካባቢዎ አልተገኘም፤ በመሆኑም አዲስ አበባ ታይቷል።"
    }
};

let state = {
    lang: localStorage.getItem("et-weather-lang") || "en",
    unit: localStorage.getItem("et-weather-unit") || "celsius",
    activePlace: AIRPORTS[0],
    latestReport: null
};

const $ = (selector) => document.querySelector(selector);

function text(key) {
    return COPY[state.lang][key];
}

function displayName(place) {
    return state.lang === "am" && place.am ? place.am : place.name;
}

function unitLabel() {
    return state.unit === "celsius" ? text("unitC") : text("unitF");
}

function temp(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return "--";
    const celsius = Number(value);
    const converted = state.unit === "celsius" ? celsius : (celsius * 9 / 5) + 32;
    return `${Math.round(converted)}°${unitLabel()}`;
}

function kmh(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return "--";
    return `${Math.round(value)} km/h`;
}

function km(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return "--";
    return `${Math.round(value / 1000)} km`;
}

function weatherText(code) {
    const map = {
        0: ["Clear sky", "ጥርት ያለ ሰማይ"],
        1: ["Mainly clear", "በአብዛኛው ጥርት"],
        2: ["Partly cloudy", "በከፊል ደመናማ"],
        3: ["Overcast", "ደመናማ"],
        45: ["Fog", "ጭጋግ"],
        48: ["Rime fog", "ቀዝቃዛ ጭጋግ"],
        51: ["Light drizzle", "ቀላል ጠብታ"],
        53: ["Drizzle", "ጠብታ"],
        55: ["Dense drizzle", "ብዙ ጠብታ"],
        61: ["Light rain", "ቀላል ዝናብ"],
        63: ["Rain", "ዝናብ"],
        65: ["Heavy rain", "ከባድ ዝናብ"],
        80: ["Rain showers", "የዝናብ መብረቅ"],
        95: ["Thunderstorm", "ነጎድጓድ"],
        96: ["Thunderstorm with hail", "ነጎድጓድ ከበረዶ ጋር"]
    };
    const fallback = ["Changing weather", "ተለዋዋጭ አየር"];
    return (map[code] || fallback)[state.lang === "am" ? 1 : 0];
}

function weekday(dateText) {
    const date = new Date(`${dateText}T12:00:00`);
    const locale = state.lang === "am" ? "am-ET" : "en-US";
    return new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(date);
}

function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function setLoading(message = text("loading")) {
    $("#weatherEmpty").hidden = false;
    $("#weatherContent").hidden = true;
    $("#weatherEmpty").innerHTML = `
        <span class="empty-icon" aria-hidden="true">...</span>
        <h2>${message}</h2>
        <p>${text("subtitle")}</p>
    `;
}

function buildWeatherUrl(place) {
    const params = new URLSearchParams({
        latitude: place.lat,
        longitude: place.lon,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_gusts_10m,visibility",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
        timezone: "auto",
        forecast_days: "7"
    });
    return `${WEATHER_API}?${params.toString()}`;
}

async function fetchWeather(place) {
    const response = await fetch(buildWeatherUrl(place));
    if (!response.ok) throw new Error("weather fetch failed");
    return response.json();
}

function offlineReport(place) {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        const iso = date.toISOString().slice(0, 10);
        return {
            time: iso,
            weather_code: index % 3 === 0 ? 2 : 1,
            temperature_2m_max: place.fallbackTemp + (index % 2),
            temperature_2m_min: place.fallbackTemp - 6 - (index % 2),
            precipitation_probability_max: index % 4 === 0 ? 35 : 15,
            wind_speed_10m_max: 14 + index
        };
    });

    return {
        current: {
            time: new Date().toISOString(),
            temperature_2m: place.fallbackTemp,
            apparent_temperature: place.fallbackTemp - 1,
            relative_humidity_2m: 54,
            precipitation: 0,
            weather_code: 2,
            cloud_cover: 38,
            surface_pressure: 1012,
            wind_speed_10m: 14,
            wind_gusts_10m: 24,
            visibility: 10000
        },
        daily: Object.fromEntries(Object.keys(days[0]).map((key) => [key, days.map((day) => day[key])])),
        offline: true
    };
}

function riskFrom(current, dailyWind) {
    const wind = current.wind_speed_10m || 0;
    const gust = current.wind_gusts_10m || 0;
    const visibility = current.visibility || 10000;
    const precipitation = current.precipitation || 0;
    const weatherCode = current.weather_code || 0;
    const maxWind = dailyWind || wind;

    if (visibility < 4000 || precipitation >= 6 || wind >= 38 || gust >= 54 || weatherCode >= 95) {
        return { level: "high", label: text("high"), className: "risk-high" };
    }

    if (visibility < 8000 || precipitation > 0 || wind >= 24 || gust >= 36 || maxWind >= 30 || weatherCode >= 45) {
        return { level: "medium", label: text("medium"), className: "risk-medium" };
    }

    return { level: "low", label: text("low"), className: "risk-low" };
}

function metric(label, value) {
    return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function renderWeather(place, report) {
    state.activePlace = place;
    state.latestReport = report;

    const current = report.current;
    const risk = riskFrom(current, report.daily?.wind_speed_10m_max?.[0]);
    const source = report.offline ? text("offline") : text("live");
    const updated = current.time ? new Date(current.time).toLocaleString(state.lang === "am" ? "am-ET" : "en-US") : "--";

    $("#weatherEmpty").hidden = true;
    $("#weatherContent").hidden = false;
    $("#weatherContent").innerHTML = `
        <div class="weather-hero">
            <div>
                <span class="station-code">${place.code || "WX"} · ${place.airport || source}</span>
                <h2>${displayName(place)}</h2>
                <div class="temperature">${temp(current.temperature_2m)}</div>
                <div class="condition">${weatherText(current.weather_code)} · ${source}</div>
            </div>
            <div class="risk-badge ${risk.className}">${risk.label}</div>
        </div>
        <div class="metric-grid">
            ${metric(text("apparent"), temp(current.apparent_temperature))}
            ${metric(text("humidity"), `${Math.round(current.relative_humidity_2m || 0)}%`)}
            ${metric(text("wind"), kmh(current.wind_speed_10m))}
            ${metric(text("gust"), kmh(current.wind_gusts_10m))}
            ${metric(text("visibility"), km(current.visibility))}
            ${metric(text("pressure"), `${Math.round(current.surface_pressure || 0)} hPa`)}
            ${metric(text("cloud"), `${Math.round(current.cloud_cover || 0)}%`)}
            ${metric(text("precipitation"), `${current.precipitation || 0} mm`)}
        </div>
        <p class="updated-line">${text("updated")}: ${updated}</p>
    `;

    renderForecast(report);
    renderOps(report);
}

function renderForecast(report) {
    const daily = report.daily;
    $("#forecastPanel").hidden = false;
    $("#forecastScroll").innerHTML = daily.time.map((date, index) => `
        <article class="forecast-day">
            <strong>${weekday(date)}</strong>
            <span>${weatherText(daily.weather_code[index])}</span>
            <span>${temp(daily.temperature_2m_max[index])} / ${temp(daily.temperature_2m_min[index])}</span>
            <span>${text("precipitation")}: ${daily.precipitation_probability_max[index] ?? 0}%</span>
            <span>${text("wind")}: ${kmh(daily.wind_speed_10m_max[index])}</span>
        </article>
    `).join("");
}

function renderOps(report = state.latestReport) {
    const routes = [
        ["Addis Ababa", "Bahir Dar"],
        ["Addis Ababa", "Dire Dawa"],
        ["Addis Ababa", "Hawassa"],
        ["Addis Ababa", "Mekelle"]
    ];
    const current = report?.current || offlineReport(AIRPORTS[0]).current;
    const risk = riskFrom(current, report?.daily?.wind_speed_10m_max?.[0]);

    $("#opsTitle").textContent = text("readyRoutes");
    $("#opsList").innerHTML = routes.map(([from, to]) => `
        <div class="ops-item">
            <div>
                <strong>${from} → ${to}</strong>
                <small>${weatherText(current.weather_code)} · ${kmh(current.wind_speed_10m)}</small>
            </div>
            <span class="risk-badge ${risk.className}">${risk.level.toUpperCase()}</span>
        </div>
    `).join("");
}

function renderQuickCities() {
    $("#quickCities").innerHTML = AIRPORTS.slice(0, 7).map((airport) => `
        <button class="airport-button" type="button" data-city="${airport.name}">
            ${displayName(airport)} <span>${airport.code}</span>
        </button>
    `).join("");
}

function renderStationGrid() {
    $("#stationsGrid").innerHTML = AIRPORTS.map((airport) => `
        <button class="station-tile" type="button" data-city="${airport.name}">
            <span class="station-top"><strong>${displayName(airport)}</strong><span>${airport.code}</span></span>
            <span class="station-temp">${temp(airport.fallbackTemp)}</span>
            <span class="station-meta">${airport.airport}</span>
        </button>
    `).join("");
}

async function hydrateStationTemps() {
    const selected = AIRPORTS.slice(0, 6);
    await Promise.allSettled(selected.map(async (airport) => {
        const report = await fetchWeather(airport);
        airport.liveTemp = report.current.temperature_2m;
    }));

    $("#stationsGrid").querySelectorAll(".station-tile").forEach((tile) => {
        const airport = AIRPORTS.find((item) => item.name === tile.dataset.city);
        const tempNode = tile.querySelector(".station-temp");
        if (airport && tempNode) tempNode.textContent = temp(airport.liveTemp ?? airport.fallbackTemp);
    });
}

function findLocalPlace(query) {
    const normalized = query.trim().toLowerCase();
    return AIRPORTS.find((airport) => {
        return airport.name.toLowerCase() === normalized ||
            airport.am === query.trim() ||
            airport.code.toLowerCase() === normalized ||
            airport.airport.toLowerCase().includes(normalized);
    });
}

async function geocodePlace(query) {
    const params = new URLSearchParams({ name: query, count: "1", language: "en", format: "json" });
    const response = await fetch(`${GEOCODE_API}?${params.toString()}`);
    if (!response.ok) throw new Error("geocode failed");
    const data = await response.json();
    const result = data.results?.[0];
    if (!result) return null;
    return {
        name: result.name,
        am: result.name,
        code: result.country_code || "WX",
        airport: `${result.admin1 || result.country || "Selected location"}`,
        lat: result.latitude,
        lon: result.longitude,
        fallbackTemp: 24
    };
}

async function loadPlace(place, options = {}) {
    setLoading();
    try {
        const report = await fetchWeather(place);
        renderWeather(place, report);
    } catch (error) {
        renderWeather(place, offlineReport(place));
        if (!options.quiet) showToast(text("offline"));
    }
}

async function searchCity(query) {
    const cleaned = query.trim();
    if (!cleaned) return;

    const local = findLocalPlace(cleaned);
    if (local) {
        $("#cityInput").value = local.name;
        await loadPlace(local);
        return;
    }

    setLoading();
    try {
        const place = await geocodePlace(cleaned);
        if (!place) {
            showToast(text("notFound"));
            await loadPlace(state.activePlace, { quiet: true });
            return;
        }
        $("#cityInput").value = place.name;
        await loadPlace(place);
    } catch (error) {
        showToast(text("notFound"));
        await loadPlace(state.activePlace, { quiet: true });
    }
}

function nearestAirport(latitude, longitude) {
    return AIRPORTS.map((airport) => ({
        airport,
        distance: Math.hypot(latitude - airport.lat, longitude - airport.lon)
    })).sort((a, b) => a.distance - b.distance)[0].airport;
}

function useLocation() {
    if (!navigator.geolocation) {
        showToast(text("locationDenied"));
        loadPlace(AIRPORTS[0]);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => loadPlace(nearestAirport(position.coords.latitude, position.coords.longitude)),
        () => {
            showToast(text("locationDenied"));
            loadPlace(AIRPORTS[0]);
        },
        { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 }
    );
}

function updateCopy() {
    $("#langBtn").textContent = text("langButton");
    $("#unitBtn").textContent = unitLabel();
    $("#dashboardSubtitle").textContent = text("subtitle");
    $("#cityInput").placeholder = text("searchPlaceholder");
    $("#searchBtn").textContent = text("search");
    $("#locationBtn").textContent = text("location");
    $("#forecastTitle").textContent = text("forecast");
    $("#stationsTitle").textContent = text("stations");
    $("#stationsNote").textContent = text("note");

    if (!state.latestReport) {
        $("#weatherEmpty").innerHTML = `
            <span class="empty-icon" aria-hidden="true">ET</span>
            <h2>${text("emptyTitle")}</h2>
            <p>${text("emptyBody")}</p>
        `;
    }

    renderQuickCities();
    renderStationGrid();
    renderOps();
    if (state.latestReport) renderWeather(state.activePlace, state.latestReport);
}

function bindEvents() {
    $("#searchForm").addEventListener("submit", (event) => {
        event.preventDefault();
        searchCity($("#cityInput").value);
    });

    $("#locationBtn").addEventListener("click", useLocation);

    $("#langBtn").addEventListener("click", () => {
        state.lang = state.lang === "en" ? "am" : "en";
        localStorage.setItem("et-weather-lang", state.lang);
        updateCopy();
    });

    $("#unitBtn").addEventListener("click", () => {
        state.unit = state.unit === "celsius" ? "fahrenheit" : "celsius";
        localStorage.setItem("et-weather-unit", state.unit);
        updateCopy();
    });

    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-city]");
        if (!button) return;
        searchCity(button.dataset.city);
    });
}

function start() {
    bindEvents();
    updateCopy();
    loadPlace(AIRPORTS[0], { quiet: true });
    hydrateStationTemps();
}

window.searchCity = searchCity;
start();
