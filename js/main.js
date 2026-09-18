const ICONS = {
  terminal: `<svg viewBox="0 0 32 32" width="120" height="32" class="ico">
    <rect x="3" y="5" width="26" height="22" fill="#000" stroke="#808080" stroke-width="1"/>
    <path d="M7 11l4 3.5L7 18" stroke="#00ff00" stroke-width="2" fill="none"/>
    <rect x="13" y="17" width="8" height="2" fill="#00ff00"/>
  </svg>`,
  notepad: `<svg viewBox="0 0 32 32" width="32" height="32" class="ico">
    <rect x="4" y="2" width="24" height="28" rx="1" fill="#fffbe6" stroke="#8a6d1f" stroke-width="1"/>
    <rect x="4" y="2" width="24" height="6" fill="#f5e6a8" stroke="#8a6d1f" stroke-width="1"/>
    <line x1="8" y1="12" x2="24" y2="12" stroke="#b0a06a" stroke-width="1.5"/>
    <line x1="8" y1="16" x2="24" y2="16" stroke="#b0a06a" stroke-width="1.5"/>
    <line x1="8" y1="20" x2="24" y2="20" stroke="#b0a06a" stroke-width="1.5"/>
    <line x1="8" y1="24" x2="20" y2="24" stroke="#b0a06a" stroke-width="1.5"/>
  </svg>`,
  readme: `<svg viewBox="0 0 32 32" width="32" height="32" class="ico">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff6b81"/><stop offset="1" stop-color="#7d1534"/>
    </linearGradient></defs>
    <rect x="5" y="2" width="22" height="28" rx="1" fill="url(#rg)" stroke="#4a0a1e" stroke-width="1"/>
    <rect x="9" y="8" width="14" height="3" fill="#fff" opacity="0.9"/>
    <rect x="9" y="14" width="14" height="3" fill="#fff" opacity="0.9"/>
    <rect x="9" y="20" width="9" height="3" fill="#fff" opacity="0.9"/>
  </svg>`,
  music: `<svg viewBox="0 0 32 32" width="32" height="32" class="ico">
    <path d="M26 3l1 5-16 3 1 4 15-3 1 5-18 4 2 7-7-2-1-14z" fill="#7d1534" stroke="#4a0a1e" stroke-width="1"/>
    <circle cx="8" cy="24" r="3" fill="#fff" stroke="#4a0a1e"/>
  </svg>`,
  camera: `<svg viewBox="0 0 32 32" width="32" height="32" class="ico">
    <rect x="2" y="9" width="21" height="15" rx="1" fill="#1a9cff" stroke="#0a3a66" stroke-width="1"/>
    <path d="M23 14l6-3v14l-6-3z" fill="#8a5cf6" stroke="#0a3a66" stroke-width="1"/>
    <circle cx="12" cy="17" r="4" fill="#fff" stroke="#0a3a66"/>
  </svg>`,
  cake: `<svg viewBox="0 0 32 32" width="32" height="32" class="ico">
    <rect x="3" y="15" width="26" height="12" rx="2" fill="#c7794f" stroke="#4a0a1e" stroke-width="1"/>
    <rect x="8" y="9" width="16" height="7" rx="2" fill="#fff0df" stroke="#4a0a1e" stroke-width="1"/>
    <rect x="14" y="1" width="4" height="11" fill="#fff" stroke="#4a0a1e" stroke-width="1"/>
    <rect x="14" y="2" width="4" height="3" fill="#e11d48"/>
    <ellipse cx="16" cy="0" rx="3" ry="4" fill="#ff7a1a" stroke="#7a3800" stroke-width="0.6"/>
  </svg>`,
  mines: `<svg viewBox="0 0 32 32" width="32" height="32" class="ico">
    <rect x="3" y="3" width="26" height="26" fill="#c0c0c0" stroke="#808080" stroke-width="1"/>
    <path d="M3 3h26v5H3zM3 12h26v5H3zM3 21h26v5H3zM3 3h5v26H3z" stroke="#fff" stroke-width="1.5" fill="none"/>
    <path d="M16 14c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" fill="#e11d48"/>
  </svg>`,
  start: `<svg viewBox="0 0 22 22" width="18" height="18">
    <path d="M4 4h6v6H4zM12 4h6v6h-6zM4 12h6v6H4zM12 12h6v6h-6z"
      fill="#c00000" stroke="#000" stroke-width="0.6" opacity="0.9"/>
  </svg>`,
};

const APPS = [
  { id: "terminal", name: "Terminal", icon: ICONS.terminal, launch: () => TerminalApp.create() },
  { id: "notepad", name: "Comandos.txt", icon: ICONS.notepad, launch: () => NotepadApp.create() },
  {
    id: "readme", name: "README.txt", icon: ICONS.readme, launch: () => NotepadApp.create({
      title: "README.txt", icon: ICONS.readme, content: "querida Isa....\n\nse que este no va a ser el mejor regalo que te vayan a dar, justifico la distancia que nos corta, fuera de eso te entrego esta (que friki suena) pagina web que hice solo para ti con mucho cariñito\n\n\nte kiere - Niko\n\n(PD: lee todo con mucha atención porfa, no sea q se termine dañando todo xd)"}) },
];

function buildDesktopIcons() {
  const container = document.getElementById("icons");
  for (const app of APPS) {
    const el = document.createElement("div");
    el.className = "desktop-icon";
    el.setAttribute("data-id", app.id);
    el.innerHTML = app.icon + `<span>${app.name}</span>`;
    el.addEventListener("click", () => {
      container.querySelectorAll(".desktop-icon").forEach((i) => i.classList.remove("selected"));
      el.classList.add("selected");
    });
    el.addEventListener("dblclick", () => {
      el.classList.remove("selected");
      app.launch();
    });
    container.appendChild(el);
  }
}

function buildStartMenu() {
  const startBtn = document.getElementById("btn-start");
  const menu = document.getElementById("start-menu");
  const items = document.getElementById("start-items");
  startBtn.innerHTML = ICONS.start + " Inicio";

  for (const app of APPS) {
    const item = document.createElement("button");
    item.className = "start-item";
    item.innerHTML = app.icon + `<span>${app.name}</span>`;
    item.addEventListener("click", () => {
      menu.hidden = true;
      startBtn.classList.remove("start-open");
      app.launch();
    });
    items.appendChild(item);
  }

  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const show = menu.hidden;
    menu.hidden = !show;
    startBtn.classList.toggle("start-open", show);
    if (show) {
      const r = startBtn.getBoundingClientRect();
      menu.style.left = "2px";
      menu.style.bottom = (window.innerHeight - r.bottom + 2) + "px";
    }
  });
  document.addEventListener("click", () => {
    menu.hidden = true;
    startBtn.classList.remove("start-open");
  });
}

function clock() {
  const el = document.getElementById("clock");
  const tick = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    el.textContent = hh + ":" + mm;
  };
  tick();
  setInterval(tick, 1000);
}

buildDesktopIcons();
buildStartMenu();
clock();

document.addEventListener("pointerdown", (e) => {
  const el = e.target.closest("button, .desktop-icon, .start-item, .taskbar-task, .term-link, .title-bar-controls button");
  if (el && window.SysSound && SysSound.ensure) SysSound.ensure();
}, true);
document.addEventListener("click", (e) => {
  const el = e.target.closest("button, .desktop-icon, .start-item, .taskbar-task, .term-link, .title-bar-controls button");
  if (el && window.SysSound) SysSound.click();
}, true);
