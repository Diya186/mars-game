/* ============ game.js ============
   Game state, properties, events, empire loop
*/

// ---- STATE ----
const GameState = {
  wealth: 100,
  income: 0,
  ownership: 1,
  playerName: 'Mansi Harsh',
  gameRunning: false,
  eventsFired: 0,
  forbesBannerShown: false,
  harshAppeared: false,
  ownedCounts: {},
  gameInterval: null,
  eventTimeout: null,
};

// ---- PROPERTIES ----
const PROPERTIES = [
  { id: 'crater',   emoji: '🪨',  name: 'Tiny Crater',    desc: 'Dusty, remote, slightly radioactive. Perfect starter property.', cost: 50,     incomeRate: 1,    ownershipGain: 0.5 },
  { id: 'mountain', emoji: '🏔️',  name: 'Small Mountain', desc: 'Elevated views. Terrible for breathing. Great for Instagram.',    cost: 200,    incomeRate: 5,    ownershipGain: 1.5 },
  { id: 'lava',     emoji: '🌋',  name: 'Lava District',  desc: 'Surprisingly popular. Investors call it "waterfront-adjacent."', cost: 1000,   incomeRate: 20,   ownershipGain: 4   },
  { id: 'suburb',   emoji: '👽',  name: 'Alien Suburb',   desc: 'Current residents unhappy about rent. You don\'t care.',         cost: 5000,   incomeRate: 100,  ownershipGain: 10  },
  { id: 'valley',   emoji: '🏜️',  name: 'Olympic Vallis', desc: 'Largest canyon in the solar system. Now yours.',                 cost: 25000,  incomeRate: 500,  ownershipGain: 20  },
  { id: 'olympus',  emoji: '🌄',  name: 'Olympus Mons',   desc: 'Tallest volcano in the solar system. Obviously you want it.',    cost: 100000, incomeRate: 2000, ownershipGain: 30  },
];
PROPERTIES.forEach(p => { GameState.ownedCounts[p.id] = 0; });

// ---- EVENTS ----
const EVENTS = [
  {
    emoji: '🚀', headline: 'BREAKING: NASA Lands Nearby',
    body: 'Property values in your district have surged. The astronauts looked confused when they saw your "SOLD" signs.',
    reward: 500,
    choices: [{ label: 'Accept Payment', fn: () => { GameState.wealth += 500; SFX.reward(); showToast('+ₘ 500 credited'); closeEvent(); } }],
  },
  {
    emoji: '🤝', headline: 'RELIANCE MARS LAUNCH',
    body: 'Mukesh Ambani\'s Reliance Mars has officially begun rocket transfer services. He texts you: "Your idea was ridiculous. It\'s also working."',
    reward: 1000,
    choices: [{ label: 'Forward to Forbes', fn: () => { GameState.wealth += 1000; SFX.reward(); showToast('+ₘ 1,000 from Reliance dividend'); closeEvent(); } }],
  },
  {
    emoji: '👽', headline: 'ALIEN RESIDENTS PROTEST',
    body: 'The original Martian inhabitants demand lower rent and "basic civil rights." Your legal team confirms: you own the land.',
    reward: null,
    choices: [
      { label: 'Reduce Rent', fn: () => { GameState.wealth -= 200; SFX.denied(); showToast('Rent reduced. Popularity +1000. Revenue -200. 🙄'); closeEvent(); } },
      { label: 'Ignore Them', secondary: true, fn: () => { SFX.click(); showToast('Ignored. They filed with Earth. Earth has no jurisdiction. 😌'); closeEvent(); } },
    ],
  },
  {
    emoji: '🌋', headline: 'VOLCANO ERUPTION',
    body: 'The Lava District has erupted. Investors are now calling it "premium heated waterfront." Prices tripled.',
    reward: 2000,
    choices: [{ label: 'List at New Price', fn: () => { GameState.wealth += 2000; SFX.reward(); showToast('+ₘ 2,000 — disaster is opportunity'); closeEvent(); } }],
  },
  {
    emoji: '💔', headline: 'HARSH WANTS TO JOIN',
    body: 'Your bf Harsh has submitted an application to relocate to Mars. He says he wants to "support the business." The MCA (you) has the final say.',
    reward: null,
    choices: [
      { label: 'Grant Visa 💙', fn: () => { showHarsh(); closeEvent(); } },
      { label: 'No Visitors', secondary: true, fn: () => { SFX.denied(); showToast('Application denied. Mars is for business only. 🔒'); closeEvent(); } },
    ],
  },
  {
    emoji: '📰', headline: 'FORBES MARS — YOU\'RE #1',
    body: `${GameState.playerName} tops the Forbes Mars list for the 3rd consecutive quarter. Strategy: "Buy everything. Sell 49%. Keep control."`,
    reward: 0,
    choices: [{ label: 'Accept the Cover', fn: () => { showForbesBanner(); closeEvent(); } }],
  },
  {
    emoji: '🏦', headline: 'EARTH BANKS REJECT MARTIAN CREDIT',
    body: 'The World Bank has refused to recognise the Martian Credit as legal tender. The MCA (you) has declared Earth "financially irrelevant."',
    reward: 0,
    choices: [{ label: 'Issue Statement', fn: () => { SFX.click(); showToast('"Earth banks are not our target market." — CEO'); closeEvent(); } }],
  },
];

// ---- HELPERS ----
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

function showMoneyPop(amount, x, y) {
  const el = document.createElement('div');
  el.className = 'money-pop';
  el.textContent = `+ₘ ${amount.toLocaleString()}`;
  el.style.left = (x || window.innerWidth / 2) + 'px';
  el.style.top  = (y || window.innerHeight / 2) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function showForbesBanner() {
  const b = document.getElementById('forbesBanner');
  b.classList.add('show');
  SFX.fanfare();
  setTimeout(() => b.classList.remove('show'), 5000);
}

function showHarsh() {
  const h = document.getElementById('harshPopup');
  h.style.display = 'flex';
  SFX.reward();
  setTimeout(() => { h.style.display = 'none'; }, 5000);
}

function showMansiBubble(text) {
  const bubble = document.getElementById('mansiBubble');
  bubble.textContent = text;
  bubble.classList.add('show');
  setTimeout(() => bubble.classList.remove('show'), 4000);
}

const MANSI_QUOTES = [
  'Mine now. 😌',
  'Added to the empire. 🚀',
  'No one can stop me. 💅',
  'Going exactly as planned.',
  'Ambani funded the right person.',
  'Market it to Earth. Premium pricing.',
  '51% forever. Non-negotiable. 🔒',
  'Forbes will hear about this.',
  'The aliens didn\'t see this coming.',
];

// ---- RENDER PROPERTIES ----
function renderProperties() {
  const grid = document.getElementById('propertyGrid');
  grid.innerHTML = '';
  PROPERTIES.forEach(p => {
    const count = GameState.ownedCounts[p.id];
    const canAfford = GameState.wealth >= p.cost;
    const card = document.createElement('div');
    card.className = 'property-card' + (canAfford ? '' : ' cant-afford');
    card.id = 'prop-' + p.id;
    card.innerHTML = `
      ${count > 0 ? `<div class="property-owned-badge">OWNED ×${count}</div>` : ''}
      <span class="property-emoji">${p.emoji}</span>
      <div class="property-name">${p.name}</div>
      <div class="property-desc">${p.desc}</div>
      <div class="property-stats">
        <div class="property-cost">ₘ ${p.cost.toLocaleString()}</div>
        <div class="property-income">+${p.incomeRate}/sec</div>
      </div>
    `;
    card.addEventListener('click', () => buyProperty(p, card));
    grid.appendChild(card);
  });
}

function updateAffordability() {
  PROPERTIES.forEach(p => {
    const el = document.getElementById('prop-' + p.id);
    if (!el) return;
    if (GameState.wealth >= p.cost) el.classList.remove('cant-afford');
    else el.classList.add('cant-afford');
  });
}

function buyProperty(p, cardEl) {
  if (GameState.wealth < p.cost) { SFX.denied(); showToast('Insufficient Martian Credits 💸'); return; }
  GameState.wealth   -= p.cost;
  GameState.income   += p.incomeRate;
  GameState.ownership = Math.min(100, GameState.ownership + p.ownershipGain);
  GameState.ownedCounts[p.id]++;
  SFX.buy();
  cardEl && cardEl.classList.add('bought');
  setTimeout(() => cardEl && cardEl.classList.remove('bought'), 400);
  renderProperties();
  updateDisplay();
  showMansiBubble(MANSI_QUOTES[Math.floor(Math.random() * MANSI_QUOTES.length)]);
  checkEndgame();
}

function updateDisplay() {
  document.getElementById('wealthDisplay').textContent = 'ₘ ' + Math.floor(GameState.wealth).toLocaleString();
  document.getElementById('incomeDisplay').textContent = '+' + GameState.income + '/sec';
  document.getElementById('ownershipPct').textContent  = Math.min(100, Math.floor(GameState.ownership)) + '%';
  document.getElementById('ownershipFill').style.width = Math.min(100, GameState.ownership) + '%';
  if (document.getElementById('ceoName')) {
    document.getElementById('ceoName').textContent = GameState.playerName.toUpperCase();
  }
  updateAffordability();

  if (GameState.wealth > 50000 && !GameState.forbesBannerShown) {
    GameState.forbesBannerShown = true;
    showForbesBanner();
  }
}

// ---- EVENTS ----
function scheduleEvent() {
  const delay = 14000 + Math.random() * 18000;
  GameState.eventTimeout = setTimeout(() => {
    if (GameState.eventsFired < EVENTS.length && GameState.gameRunning) {
      triggerEvent(EVENTS[GameState.eventsFired]);
      GameState.eventsFired++;
      scheduleEvent();
    }
  }, delay);
}

function triggerEvent(evt) {
  document.getElementById('eventEmoji').textContent    = evt.emoji;
  document.getElementById('eventHeadline').textContent = evt.headline;
  document.getElementById('eventBody').textContent     = evt.body;
  document.getElementById('eventReward').textContent   = evt.reward ? `+ₘ ${evt.reward.toLocaleString()}` : '';

  const choicesEl = document.getElementById('eventChoices');
  choicesEl.innerHTML = '';
  evt.choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'event-btn' + (c.secondary ? ' secondary' : '');
    btn.textContent = c.label;
    btn.addEventListener('click', c.fn);
    choicesEl.appendChild(btn);
  });

  SFX.alert();
  document.getElementById('eventOverlay').classList.add('show');
}

function closeEvent() {
  document.getElementById('eventOverlay').classList.remove('show');
}

// ---- ENDGAME CHECK ----
function checkEndgame() {
  if (GameState.ownership >= 100 && GameState.gameRunning) {
    GameState.gameRunning = false;
    clearInterval(GameState.gameInterval);
    clearTimeout(GameState.eventTimeout);
    SFX.victory();
    setTimeout(() => goPhase(5), 1200);
  }
}

// ---- START GAME ----
function startGame() {
  if (GameState.gameRunning) return;
  GameState.gameRunning = true;

  renderProperties();
  updateDisplay();

  // show Mansi avatar
  document.getElementById('mansiChar').style.display = 'flex';
  setTimeout(() => showMansiBubble('Alright. Let\'s build an empire. 🚀'), 800);

  GameState.gameInterval = setInterval(() => {
    if (!GameState.gameRunning) return;
    GameState.wealth += GameState.income;
    SFX.tick();
    updateDisplay();
    checkEndgame();
  }, 1000);

  scheduleEvent();
}
