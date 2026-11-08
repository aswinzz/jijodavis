/* =====================================================================
   Motion and interactions for the pre-built page.
   The HTML itself is generated from content/*.json by scripts/build.mjs,
   so content changes never need this file.
   ===================================================================== */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* =================================================================
     GALLERY + CERTIFICATES
     ================================================================= */
  // Every [data-lb] button joins a full-screen viewer group.
  const lightboxGroups = {};
  $$("[data-lb]").forEach((btn) => {
    const group = (lightboxGroups[btn.dataset.lb] ||= []);
    const index = group.length;
    group.push({
      src: btn.dataset.full,
      caption: btn.dataset.caption || "",
      alt: btn.dataset.alt || btn.querySelector("img")?.alt || "",
    });
    btn.addEventListener("click", () => openLightbox(btn.dataset.lb, index));
  });

  function initGallery() {
    const root = $("[data-gallery]");
    if (!root) return;
    const tiles = $$(".tile", root);
    const fadeIn = (tile) => {
      const img = $("img", tile);
      const loaded = () => tile.classList.add("is-loaded");
      if (!img || img.complete) loaded();
      else { img.addEventListener("load", loaded, { once: true }); img.addEventListener("error", loaded, { once: true }); }
    };
    tiles.filter((t) => !t.hidden).forEach(fadeIn);

    const more = $("[data-more]");
    const step = Number(root.dataset.step) || 12;
    more?.addEventListener("click", () => {
      const next = tiles.filter((t) => t.hidden).slice(0, step);
      next.forEach((t, j) => { t.style.setProperty("--d", `${j * 50}ms`); t.hidden = false; fadeIn(t); });
      const left = tiles.filter((t) => t.hidden).length;
      more.hidden = left === 0;
      more.textContent = `Show more results (${left} left)`;
      next[0]?.focus({ preventScroll: true });
    });
  }

  function initCerts() {
    const track = $("[data-certs]");
    if (!track) return;
    const step = () => Math.min(track.clientWidth * 0.8, 520);
    $("[data-cert-prev]")?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    $("[data-cert-next]")?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

    // drag-to-scroll with a mouse
    let down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add("is-dragging"); }
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", () => { down = false; track.classList.remove("is-dragging"); });
    track.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  }

  /* =================================================================
     LIGHTBOX
     ================================================================= */
  const lb = $(".lightbox");
  let lbGroup = null, lbIndex = 0, lbReturn = null;

  function showLb() {
    const items = lightboxGroups[lbGroup];
    const it = items[lbIndex];
    const img = $("img", lb);
    img.classList.remove("is-in");
    img.src = it.src;
    img.alt = it.alt || "";
    $("figcaption", lb).textContent = it.caption ? it.caption : `${lbIndex + 1} / ${items.length}`;
    requestAnimationFrame(() => img.classList.add("is-in"));
    lb.classList.toggle("is-single", items.length < 2);
  }
  function openLightbox(group, index) {
    lbGroup = group; lbIndex = index; lbReturn = document.activeElement;
    showLb();
    lb.showModal();
    document.documentElement.classList.add("no-scroll");
  }
  function moveLb(d) {
    const n = lightboxGroups[lbGroup].length;
    lbIndex = (lbIndex + d + n) % n;
    showLb();
  }
  $(".lightbox__close").addEventListener("click", () => lb.close());
  $(".lightbox__nav--prev").addEventListener("click", () => moveLb(-1));
  $(".lightbox__nav--next").addEventListener("click", () => moveLb(1));
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lightbox__figure")) lb.close(); });
  lb.addEventListener("close", () => { document.documentElement.classList.remove("no-scroll"); lbReturn?.focus?.(); });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") moveLb(1);
    if (e.key === "ArrowLeft") moveLb(-1);
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) moveLb(dx < 0 ? 1 : -1);
    touchX = null;
  });

  /* =================================================================
     INTERACTIONS & MOTION
     ================================================================= */
  function initHeader() {
    const header = $(".site-header");
    const bar = $(".progress span");
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const toggle = $(".menu-toggle");
    const menu = $("#mobile-menu");
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      header.classList.toggle("menu-open", open);
      document.documentElement.classList.toggle("no-scroll", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    window.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));

    // highlight current section in nav
    const links = $$(".nav a");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${en.target.id}`));
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    $$("main section[id]").forEach((s) => io.observe(s));
  }

  // Reveal: headings rise line-by-line; steps line draws; tiles fade in.
  function initReveals() {
    const targets = $$(".reveal-lines, .steps, .gallery, .about__media, .facts");
    if (reduceMotion) { targets.forEach((t) => t.classList.add("is-visible")); return; }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((t) => io.observe(t));
  }

  // Manifesto words light up as you scroll through the section.
  function initManifesto() {
    const sec = $(".manifesto");
    if (!sec) return;
    const words = $$(".w", sec);
    if (reduceMotion) { words.forEach((w) => w.classList.add("is-lit")); return; }
    let ticking = false;
    const update = () => {
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // Hero photo drifts slower than the page.
  function initParallax() {
    if (reduceMotion) return;
    const photo = $(".hero__photo");
    if (!photo) return;
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = Math.min(window.scrollY, window.innerHeight);
          photo.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  // Count-up for the "facts" values that are plain numbers (e.g. "36+").
  function initCounters() {
    const els = $$(".facts dd");
    const run = (el) => {
      const m = el.textContent.match(/^(\d+)(.*)$/);
      if (!m || reduceMotion) return;
      const end = +m[1], suffix = m[2], t0 = performance.now(), dur = 1400;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  function initForm() {
    const form = $("[data-wa-form]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const err = $("#f-name-err");
      const input = $("#f-name");
      if (!name) {
        err.hidden = false;
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", "f-name-err");
        input.focus();
        return;
      }
      err.hidden = true;
      input.removeAttribute("aria-invalid");
      const lines = [
        form.dataset.greeting || "Hi Jijo,",
        `Name: ${name}`,
        `Goal: ${fd.get("goal")}`,
        `Training: ${fd.get("format")}`,
        fd.get("message") ? `Notes: ${String(fd.get("message")).trim()}` : "",
      ].filter(Boolean);
      const wa = `https://wa.me/${encodeURIComponent(form.dataset.whatsapp || "")}?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(wa, "_blank", "noopener");
    });
  }

  /* =================================================================
     BOOT
     ================================================================= */
  initHeader();
  initReveals();
  initManifesto();
  initParallax();
  initCounters();
  initForm();
  initGallery();
  initCerts();

  // Kick off the hero load sequence once the photo is ready.
  const heroImg = $(".hero__photo img");
  const start = () => requestAnimationFrame(() => document.body.classList.add("is-ready"));
  if (!heroImg || heroImg.complete) start();
  else { heroImg.addEventListener("load", start, { once: true }); heroImg.addEventListener("error", start, { once: true }); setTimeout(start, 2500); }
})();
