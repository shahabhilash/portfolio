(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- stagger index for the big name letters ---------- */
  $$(".hero__name-line span").forEach((el, i) => el.style.setProperty("--i", i));

  /* ---------- LOADER ---------- */
  const loader = $("#loader");
  const bar = $("#loaderBar");
  const count = $("#loaderCount");
  const MIN_TIME = reduce ? 300 : 3000;
  let start = performance.now();

  const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
  // the signature starts writing once the handwriting font is in; the timer restarts with it
  fontsReady.then(() => { start = performance.now(); loader.classList.add("is-writing"); });

  const imgs = $$("img").filter((i) => i.loading !== "lazy");
  const imgReady = Promise.all(
    imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })))
  );
  let assetsDone = false;
  Promise.all([fontsReady, imgReady]).then(() => (assetsDone = true));
  setTimeout(() => (assetsDone = true), 6000); // never hang

  (function tick(now) {
    const t = Math.max(0, Math.min(1, (now - start) / MIN_TIME));
    const p = assetsDone ? t : Math.min(t, 0.9);
    bar.style.width = (p * 100).toFixed(1) + "%";
    count.textContent = String(Math.round(p * 100)).padStart(2, "0");
    if (p < 1) return requestAnimationFrame(tick);
    loader.classList.add("is-done");
    document.body.classList.remove("is-loading");
    setTimeout(() => document.body.classList.add("is-ready"), 250);
    setTimeout(() => loader.remove(), 1300);
  })(start);

  /* ---------- hero notes: gentle mouse parallax ---------- */
  const notes = $$(".note");
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    let raf;
    addEventListener("mousemove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / innerWidth - 0.5;
        const y = e.clientY / innerHeight - 0.5;
        notes.forEach((n) => {
          const d = +n.dataset.depth || 10;
          n.style.setProperty("--px", (-x * d).toFixed(1) + "px");
          n.style.setProperty("--py", (-y * d).toFixed(1) + "px");
        });
      });
    });
  }

  /* ---------- nav colour by section ---------- */
  const nav = $("#nav");
  const darkSections = $$(".about, .contact");
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle("is-solid", y > 40);
    const probe = 30;
    const overDark = darkSections.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe;
    });
    nav.classList.toggle("is-dark", overDark);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- phone menu ---------- */
  const toggle = $("#navToggle");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("scroll", () => nav.classList.contains("is-open") && setMenu(false), { passive: true });

  /* ---------- reveal on scroll + counters ---------- */
  const animateCount = (el) => {
    const target = +el.dataset.count;
    const pre = el.dataset.prefix || "";
    const suf = el.dataset.suffix || "";
    const dur = 1400;
    const t0 = performance.now();
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + Math.round(target * eased).toLocaleString("en-IN") + suf;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
        el.style.transitionDelay = Math.max(0, sibs.indexOf(el)) * 70 + "ms";
        el.classList.add("is-in");
        $$("[data-count]", el).forEach(animateCount);
        io.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- small project cards: click anywhere to open the project ---------- */
  $$(".cards .card:not(.card--more)").forEach((card) => {
    const link = card.querySelector(".card__link");
    if (!link) return;
    card.dataset.href = link.href;
    card.addEventListener("click", (e) => {
      if (e.target.closest("a") || getSelection().toString()) return;
      window.open(link.href, "_blank", "noopener");
    });
  });

  /* ---------- ink-pen cursor trail & magnetic buttons (mouse only) ---------- */
  // Turned on by the first real mouse movement (media queries are unreliable in some
  // browsers/previews). Touch input switches the trail off again.
  let inkOn = false, inkCanvas = null;
  const enableInk = () => {
    if (inkOn) { inkCanvas.style.display = ""; return; }
    inkOn = true;

    // full-screen canvas the pen draws on; clicks pass straight through it
    const cv = (inkCanvas = document.createElement("canvas"));
    cv.className = "ink";
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = document.documentElement.clientWidth; H = document.documentElement.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    addEventListener("resize", size);

    const LIFE = 650; // ms a stroke stays visible before it fades away
    const DARK = ".about, .contact, .marquee, .flagship:not(.flagship--alt), .card--ai, .transit__eta, .nav.is-dark";
    const root = getComputedStyle(document.documentElement);
    const INK_LIGHT = root.getPropertyValue("--teal").trim() || "#0e7c61";
    const INK_DARK = root.getPropertyValue("--sea").trim() || "#6ee7c0";
    let pts = [];
    let drawing = false;

    addEventListener("mousemove", (e) => {
      const t = e.target instanceof Element ? e.target : null;
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now(), dark: !!(t && t.closest(DARK)) });
      if (!drawing) { drawing = true; requestAnimationFrame(draw); }
    }, { passive: true });
    document.addEventListener("mouseleave", () => { pts = []; });
    addEventListener("scroll", () => { pts = []; }, { passive: true }); // the page moved under the ink

    function draw() {
      const now = performance.now();
      pts = pts.filter((p) => now - p.t < LIFE);
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // smooth pen line through the midpoints; older parts thinner and more faded
      for (let i = 1; i < pts.length - 1; i++) {
        const a = pts[i - 1], b = pts[i], c = pts[i + 1];
        const life = 1 - (now - b.t) / LIFE;            // 1 = fresh, 0 = gone
        const speed = Math.hypot(c.x - a.x, c.y - a.y); // faster strokes draw thinner, like a real pen
        ctx.strokeStyle = b.dark ? INK_DARK : INK_LIGHT;
        ctx.globalAlpha = Math.max(0, life) * 0.85;
        ctx.lineWidth = Math.max(0.6, (3.2 - Math.min(speed, 60) / 30) * (0.35 + 0.65 * life));
        ctx.beginPath();
        ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
        ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (pts.length) requestAnimationFrame(draw);
      else { drawing = false; ctx.clearRect(0, 0, W, H); }
    }

    // magnetic buttons: pulled up to 10px toward the pointer when it comes close
    const MAG_RANGE = 70, MAG_MAX = 10;
    const magnets = $$(".btn, .nav__cta");
    addEventListener("mousemove", (e) => {
      magnets.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const reach = Math.max(r.width, r.height) / 2 + MAG_RANGE;
        const dist = Math.hypot(dx, dy);
        if (dist < reach) {
          const pull = (1 - dist / reach) * 0.45;
          el.style.setProperty("--mx", Math.max(-MAG_MAX, Math.min(MAG_MAX, dx * pull)).toFixed(1) + "px");
          el.style.setProperty("--my", Math.max(-MAG_MAX, Math.min(MAG_MAX, dy * pull)).toFixed(1) + "px");
        } else if (el.style.getPropertyValue("--mx")) {
          el.style.removeProperty("--mx");
          el.style.removeProperty("--my");
        }
      });
    }, { passive: true });
  };
  if (!reduce) {
    addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") enableInk(); }, { passive: true });
    addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" && inkCanvas) inkCanvas.style.display = "none";
    }, { passive: true });
  }

  /* ---------- phones: "Key features" toggle on the featured projects ---------- */
  $$(".flagship__more").forEach((b) => {
    b.addEventListener("click", () => {
      const card = b.closest(".flagship");
      const open = card.classList.toggle("is-open");
      b.setAttribute("aria-expanded", open);
      b.firstChild.textContent = open ? "Hide features " : "Key features ";
    });
  });

  /* ---------- "More things I've built": stacked card deck ---------- */
  const deck = $(".deck");
  if (deck) {
    const cards = $$(".card", deck);
    const n = cards.length;
    const nowEl = $("#deckNow");
    const dots = $$(".deck-dots button");
    const timer = $(".deck-timer i");
    const wrap = deck.closest(".more-wrap");
    let order = cards.map((_, i) => i);
    let busy = false;
    const FLING = 520;

    const apply = () => {
      order.forEach((ci, pos) => {
        const c = cards[ci];
        c.dataset.pos = Math.min(pos, 3);
        if (pos === 0) c.removeAttribute("inert"); else c.setAttribute("inert", "");
      });
      const front = order[0];
      if (nowEl) nowEl.textContent = String(front + 1).padStart(2, "0");
      dots.forEach((d, i) => { d.classList.toggle("is-on", i === front); d.setAttribute("aria-current", i === front); });
      restartTimer();
    };
    const restartTimer = () => {
      if (!timer) return;
      timer.style.animation = "none";
      void timer.offsetWidth; // restart the CSS animation
      timer.style.animation = "";
    };

    const next = () => {
      if (busy) return; busy = true;
      const top = cards[order[0]];
      top.classList.add("fling-out");
      setTimeout(() => {
        top.classList.remove("fling-out");
        order.push(order.shift());
        apply();
        busy = false;
      }, FLING);
    };
    const prev = () => {
      if (busy) return; busy = true;
      order.unshift(order.pop());
      const top = cards[order[0]];
      top.classList.add("fling-in");
      apply();
      setTimeout(() => { top.classList.remove("fling-in"); busy = false; }, FLING);
    };
    const goTo = (i) => {
      if (busy || i === order[0]) return;
      while (order[0] !== i) order.push(order.shift());
      const top = cards[i];
      top.classList.add("fling-in");
      busy = true;
      apply();
      setTimeout(() => { top.classList.remove("fling-in"); busy = false; }, FLING);
    };

    $$(".deck-btn").forEach((b) => b.addEventListener("click", () => (b.dataset.dir === "1" ? next() : prev())));
    dots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));
    deck.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    });

    // swipe / drag the front card
    let sx = null, swiped = false;
    deck.addEventListener("pointerdown", (e) => { sx = e.clientX; swiped = false; });
    deck.addEventListener("pointerup", (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 45) { swiped = true; dx < 0 ? next() : prev(); }
    });
    // a swipe should not also open the project
    deck.addEventListener("click", (e) => { if (swiped) { e.stopPropagation(); e.preventDefault(); swiped = false; } }, true);

    // autoplay: the progress line drives the timing; it pauses on hover/focus and off-screen
    if (!reduce && timer) {
      timer.addEventListener("animationend", next);
      const pause = (on) => wrap.classList.toggle("is-paused", on);
      wrap.addEventListener("mouseenter", () => pause(true));
      wrap.addEventListener("mouseleave", () => pause(false));
      wrap.addEventListener("focusin", () => pause(true));
      wrap.addEventListener("focusout", () => pause(false));
      new IntersectionObserver(([en]) => wrap.classList.toggle("is-offscreen", !en.isIntersecting), { threshold: 0.3 }).observe(deck);
    } else if (timer) {
      timer.parentElement.hidden = true;
    }

    apply();
  }

  /* ---------- certificate cards tilt toward the mouse ---------- */
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    $$(".cert").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
        card.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg");
      });
      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ---------- CartSense mock: cycle through "Why this?" explanations ---------- */
  const why = $("#whyText");
  if (why && !reduce) {
    const reasons = [
      [0, "Similar to a game you viewed (shared: sci-fi, metroidvania)"],
      [1, "People who reviewed a racer you liked also reviewed this"],
      [2, "Trending with players who share your taste in RPGs"],
    ];
    const rows = $$(".recs__list li");
    let k = 0;
    const show = () => {
      const [row, text] = reasons[k % reasons.length];
      why.classList.add("is-swap");
      setTimeout(() => {
        why.textContent = text;
        rows.forEach((r, i) => r.classList.toggle("is-why", i === row));
        why.classList.remove("is-swap");
      }, 300);
      k++;
    };
    show();
    setInterval(show, 3200);
  }

  /* ---------- MeriYatra mock: ETA counts down in step with the moving auto ---------- */
  const eta = $("#etaMin");
  if (eta && !reduce) {
    const t0 = performance.now();
    setInterval(() => {
      const k = ((performance.now() - t0) % 7000) / 7000; // matches the 7s animateMotion loop
      eta.textContent = k >= 0.85 ? "<1" : String(Math.max(1, Math.ceil(4 * (1 - k / 0.85))));
    }, 250);
  }

  $("#year").textContent = new Date().getFullYear();
})();
