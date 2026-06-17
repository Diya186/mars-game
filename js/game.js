/* ============ game.js ============
   Chaotic Business Simulator — rapid fire events, no clicker
*/

const GameState = {
  wealth: 100,
  ownership: 1,
  playerName: 'Mansi Harsh',
  currentEvent: 0,
  gameRunning: false,
};

// ---- 10 RAPID FIRE EVENTS ----
const EVENTS = [
  {
    emoji: '📱',
    headline: 'AMBANI IS TEXTING',
    body: 'Mukesh Ambani: "Beta I gave you funding. I want 2% land now instead of 1%."',
    choices: [
      {
        label: '🔒 Absolutely not. 1% was the deal.',
        good: true,
        wealthDelta: +500,
        ownershipDelta: +5,
        result: 'Ambani respects the boundary. Slightly. +ₘ500 confidence bonus.',
        mansiAnim: 'bounce',
      },
      {
        label: '😅 Fine fine take 1.5%',
        good: false,
        wealthDelta: -200,
        ownershipDelta: +3,
        result: 'You gave in. He immediately asks for 3%. Classic.',
        mansiAnim: 'shake',
      },
    ],
  },
  {
    emoji: '👽',
    headline: 'ALIEN TENANTS REVOLT',
    body: 'The original Martian residents have formed a union. They want rent control, free Wi-Fi, and "acknowledgement of their existence."',
    choices: [
      {
        label: '😤 Wi-Fi costs extra. Dismissed.',
        good: true,
        wealthDelta: +800,
        ownershipDelta: +8,
        result: 'They filed a complaint with Earth. Earth has no jurisdiction on Mars. +ₘ800',
        mansiAnim: 'bounce',
      },
      {
        label: '🤝 Fine, free Wi-Fi only',
        good: false,
        wealthDelta: -300,
        ownershipDelta: +5,
        result: 'They immediately demanded Netflix too. You said no. Too late.',
        mansiAnim: 'shake',
      },
    ],
  },
  {
    emoji: '🚀',
    headline: 'NASA WANTS TO LAND',
    body: 'NASA has requested permission to land a rocket on your property. They say it\'s "for science." You know it\'s for clout.',
    choices: [
      {
        label: '💰 Sure. Landing permit fee: ₘ2000',
        good: true,
        wealthDelta: +2000,
        ownershipDelta: +10,
        result: 'NASA paid. Reluctantly. Property value tripled. +ₘ2000 🚀',
        mansiAnim: 'spin',
      },
      {
        label: '🚫 This is private property.',
        good: false,
        wealthDelta: +100,
        ownershipDelta: +3,
        result: 'They landed anyway. You sued. Court date: 2087.',
        mansiAnim: 'shake',
      },
    ],
  },
  {
    emoji: '📰',
    headline: 'FORBES MARS CALLS',
    body: 'Forbes Mars wants to do a cover story. They ask: "What\'s your business philosophy?" You have 10 seconds.',
    choices: [
      {
        label: '"Buy Mars. Sell 49%. Keep power. Repeat."',
        good: true,
        wealthDelta: +1500,
        ownershipDelta: +8,
        result: 'Cover story goes viral on Earth. Investors are confused but intrigued. +ₘ1500',
        mansiAnim: 'spin',
      },
      {
        label: '"I just really believe in real estate."',
        good: false,
        wealthDelta: +300,
        ownershipDelta: +4,
        result: 'Boring answer. Page 47. No one reads page 47.',
        mansiAnim: 'shake',
      },
    ],
  },
  {
    emoji: '🌋',
    headline: 'VOLCANO SITUATION',
    body: 'Olympus Mons just erupted. Half your Lava District is now actual lava. An investor calls it "premium heated waterfront."',
    choices: [
      {
        label: '📈 Relist at 3x the price immediately',
        good: true,
        wealthDelta: +3000,
        ownershipDelta: +12,
        result: 'Sold in 4 minutes. The buyer is from Dubai. Of course. +ₘ3000 🌋',
        mansiAnim: 'spin',
      },
      {
        label: '😰 Evacuate and repair first',
        good: false,
        wealthDelta: -500,
        ownershipDelta: +5,
        result: 'Repair costs: ₘ500. The lava is still there. Nothing changed.',
        mansiAnim: 'shake',
      },
    ],
  },
  {
    emoji: '💔',
    headline: 'HARSH IS TEXTING',
    body: 'Harsh: "Hey I heard you own Mars now. Can I visit? I\'ll bring snacks." He has no idea there\'s no oxygen.',
    choices: [
      {
        label: '💙 Grant him a visitor visa (he\'s sweet)',
        good: true,
        wealthDelta: +200,
        ownershipDelta: +5,
        result: 'He arrives. Immediately asks where the AC is. You love him anyway. 💙',
        mansiAnim: 'bounce',
        harshAppear: true,
      },
      {
        label: '🔒 No visitors. Mars is for business.',
        good: false,
        wealthDelta: +500,
        ownershipDelta: +3,
        result: 'He sends a sad emoji. You gain ₘ500 but feel bad. Worth it? Unclear.',
        mansiAnim: 'shake',
      },
    ],
  },
  {
    emoji: '🏦',
    headline: 'EARTH BANK MEETING',
    body: 'A major Earth bank wants to invest ₘ5000 but demands 10% ownership stake. Your lawyers say "do not."',
    choices: [
      {
        label: '🔒 No. 49% cap. Non-negotiable.',
        good: true,
        wealthDelta: +1000,
        ownershipDelta: +10,
        result: 'They called you "difficult." You called them "not invited to Mars." +ₘ1000',
        mansiAnim: 'bounce',
      },
      {
        label: '🤝 Fine, 5% only',
        good: false,
        wealthDelta: +5000,
        ownershipDelta: +5,
        result: 'You got the money but now they\'re in your board meetings. Forever.',
        mansiAnim: 'shake',
      },
    ],
  },
  {
    emoji: '🛸',
    headline: 'MYSTERIOUS UFO LANDS',
    body: 'An unidentified spacecraft landed on your property. The pilot says they\'re from another galaxy and want to "invest in the neighbourhood."',
    choices: [
      {
        label: '💼 Welcome! Permit fee: ₘ9999',
        good: true,
        wealthDelta: +9999,
        ownershipDelta: +15,
        result: 'They paid without blinking. You now have an intergalactic investor. +ₘ9999 🛸',
        mansiAnim: 'spin',
      },
      {
        label: '😨 Call NASA immediately',
        good: false,
        wealthDelta: -100,
        ownershipDelta: +3,
        result: 'NASA took 3 hours to respond. The alien left. Opportunity missed.',
        mansiAnim: 'shake',
      },
    ],
  },
  {
    emoji: '📣',
    headline: 'ELON MUSK IS UPSET',
    body: 'Elon Musk tweets: "Mars belongs to everyone." You own 80% of it. He wants a meeting.',
    choices: [
      {
        label: '😌 "See you in court, Elon."',
        good: true,
        wealthDelta: +2000,
        ownershipDelta: +8,
        result: 'The tweet goes viral. Your brand awareness on Earth skyrockets. +ₘ2000',
        mansiAnim: 'spin',
      },
      {
        label: '🤝 Offer him 0.1% to be quiet',
        good: false,
        wealthDelta: -800,
        ownershipDelta: +5,
        result: 'He took the 0.1% and still tweeted about it. Classic.',
        mansiAnim: 'shake',
      },
    ],
  },
  {
    emoji: '🏆',
    headline: 'FINAL ACQUISITION',
    body: 'One last property remains — the Martian North Pole. Scientists say it\'s "just ice." You know it\'s prime real estate.',
    choices: [
      {
        label: '🔥 BUY IT. Complete the empire.',
        good: true,
        wealthDelta: +5000,
        ownershipDelta: 100, // triggers endgame
        result: '100% of Mars. YOURS. The dream is complete. 🚀',
        mansiAnim: 'spin',
        final: true,
      },
      {
        label: '🤔 Maybe I have enough Mars...',
        good: true,
        wealthDelta: +3000,
        ownershipDelta: 100,
        result: 'You bought it anyway. Obviously. 🚀',
        mansiAnim: 'spin',
        final: true,
      },
    ],
  },
];

// ---- EVENT ENGINE ----
function startGame() {
  if (GameState.gameRunning) return;
  GameState.gameRunning = true;
  GameState.currentEvent = 0;
  GameState.wealth = 100;
  GameState.ownership = 1;

  updateGameHUD();
  showNextEvent();
}

function showNextEvent() {
  if (GameState.currentEvent >= EVENTS.length) {
    triggerEndgame();
    return;
  }

  const evt = EVENTS[GameState.currentEvent];
  const card = document.getElementById('eventCard');
  const overlay = document.getElementById('gameOverlay');

  // animate card in
  card.style.opacity = '0';
  card.style.transform = 'scale(0.85) translateY(20px)';

  document.getElementById('evtEmoji').textContent = evt.emoji;
  document.getElementById('evtHeadline').textContent = evt.headline;
  document.getElementById('evtBody').textContent = evt.body;
  document.getElementById('evtResult').textContent = '';
  document.getElementById('evtResult').style.display = 'none';

  const choicesEl = document.getElementById('evtChoices');
  choicesEl.innerHTML = '';
  choicesEl.style.display = 'flex';

  evt.choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'evt-btn' + (c.good ? '' : ' evt-btn-risky');
    btn.textContent = c.label;
    btn.addEventListener('click', () => handleChoice(c, btn));
    choicesEl.appendChild(btn);
  });

  overlay.classList.add('show');
  SFX.alert();

  requestAnimationFrame(() => {
    card.style.transition = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    card.style.opacity = '1';
    card.style.transform = 'scale(1) translateY(0)';
  });
}

function handleChoice(choice, btn) {
  // disable all buttons
  document.querySelectorAll('.evt-btn').forEach(b => b.disabled = true);

  // apply effects
  GameState.wealth = Math.max(0, GameState.wealth + choice.wealthDelta);
  GameState.ownership = Math.min(100, GameState.ownership + choice.ownershipDelta);
  updateGameHUD();

  // show result
  const resultEl = document.getElementById('evtResult');
  resultEl.textContent = choice.result;
  resultEl.style.display = 'block';
  resultEl.className = 'evt-result ' + (choice.good ? 'good' : 'bad');
  document.getElementById('evtChoices').style.display = 'none';

  // play sound
  if (choice.good) SFX.reward();
  else SFX.denied();

  // animate character
  if (window.animateMansi) window.animateMansi(choice.mansiAnim || 'bounce');
  if (choice.harshAppear && window.showHarshChar) window.showHarshChar();

  // money pop
  if (choice.wealthDelta !== 0) {
    showMoneyPop(
      (choice.wealthDelta > 0 ? '+' : '') + 'ₘ' + Math.abs(choice.wealthDelta).toLocaleString()
    );
  }

  // next event after delay
  setTimeout(() => {
    document.getElementById('gameOverlay').classList.remove('show');
    GameState.currentEvent++;
    setTimeout(() => {
      if (choice.final || GameState.ownership >= 100) {
        triggerEndgame();
      } else {
        showNextEvent();
      }
    }, 400);
  }, 2200);
}

function triggerEndgame() {
  GameState.gameRunning = false;
  SFX.victory();
  if (window.animateMansi) window.animateMansi('spin');
  setTimeout(() => goPhase(5), 1200);
}

function updateGameHUD() {
  const w = document.getElementById('wealthDisplay');
  const o = document.getElementById('ownershipPct');
  const f = document.getElementById('ownershipFill');
  const p = document.getElementById('eventProgress');

  if (w) w.textContent = 'ₘ ' + Math.floor(GameState.wealth).toLocaleString();
  if (o) o.textContent = Math.min(100, Math.floor(GameState.ownership)) + '%';
  if (f) f.style.width = Math.min(100, GameState.ownership) + '%';
  if (p) p.textContent = `EVENT ${GameState.currentEvent + 1} OF ${EVENTS.length}`;
}

function showMoneyPop(text) {
  const el = document.createElement('div');
  el.className = 'money-pop';
  el.textContent = text;
  el.style.left = (Math.random() * 60 + 20) + '%';
  el.style.top = '40%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
