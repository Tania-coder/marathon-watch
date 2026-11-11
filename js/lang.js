// Language switch EN / DK
// The pages are written in English. When DK is picked, this script
// finds every text on the page and swaps it for the Danish version below.
// The choice is saved, so it stays when you go to another page.

// 1. Danish words — the English text on the left, Danish on the right.
//    New text on a page? Add one line here.
const danish = {
  // header
  "Weather": "Vejr",
  "Time left": "Tid tilbage",
  "Home": "Forside",
  "Menu": "Menu",
  "Emergency": "Nødsituation",

  // home
  "Find location": "Find sted",
  "Open map": "Åbn kort",

  // menu
  "What do you need?": "Hvad har du brug for?",
  "Pick one and we show the nearest spot.": "Vælg en, så viser vi det nærmeste sted.",

  // places
  "Water station": "Vanddepot",
  "Toilets": "Toiletter",
  "Equipment": "Udstyr",
  "First aid": "Førstehjælp",
  "All locations": "Alle steder",

  // map
  "Show all locations": "Vis alle steder",
  "Zoom in": "Zoom ind",
  "Zoom out": "Zoom ud",
  "Back to my location": "Tilbage til min placering",
  "Tap a place to get directions": "Tryk på et sted for at få vej",

  // panel
  "Back": "Tilbage",
  "Wait time": "Ventetid",
  "In stock at this station": "På lager på dette depot",
  "Energy gels": "Energigeler",
  "Socks": "Strømper",
  "Plasters": "Plastre",
  "Water bottles": "Vandflasker",
  "Available": "På lager",
  "Low stock": "Få tilbage",
  "Out of stock": "Udsolgt",
  "QR code": "QR-kode",

  // first aid
  "In an emergency": "I nødstilfælde",
  "call": "ring",
  "Use your own phone and tell them where you are.": "Brug din egen telefon og fortæl, hvor du er.",
  "Your location is in the QR code below.": "Din placering står i QR-koden nedenfor.",
  "Scan for your exact location": "Scan for din præcise placering",
  "Read it out to the 112 operator": "Læs den op for 112-operatøren",
  "QR code with your location": "QR-kode med din placering",

  // watch
  "Water": "Vand",
  "left": "tilbage",
  "In stock": "På lager",
  "Yes": "Ja",
  "Low": "Få",
  "Out": "Udsolgt",
  "See what’s in stock": "Se hvad der er på lager",
  "Call 112": "Ring 112",
  "Your location": "Din placering",
  "Read it to the 112 operator": "Læs den op for 112-operatøren",
  "Done": "Færdig",
  "Open on Apple Watch": "Åbn på Apple Watch"
};

// 2. Texts with a number or letter inside ("2 km left", "Station A (5 km)")
const danishPatterns = [
  [/^(.+) away · see what’s in stock$/, "$1 væk · se hvad der er på lager"],
  [/^(.+) away · send your location to medics$/, "$1 væk · send din placering til samaritterne"],
  [/^(.+) away$/, "$1 væk"],
  [/^(.+) left$/, "$1 tilbage"],
  [/^Station (\w+) \((.+)\)$/, "Depot $1 ($2)"],
  [/^Water station (\w+)$/, "Vanddepot $1"],
  [/^Station (\w+) · (.+)$/, "Depot $1 · $2"]
];

function toDanish(english) {
  if (danish[english]) return danish[english];

  // page title, e.g. "Toilets - Copenhagen Marathon"
  const title = english.match(/^(.+) - Copenhagen Marathon$/);
  if (title && danish[title[1]]) return danish[title[1]] + " - Copenhagen Marathon";

  for (const [pattern, result] of danishPatterns) {
    if (pattern.test(english)) return english.replace(pattern, result);
  }
  return english; // no translation → keep English
}

// 3. Saved choice ("en" or "da")
function getLang() {
  try { return localStorage.getItem("lang") || "en"; } catch (e) { return "en"; }
}
function saveLang(lang) {
  try { localStorage.setItem("lang", lang); } catch (e) {}
}

// 4. Translate the whole page
function translatePage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.setAttribute("translate", "no"); // Chrome must not translate on top of us

  // all texts on the page
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style, #time-left, #weather, .lang-switch")) continue;

    if (node.english === undefined) node.english = node.textContent; // remember English once
    const text = node.english.trim();
    if (!text) continue;

    const newText = lang === "da" ? toDanish(text) : text;
    node.textContent = node.english.replace(text, newText);
  }

  // hidden texts: alt, title, aria-label
  document.querySelectorAll("[alt], [title], [aria-label]").forEach(function (el) {
    ["alt", "title", "aria-label"].forEach(function (attr) {
      if (!el.hasAttribute(attr) || !el.getAttribute(attr)) return;
      const key = "en" + attr.replace("-", ""); // "aria-label" → "enarialabel"
      if (el.dataset[key] === undefined) el.dataset[key] = el.getAttribute(attr);
      const english = el.dataset[key];
      el.setAttribute(attr, lang === "da" ? toDanish(english) : english);
    });
  });

  // browser tab title
  if (document.englishTitle === undefined) document.englishTitle = document.title;
  document.title = lang === "da" ? toDanish(document.englishTitle) : document.englishTitle;

  // which button looks active
  document.querySelectorAll(".lang-switch button").forEach(function (button) {
    button.classList.toggle("active", button.dataset.lang === lang);
  });
}

// 5. Put the EN / DK buttons into the header on every page
function addSwitch() {
  const info = document.querySelector("header .info");
  if (!info) return;

  const box = document.createElement("div");
  box.className = "lang-switch";
  box.innerHTML =
    '<button type="button" data-lang="en">EN</button>' +
    '<button type="button" data-lang="da">DK</button>';

  // before the home button, or at the end if the page has none
  const home = info.querySelector(".home-button");
  info.insertBefore(box, home);

  box.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;
    saveLang(button.dataset.lang);
    translatePage(button.dataset.lang);
  });
}

addSwitch();
translatePage(getLang());
