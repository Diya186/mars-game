/* ============ main.js ============
   Phase navigation, form submission, approval sequence,
   endgame, reality check, confetti
*/

// ---- PHASE NAVIGATION ----
function goPhase(n) {
  document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));
  const next = document.getElementById('phase' + n);
  if (!next) return;
  next.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  SFX.click();

  if (n === 3) startApproval();
  if (n === 4) startGame();
  if (n === 5) startEndgame();
  if (n === 6) startReality();
}

// ---- FORM ----
function selectOption(el, group) {
  // deselect all in same group
  document.querySelectorAll(`.radio-option[onclick*="'${group}'"]`)
    .forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  SFX.click();
}

function submitApplication() {
  const name = document.getElementById('applicantName').value.trim();
  if (!name) {
    SFX.denied();
    showToast('Please enter your name, future CEO 🚀');
    document.getElementById('applicantName').focus();
    return;
  }

  // store name in game state
  GameState.playerName = name;

  // put name on certificate
  document.getElementById('certName').textContent = name.toUpperCase();

  // update forbes card
  const fn = document.getElementById('forbesName');
  if (fn) fn.textContent = name;

  SFX.submit();
  goPhase(3);
}

// ---- PHASE 3: APPROVAL ----
function startApproval() {
  // reset
  document.getElementById('checkScreen').style.display = 'block';
  document.getElementById('certificate').style.display = 'none';
  document.getElementById('loadingBar').style.width = '0%';

  const checks = [
    { id: 'c1', icon: '✅', text: 'Financial Review — Ambani confirmed. 1% land + rocket deal signed.' },
    { id: 'c2', icon: '✅', text: 'Leadership Assessment — CEO potential: EXCEPTIONAL.' },
    { id: 'c3', icon: '✅', text: 'Visionary Thinking — Buy Mars. Sell Mars. Brilliant.' },
    { id: 'c4', icon: '✅', text: 'Power Structure — 49% cap confirmed. Founder stays in control.' },
    { id: 'c5', icon: '❌', text: 'Realistic Expectations — FAILED. Override approved by committee.' },
  ];

  // reset check items
  checks.forEach(c => {
    const el = document.getElementById(c.id);
    el.classList.remove('visible');
    el.querySelector('.check-icon').textContent = '⏳';
    el.querySelector('span:last-child').textContent = el.querySelector('span:last-child').textContent;
  });

  checks.forEach((check, i) => {
    setTimeout(() => {
      const el = document.getElementById(check.id);
      el.querySelector('.check-icon').textContent = check.icon;
      el.querySelector('span:last-child').textContent = check.text;
      el.classList.add('visible');
      document.getElementById('loadingBar').style.width = ((i + 1) / checks.length * 100) + '%';

      if (check.icon === '✅') SFX.checkOk();
      else SFX.checkFail();

      if (i === checks.length - 1) {
        setTimeout(() => {
          document.getElementById('checkScreen').style.display = 'none';
          document.getElementById('certificate').style.display = 'block';
          SFX.fanfare();
        }, 900);
      }
    }, i * 950 + 400);
  });
}

// ---- WIRE UP START EMPIRE BUTTON ----
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('startEmpireBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      SFX.submit();
      goPhase(4);
    });
  }
});

// ---- PHASE 5: ENDGAME ----
function startEndgame() {
  document.getElementById('finalWealth').textContent = 'ₘ ' + Math.floor(GameState.wealth).toLocaleString();

  // update forbes card name
  const fn = document.getElementById('forbesName');
  if (fn) fn.textContent = GameState.playerName;

  createConfetti();
  SFX.victory();
}

function createConfetti() {
  const container = document.getElementById('confetti');
  container.innerHTML = '';
  const colors = ['#c0392b', '#e67e22', '#f39c12', '#e8eaf0', '#ff4d2e', '#2ecc71'];
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = Math.random() * 12 + 5;
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      top: -20px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --fall-dur: ${Math.random() * 2 + 2}s;
      animation-delay: ${Math.random() * 3}s;
      width: ${size}px;
      height: ${size}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    container.appendChild(piece);
  }
}

// ---- PHASE 6: REALITY CHECK ----
function startReality() {
  document.getElementById('realityLoading').style.display = 'block';
  document.getElementById('errorBox').style.display = 'none';
  document.getElementById('realityBar').style.width = '0%';

  // init crying Phaser scene
  initCryingScene();

  const statuses = [
    'Checking oxygen levels...',
    'Verifying atmospheric pressure...',
    'Consulting NASA database...',
    'Cross-referencing with physics...',
    'Comparing to actual reality...',
    'ERROR DETECTED...',
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i < statuses.length) {
      document.getElementById('realityStatus').textContent = statuses[i];
      document.getElementById('realityBar').style.width = ((i + 1) / statuses.length * 100) + '%';
      SFX.loading();
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        document.getElementById('realityLoading').style.display = 'none';
        document.getElementById('errorBox').style.display = 'block';
        SFX.error();
        setTimeout(() => SFX.cry(), 900);

        // scanlines effect
        const sl = document.createElement('div');
        sl.className = 'scanlines show';
        document.body.appendChild(sl);
      }, 700);
    }
  }, 950);
}
