/* ============ phaser-scenes.js ============
   Phaser 3 scenes:
   - StarfieldScene  (persistent bg)
   - PlanetScene     (landing page)
   - CharacterScene  (Mansi + Harsh animated pixel sprites)
   - CryingScene     (final page)
*/

// ---- STARFIELD ----
class StarfieldScene extends Phaser.Scene {
  constructor() { super({ key: 'StarfieldScene' }); }
  create() {
    const W = this.scale.width, H = this.scale.height;
    this.stars = [];
    for (let i = 0; i < 200; i++) {
      const size = Phaser.Math.FloatBetween(0.5, 2.5);
      const g = this.add.graphics();
      g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.2, 0.9));
      g.fillCircle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        size
      );
      this.stars.push({ g, phase: Math.random() * Math.PI * 2 });
    }
    this.time.addEvent({ delay: Phaser.Math.Between(3000, 8000), callback: this.shootingStar, callbackScope: this, loop: true });
  }
  update(time) {
    this.stars.forEach(s => {
      s.g.setAlpha(0.3 + 0.7 * Math.abs(Math.sin(time / 1500 + s.phase)));
    });
  }
  shootingStar() {
    const x = Phaser.Math.Between(0, this.scale.width * 0.7);
    const y = Phaser.Math.Between(0, this.scale.height * 0.4);
    const line = this.add.graphics();
    line.lineStyle(1.5, 0xffffff, 0.9);
    line.beginPath(); line.moveTo(x, y); line.lineTo(x + 90, y + 45); line.strokePath();
    this.tweens.add({ targets: line, alpha: 0, x: 100, duration: 500, ease: 'Quad.easeOut', onComplete: () => line.destroy() });
  }
}

// ---- PLANET SCENE ----
class PlanetScene extends Phaser.Scene {
  constructor() { super({ key: 'PlanetScene' }); }
  preload() {}
  create() {
    const cx = 110, cy = 110, r = 90;
    // glow rings
    for (let i = 25; i > 0; i--) {
      const g = this.add.graphics();
      g.fillStyle(0xc0392b, i / 280);
      g.fillCircle(cx, cy, r + i * 1.6);
    }
    // planet body
    const planet = this.add.graphics();
    [[0xe8623a,r],[0xd4522a,r-10],[0xc0392b,r-22],[0xa02020,r-38],[0x7b1a0a,r-56],[0x3d0a04,r-72]].forEach(([col, rad]) => {
      planet.fillStyle(col, 1);
      planet.fillCircle(cx - (r-rad)*0.15, cy - (r-rad)*0.15, rad);
    });
    // shadow
    planet.fillStyle(0x000000, 0.32);
    planet.fillEllipse(cx + 28, cy + 22, r * 1.3, r * 1.5);
    // craters
    [[cx-32,cy-18,11],[cx+22,cy+28,7],[cx-8,cy+38,5],[cx+38,cy-12,5]].forEach(([x,y,r2]) => {
      planet.fillStyle(0x000000, 0.2);
      planet.fillCircle(x, y, r2);
    });
    // highlight
    const hl = this.add.graphics();
    hl.fillStyle(0xffa070, 0.2);
    hl.fillEllipse(cx - 30, cy - 30, 48, 36);
    // atmosphere
    const atmo = this.add.graphics();
    atmo.lineStyle(3, 0xff6030, 0.1);
    atmo.strokeCircle(cx, cy, r + 5);
    // orbiting moon
    const moon = this.add.graphics();
    moon.fillStyle(0xaabbcc, 0.75);
    moon.fillCircle(0, 0, 4);
    let angle = 0;
    this.time.addEvent({ delay: 16, loop: true, callback: () => {
      angle += 0.018;
      moon.setPosition(cx + Math.cos(angle) * (r + 24), cy + Math.sin(angle) * (r + 24) * 0.4);
    }});
    // pulse glow
    const glowG = this.add.graphics();
    glowG.fillStyle(0xc0392b, 0.08);
    glowG.fillCircle(cx, cy, r + 20);
    this.tweens.add({ targets: glowG, alpha: { from: 0.5, to: 1 }, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}

// ---- CHARACTER SCENE ----
class CharacterScene extends Phaser.Scene {
  constructor() { super({ key: 'CharacterScene' }); }

  preload() {
    this.load.image('mansi', 'assets/images/mansi.png');
    this.load.image('harsh', 'assets/images/harsh.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // MANSI — bottom right
    this.mansiSprite = this.add.image(W - 60, H - 10, 'mansi');
    this.mansiSprite.setOrigin(0.5, 1);
    this.mansiSprite.setScale(0.32);
    this.mansiSprite.setAlpha(0);

    // HARSH — further right, hidden initially
    this.harshSprite = this.add.image(W + 80, H - 10, 'harsh');
    this.harshSprite.setOrigin(0.5, 1);
    this.harshSprite.setScale(0.28);
    this.harshSprite.setAlpha(0);

    // float Mansi in
    this.tweens.add({
      targets: this.mansiSprite,
      alpha: 1,
      y: H - 10,
      duration: 600,
      ease: 'Back.easeOut',
    });

    // idle float loop for Mansi
    this.mansiFloat = this.tweens.add({
      targets: this.mansiSprite,
      y: { from: H - 10, to: H - 22 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // expose animation functions globally
    window.animateMansi = (type) => this.playMansiAnim(type);
    window.showHarshChar = () => this.showHarsh();
    window.hideChars = () => { this.mansiSprite.setAlpha(0); this.harshSprite.setAlpha(0); };
    window.showCryingMansi = () => this.playCryAnim();
  }

  playMansiAnim(type) {
    const H = this.scale.height;
    const sprite = this.mansiSprite;
    // stop idle float temporarily
    if (this.mansiFloat) this.mansiFloat.pause();

    if (type === 'bounce') {
      this.tweens.add({
        targets: sprite,
        y: { from: H - 10, to: H - 60 },
        scaleY: { from: 0.32, to: 0.35 },
        duration: 200,
        yoyo: true,
        repeat: 2,
        ease: 'Quad.easeOut',
        onComplete: () => { sprite.setScale(0.32); this.mansiFloat && this.mansiFloat.resume(); },
      });
    } else if (type === 'shake') {
      this.tweens.add({
        targets: sprite,
        x: { from: this.scale.width - 60, to: this.scale.width - 45 },
        duration: 60,
        yoyo: true,
        repeat: 5,
        ease: 'Sine.easeInOut',
        onComplete: () => { sprite.setX(this.scale.width - 60); this.mansiFloat && this.mansiFloat.resume(); },
      });
    } else if (type === 'spin') {
      this.tweens.add({
        targets: sprite,
        angle: { from: 0, to: 360 },
        y: { from: H - 10, to: H - 80 },
        scale: { from: 0.32, to: 0.38 },
        duration: 600,
        ease: 'Back.easeOut',
        onComplete: () => {
          sprite.setAngle(0);
          sprite.setScale(0.32);
          sprite.setY(H - 10);
          this.mansiFloat && this.mansiFloat.resume();
        },
      });
    }
  }

  showHarsh() {
    const H = this.scale.height;
    const W = this.scale.width;
    this.harshSprite.setX(W + 80);
    this.tweens.add({
      targets: this.harshSprite,
      x: W - 130,
      alpha: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });
    // idle float for Harsh
    this.tweens.add({
      targets: this.harshSprite,
      y: { from: H - 10, to: H - 20 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    // hide after 5s
    setTimeout(() => {
      this.tweens.add({
        targets: this.harshSprite,
        x: W + 100,
        alpha: 0,
        duration: 500,
        ease: 'Quad.easeIn',
      });
    }, 5000);
  }

  playCryAnim() {
    const sprite = this.mansiSprite;
    if (this.mansiFloat) this.mansiFloat.stop();
    // droop down sadly
    this.tweens.add({
      targets: sprite,
      y: this.scale.height + 20,
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // bring back crying version
        sprite.setY(this.scale.height - 10);
        this.tweens.add({
          targets: sprite,
          alpha: 1,
          duration: 400,
          ease: 'Quad.easeOut',
        });
        // shake cry loop
        this.tweens.add({
          targets: sprite,
          angle: { from: -5, to: 5 },
          duration: 200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });
  }
}

// ---- CRYING OVERLAY SCENE ----
class CryingScene extends Phaser.Scene {
  constructor() { super({ key: 'CryingScene' }); }
  preload() { this.load.image('mansi', 'assets/images/mansi.png'); }
  create() {
    const cx = 100, cy = 150;
    const sprite = this.add.image(cx, cy, 'mansi');
    sprite.setScale(0.22);
    sprite.setOrigin(0.5, 1);

    // shake
    this.tweens.add({
      targets: sprite,
      angle: { from: -6, to: 6 },
      duration: 180,
      yoyo: true,
      repeat: -1,
    });

    // animated tears (blue circles falling)
    this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        [-18, 18].forEach(xOff => {
          const tear = this.add.graphics();
          tear.fillStyle(0x5dade2, 0.9);
          tear.fillEllipse(0, 0, 7, 11);
          tear.setPosition(cx + xOff, cy - 110);
          this.tweens.add({
            targets: tear,
            y: cy - 70,
            alpha: 0,
            duration: 600,
            ease: 'Quad.easeIn',
            onComplete: () => tear.destroy(),
          });
        });
      },
    });
  }
}

// ---- INIT ----
function initPhaser() {
  // starfield background
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

  // planet on landing
  new Phaser.Game({
    type: Phaser.AUTO,
    width: 220, height: 220,
    transparent: true,
    parent: 'phaser-planet',
    scene: [PlanetScene],
    audio: { noAudio: true },
  });
}

// character game initialized when phase 4 starts
function initCharacterScene() {
  const container = document.getElementById('charCanvas');
  if (!container || container.dataset.init) return;
  container.dataset.init = '1';

  new Phaser.Game({
    type: Phaser.AUTO,
    width: 280,
    height: window.innerHeight,
    transparent: true,
    parent: 'charCanvas',
    scene: [CharacterScene],
    audio: { noAudio: true },
  });
}

function initCryingScene() {
  const container = document.getElementById('cryingScene');
  if (!container || container.dataset.init) return;
  container.dataset.init = '1';
  new Phaser.Game({
    type: Phaser.AUTO,
    width: 200, height: 160,
    transparent: true,
    parent: 'cryingScene',
    scene: [CryingScene],
    audio: { noAudio: true },
  });
}

document.addEventListener('DOMContentLoaded', initPhaser);
