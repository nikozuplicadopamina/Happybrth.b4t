const MediaPlayerApp = {
  create: () => {
    const audio = new Audio("NOESCUCHASNIESCUCHO.mp3");
    audio.loop = true;
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