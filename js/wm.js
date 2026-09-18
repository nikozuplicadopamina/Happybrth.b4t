const WM = (() => {
  let z = 100;
  const layer = document.getElementById("windows");
  const tasksEl = document.getElementById("taskbar-tasks");

  function focus(win) {
    win.el.style.zIndex = ++z;
    win.el.classList.add("win-active");
    for (const w of WM.opened) {
      if (w !== win) w.el.classList.remove("win-active");
    }
    if (win.tbBtn) {
      win.tbBtn.classList.add("task-active");
      for (const w of WM.opened) {
        if (w !== win && w.tbBtn) w.tbBtn.classList.remove("task-active");
      }
    }
  }

  function close(win) {
    win.el.remove();
    win.tbBtn.remove();
    WM.opened = WM.opened.filter((w) => w !== win);
  }

  function restoreState(win) {
    if (!win.dataset_restore) return;
    const r = JSON.parse(win.dataset_restore);
    const clamp = (v, lo, hi) => Math.min(Math.max(parseInt(v) || 0, lo), hi);
    win.el.style.width = r.w;
    win.el.style.height = r.h;
    win.el.style.left = clamp(r.l, 0, window.innerWidth - 300) + "px";
    win.el.style.top = clamp(r.t, 0, window.innerHeight - 140) + "px";
    win.maximized = false;
  }

  function drag(win, el) {
    const bar = el.querySelector(".title-bar");
    let sx, sy, ox, oy, moved = false;

    bar.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON") return;
      sx = e.clientX; sy = e.clientY;
      ox = el.offsetLeft; oy = el.offsetTop;
      moved = false;
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    function onMove(e) {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      el.style.left = Math.min(Math.max(0, ox + dx), window.innerWidth - 60) + "px";
      el.style.top = Math.min(Math.max(0, oy + dy), window.innerHeight - 40) + "px";
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }

    bar.addEventListener("click", (e) => { if (!moved) focus(win); });
  }

  function resize(win, el) {
    const handle = document.createElement("div");
    handle.className = "resize-handle";
    el.appendChild(handle);
    let sx, sy, ow, oh;

    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      sx = e.clientX; sy = e.clientY;
      ow = el.offsetWidth; oh = el.offsetHeight;
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    function onMove(e) {
      el.style.width = Math.max(260, ow + (e.clientX - sx)) + "px";
      el.style.height = Math.max(160, oh + (e.clientY - sy)) + "px";
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
  }

  return {
    opened: [],
    create({ title, icon, width = 480, height = 340, onClose, body }) {
      const el = document.createElement("div");
      el.className = "window win";
      el.style.width = width + "px";
      el.style.height = height + "px";

      const n = WM.opened.length;
      el.style.left = 60 + (n % 6) * 34 + "px";
      el.style.top = 30 + (n % 6) * 26 + "px";

      el.innerHTML = `
        <div class="title-bar">
          <div class="title-bar-text">${icon}${title}</div>
          <div class="title-bar-controls">
            <button aria-label="Minimize" data-act="min"></button>
            <button aria-label="Maximize" data-act="max"></button>
            <button aria-label="Close" data-act="close"></button>
          </div>
        </div>
        <div class="window-body"></div>`;

      const bodyEl = el.querySelector(".window-body");

      const tbBtn = document.createElement("button");
      tbBtn.className = "taskbar-task";
      tbBtn.innerHTML = `<span class="tb-ico">${icon}</span><span class="tb-label">${title}</span>`;
      tbBtn.addEventListener("click", () => win.toggle());
      tasksEl.appendChild(tbBtn);

      const win = {
        el, tbBtn, minimized: false, maximized: false, dataset_restore: null,
        focus: () => focus(win),
        close: () => { close(win); if (onClose) onClose(); },
        minimize: () => {
          win.minimized = true;
          el.classList.add("win-minimized");
          tbBtn.classList.add("task-active");
        },
        maximize: () => {
          if (!win.maximized) {
            for (const w of WM.opened) {
              if (w !== win && w.maximized) restoreState(w);
            }
            win.maximized = true;
            win.dataset_restore = JSON.stringify({ w: el.style.width, h: el.style.height, l: el.style.left, t: el.style.top });
            el.style.left = "0"; el.style.top = "0";
            el.style.width = window.innerWidth + "px";
            el.style.height = (window.innerHeight - 34) + "px";
          } else {
            restoreState(win);
          }
          focus(win);
        },
        toggle: () => {
          if (!win.minimized) {
            win.minimize();
          } else {
            win.minimized = false;
            el.classList.remove("win-minimized");
            focus(win);
          }
        },
      };

      body(bodyEl, win);

      el.querySelector(".title-bar").addEventListener("click", (e) => {
        const act = e.target.closest("button")?.dataset.act;
        if (act === "min") win.minimize();
        else if (act === "max") win.maximize();
        else if (act === "close") win.close();
      });

      layer.appendChild(el);

      drag(win, el);
      resize(win, el);
      WM.opened.push(win);
      focus(win);
      return win;
    },
  };
})();