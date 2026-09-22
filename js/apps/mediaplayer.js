const Showtime = (() => {
  const START = 121; // 2:01
  const FINAL = 169; // 2:49
  const BPM = 81;
  const BEAT = 60 / BPM;

  const PHRASES = [
    "espero que hayas leido la carta",
    "sino puedes volver a entrar aqui",
    "perdon por este regalo tan miserable JAJAJA",
    "perdon por tan poco y gracias por tanto isita",
    "realmente te prometo más adelante algo mejor",
    "por lo pronto seguiré deseando un abrazo tuyo",
    "te amo demasiado isita no lo dudes",
    "pronto, pero muy pronto t lo juro q nos veremos",
  ];
  const FINAL_TEXT = "feliz cumple isita <3";

  const WARM = ["#006a6a", "#6b122d", "#751a35", "#570b22"];

  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const RGB = WARM.map(hex);
  const lerp = (a, b, f) => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * f));

  const phraseAt = (t) => {
    if (t >= FINAL) return FINAL_TEXT;
    if (t < START) return "";
    const span = FINAL - START;
    const n = PHRASES.length;
    const idx = Math.min(n - 1, Math.floor(((t - START) / span) * n));
    return PHRASES[idx];
  };

  let started = false;
  let overlay = null;
  let raf = 0;
  let last = null;
  let anim = null;
  const TYPE_MS = 18;

  const start = (audio) => {
    if (started) return;
    started = true;
    document.body.classList.add("clean");
    overlay = document.createElement("div");
    overlay.id = "showtext";
    document.body.appendChild(overlay);
    overlay.classList.add("show");

    const desk = document.getElementById("desktop");

    const frame = (now) => {
      const t = audio.currentTime;

      const ph = phraseAt(t);
      if (ph !== last) {
        last = ph;
        if (ph === FINAL_TEXT) {
          anim = null;
          overlay.textContent = ph;
        } else {
          anim = { goal: ph, old: overlay.textContent, len: overlay.textContent.length, erase: true, next: now };
        }
      }

      if (anim && now >= anim.next) {
        if (anim.erase) {
          if (anim.len > 0) {
            anim.len -= 1;
            anim.next = now + TYPE_MS;
          } else {
            anim.erase = false;
            anim.next = now;
          }
          overlay.textContent = anim.old.slice(0, anim.len);
        } else {
          anim.len += 1;
          anim.next = now + TYPE_MS;
          if (anim.len >= anim.goal.length) {
            overlay.textContent = anim.goal;
            anim = null;
          } else {
            overlay.textContent = anim.goal.slice(0, anim.len);
          }
        }
      }

      if (desk && t > START) {
        const beats = Math.max(0, (t - START) / BEAT);
        const idx = Math.floor(beats) % RGB.length;
        const nxt = (idx + 1) % RGB.length;
        const f = beats - Math.floor(beats);
        const c = lerp(RGB[idx], RGB[nxt], f);
        desk.style.background = "rgb(" + c.join(",") + ")";
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  };

  return { start, START, active: () => started };
})();

const MediaPlayerApp = {
  create: () => {
    const audio = new Audio("NOESCUCHASNIESCUCHO.mp3");
    audio.loop = false;
    let actx = null;
    let analyser = null;
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      const src = actx.createMediaElementSource(audio);
      src.connect(analyser);
      analyser.connect(actx.destination);
    } catch (e) { analyser = null; }

    return WM.create({
    title: "Media Player",
    icon: ICONS.music,
    width: 420,
    height: 300,
    body: (body, win) => {
      body.innerHTML = `
        <div class="mp-head">
          <div class="mp-art"><img src="img/cover.jpg" alt=""></div>
          <div class="mp-meta">
            <div><span>Canción:</span> NOESCUCHASNIESCUCHO</div>
            <div><span>Banda:</span> Nsqk</div>
            <div><span>Álbum:</span> Sin información</div>
            <div><span>Año:</span> 2023</div>
            <div><span>Duración:</span> <span class="mp-time2">0:00</span></div>
          </div>
        </div>
        <div class="mp-vis"></div>
        <div class="mp-disp">NOESCUCHASNIESCUCHO.mp3</div>
        <div class="mp-progress"><div class="mp-fill"></div></div>
        <div class="mp-time">0:00 / 0:00</div>
        <div class="field-row">
          <button id="mp-play" class="mp-btn">Reproducir</button>
          <button id="mp-pause" class="mp-btn">Pausa</button>
          <button id="mp-stop" class="mp-btn">Detener</button>
        </div>
        <div class="mp-hint"></div>`;

      const btnPlay = body.querySelector("#mp-play");
      const btnPause = body.querySelector("#mp-pause");
      const btnStop = body.querySelector("#mp-stop");
      const fill = body.querySelector(".mp-fill");
      const timeEl = body.querySelector(".mp-time");
      const time2El = body.querySelector(".mp-time2");
      const hint = body.querySelector(".mp-hint");
      const vis = body.querySelector(".mp-vis");

      const fmt = (s) => {
        const m = Math.floor(s / 60);
        const ss = Math.floor(s % 60);
        return m + ":" + String(ss).padStart(2, "0");
      };

      audio.addEventListener("loadedmetadata", () => {
        time2El.textContent = fmt(audio.duration || 0);
      });
      audio.addEventListener("timeupdate", () => {
        fill.style.width = (audio.duration ? (audio.currentTime / audio.duration) * 100 : 0) + "%";
        timeEl.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration || 0);
        if (!Showtime.active() && audio.currentTime >= Showtime.START) Showtime.start(audio);
      });
      audio.addEventListener("play", () => hint.textContent = "");
      audio.addEventListener("error", () => hint.textContent = "No se pudo cargar el archivo de audio.");

      btnPlay.addEventListener("click", () => {
        if (actx && actx.state === "suspended") actx.resume();
        audio.play().catch(() => hint.textContent = "Autoplay bloqueado por el navegador. Hacé clic en Reproducir.");
      });
      btnPause.addEventListener("click", () => audio.pause());
      btnStop.addEventListener("click", () => { audio.pause(); audio.currentTime = 0; });

      const bars = [];
      for (let i = 0; i < 24; i++) {
        const b = document.createElement("div");
        b.className = "mp-bar";
        vis.appendChild(b);
        bars.push(b);
      }
      const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
      function draw() {
        if (analyser && data) {
          analyser.getByteFrequencyData(data);
          for (let i = 0; i < bars.length; i++) {
            const idx = Math.min(data.length - 1, Math.round(Math.pow((i + 1) / bars.length, 1.5) * (data.length - 1)));
            const h = audio.paused ? 4 : Math.max(4, (data[idx] / 255) * 38);
            bars[i].style.height = h + "px";
          }
        }
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);

      audio.play().catch(() => hint.textContent = "Clic en Reproducir: el navegador bloqueó el autoplay.");
    },
    onClose: () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      if (actx) actx.close();
    },
    });
  },
};