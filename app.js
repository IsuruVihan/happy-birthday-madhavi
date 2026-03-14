(() => {
  const friends = [
    {
      name: "Isuru",
      meta: "You • Male",
      note: "The hype engine. Always ready to press the confetti button.",
      colors: ["#ff4fd8", "#5cf6ff"],
      tag: "Builder",
    },
    {
      name: "Ravindu",
      meta: "Male",
      note: "Brings calm vibes and the best ideas at the perfect time.",
      colors: ["#ffd16a", "#ff7a59"],
      tag: "Vibes",
    },
    {
      name: "Samila",
      meta: "Male",
      note: "The laugh supplier. If fun had a name, it would be this.",
      colors: ["#a8ff78", "#5cf6ff"],
      tag: "Fun",
    },
    {
      name: "Gayathrini",
      meta: "Female",
      note: "Kind heart, sharp mind, and always looking out for everyone.",
      colors: ["#9b7bff", "#5cf6ff"],
      tag: "Care",
    },
    {
      name: "Shamali",
      meta: "Female",
      note: "The sparkle factor. Makes any moment feel special.",
      colors: ["#ff4fd8", "#ffd16a"],
      tag: "Sparkle",
    },
    {
      name: "Kasuni",
      meta: "Female",
      note: "Always supportive, always real — and always ready for snacks.",
      colors: ["#5cf6ff", "#a8ff78"],
      tag: "Real",
    },
    {
      name: "Devdini",
      meta: "Female",
      note: "Quietly iconic. Turns simple plans into great memories.",
      colors: ["#ffd16a", "#9b7bff"],
      tag: "Iconic",
    },
    {
      name: "Madhavi",
      meta: "Birthday girl • Female",
      note: "Today’s star. May your year be colorful, confident, and full of love.",
      colors: ["#ff4fd8", "#a8ff78"],
      tag: "Birthday",
      birthday: true,
    },
  ];

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  const music = {
    ctx: null,
    master: null,
    playing: false,
    loopTimer: 0,
    startedOnce: false,
  };

  function midiToFreq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  function setMusicUi(playing) {
    const btn = $("#musicToggle");
    if (!btn) return;
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
    btn.textContent = playing ? "Pause song" : "Play song";
  }

  function buildHappyBirthdaySong() {
    const R = null;
    return [
      [67, 0.5],
      [67, 0.5],
      [69, 1],
      [67, 1],
      [72, 1],
      [71, 2],
      [R, 0.5],

      [67, 0.5],
      [67, 0.5],
      [69, 1],
      [67, 1],
      [74, 1],
      [72, 2],
      [R, 0.5],

      [67, 0.5],
      [67, 0.5],
      [79, 1],
      [76, 1],
      [72, 1],
      [71, 1],
      [69, 2],
      [R, 0.5],

      [77, 0.5],
      [77, 0.5],
      [76, 1],
      [72, 1],
      [74, 1],
      [72, 2.5],
      [R, 2],
    ];
  }

  function scheduleNote(ctx, out, when, freq, durSec) {
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, when);

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, when);

    const g = ctx.createGain();
    const a = 0.012;
    const r = Math.min(0.12, durSec * 0.35);
    const peak = 0.22;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + a);
    g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(a + 0.01, durSec - r));

    osc1.connect(g);
    osc2.connect(g);
    g.connect(out);

    osc1.start(when);
    osc2.start(when);
    osc1.stop(when + durSec + 0.02);
    osc2.stop(when + durSec + 0.02);
  }

  function scheduleSongFromStart() {
    if (!music.ctx || !music.master) return 0;
    const ctx = music.ctx;

    const tempo = 112;
    const beat = 60 / tempo;
    const song = buildHappyBirthdaySong();

    const startAt = ctx.currentTime + 0.06;
    let t = startAt;

    for (const [midi, beats] of song) {
      const durSec = beats * beat;
      if (midi != null) {
        scheduleNote(ctx, music.master, t, midiToFreq(midi), Math.max(0.07, durSec));
      }
      t += durSec;
    }

    return t - startAt;
  }

  async function playSong() {
    if (!music.ctx) {
      music.ctx = new (window.AudioContext || window.webkitAudioContext)();
      music.master = music.ctx.createGain();
      music.master.gain.value = 0.055;
      music.master.connect(music.ctx.destination);
    }

    if (music.ctx.state === "suspended") {
      await music.ctx.resume();
    }

    music.playing = true;
    music.startedOnce = true;
    setMusicUi(true);

    clearTimeout(music.loopTimer);
    const dur = scheduleSongFromStart();
    music.loopTimer = window.setTimeout(() => {
      if (music.playing) playSong();
    }, Math.max(1000, Math.floor(dur * 1000)));
  }

  async function pauseSong() {
    music.playing = false;
    setMusicUi(false);
    clearTimeout(music.loopTimer);
    if (music.ctx && music.ctx.state === "running") {
      await music.ctx.suspend();
    }
  }

  function ensureSongStarted() {
    if (music.playing) return;
    void playSong();
  }

  function initMusic() {
    const btn = $("#musicToggle");
    if (btn) {
      btn.addEventListener("click", async () => {
        if (music.playing) {
          await pauseSong();
        } else {
          await playSong();
        }
      });
    }
    setMusicUi(false);
  }

  function mulberry32(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function initReveal() {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    $$(".reveal").forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(220 + i * 55, 900)}ms`;
      io.observe(el);
    });
  }

  function buildFriends() {
    const grid = $("#friendsGrid");
    grid.innerHTML = "";

    friends.forEach((f) => {
      const card = document.createElement("article");
      card.className = `friend reveal${f.birthday ? " birthday" : ""}`;
      card.style.setProperty("--a1", f.colors[0]);
      card.style.setProperty("--a2", f.colors[1]);

      const initials = f.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join("");

      card.innerHTML = `
        <div class="tag">${f.tag}</div>
        <div class="friend-inner">
          <div class="avatar" aria-hidden="true">${initials}</div>
          <div>
            <div class="friend-name">${f.name}</div>
            <div class="friend-meta">${f.meta}</div>
          </div>
        </div>
        <div class="friend-note">${f.note}</div>
      `;

      grid.appendChild(card);
    });

    $$(".friend.reveal").forEach((el) => el.classList.remove("in-view"));
  }

  function initGift() {
    const gift = $("#gift");
    const card = $("#card");

    const open = () => {
      gift.classList.add("open");
      ensureSongStarted();
      burstConfetti(180);
    };

    const flip = () => {
      card.classList.toggle("flipped");
      burstConfetti(90);
    };

    gift.addEventListener("click", open);
    gift.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });

    card.addEventListener("click", (e) => {
      e.stopPropagation();
      flip();
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        flip();
      }
    });

    $("#openSurprise").addEventListener("click", () => {
      open();
      card.classList.add("flipped");
    });
  }

  function initNav() {
    const back = $("#backToTop");
    back.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initBalloons() {
    const host = $("#balloons");
    host.innerHTML = "";

    const palette = [
      ["#ff4fd8", "#9b7bff"],
      ["#5cf6ff", "#9b7bff"],
      ["#a8ff78", "#5cf6ff"],
      ["#ffd16a", "#ff7a59"],
      ["#ff7a59", "#ff4fd8"],
      ["#9b7bff", "#ffd16a"],
    ];

    const rnd = mulberry32(Date.now() % 100000);
    const count = window.innerWidth < 720 ? 14 : 22;

    for (let i = 0; i < count; i++) {
      const b = document.createElement("div");
      b.className = "balloon";
      const [c1, c2] = palette[i % palette.length];

      const x = rnd() * 100;
      const x2 = clamp(x + (rnd() * 18 - 9), 0, 100);
      const dur = 10 + rnd() * 8;
      const r0 = -10 + rnd() * 20;
      const r1 = -10 + rnd() * 20;
      const scale = 0.85 + rnd() * 0.55;
      const delay = -rnd() * dur;

      b.style.setProperty("--c1", c1);
      b.style.setProperty("--c2", c2);
      b.style.setProperty("--x", `${x}vw`);
      b.style.setProperty("--x2", `${x2}vw`);
      b.style.setProperty("--dur", `${dur}s`);
      b.style.setProperty("--r0", `${r0}deg`);
      b.style.setProperty("--r1", `${r1}deg`);
      b.style.animationDelay = `${delay}s`;
      b.style.transform = `scale(${scale})`;

      const s = document.createElement("div");
      s.className = "string";
      b.appendChild(s);

      host.appendChild(b);
    }
  }

  function initPetals() {
    const host = $("#petals");
    if (!host) return;
    host.innerHTML = "";

    const rnd = mulberry32((Date.now() + 1337) % 100000);
    const count = window.innerWidth < 720 ? 14 : 22;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "petal-drop";

      const x = rnd() * 100;
      const x2 = clamp(x + (rnd() * 22 - 11), 0, 100);
      const dur = 9 + rnd() * 8;
      const r0 = -90 + rnd() * 180;
      const r1 = r0 + (-140 + rnd() * 280);
      const scale = 0.75 + rnd() * 0.8;
      const delay = -rnd() * dur;

      p.style.setProperty("--x", `${x}vw`);
      p.style.setProperty("--x2", `${x2}vw`);
      p.style.setProperty("--dur", `${dur}s`);
      p.style.setProperty("--r0", `${r0}deg`);
      p.style.setProperty("--r1", `${r1}deg`);
      p.style.animationDelay = `${delay}s`;
      p.style.transform = `scale(${scale})`;

      host.appendChild(p);
    }
  }

  function burstPetalsAt(x, y, n = 18) {
    const host = $("#petals");
    if (!host) return;

    for (let i = 0; i < n; i++) {
      const p = document.createElement("div");
      p.className = "petal-burst";
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;

      const a = Math.random() * Math.PI * 2;
      const d = 30 + Math.random() * 70;
      const dx = Math.cos(a) * d;
      const dy = Math.sin(a) * d - (10 + Math.random() * 18);
      const rot = -140 + Math.random() * 280;

      p.style.setProperty("--dx", `${dx}px`);
      p.style.setProperty("--dy", `${dy}px`);
      p.style.setProperty("--rot", `${rot}deg`);

      host.appendChild(p);
      window.setTimeout(() => p.remove(), 1050);
    }
  }

  function burstPawsAt(x, y, n = 10) {
    const host = $("#paws");
    if (!host) return;

    for (let i = 0; i < n; i++) {
      const p = document.createElement("div");
      p.className = "paw";
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;

      const a = Math.random() * Math.PI * 2;
      const d = 34 + Math.random() * 85;
      const dx = Math.cos(a) * d;
      const dy = Math.sin(a) * d - (18 + Math.random() * 26);
      const rot = -45 + Math.random() * 90;

      p.style.setProperty("--dx", `${dx}px`);
      p.style.setProperty("--dy", `${dy}px`);
      p.style.setProperty("--rot", `${rot}deg`);

      host.appendChild(p);
      window.setTimeout(() => p.remove(), 1350);
    }
  }

  function initInterests() {
    const flowers = $("#flowersCard");
    const cats = $("#catsCard");

    const onFlowers = (x, y) => {
      ensureSongStarted();
      burstConfetti(60);
      burstPetalsAt(x, y, 20);
    };

    const onCats = (x, y) => {
      ensureSongStarted();
      burstConfetti(45);
      burstPawsAt(x, y, 10);
    };

    const wire = (el, handler) => {
      if (!el) return;
      el.addEventListener("click", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX || rect.left + rect.width / 2;
        const y = e.clientY || rect.top + rect.height / 2;
        handler(x, y);
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const rect = el.getBoundingClientRect();
          handler(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      });
    };

    wire(flowers, onFlowers);
    wire(cats, onCats);
  }

  const confetti = {
    canvas: null,
    ctx: null,
    dpr: 1,
    particles: [],
    lastT: 0,
    raf: 0,
    running: false,
  };

  function resizeConfetti() {
    confetti.dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    confetti.canvas.width = Math.floor(window.innerWidth * confetti.dpr);
    confetti.canvas.height = Math.floor(window.innerHeight * confetti.dpr);
    confetti.canvas.style.width = `${window.innerWidth}px`;
    confetti.canvas.style.height = `${window.innerHeight}px`;
    confetti.ctx.setTransform(confetti.dpr, 0, 0, confetti.dpr, 0, 0);
  }

  function makeParticle(x, y) {
    const palette = [
      "#ff4fd8",
      "#5cf6ff",
      "#a8ff78",
      "#ffd16a",
      "#9b7bff",
      "#ff7a59",
    ];

    const angle = (Math.random() * Math.PI) / 2 + Math.PI * 1.25;
    const speed = 5 + Math.random() * 10;

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      g: 0.22 + Math.random() * 0.2,
      drag: 0.992,
      r: 2 + Math.random() * 3.5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      color: palette[(Math.random() * palette.length) | 0],
      life: 80 + (Math.random() * 50) | 0,
      kind: Math.random() < 0.5 ? "rect" : "arc",
    };
  }

  function burstConfetti(n = 140) {
    const x = window.innerWidth * (0.25 + Math.random() * 0.5);
    const y = window.innerHeight * (0.12 + Math.random() * 0.2);
    for (let i = 0; i < n; i++) confetti.particles.push(makeParticle(x, y));

    if (!confetti.running) {
      confetti.running = true;
      confetti.lastT = performance.now();
      confetti.raf = requestAnimationFrame(tickConfetti);
    }
  }

  function tickConfetti(t) {
    const dt = Math.min(32, t - confetti.lastT);
    confetti.lastT = t;

    const ctx = confetti.ctx;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = confetti.particles.length - 1; i >= 0; i--) {
      const p = confetti.particles[i];
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.g;
      p.x += p.vx * (dt / 16.67);
      p.y += p.vy * (dt / 16.67);
      p.rot += p.vr * (dt / 16.67);
      p.life -= 1;

      if (p.life <= 0 || p.y > window.innerHeight + 80) {
        confetti.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = clamp(p.life / 120, 0, 1);

      if (p.kind === "rect") {
        ctx.fillRect(-p.r, -p.r, p.r * 2.1, p.r * 1.2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (confetti.particles.length > 0) {
      confetti.raf = requestAnimationFrame(tickConfetti);
    } else {
      confetti.running = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function initConfetti() {
    confetti.canvas = $("#confetti");
    confetti.ctx = confetti.canvas.getContext("2d", { alpha: true });
    resizeConfetti();

    $("#moreConfetti").addEventListener("click", () => burstConfetti(220));
    $("#replay").addEventListener("click", () => {
      initBalloons();
      burstConfetti(240);
    });

    window.addEventListener("resize", () => {
      resizeConfetti();
      initBalloons();
      initPetals();
    });

    const first = () => {
      burstConfetti(170);
      ensureSongStarted();
      window.removeEventListener("pointerdown", first);
    };
    window.addEventListener("pointerdown", first, { once: true });

    setTimeout(() => burstConfetti(150), 650);
  }

  function boot() {
    buildFriends();
    initReveal();
    initMusic();
    initGift();
    initNav();
    initBalloons();
    initPetals();
    initInterests();
    initConfetti();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
