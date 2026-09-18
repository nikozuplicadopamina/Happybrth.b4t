const CameraApp = {
  create: () => {
    let stream = null;

    return WM.create({
      title: "Cámara",
      icon: ICONS.camera,
      width: 500,
      height: 380,
      body: (body) => {
        body.innerHTML = `
          <div class="cam-stage">
            <video autoplay playsinline muted></video>
            <canvas></canvas>
          </div>
          <div class="cam-tools">
            <button id="cam-brush" class="cam-tool active">Pincel</button>
            <button id="cam-eraser" class="cam-tool">Borrador</button>
            <div class="cam-colors"></div>
            <label class="cam-size">Grosor<input type="range" id="cam-size" min="1" max="16" value="4"></label>
          </div>
          <div class="cam-hint"></div>`;

        const video = body.querySelector("video");
        const canvas = body.querySelector("canvas");
        const stage = body.querySelector(".cam-stage");
        const hint = body.querySelector(".cam-hint");
        const btnBrush = body.querySelector("#cam-brush");
        const btnEraser = body.querySelector("#cam-eraser");
        const colorsEl = body.querySelector(".cam-colors");
        const sizeInput = body.querySelector("#cam-size");

        const PALETTE = ["#ffffff", "#000000", "#e11d48", "#7d1534", "#ff8c1a", "#ffd400", "#39d353", "#1a9cff", "#8a5cf6"];

        const ctx2 = canvas.getContext("2d");
        let color = PALETTE[0];
        let lineWidth = 4;
        let erasing = false;
        let drawing = false;
        let last = null;

        const syncSize = () => {
          const r = stage.getBoundingClientRect();
          canvas.width = Math.max(1, Math.round(r.width));
          canvas.height = Math.max(1, Math.round(r.height));
        };
        video.addEventListener("loadedmetadata", syncSize);
        syncSize();
        if (window.ResizeObserver) {
          const ro = new ResizeObserver(syncSize);
          ro.observe(stage);
        }

        const setTool = (eraser) => {
          erasing = eraser;
          btnBrush.classList.toggle("active", !eraser);
          btnEraser.classList.toggle("active", eraser);
        };
        btnBrush.addEventListener("click", () => setTool(false));
        btnEraser.addEventListener("click", () => setTool(true));

        for (const c of PALETTE) {
          const s = document.createElement("button");
          s.className = "cam-swatch";
          s.style.background = c;
          s.title = c;
          s.addEventListener("click", () => {
            color = c;
            setTool(false);
            colorsEl.querySelectorAll(".cam-swatch").forEach((el) => el.classList.remove("active"));
            s.classList.add("active");
          });
          colorsEl.appendChild(s);
        }
        colorsEl.querySelector(".cam-swatch").classList.add("active");

        sizeInput.addEventListener("input", () => { lineWidth = parseInt(sizeInput.value, 10); });

        const draw = (x, y) => {
          ctx2.globalCompositeOperation = erasing ? "destination-out" : "source-over";
          ctx2.strokeStyle = erasing ? "#000" : color;
          ctx2.lineWidth = erasing ? lineWidth * 3 : lineWidth;
          ctx2.lineCap = "round";
          ctx2.lineJoin = "round";
          ctx2.beginPath();
          ctx2.moveTo(last.x, last.y);
          ctx2.lineTo(x, y);
          ctx2.stroke();
        };

        canvas.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          drawing = true;
          last = { x: e.offsetX, y: e.offsetY };
          canvas.setPointerCapture(e.pointerId);
          draw(e.offsetX, e.offsetY);
        });
        canvas.addEventListener("pointermove", (e) => {
          if (!drawing) return;
          draw(e.offsetX, e.offsetY);
          last = { x: e.offsetX, y: e.offsetY };
        });
        const stop = () => { drawing = false; last = null; };
        canvas.addEventListener("pointerup", stop);
        canvas.addEventListener("pointercancel", stop);

        async function startCam() {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            hint.textContent = "Tu navegador no permite usar la cámara.";
            return;
          }
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
            video.srcObject = stream;
          } catch (err) {
            hint.textContent = "No se pudo abrir la cámara. file:// bloquea la cámara: abrí con localhost o https.";
          }
        }
        startCam();
      },
      onClose: () => {
        if (stream) stream.getTracks().forEach((t) => t.stop());
      },
    });
  },
};