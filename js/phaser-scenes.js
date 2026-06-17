/* ============ phaser-scenes.js ============
   Phaser 3 scenes for:
   - StarfieldScene  (persistent background stars)
   - PlanetScene     (rotating Mars on landing page)
   - CryingScene     (animated crying Mansi on final page)
*/

// ---- STARFIELD (always running in background) ----
class StarfieldScene extends Phaser.Scene {
  constructor() { super({ key: 'StarfieldScene' }); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.stars = [];

    for (let i = 0; i < 180; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const size = Phaser.Math.FloatBetween(0.5, 2.5);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.8);
      const g = this.add.graphics();
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(x, y, size);
      this.stars.push({ g, baseAlpha: alpha, phase: Math.random() * Math.PI * 2 });
    }

    // occasional shooting star
    this.time.addEvent({
      delay: Phaser.Math.Between(4000, 10000),
      callback: this.shootingStar,
      callbackScope: this,
      loop: true,
    });
  }

  update(time) {
    this.stars.forEach(s => {
      const flicker = s.baseAlpha * (0.6 + 0.4 * Math.sin(time / 1200 + s.phase));
      s.g.setAlpha(flicker);
    });
  }

  shootingStar() {
    const W = this.scale.width;
    const H = this.scale.height;
    const x = Phaser.Math.Between(0, W * 0.6);
    const y = Phaser.Math.Between(0, H * 0.4);
    const line = this.add.graphics();
    line.lineStyle(1.5, 0xffffff, 0.9);
    line.beginPath();
    line.moveTo(x, y);
    line.lineTo(x + 80, y + 40);
    line.strokePath();
    this.tweens.add({
      targets: line,
      alpha: 0,
      x: 120,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => line.destroy(),
    });
  }
}

// ---- PLANET SCENE ----
class PlanetScene extends Phaser.Scene {
  constructor() { super({ key: 'PlanetScene' }); }

  create() {
    const cx = 110, cy = 110, r = 90;

    // glow
    const glow = this.add.graphics();
    for (let i = 30; i > 0; i--) {
      glow.fillStyle(0xc0392b, i / 300);
      glow.fillCircle(cx, cy, r + i * 1.5);
    }

    // planet body gradient (concentric circles approximation)
    const planet = this.add.graphics();
    const colors = [0xe8623a, 0xd4522a, 0xc0392b, 0xa02020, 0x7b1a0a, 0x3d0a04];
    colors.forEach((col, i) => {
      planet.fillStyle(col, 1);
      planet.fillCircle(cx - 10 + i * 2, cy - 10 + i * 2, r - i * 12);
    });

    // dark side shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.35);
    shadow.fillEllipse(cx + 25, cy + 20, r * 1.4, r * 1.6);

    // craters
    const craters = [
      { x: cx - 30, y: cy - 20, r: 12 },
      { x: cx + 20, y: cy + 25, r: 8 },
      { x: cx - 10, y: cy + 35, r: 6 },
      { x: cx + 35, y: cy - 15, r: 5 },
    ];
    craters.forEach(c => {
      planet.fillStyle(0x000000, 0.18);
      planet.fillCircle(c.x, c.y, c.r);
    });

    // highlight
    const hl = this.add.graphics();
    hl.fillStyle(0xffa070, 0.22);
    hl.fillEllipse(cx - 28, cy - 28, 45, 35);

    // atmosphere ring
    const atmo = this.add.graphics();
    atmo.lineStyle(3, 0xff6030, 0.12);
    atmo.strokeCircle(cx, cy, r + 4);

    // slow rotation shimmer via tween on glow alpha
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.7, to: 1 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // tiny orbiting dot (moon-ish)
    const moon = this.add.graphics();
    moon.fillStyle(0xaabbcc, 0.7);
    moon.fillCircle(0, 0, 4);

    let angle = 0;
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        angle += 0.02;
        moon.setPosition(cx + Math.cos(angle) * (r + 22), cy + Math.sin(angle) * (r + 22) * 0.4);
      },
    });
  }
}

// ---- CRYING SCENE ----
class CryingScene extends Phaser.Scene {
  constructor() { super({ key: 'CryingScene' }); }

  create() {
    const cx = 100, cy = 70;

    // Head (circle)
    const head = this.add.graphics();
    head.fillStyle(0xf5cba7, 1);
    head.fillCircle(cx, cy, 38);

    // Hair (dark)
    head.fillStyle(0x1a0a00, 1);
    head.fillEllipse(cx, cy - 28, 82, 42);
    // curly hair hint
    for (let i = -3; i <= 3; i++) {
      head.fillCircle(cx + i * 10, cy - 38 + Math.abs(i) * 3, 8);
    }

    // Eyes — sad / squinting
    const eyes = this.add.graphics();
    this.drawSadEyes(eyes, cx, cy);

    // Tears
    this.tears = [];
    for (let i = 0; i < 4; i++) {
      const t = this.add.graphics();
      t.fillStyle(0x5dade2, 0.85);
      t.fillEllipse(0, 0, 6, 10);
      const side = i % 2 === 0 ? -1 : 1;
      t.setPosition(cx + side * 18, cy + 15);
      this.tears.push({ g: t, side, offset: i * 0.3 });
    }

    // Body (black dress hint)
    const body = this.add.graphics();
    body.fillStyle(0x111111, 1);
    body.fillTriangle(cx - 30, cy + 38, cx + 30, cy + 38, cx - 40, cy + 110);
    body.fillTriangle(cx - 30, cy + 38, cx + 30, cy + 38, cx + 40, cy + 110);

    // Mouth — sad curve
    const mouth = this.add.graphics();
    mouth.lineStyle(3, 0x8B5E3C, 1);
    mouth.beginPath();
    mouth.arc(cx, cy + 22, 14, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340));
    mouth.strokePath();

    // Shake animation
    this.shakeTween = this.tweens.add({
      targets: [head, eyes, mouth, body],
      x: { from: -3, to: 3 },
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.time = 0;
  }

  drawSadEyes(g, cx, cy) {
    // sad eyebrows
    g.lineStyle(3, 0x1a0a00, 1);
    g.beginPath(); g.moveTo(cx - 22, cy - 14); g.lineTo(cx - 8, cy - 10); g.strokePath();
    g.beginPath(); g.moveTo(cx + 22, cy - 14); g.lineTo(cx + 8, cy - 10); g.strokePath();
    // eyes (closed sad lines)
    g.lineStyle(2.5, 0x333333, 1);
    g.beginPath(); g.arc(cx - 14, cy - 2, 7, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(180)); g.strokePath();
    g.beginPath(); g.arc(cx + 14, cy - 2, 7, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(180)); g.strokePath();
  }

  update(time) {
    // animate tears falling
    this.tears.forEach(t => {
      const cycle = ((time / 800 + t.offset) % 1);
      t.g.setPosition(t.g.x, 85 + cycle * 60);
      t.g.setAlpha(cycle < 0.8 ? 1 : 1 - (cycle - 0.8) / 0.2);
    });
  }
}

// ---- BOOT: create all Phaser games ----
function initPhaser() {
  // Background starfield (full page)
  new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: true,
    parent: 'star-canvas',
    scene: [StarfieldScene],
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    audio: { noAudio: true },
  });

  // Mars planet on landing page
  window.planetGame = new Phaser.Game({
    type: Phaser.AUTO,
    width: 220,
    height: 220,
    transparent: true,
    parent: 'phaser-planet',
    scene: [PlanetScene],
    audio: { noAudio: true },
  });
}

// Crying scene is created on demand
function initCryingScene() {
  const container = document.getElementById('cryingScene');
  if (!container || container.dataset.init) return;
  container.dataset.init = '1';

  new Phaser.Game({
    type: Phaser.AUTO,
    width: 200,
    height: 160,
    transparent: true,
    parent: 'cryingScene',
    scene: [CryingScene],
    audio: { noAudio: true },
  });
}

document.addEventListener('DOMContentLoaded', initPhaser);
