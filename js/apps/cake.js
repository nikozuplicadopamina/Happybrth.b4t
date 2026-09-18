let _micRef = null;

const CakeApp = {
  create: (opts = {}) => {
    const burnMs = (opts.burnSeconds || 15) * 1000;
    let raf = 0;
    let start = null;
    let actx = null;
    let crashed = false;
    let micStream = null;
    let micSourceNode = null;
    let micAnalyser = null;
    let micLevel = null;
    let blowSince = null;
    let micStarted = false;
    let micFailed = false;
    let micFloor = null;
    let lastResumeTry = 0;

    return WM.create({
      title: "Pastel de Cumpleaños",
      icon: ICONS.cake,
      width: 420,
      height: 360,
      body: (body) => {
        body.innerHTML = `
          <div class="cake-stage"><canvas></canvas></div>
          <div class="field-row">
            <button id="cake-light" class="mp-btn">Encender</button>
          </div>
          <div class="cam-hint"></div>`;

        const stage = body.querySelector(".cake-stage");
        const canvas = stage.querySelector("canvas");
        const hint = body.querySelector(".cam-hint");
        const btnLight = body.querySelector("#cake-light");
        const ctx = canvas.getContext("2d");

        const W = 400;
        const H = 280;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const rnd = (i) => { const s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); };
        const shade = (hex, f) => {
          const n = parseInt(hex.slice(1), 16);
          const r = Math.min(255, Math.round((((n >> 16) & 255) / 255) * f * 255));
          const g = Math.min(255, Math.round((((n >> 8) & 255) / 255) * f * 255));
          const b = Math.min(255, Math.round(((n & 255) / 255) * f * 255));
          return "rgb(" + r + "," + g + "," + b + ")";
        };
        const PAL = (typeof RAINBOW_COLORS !== "undefined") ? RAINBOW_COLORS : ["#660d28", "#7d1534", "#7d1534", "#8a1e3e", "#660d28", "#7d1534", "#660d28"];
        const litColor = (base, d) => shade(base, 0.42 + 0.72 * Math.max(0.1, d));

        const L = (() => {
          const d = Math.sqrt(0.6 * 0.6 + 0.8 * 0.8 + 0.4 * 0.4);
          return { x: 0.6 / d, y: 0.8 / d, z: 0.4 / d };
        })();

        const verts = [];
        const faces = [];
        const V = (x, y, z) => { const i = verts.length; verts.push({ x, y, z }); return i; };

        const addPrism = (x0, z0, y0, h, r, n, side, topCol, edge = null, topEdge = null) => {
          const top = [];
          const bot = [];
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            top.push(V(x0 + Math.cos(a) * r, y0 + h, z0 + Math.sin(a) * r));
            bot.push(V(x0 + Math.cos(a) * r, y0, z0 + Math.sin(a) * r));
          }
          for (let i = 0; i < n; i++) {
            const a = ((i + 0.5) / n) * Math.PI * 2;
            const f = { v: [top[i], top[(i + 1) % n], bot[(i + 1) % n], bot[i]], c: side(i, a), e: null };
            if (edge) f.e = edge[i % edge.length];
            faces.push(f);
          }
          const tf = { v: top, c: shade(topCol, 1.3), e: topEdge || null };
          faces.push(tf);
          return { top, topY: y0 + h };
        };

        const hB = 62, hT = 50, rB = 140, rT = 100, hC = 52;

        addPrism(0, 0, 0, hB, rB, 14,
          (i, a) => {
            const d = Math.max(0, Math.cos(a) * L.x + Math.sin(a) * L.z);
            return litColor(PAL[1], d);
          },
          "#7d1534");

        addPrism(0, 0, hB, hT, rT, 12,
          (i, a) => {
            const d = Math.max(0, Math.cos(a) * L.x + Math.sin(a) * L.z);
            return litColor(PAL[3], d);
          },
          "#8a1e3e");

        const candTop = hB + hT + hC;
        const cand = addPrism(0, 0, hB + hT, hC, 8, 10,
          (i, a) => "#000000",
          "#000000",
          PAL,
          PAL[3]);

        const wick = [V(-1.2, candTop, 0), V(1.2, candTop, 0), V(1.2, candTop + 7, 0), V(-1.2, candTop + 7, 0)];
        faces.push({ v: [wick[1], wick[0], wick[2], wick[3]], c: "#222222", e: null });
        faces.push({ v: [wick[3], wick[2], wick[1], wick[0]], c: "#222222", e: null });

        const addSprinkle = (x0, z0, y0, col) => {
          addPrism(x0, z0, y0, 7, 3, 6,
            (i, a) => {
              const d = Math.max(0, Math.cos(a) * L.x + Math.sin(a) * L.z);
              return litColor(col, d);
            },
            col);
        };
        for (let i = 0; i < 26; i++) {
          const a = rnd(i + 1) * Math.PI * 2;
          const rr = 12 + rnd(i + 50) * 92;
          addSprinkle(Math.cos(a) * rr, Math.sin(a) * rr, hB, PAL[i % PAL.length]);
        }
        for (let i = 26; i < 40; i++) {
          const a = rnd(i + 1) * Math.PI * 2;
          const rr = 8 + rnd(i + 50) * 64;
          addSprinkle(Math.cos(a) * rr, Math.sin(a) * rr, hB + hT, PAL[i % PAL.length]);
        }

        const eye = { x: 0, y: 330, z: 440 };
        const target = { x: 0, y: 80, z: 0 };
        const up = { x: 0, y: 1, z: 0 };
        let fwd = { x: target.x - eye.x, y: target.y - eye.y, z: target.z - eye.z };
        const fl = Math.sqrt(fwd.x * fwd.x + fwd.y * fwd.y + fwd.z * fwd.z);
        fwd = { x: fwd.x / fl, y: fwd.y / fl, z: fwd.z / fl };
        let right = {
          x: fwd.y * up.z - fwd.z * up.y,
          y: fwd.z * up.x - fwd.x * up.z,
          z: fwd.x * up.y - fwd.y * up.x,
        };
        const rl = Math.sqrt(right.x * right.x + right.y * right.y + right.z * right.z);
        right = { x: right.x / rl, y: right.y / rl, z: right.z / rl };
        const tru = {
          x: right.y * fwd.z - right.z * fwd.y,
          y: right.z * fwd.x - right.x * fwd.z,
          z: right.x * fwd.y - right.y * fwd.x,
        };
        const focal = 500;
        const cx2 = W / 2;
        const cy2 = H / 2;

        const project = (p) => {
          const rx = p.x - eye.x;
          const ry = p.y - eye.y;
          const rz = p.z - eye.z;
          const depth = rx * fwd.x + ry * fwd.y + rz * fwd.z;
          const c = rx * right.x + ry * right.y + rz * right.z;
          const r = rx * tru.x + ry * tru.y + rz * tru.z;
          const s = (focal / depth) * 0.8;
          return { x: cx2 + c * s, y: cy2 - r * s, d: depth, s, c, r };
        };

        const shards = faces.map((f, i) => {
          let cx = 0, cy = 0, cz = 0;
          for (const vi of f.v) { cx += verts[vi].x; cy += verts[vi].y; cz += verts[vi].z; }
          const n = f.v.length;
          cx /= n; cy /= n; cz /= n;
          const dh = Math.hypot(cx, cz) || 1;
          let dx = cx / dh, dz = cz / dh;
          let dy = 0;
          if (cy > 0) { dy = 0.18 + rnd(i + 400) * 0.3; dx *= 1; dz *= 1; }
          let dd = Math.hypot(dx, dy, dz) + 0.001;
          const ax = (rnd(i + 500) - 0.5) * 0.6 + dz, ay = (rnd(i + 600) - 0.5) * 0.6, az = (rnd(i + 700) - 0.5) * 0.6 - dx;
          let al = Math.hypot(ax, ay, az) || 1;
          return { c: [cx, cy, cz], d: [dx / dd, dy / dd, dz / dd], spin: 4 + rnd(i + 800) * 10, ax: [ax / al, ay / al, az / al], lin: 60 + rnd(i + 900) * 220, col: f.c, ed: f.e };
        });

        const shells = [];
        const flakes = [];
        for (let i = 0; i < 120; i++) {
          flakes.push({
            x: Math.random() * W,
            y: -20 - Math.random() * 60,
            spd: 18 + Math.random() * 55,
            sw: 1.5 + Math.random() * 2.5,
            ph: Math.random() * Math.PI * 2,
            rot: Math.random() * Math.PI * 2,
            rv: (Math.random() - 0.5) * 6,
            w: 3 + Math.random() * 3,
            h: 1.5 + Math.random() * 2,
            c: PAL[Math.floor(Math.random() * PAL.length)],
          });
        }

        const drawScreenFace = (pts3d, color) => {
          const q = pts3d.map(project);
          ctx.beginPath();
          ctx.moveTo(q[0].x, q[0].y);
          for (let i = 1; i < q.length; i++) ctx.lineTo(q[i].x, q[i].y);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.35)";
          ctx.lineWidth = 1;
          ctx.stroke();
        };

        const flame = (fx, fy, fz, fh, sx) => {
          const base = [
            { x: fx, y: fy, z: fz + sx * 0.45 },
            { x: fx + sx, y: fy, z: fz },
            { x: fx, y: fy, z: fz - sx * 0.45 },
            { x: fx - sx, y: fy, z: fz },
          ];
          const tip = { x: fx, y: fy + fh, z: fz };
          const b2 = [
            { x: fx, y: fy + 2, z: fz + sx * 0.25 },
            { x: fx + sx * 0.55, y: fy + 2, z: fz },
            { x: fx, y: fy + 2, z: fz - sx * 0.25 },
            { x: fx - sx * 0.55, y: fy + 2, z: fz },
          ];
          const t2 = { x: fx, y: fy + 2 + fh * 0.55, z: fz };
          for (let j = 0; j < 4; j++) {
            ctx.fillStyle = (j % 2 === 0) ? "#cf2d5d" : "#a8304f";
            drawScreenFace([base[j], base[(j + 1) % 4], tip], ctx.fillStyle);
            drawScreenFace([b2[j], b2[(j + 1) % 4], t2], "#ffc2cf");
          }
        };

        const confetti = () => {
          if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
          if (actx.state === "suspended") actx.resume();
          const t0 = actx.currentTime;

          const mkNoise = (sec) => {
            const len = Math.floor(actx.sampleRate * sec);
            const buf = actx.createBuffer(1, len, actx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
            return buf;
          };

          const master = actx.createGain();
          master.gain.setValueAtTime(0.6, t0);
          master.gain.exponentialRampToValueAtTime(0.001, t0 + 1.3);
          master.connect(actx.destination);

          const thump = actx.createBufferSource();
          thump.buffer = mkNoise(0.12);
          const lpf = actx.createBiquadFilter();
          lpf.type = "lowpass";
          lpf.frequency.value = 850;
          const tg = actx.createGain();
          tg.gain.setValueAtTime(0.7, t0);
          tg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
          thump.connect(lpf);
          lpf.connect(tg);
          tg.connect(master);
          thump.start(t0);

          const crackle = mkNoise(0.05);
          for (let i = 0; i < 34; i++) {
            const t = t0 + 0.05 + i * 0.033 + Math.random() * 0.02;
            const s = actx.createBufferSource();
            s.buffer = crackle;
            s.playbackRate.value = 0.9 + Math.random() * 2.6;
            const hp = actx.createBiquadFilter();
            hp.type = "highpass";
            hp.frequency.value = 2300 + Math.random() * 2000;
            const g = actx.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.22 + Math.random() * 0.16, t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
            const pan = actx.createStereoPanner();
            pan.pan.value = (Math.random() * 2 - 1) * 0.8;
            s.connect(hp);
            hp.connect(g);
            g.connect(pan);
            pan.connect(master);
            s.start(t);
            s.stop(t + 0.06);
          }
        };

        const startMic = () => {
          if (micStarted || micStream || micFailed) return;
          micStarted = true;
          const gum = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices) : null;
          if (!gum) { micFailed = true; return; }
          gum({
            audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
          }).then((stream) => {
            micStream = _micRef = stream;
            if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
            if (actx.state === "suspended") actx.resume();
            try {
              micSourceNode = actx.createMediaStreamSource(stream);
              micAnalyser = actx.createAnalyser();
              micAnalyser.fftSize = 512;
              micAnalyser.smoothingTimeConstant = 0.3;
              micSourceNode.connect(micAnalyser);
              micLevel = new Uint8Array(micAnalyser.fftSize);
            } catch (e) {
              micFailed = true;
            }
          }).catch(() => {
            micFailed = true;
            hint.textContent = "Sin micro... la vela se apaga sola";
          });
        };

        const light = () => {
          crashed = false;
          shells.length = 0;
          blowSince = null;
          micFloor = null;
          start = performance.now();
          if (actx && actx.state === "suspended") actx.resume();
          startMic();
          hint.textContent = "Apagá la vela!";
        };

        const draw = () => {
          const now = performance.now();
          const elapsed = now - start;
          const micOn = !!micAnalyser;
          const effElapsed = micOn ? Math.min(elapsed, burnMs - 1) : elapsed;
          const remaining = Math.max(0, 1 - effElapsed / burnMs);

          ctx.clearRect(0, 0, W, H);

          if (crashed) {
            const et = now - start - burnMs;
            const t = et / 1300;
            if (t < 1) {
              const tt = Math.max(0, t);
              if (tt < 0.09) {
                ctx.globalAlpha = 0.45 * (1 - tt / 0.09);
                ctx.fillStyle = "#ffd7dd";
                ctx.beginPath();
                ctx.arc(cx2, H / 2, 70 * (1 + tt), 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
              }
              for (let s = 0; s < shards.length; s++) {
                const sh = shards[s];
                const off = sh.lin * tt;
                const px = sh.c[0] + sh.d[0] * off;
                const py = sh.c[1] + sh.d[1] * off - 30 * tt * tt;
                const pz = sh.c[2] + sh.d[2] * off;
                const ang = sh.spin * tt;
                const k = sh.ax;
                const c = Math.cos(ang), sn = Math.sin(ang), dv = 1 - c;
                const q = faces[s].v.map((vi) => {
                  const v = verts[vi];
                  const rx = v.x - sh.c[0], ry = v.y - sh.c[1], rz = v.z - sh.c[2];
                  const nx = (k.x * k.x * dv + c) * rx + (k.x * k.y * dv - k.z * sn) * ry + (k.x * k.z * dv + k.y * sn) * rz;
                  const ny = (k.y * k.x * dv + k.z * sn) * rx + (k.y * k.y * dv + c) * ry + (k.y * k.z * dv - k.x * sn) * rz;
                  const nz = (k.z * k.x * dv - k.y * sn) * rx + (k.z * k.y * dv + k.x * sn) * ry + (k.z * k.z * dv + c) * rz;
                  return project({ x: nx + px, y: ny + py, z: nz + pz });
                });
                ctx.globalAlpha = 1 - tt * tt;
                ctx.beginPath();
                ctx.moveTo(q[0].x, q[0].y);
                for (let i = 1; i < q.length; i++) ctx.lineTo(q[i].x, q[i].y);
                ctx.closePath();
                ctx.fillStyle = sh.col;
                ctx.fill();
                ctx.strokeStyle = sh.ed || sh.col;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
              ctx.globalAlpha = 1;
            }

            if (et > 260 && et < 3400) {
              while (shells.length < Math.floor(et / 240)) {
                const born = start + burnMs + 260 + shells.length * 240;
                shells.push({
                  born,
                  x: cx2 + (rnd(shells.length + 7000) - 0.5) * 300,
                  ty: 42 + rnd(shells.length + 7100) * 96,
                  col: PAL[Math.floor(rnd(shells.length + 7200) * PAL.length)],
                  sparks: null,
                });
              }
            }
            for (const sh of shells) {
              const age = now - sh.born;
              if (age < 0) continue;
              if (age < 480) {
                const p = age / 480;
                const y = H - (H - sh.ty) * p;
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(sh.x - 1.5, y - 3, 3, 8);
                ctx.globalAlpha = 0.35;
                ctx.strokeStyle = sh.col;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(sh.x, y);
                ctx.lineTo(sh.x, y + (H - sh.ty) * (1 - p) * 0.6);
                ctx.stroke();
                ctx.globalAlpha = 1;
              } else {
                if (!sh.sparks) {
                  sh.sparks = [];
                  for (let i = 0; i < 30; i++) {
                    const a = (i / 30) * Math.PI * 2 + rnd(i + sh.born) * 0.35;
                    sh.sparks.push({
                      a,
                      sp: 60 + rnd(i + sh.born + 500) * 170,
                      l: 750 + rnd(i + sh.born + 900) * 550,
                      sz: 1.5 + rnd(i + sh.born + 1300) * 2.5,
                      c: rnd(i + sh.born + 1700) < 0.22 ? "#fff2f5" : sh.col,
                    });
                  }
                }
                const bt = age - 480;
                for (const s of sh.sparks) {
                  const lp = bt / s.l;
                  if (lp >= 1) continue;
                  const xx = sh.x + Math.cos(s.a) * s.sp * bt / 1000;
                  const yy = sh.ty + Math.sin(s.a) * s.sp * bt / 1000 + 0.42 * (bt / 1000) * (bt / 1000) * 100;
                  ctx.globalAlpha = 1 - lp;
                  ctx.fillStyle = s.c;
                  ctx.fillRect(xx - s.sz, yy - s.sz, s.sz * 2, s.sz * 2);
                }
                ctx.globalAlpha = 1;
              }
            }

            const ftt = et / 1000;
            for (const fk of flakes) {
              let yy = fk.y + fk.spd * ftt;
              yy = ((yy % (H + 40)) + H + 40) % (H + 40) - 30;
              const xx = fk.x + Math.sin(ftt * fk.sw + fk.ph) * 22;
              ctx.save();
              ctx.translate(xx, yy);
              ctx.rotate(fk.rot + fk.rv * ftt);
              ctx.globalAlpha = 0.85;
              ctx.fillStyle = fk.c;
              ctx.fillRect(-fk.w / 2, -fk.h / 2, fk.w, fk.h);
              ctx.restore();
            }
            ctx.globalAlpha = 1;

            if (et < 400) hint.textContent = "¡BUM!";
            else if (et < 3400) hint.textContent = "¡FELIZ CUMPLEAÑOS!";
            else hint.textContent = "enciende denuevo la vela si quieres :))";
          } else {
            const sorted = faces.map((f) => {
              let dsum = 0;
              const q = f.v.map((vi) => { const p = project(verts[vi]); dsum += p.d; return p; });
              return { q, d: dsum / f.v.length, c: f.c, e: f.e };
            });
            sorted.sort((A, B) => B.d - A.d);
            for (const f of sorted) {
              ctx.beginPath();
              ctx.moveTo(f.q[0].x, f.q[0].y);
              for (let i = 1; i < f.q.length; i++) ctx.lineTo(f.q[i].x, f.q[i].y);
              ctx.closePath();
              ctx.fillStyle = f.c;
              ctx.fill();
              ctx.strokeStyle = f.e || f.c;
              ctx.lineWidth = 1;
              ctx.stroke();
            }

            const wy = candTop + 7;
            if (remaining > 0) {
              const flick = 0.85 + 0.25 * Math.sin(now * 0.06) + (Math.random() - 0.5) * 0.25;
              const fh = remaining * 30 * Math.max(0.1, flick);
              const sx = fh * 0.4;
              const fx = (Math.random() - 0.5) * 2;
              const fy = wy - 1;
              const p = project({ x: fx, y: fy, z: 0 });
              const glowR = 22 * (focal / p.d) * 0.8;
              ctx.globalAlpha = 0.22;
              ctx.fillStyle = "#cf2d5d";
              ctx.beginPath();
              ctx.moveTo(p.x, p.y - glowR);
              ctx.lineTo(p.x + glowR * 0.6, p.y);
              ctx.lineTo(p.x, p.y + glowR);
              ctx.lineTo(p.x - glowR * 0.6, p.y);
              ctx.closePath();
              ctx.fill();
              ctx.globalAlpha = 1;
              flame(fx, fy, 0, fh, sx);

              const secs = Math.ceil((burnMs - effElapsed) / 1000);
              if (micOn) {
                if (micAnalyser && micLevel) {
                  if (actx && actx.state === "suspended" && now - lastResumeTry > 600) {
                    lastResumeTry = now;
                    actx.resume();
                  }
                  micAnalyser.getByteFrequencyData(micLevel);
                  const nb = Math.min(11, micLevel.length - 1);
                  let sum = 0;
                  for (let i = 1; i <= nb; i++) sum += micLevel[i];
                  const bass = sum / nb;
                  if (micFloor === null) micFloor = bass;
                  else micFloor = micFloor * 0.94 + bass * 0.06;
                  const goal = Math.max(58, micFloor + 30, micFloor * 1.7);
                  if (bass > goal) {
                    if (blowSince === null) blowSince = now;
                    if (now - blowSince > 180) {
                      crashed = true;
                      confetti();
                    }
                  } else {
                    blowSince = null;
                  }
                  const status = (actx && actx.state === "suspended") ? " (pulsá Encender si quedó 0)" : "";
                  hint.textContent = "Soplá la vela! (nivel " + Math.round(bass) + "/" + Math.round(goal) + ")" + status;
                }
              } else if (micFailed) {
                hint.textContent = "Sin micro: la vela se apaga en " + secs + "s...";
              } else {
                hint.textContent = "Pulsá Encender y soplá fuerte la vela";
              }
            } else {
              crashed = true;
              confetti();
              hint.textContent = "¡BUM!";
            }
          }

          ctx.fillStyle = "rgba(226,45,88,0.9)";
          ctx.font = "bold 11px 'Pixelated MS Sans Serif', monospace";
          ctx.textAlign = "center";
          ctx.fillText("FELIZ CUMPLEAÑOS <3", cx2, 20);

          raf = requestAnimationFrame(draw);
        };

        btnLight.addEventListener("click", light);
        light();
        raf = requestAnimationFrame(draw);
      },
      onClose: () => {
        cancelAnimationFrame(raf);
        if (micSourceNode && typeof micSourceNode.disconnect === "function") {
          micSourceNode.disconnect();
          micSourceNode = null;
        }
        if (_micRef) {
          _micRef.getTracks().forEach((tk) => tk.stop());
          _micRef = null;
          micStream = null;
        }
        micAnalyser = null;
        micLevel = null;
        if (actx && typeof actx.close === "function") actx.close();
      },
    });
  },
};
