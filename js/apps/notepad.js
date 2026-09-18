const NotepadApp = {
  create: (opts = {}) => WM.create({
    title: opts.title || "COMANDOS.TXT",
    icon: opts.icon || ICONS.notepad,
    width: opts.width || 520,
    height: opts.height || 400,
    body: (body) => {
      if (opts.image) {
        body.innerHTML = `
        <div class="notepad-bar">Archivo &nbsp;Ver &nbsp;Imagen &nbsp;Ayuda</div>
        <div class="notepad-image"><img src="${opts.image}" alt="" draggable="false"></div>
        <div class="notepad-status"></div>`;
        return;
      }
      body.innerHTML = `
        <div class="notepad-bar">Archivo &nbsp;Edici&oacute;n &nbsp;Formato &nbsp;Ver &nbsp;Ayuda</div>
        <textarea class="notepad-txt" spellcheck="false"></textarea>
        <div class="notepad-status"></div>`;

      const txt = body.querySelector(".notepad-txt");
      const status = body.querySelector(".notepad-status");

      const content = opts.content !== undefined
        ? opts.content
        : [
            "COMANDOS.TXT - Lista de comandos de la terminal",
            "================================================",
            "",
            ...COMMANDS.map((c) => {
              const aliases = c.aliases.slice(1).length ? "  (alias: " + c.aliases.slice(1).join(", ") + ")" : "";
              return "- " + c.aliases[0] + ": " + c.desc + aliases;
            }),
            "",
            "Tip: en la terminal usá TAB para autocompletar",
            "y las flechas ↑ ↓ para navegar el historial.",
            "tambien deberías probar todos los comandos en",
            "orden.",
          ].join("\r\n");

      txt.value = content;
      txt.readOnly = !opts.editable;
      status.textContent = "Línea " + content.split("\r\n").length + ", Columna 1";
    },
  }),
};
