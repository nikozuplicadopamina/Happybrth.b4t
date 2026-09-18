const MinesApp = {
  create: () => {
    const CFG = { facil: { c: 9, r: 9, m: 10 }, medio: { c: 16, r: 16, m: 40 } };
    const COLORS = ["", "#0000ee", "#008000", "#ee0000", "#000080", "#800000", "#008080", "#000000", "#808080", "#000000", "#000000"];
    let level = "facil";
    let st = null;
    let gridEl = null;
    let countEl = null;
    let timeEl = null;
    let hintEl = null;

    return WM.create({
      title: "Buscaminas de Corazones",
      icon: ICONS.mines,
      width: 470,
      height: 500,
      body: (body) => {
        body.innerHTML = `
          <div class="ms-head">
            <span class="ms-count" id="ms-count">♥ 10</span>
            <div class="ms-levels">
              <button class="ms-lvl active" data-lvl="facil">Fácil</button>
              <button class="ms-lvl" data-lvl="medio">Medio</button>
            </div>
            <span class="ms-time" id="ms-time">0s</span>
          </div>
          <div class="ms-hint" id="ms-hint">Click: descubrir · Click derecho: marcar corazón</div>
          <div class="ms-board"><div class="ms-grid" id="ms-grid"></div></div>
          <div class="field-row"><button id="ms-new" class="mp-btn">Nuevo ♥</button></div>`;

        gridEl = body.querySelector("#ms-grid");
        countEl = body.querySelector("#ms-count");
        timeEl = body.querySelector("#ms-time");
        hintEl = body.querySelector("#ms-hint");

        const newBtn = body.querySelector("#ms-new");
        for (const b of body.querySelectorAll(".ms-lvl")) {
          b.addEventListener("click", () => {
            level = b.dataset.lvl;
            body.querySelectorAll(".ms-lvl").forEach((x) => x.classList.toggle("active", x === b));
            newGame();
          });
        }
        newBtn.addEventListener("click", newGame);
        newGame();

        function newGame() {
          const cfg = CFG[level];
          clearTimer();
          st = {
            c: cfg.c, r: cfg.r, mines: cfg.m, cells: [], openCount: 0,
            started: false, finished: false, secs: 0, flags: 0, interval: 0,
          };
          for (let i = 0; i < cfg.c * cfg.r; i++) {
            st.cells.push({ mine: false, flag: false, open: false, num: 0 });
          }
          const cell = Math.max(20, Math.min(26, Math.floor(400 / cfg.c)));
          gridEl.style.gridTemplateColumns = `repeat(${cfg.c}, ${cell}px)`;
          gridEl.innerHTML = "";
          for (let i = 0; i < st.cells.length; i++) {
            const el = document.createElement("button");
            el.className = "ms-cell";
            el.style.width = cell + "px";
            el.style.height = cell + "px";
            el.dataset.i = i;
            el.addEventListener("click", () => reveal(i, el));
            el.addEventListener("contextmenu", (e) => { e.preventDefault(); flag(i, el); });
            gridEl.appendChild(el);
          }
          countEl.textContent = "♥ " + st.mines;
          timeEl.textContent = "0s";
          hintEl.textContent = "Click: descubrir · Click derecho: marcar corazón";
        }

        function clearTimer() {
          if (st && st.interval) { clearInterval(st.interval); st.interval = 0; }
        }

        function placeMines(keep) {
          const cfg = CFG[level];
          const opts = [];
          for (let i = 0; i < st.cells.length; i++) if (!keep.has(i)) opts.push(i);
          for (let k = 0; k < st.mines; k++) {
            const j = Math.floor(Math.random() * opts.length);
            const i = opts.splice(j, 1)[0];
            st.cells[i].mine = true;
          }
          for (let rr = 0; rr < st.r; rr++) {
            for (let cc = 0; cc < st.c; cc++) {
              const n = neighbors(rr, cc).filter((p) => st.cells[p].mine).length;
              st.cells[rr * st.c + cc].num = n;
            }
          }
        }

        function neighbors(rr, cc) {
          const out = [];
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = rr + dr, nc = cc + dc;
              if (nr < 0 || nr >= st.r || nc < 0 || nc >= st.c || (dr === 0 && dc === 0)) continue;
              out.push(nr * st.c + nc);
            }
          }
          return out;
        }

        function startTimer() {
          st.interval = setInterval(() => {
            if (!st.finished) {
              st.secs++;
              timeEl.textContent = st.secs + "s";
            }
          }, 1000);
        }

        function reveal(i, el) {
          if (st.finished || st.cells[i].open || st.cells[i].flag) return;
          if (!st.started) {
            st.started = true;
            const keep = new Set([i, ...neighbors(Math.floor(i / st.c), i % st.c)]);
            placeMines(keep);
            startTimer();
          }
          if (st.cells[i].mine) {
            lose(i);
            return;
          }
          const stack = [i];
          while (stack.length) {
            const p = stack.pop();
            const cell = st.cells[p];
            if (cell.open || cell.flag || cell.mine) continue;
            cell.open = true;
            st.openCount++;
            if (cell.num === 0) {
              for (const q of neighbors(Math.floor(p / st.c), p % st.c)) {
                if (!st.cells[q].open) stack.push(q);
              }
            }
          }
          render();
          if (st.openCount === st.r * st.c - st.mines) win();
        }

        function flag(i, el) {
          if (st.finished) return;
          const cell = st.cells[i];
          if (cell.open) return;
          cell.flag = !cell.flag;
          st.flags += cell.flag ? 1 : -1;
          countEl.textContent = "♥ " + (st.mines - st.flags);
          el.classList.toggle("flag", cell.flag);
          el.textContent = cell.flag ? "♥" : "";
        }

        function lose(idx) {
          st.finished = true;
          for (let i = 0; i < st.cells.length; i++) {
            const cell = st.cells[i];
            if (cell.mine) {
              cell.open = true;
            } else if (cell.flag) {
              cell.flag = false;
            }
          }
          st.cells[idx].broken = true;
          render();
          hintEl.textContent = "¡Boom! 💔";
        }

        function win() {
          st.finished = true;
          for (let i = 0; i < st.cells.length; i++) {
            const cell = st.cells[i];
            if (cell.mine) { cell.flag = true; cell.open = true; }
          }
          st.flags = st.mines;
          countEl.textContent = "♥ 0";
          render();
          hintEl.textContent = "¡Ganaste! ♥♥♥";
        }

        function render() {
          for (let i = 0; i < st.cells.length; i++) {
            const cell = st.cells[i];
            const el = gridEl.children[i];
            el.className = "ms-cell" + (cell.open ? " revealed" : "");
            el.style.color = "";
            el.textContent = "";
            if (cell.open) {
              if (cell.mine) {
                el.textContent = "♥";
                if (cell.broken) {
                  el.classList.add("broken");
                  el.textContent = "✕";
                } else {
                  el.classList.add("bomb");
                }
              } else {
                el.classList.add("n" + cell.num);
                el.textContent = cell.num ? String(cell.num) : "";
              }
            } else if (cell.flag) {
              el.classList.add("flag");
              el.textContent = "♥";
            }
          }
        }
      },
      onClose: () => {
        if (st && st.interval) clearInterval(st.interval);
      },
    });
  },
};