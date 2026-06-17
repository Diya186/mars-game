/* ============ sounds.js ============
   Generates all sounds procedurally via Web Audio API.
   No sound files needed — everything is synthesized! */

const SFX = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function beep({ freq = 440, type = 'sine', duration = 0.15, vol = 0.3, delay = 0 } = {}) {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    gain.gain.setValueAtTime(vol, c.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration + 0.05);
  }

  function sweep({ startFreq, endFreq, type = 'sine', duration = 0.3, vol = 0.3 } = {}) {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + duration);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration + 0.05);
  }

  function noise(duration = 0.1, vol = 0.1) {
    const c = getCtx();
    const bufSize = c.sampleRate * duration;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    const gain = c.createGain();
    src.buffer = buf;
    src.connect(gain);
    gain.connect(c.destination);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    src.start();
  }

  return {
    // Phase transitions
    click()    { beep({ freq: 800, type: 'square', duration: 0.08, vol: 0.2 }); },
    submit()   { [440, 550, 660].forEach((f, i) => beep({ freq: f, duration: 0.12, delay: i * 0.08, vol: 0.25 })); },

    // Approval checks
    checkOk()  { sweep({ startFreq: 400, endFreq: 800, duration: 0.2, vol: 0.25 }); },
    checkFail(){ sweep({ startFreq: 600, endFreq: 200, type: 'sawtooth', duration: 0.3, vol: 0.2 }); },

    // Certificate
    fanfare()  {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => beep({ freq: f, duration: 0.25, delay: i * 0.15, vol: 0.3 }));
    },

    // Buy property
    buy()      {
      beep({ freq: 300, type: 'triangle', duration: 0.06, vol: 0.2 });
      beep({ freq: 600, type: 'triangle', duration: 0.12, delay: 0.06, vol: 0.3 });
    },

    // Wealth tick
    tick()     { beep({ freq: 1000, type: 'sine', duration: 0.04, vol: 0.05 }); },

    // Can't afford
    denied()   { sweep({ startFreq: 300, endFreq: 150, type: 'square', duration: 0.2, vol: 0.15 }); },

    // Event popup
    alert()    {
      beep({ freq: 880, type: 'square', duration: 0.1, vol: 0.2 });
      beep({ freq: 660, type: 'square', duration: 0.1, delay: 0.12, vol: 0.2 });
    },

    // Reward
    reward()   {
      [523, 784, 1047, 1318].forEach((f, i) =>
        beep({ freq: f, duration: 0.18, delay: i * 0.1, vol: 0.25 })
      );
    },

    // Endgame win
    victory()  {
      const melody = [523, 659, 784, 1047, 1319, 1047, 1319, 1568];
      melody.forEach((f, i) => beep({ freq: f, duration: 0.25, delay: i * 0.18, vol: 0.3, type: 'triangle' }));
    },

    // Reality check loading
    loading()  { beep({ freq: 200, type: 'sawtooth', duration: 0.5, vol: 0.1 }); },

    // Error / sad trombone
    error()    {
      sweep({ startFreq: 400, endFreq: 100, type: 'sawtooth', duration: 0.8, vol: 0.3 });
      beep({ freq: 80, type: 'sawtooth', duration: 0.5, delay: 0.8, vol: 0.25 });
    },

    // Crying sound
    cry()      {
      for (let i = 0; i < 5; i++) {
        const t = i * 0.3;
        sweep({ startFreq: 600 - i*40, endFreq: 300 - i*20, duration: 0.25, vol: 0.15, type: 'sine' });
      }
    },
  };
})();
