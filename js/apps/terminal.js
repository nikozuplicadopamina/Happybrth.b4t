const RAINBOW_COLORS = ["#660d28", "#7d1534", "#7d1534", "#8a1e3e", "#660d28", "#7d1534", "#660d28"];

const TerminalApp = {
  create: () => {
    const win = WM.create({
      title: "Terminal",
      icon: ICONS.terminal,
      width: 840,
      height: 520,
      body: (body, win) => {
        body.innerHTML = `
        <div class="term-scroll" tabindex="-1">
          <div class="term-out"></div>
        </div>
        <div class="term-line">
          <span class="term-prompt"></span>
          <input class="term-input" autocomplete="off" spellcheck="false">
        </div>`;

      const scroll = body.querySelector(".term-scroll");
      const out = body.querySelector(".term-out");
      const input = body.querySelector(".term-input");
      const promptEl = body.querySelector(".term-prompt");
      const history = [];
      let hPos = 0;

      const ctx = {
        out: (line) => {
          const d = document.createElement("div");
          d.className = "term-row";
          d.innerHTML = linkify(line);
          out.appendChild(d);
          scroll.scrollTop = scroll.scrollHeight;
        },
        color: (line, color) => {
          const d = document.createElement("div");
          d.className = "term-row";
          d.textContent = line;
          d.style.color = color;
          out.appendChild(d);
          scroll.scrollTop = scroll.scrollHeight;
        },
        clear: () => { out.innerHTML = ""; },
        close: () => win.close(),
      };

      const rainbowLine = (line) => {
        const d = document.createElement("div");
        d.className = "term-row";
        if (line) {
          d.innerHTML = [...line].map((ch, i) =>
            `<span style="color:${RAINBOW_COLORS[i % RAINBOW_COLORS.length]}">${escapeHtml(ch)}</span>`
          ).join("");
        }
        out.appendChild(d);
      };

      const rainbow = (lines) => {
        for (const line of lines) rainbowLine(line);
        scroll.scrollTop = scroll.scrollHeight;
      };

      const render = (lines, rainbowAll) => {
        for (const line of lines) {
          if (rainbowAll) rainbowLine(line);
          else if (line.startsWith("§")) rainbowLine(line.slice(1));
          else ctx.out(line);
        }
        scroll.scrollTop = scroll.scrollHeight;
      };

      const prompt = () => "Izab4t:~$";
      const setPrompt = () => { promptEl.textContent = prompt() + " "; };
      const scrollEnd = () => { scroll.scrollTop = scroll.scrollHeight; };

      const exec = (raw) => {
        const line = document.createElement("div");
        line.className = "term-row term-cmd";
        line.innerHTML = `<span>${prompt()}</span> <span>${escapeHtml(raw)}</span>`;
        out.appendChild(line);

        const parts = raw.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const name = (parts[0] || "").replace(/"/g, "");
        const args = parts.slice(1).map((a) => a.replace(/^"|"$/g, ""));

        if (name) {
          const found = findCommand(name);
          if (found) {
            if (found.clear) ctx.clear();
            if (found.openLink) {
              ctx.out("Abriendo: " + found.openLink);
              window.open(found.openLink, "_blank");
            }
            if (found.opensApp && typeof APPS !== "undefined") {
              const app = APPS.find((a) => a.id === found.opensApp);
              if (app) app.launch();
            }
            if (found.close) ctx.close();
            const h = HANDLERS[found.name];
            if (h) {
              const result = h(ctx, args, found);
              if (result && result.length) {
                render(result, found.rainbow);
              }
            }
          } else {
            ctx.out(name + ": no se reconoce como un comando. Escribi 'help'.");
          }
        }
        setPrompt();
        scrollEnd();
      };

      const autocomplete = () => {
        const val = input.value.trim().toLowerCase();
        if (!val) return;
        const matches = COMMANDS.filter((c) => c.aliases.some((u) => u.startsWith(val)));
        if (matches.length === 1) {
          input.value = matches[0].aliases[0] + " ";
        } else if (matches.length > 1) {
          ctx.out("");
          for (const m of matches) ctx.out("  " + m.aliases[0].padEnd(12) + m.desc);
          ctx.out("");
          scrollEnd();
        }
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const val = input.value;
          input.value = "";
          if (val.trim()) {
            history.push(val);
            hPos = history.length;
            exec(val);
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (hPos > 0) { hPos--; input.value = history[hPos]; }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (hPos < history.length - 1) { hPos++; input.value = history[hPos]; }
          else { hPos = history.length; input.value = ""; }
        } else if (e.key === "Tab") {
          e.preventDefault();
          autocomplete();
        }
      });

      body.addEventListener("click", () => input.focus());
      win.el.classList.add("terminal-win");

      if (HANDLERS.banner) rainbow(HANDLERS.banner(ctx));
      ctx.out("");
      setPrompt();
      input.focus();
      },
    });
    return win;
  },
};

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function linkify(text) {
  const re = /https?:\/\/\S+/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    let url = m[0];
    while (/[.,;:!?)\]>"']$/.test(url)) url = url.slice(0, -1);
    out += escapeHtml(text.slice(last, m.index));
    out += `<a class="term-link" href="${url}" target="_blank" rel="noopener">${escapeHtml(url)}</a>`;
    last = m.index + m[0].length;
  }
  out += escapeHtml(text.slice(last));
  return out;
}
