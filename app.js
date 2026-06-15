// ============================================
// የኢትዮጵያ አየር መንገድ - ከመስመር ውጭ የሚሰራ መተግበሪያ
// Ethiopian Airlines Weather Dashboard (Mock Mode)
// ============================================

let TEMP_UNIT = localStorage.getItem('temp_unit') || 'metric';
let CURRENT_LANG = localStorage.getItem('app_lang') || 'en';

// የኢትዮጵያ ከተሞች እና መነሻ የአየር ንብረት (Mock Baseline Weather Data)
const ETHIOPIAN_CITIES = [
    { name: 'Addis Ababa', am: 'አዲስ አበባ', emoji: '🏙️', baseTemp: 22, descEn: 'Partly cloudy', descAm: 'በከፊል ደመናማ', humidity: 55, wind: 4, pressure: 1014, visibility: 10 },
    { name: 'Dire Dawa', am: 'ድሬ ዳዋ', emoji: '🏛️', baseTemp: 31, descEn: 'Sunny and clear', descAm: 'ጸሐያማ አየር', humidity: 35, wind: 6, pressure: 1010, visibility: 12 },
    { name: 'Bahir Dar', am: 'ባህር ዳር', emoji: '🌊', baseTemp: 26, descEn: 'Light lake breeze', descAm: 'ቀሊል የሐይቅ ነፋስ', humidity: 60, wind: 3, pressure: 1012, visibility: 9 },
    { name: 'Gondar', am: 'ጎንደር', emoji: '🏰', baseTemp: 24, descEn: 'Scattered clouds', descAm: 'የተበተኑ ደመናዎች', humidity: 48, wind: 5, pressure: 1013, visibility: 10 },
    { name: 'Lalibela', am: 'ላሊበላ', emoji: '⛪', baseTemp: 23, descEn: 'Clear mountain sky', descAm: 'ደማቅ ሰማይ', humidity: 40, wind: 7, pressure: 1011, visibility: 14 },
    { name: 'Hawassa', am: 'ሀዋሳ', emoji: '🐟', baseTemp: 27, descEn: 'Warm and humid', descAm: 'ሞቃት እና እርጥብ', humidity: 65, wind: 4, pressure: 1012, visibility: 10 },
    { name: 'Mekelle', am: 'መቀሌ', emoji: '⛰️', baseTemp: 25, descEn: 'Windy and dry', descAm: 'ነፋሻማ እና ደረቅ', humidity: 30, wind: 11, pressure: 1013, visibility: 11 },
    { name: 'Jimma', am: 'ጅማ', emoji: '☕', baseTemp: 23, descEn: 'Mild afternoon rain', descAm: 'ቀሊል ከሰዓት ዝናብ', humidity: 75, wind: 3, pressure: 1015, visibility: 8 },
    { name: 'Harar', am: 'ሀረር', emoji: '🕌', baseTemp: 26, descEn: 'Pleasant and sunny', descAm: 'ደስ የሚል የፀሐይ ብርሃን', humidity: 42, wind: 5, pressure: 1012, visibility: 12 }
];

const TRANSLATE = {
    am: {
        search: 'ፈልግ',
        location: 'ቦታዬ',
        humidity: 'እርጥበት',
        wind: 'ንፋስ',
        pressure: 'ግፊት',
        visibility: 'እይታ',
        flightOk: '✅ ጥሩ ሁኔታ',
        flightMed: '⚡ መካከለኛ ንፋስ',
        flightBad: '⛈️ አደገኛ/አሉታዊ',
        forecastTitle: '📅 የ5 ቀን የአየር ንብረት ትንበያ',
        enterCity: 'እባክዎ የከተማ ስም ያስገቡ',
        overviewTitle: '🏙️ የኢትዮጵያ ከተሞች አጠቃላይ እይታ',
        emptyMessage: 'የአየር ሁኔታን ለማየት ከተማ ይፈልጉ',
        loadingText: 'በመጫን ላይ...'
    },
    en: {
        search: 'Search',
        location: 'My Location',
        humidity: 'Humidity',
        wind: 'Wind',
        pressure: 'Pressure',
        visibility: 'Visibility',
        flightOk: '✅ Clear Flight Condition',
        flightMed: '⚡ Moderate Wind Caution',
        flightBad: '⛈️ Severe Weather / Risk',
        forecastTitle: '📅 5-Day Weather Forecast',
        enterCity: 'Please enter a city name',
        enterKey: 'Simulation Mode Enabled',
        overviewTitle: '🏙️ Ethiopian Cities Overview',
        emptyMessage: 'Search a city to see weather',
        loadingText: 'Loading weather assets...'
    }
};

const el = (id) => document.querySelector(id);

// ==================== መነሻ (Bootstrap App) ====================
function start() {
    el('#searchBtn').onclick = () => search();
    el('#locationBtn').onclick = () => getLocation();
    el('#unitBtn').onclick = () => toggleUnit();
    el('#langBtn').onclick = () => toggleLang();
    
    // Hide API buttons/modals since they are no longer required
    if (el('#apiKeyBtn')) el('#apiKeyBtn').style.display = 'none';
    if (el('#apiModal')) el('#apiModal').style.display = 'none';
    
    showCities();
    updateText();
    loadAllCities();
    
    setTimeout(() => {
        const loader = el('#loadingScreen');
        if (loader) loader.style.display = 'none';
    }, 400);
}

function toggleLang() {
    CURRENT_LANG = CURRENT_LANG === 'am' ? 'en' : 'am';
    localStorage.setItem('app_lang', CURRENT_LANG);
    updateText();
    showCities();
    loadAllCities();
}

function updateText() {
    el('#langBtn').innerHTML = CURRENT_LANG === 'am' ? 'EN' : 'አማርኛ';
    el('#searchBtn').innerHTML = `🔍 ${TRANSLATE[CURRENT_LANG].search}`;
    el('#locationBtn').innerHTML = `📍 ${TRANSLATE[CURRENT_LANG].location}`;
    el('#forecastTitle').innerHTML = TRANSLATE[CURRENT_LANG].forecastTitle;
    el('#overviewHeading').innerHTML = TRANSLATE[CURRENT_LANG].overviewTitle;
    
    if (el('#weatherEmpty')) {
        el('#weatherEmpty').querySelector('h3').innerHTML = TRANSLATE[CURRENT_LANG].emptyMessage;
    }
    el('#cityInput').placeholder = CURRENT_LANG === 'am' ? 'ከተማ ይፈልጉ... (ምሳሌ፡ አዲስ አበባ)' : 'Search city... (e.g., Addis Ababa)';
}

// ==================== Local Mock Engine ====================
function convertTemp(celsius) {
    if (TEMP_UNIT === 'metric') return Math.round(celsius);
    return Math.round((celsius * 9/5) + 32);
}

function showCities() {
    let html = '';
    for (let city of ETHIOPIAN_CITIES) {
        let cityName = CURRENT_LANG === 'am' ? city.am : city.name;
        html += `
            <div class="city-tile" onclick="searchCity('${city.name}')">
                <div style="font-size:30px">${city.emoji}</div>
                <div><strong>${cityName}</strong></div>
                <div id="temp_${city.name.replace(/\s/g, '_')}">--°</div>
            </div>
        `;
    }
    el('#citiesGrid').innerHTML = html;
}

function loadAllCities() {
    for (let city of ETHIOPIAN_CITIES) {
        const tempDiv = el(`#temp_${city.name.replace(/\s/g, '_')}`);
        if (tempDiv) {
            const finalTemp = convertTemp(city.baseTemp);
            const symbol = TEMP_UNIT === 'metric' ? '°C' : '°F';
            tempDiv.innerHTML = `${finalTemp}${symbol}`;
        }
    }
}

function search() {
    const city = el('#cityInput').value.trim();
    if (!city) {
        alert(TRANSLATE[CURRENT_LANG].enterCity);
        return;
    }
    searchCity(city);
}

function searchCity(cityName) {
    el('#weatherContent').style.display = 'block';
    el('#weatherEmpty').style.display = 'none';
    
    // Find city metadata locally
    const target = ETHIOPIAN_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase() || c.am === cityName);
    
    if (!target) {
        // Fallback generator for unknown random custom searches
        const mockCustom = {
            name: cityName,
            am: cityName,
            emoji: '🌍',
            baseTemp: 20 + Math.floor(Math.random() * 10),
            descEn: 'Cloudy patches',
            descAm: 'የተቆራረጠ ደመና',
            humidity: 50,
            wind: 5,
            pressure: 1013,
            visibility: 10
        };
        renderWeatherData(mockCustom);
    } else {
        renderWeatherData(target);
    }
}

function renderWeatherData(city) {
    const unitSym = TEMP_UNIT === 'metric' ? '°C' : '°F';
    const windUnit = TEMP_UNIT === 'metric' ? 'm/s' : 'mph';
    
    const displayTemp = convertTemp(city.baseTemp);
    const displayTitle = CURRENT_LANG === 'am' ? city.am : city.name;
    const displayDesc = CURRENT_LANG === 'am' ? city.descAm : city.descEn;
    
    let flight = TRANSLATE[CURRENT_LANG].flightOk;
    if (city.wind > 7) flight = TRANSLATE[CURRENT_LANG].flightMed;
    if (city.wind > 10) flight = TRANSLATE[CURRENT_LANG].flightBad;
    
    el('#weatherContent').innerHTML = `
        <div style="text-align:center">
            <h2>${city.emoji} ${displayTitle}</h2>
            <div style="font-size:3.5rem; font-weight:bold; margin:10px 0">${displayTemp}${unitSym}</div>
            <div style="text-transform: capitalize; opacity:0.9; margin-bottom: 20px;">${displayDesc}</div>
            <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-top:20px; text-align:left; background:rgba(255,255,255,0.02); padding:15px; border-radius:12px;">
                <div>💧 ${TRANSLATE[CURRENT_LANG].humidity}: ${city.humidity}%</div>
                <div>💨 ${TRANSLATE[CURRENT_LANG].wind}: ${city.wind} ${windUnit}</div>
                <div>#️⃣ ${TRANSLATE[CURRENT_LANG].pressure}: ${city.pressure} hPa</div>
                <div>👁️ ${TRANSLATE[CURRENT_LANG].visibility}: ${city.visibility} km</div>
            </div>
            <div style="margin-top:20px; padding:12px; border-radius:10px; background:rgba(255,255,255,0.1); font-weight:bold;">
                ✈️ Aviation Safety Status: ${flight}
            </div>
        </div>
    `;
    
    renderMockForecast(city.baseTemp);
    el('#forecastCard').style.display = 'block';
}

function renderMockForecast(base) {
    const unitSym = TEMP_UNIT === 'metric' ? '°C' : '°F';
    const days = CURRENT_LANG === 'am' ? ['ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'አርብ'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    let html = '<div style="display:flex; gap:15px; overflow-x:auto; justify-content:center; padding-top:10px">';
    for (let i = 0; i < 5; i++) {
        const max = convertTemp(base + (i % 2 === 0 ? 2 : -1));
        const min = convertTemp(base - 4 - (i % 3 === 0 ? 1 : 0));
        html += `
            <div style="text-align:center; min-width:90px; padding:12px; background:rgba(255,255,255,0.05); border-radius:12px">
                <div style="margin-bottom:5px; font-weight:bold">${days[i]}</div>
                <div style="font-size:20px; margin:5px 0">🌤️</div>
                <div><strong>${max}${unitSym}</strong></div>
                <div style="opacity:0.6; font-size:0.9rem">${min}${unitSym}</div>
            </div>
        `;
    }
    html += '</div>';
    el('#forecastScroll').innerHTML = html;
}

function getLocation() {
    // Simulates picking up user's coordinates and snapping to capital city
    searchCity('Addis Ababa');
}

function toggleUnit() {
    TEMP_UNIT = TEMP_UNIT === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('temp_unit', TEMP_UNIT);
    el('#unitBtn').innerHTML = TEMP_UNIT === 'metric' ? '°C' : '°F';
    
    loadAllCities();
    const activeHeader = el('#weatherContent h2');
    if (activeHeader) {
        const currentCityName = activeHeader.innerText.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();
        searchCity(currentCityName);
    }
}

window.searchCity = searchCity;
start();