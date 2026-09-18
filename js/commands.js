const COMMANDS = [
  {
    name: "banner",
    aliases: ["banner", "hola", "hi"],
    desc: "Muestra el banner de bienvenida.",
    printText: true, link: false, rainbow: true,
    clear: false, close: false, openLink: null, opensApp: null,
    buildIn: false,
  },
  {
    name: "playlist",
    aliases: ["playlist", "ply"],
    desc: "Playlist para tu cumpleaños",
    printText: true, link: true, rainbow: false,
    clear: false, close: false, openLink: "https://open.spotify.com/playlist/7EK8haNSu906TS7LFnnpto", opensApp: null,
    buildIn: false,
  },
  {
    name: "camara",
    aliases: ["camara", "webcam"],
    desc: "Abre una camarita",
    printText: true, link: false, rainbow: false,
    clear: false, close: false, openLink: null, opensApp: null,
    buildIn: false,
  },
  {
    name: "pastel",
    aliases: ["pastel", "cake", "vela"],
    desc: "un pastelito de cumpleañoss",
    printText: true, link: false, rainbow: false,
    clear: false, close: false, openLink: null, opensApp: null,
    buildIn: false,
    burnSeconds: 15,
  },
  {
    name: "buscaminas",
    aliases: ["buscaminas", "minas", "busca"],
    desc: "un pequeño buscaminas",
    printText: true, link: false, rainbow: false,
    clear: false, close: false, openLink: null, opensApp: null,
    buildIn: false,
  },
  {
    name: "regalo",
    aliases: ["regalo", "gift4u"],
    desc: "Un pequeño regalo para ti! :3",
    printText: true, link: false, rainbow: false,
    clear: false, close: false, openLink: null, opensApp: null,
    buildIn: false,
    preparate: "Preparate...",
    delayPreparate: 2000,
    delayCountdown: 1000,
    delayAscii: 1000,
  },
];

const HANDLERS = {
  banner: () => [
    "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
    "████████████████████████████████████████████████████████████████████████████████████████████████████╗",
    "╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝",
    "██╗░░██╗░█████╗░██████╗░██████╗░██╗░░░██╗██████╗░██████╗░████████╗██╗░░██╗░░░██████╗░░░██╗██╗████████╗",
    "██║░░██║██╔══██╗██╔══██╗██╔══██╗╚██╗░██╔╝██╔══██╗██╔══██╗╚══██╔══╝██║░░██║░░░██╔══██╗░██╔╝██║╚══██╔══╝",
    "███████║███████║██████╔╝██████╔╝░╚████╔╝░██████╦╝██████╔╝░░░██║░░░███████║░░░██████╦╝██╔╝░██║░░░██║░░░",
    "██╔══██║██╔══██║██╔═══╝░██╔═══╝░░░╚██╔╝░░██╔══██╗██╔══██╗░░░██║░░░██╔══██║░░░██╔══██╗███████║░░░██║░░░",
    "██║░░██║██║░░██║██║░░░░░██║░░░░░░░░██║░░░██████╦╝██║░░██║░░░██║░░░██║░░██║██╗██████╦╝╚════██║░░░██║░░░",
    "╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░░░░╚═╝░░░░░░░░╚═╝░░░╚═════╝░╚═╝░░╚═╝░░░╚═╝░░░╚═╝░░╚═╝╚═╝╚═════╝░░░░░░╚═╝░░░╚═╝░░░",
    "Bienvenida a la terminal, si estás aqui es porque estás cumpliendo años (dah JKASDJ)",
    "Porfavor Ingresa tu comando para iniciar",
    "",
    "████████████████████████████████████████████████████████████████████████████████████████████████████╗",
    "╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝",
    "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
  ],
  playlist: () => [
    "§▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄",
    "§  █▄▄ █░█ ▀█▀   █   █▀█ █░  ▄▀█ █▄█ █░  █ █▀ ▀█▀",
    "§▄ █▄█ ▀▀█ ░█░   █   █▀▀ █▄▄ █▀█ ░█░ █▄▄ █ ▄█ ░█░",
    "§▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄",
    "Playlist armada con suma cautulencia, escogí cada canción de forma que pareciece un album.",
    "es un poco friki el dedicar canciones para alguien que amas, pero es el mismo amor (y lo",
    "friki q soy) lo que me hizo dedicarte estas canciones solo 4 u",
  ],

  camara: () => {
    if (typeof CameraApp !== "undefined") CameraApp.create();
    return ["una pequeña camarita para que se yo"];
  },

  pastel: () => {
    if (typeof CakeApp !== "undefined") CakeApp.create();
    return ["apesar de la distancia t hice un pastel, sopla la velita :))"];
  },

  buscaminas: () => {
    if (typeof MinesApp !== "undefined") MinesApp.create();
    return ["ya me iba quedando un poco sin ideas, entonces hice un buscaminas", "(Espero sepas jugar jejejej)"];
  },

  regalo: (ctx, args, found) => {
    const pre = (found && found.preparate) || "Preparate...";
    const t1 = (found && found.delayPreparate) || 2000;
    const tc = (found && found.delayCountdown) || 1000;
    const t2 = (found && found.delayAscii) || 1000;

    let at = t1;
    setTimeout(() => ctx.out(pre), at);
    [3, 2, 1].forEach((n) => {
      at += tc;
      setTimeout(() => ctx.color(n, "#7d1534"), at);
    });
    at += t2;
    setTimeout(() => {
      ctx.out("");
      for (const line of [
        "░░██╗██████╗░",
        "░██╔╝╚════██╗",
        "██╔╝░░█████╔╝",
        "╚██╗░░╚═══██╗",
        "░╚██╗██████╔╝",
        "░░░╚╝╚════╝░",
      ]) ctx.color(line, "#7d1534");
      if (typeof MediaPlayerApp !== "undefined") MediaPlayerApp.create();
      if (typeof NotepadApp !== "undefined") NotepadApp.create({
        title: "PENDIENTE.txt",
        width: 420,
        height: 540,
        image: "img/pendiente.png",
      });
    }, at);
    return [];
  },
};

function findCommand(name) {
  return COMMANDS.find((c) => c.aliases.includes(name.toLowerCase()));
}
