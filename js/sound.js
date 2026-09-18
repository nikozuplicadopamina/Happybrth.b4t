const SysSound = (() => {
  let actx = null;

  const ensure = () => {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try { actx = new AC(); } catch (e) { return false; }
    }
    if (actx.state === "suspended") actx.resume();
    return true;
  };

  const click = () => {
    if (!ensure()) return;
    try {
      const t0 = actx.currentTime;
      const master = actx.createGain();
      master.gain.value = 0.8;
      master.connect(actx.destination);

      const o = actx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(1150, t0);
      o.frequency.exponentialRampToValueAtTime(460, t0 + 0.03);
      const og = actx.createGain();
      og.gain.setValueAtTime(0.0001, t0);
      og.gain.exponentialRampToValueAtTime(0.5, t0 + 0.004);
      og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
      o.connect(og);
      og.connect(master);
      o.start(t0);
      o.stop(t0 + 0.055);

      const len = Math.max(1, Math.floor(actx.sampleRate * 0.035));
      const buf = actx.createBuffer(1, len, actx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = actx.createBufferSource();
      src.buffer = buf;
      const f = actx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 1500;
      f.Q.value = 1.1;
      const g = actx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.45, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04);
      src.connect(f);
      f.connect(g);
      g.connect(master);
      src.start(t0);
    } catch (e) { /* silencio a prueba de fallos */ }
  };

  return { click, ensure };
})();