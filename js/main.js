/* =====================================================================
   Renders the site from config.js + js/images.js and wires up motion.
   Content changes belong in config.js — not here.
   ===================================================================== */
(() => {
  "use strict";

  const C = window.SITE_CONFIG || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- helpers ---------- */
  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // "Plain *bright* plain" -> two-tone spans
  const twoTone = (s = "") =>
    esc(s)
      .split(/(\*[^*]+\*)/g)
      .filter(Boolean)
      .map((part) =>
        part.startsWith("*") ? `<span class="tt-hi">${part.slice(1, -1)}</span>` : `<span class="tt-lo">${part}</span>`
      )
      .join("");

  const plain = (s = "") => String(s).replace(/\*/g, "");
  const waLink = (text) =>
    `https://wa.me/${encodeURIComponent(C.contact?.whatsapp || "")}?text=${encodeURIComponent(text || C.contact?.whatsappGreeting || "")}`;
  const numFromPath = (p) => parseInt(p.split("/").pop(), 10);

  const icon = {
    whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico ico--fill"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="dot"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
    arrowL: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path d="M15 5l-7 7 7 7"/></svg>`,
    arrowR: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path d="M9 5l7 7-7 7"/></svg>`,
  };

  /* ---------- images: manifest first, numbered-file probing as fallback ---------- */
  async function probeFolder(folder) {
    const found = [];
    let misses = 0;
    for (let i = 1; misses < 3 && i < 500; i++) {
      const src = `${folder}/${i}.jpg`;
      const ok = await new Promise((res) => {
        const im = new Image();
        im.onload = () => res(true);
        im.onerror = () => res(false);
        im.src = src;
      });
      if (ok) { found.push(src); misses = 0; } else misses++;
    }
    return found;
  }
  async function getImages(folder) {
    const m = window.SITE_IMAGES;
    if (m && Array.isArray(m[folder])) return m[folder];
    return probeFolder(folder);
  }

  /* ---------- section heading ---------- */
  const heading = (text, id) =>
    `<h2 class="section-title reveal-lines" id="${id}-title"><span class="rl">${twoTone(text)}</span></h2>`;

  /* =================================================================
     RENDERERS
     ================================================================= */
  function renderHeader() {
    const h = $(".site-header");
    const links = (C.nav || [])
      .filter((n) => (C.sections || []).includes(n.target))
      .map((n) => `<li><a href="#${n.target}">${esc(n.label)}</a></li>`)
      .join("");
    h.innerHTML = `
      <a class="skip" href="#main">Skip to content</a>
      <div class="site-header__inner">
        <a href="#top" class="wordmark" aria-label="${esc(C.site?.name)} — home">
          <span class="wordmark__mark">JD</span><span class="wordmark__name">${esc(C.site?.name)}</span>
        </a>
        <nav class="nav" aria-label="Main">
          <ul>${links}</ul>
        </nav>
        <a class="btn btn--accent btn--sm header-cta" href="${waLink()}" target="_blank" rel="noopener">${icon.whatsapp}<span>WhatsApp</span></a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">
          <span class="sr-only">Menu</span><span class="menu-toggle__bars" aria-hidden="true"></span>
        </button>
      </div>
      <div class="mobile-menu" id="mobile-menu" hidden>
        <ul>${links}</ul>
        <a class="btn btn--accent" href="${waLink()}" target="_blank" rel="noopener">${icon.whatsapp}<span>Message on WhatsApp</span></a>
      </div>`;
  }

  const R = {};

  R.hero = () => {
    const h = C.hero || {};
    const letters = (word) =>
      [...word].map((ch, i) => `<span class="char" style="--i:${i}">${esc(ch)}</span>`).join("");
    return `
    <section class="hero" id="hero" aria-label="Introduction">
      <div class="hero__photo" aria-hidden="true">
        <img src="${esc(h.photo)}" alt="" fetchpriority="high" />
      </div>
      <div class="hero__content wrap">
        <h1 class="hero__name" aria-label="${esc(h.firstName)} ${esc(h.lastName)}">
          <span class="hero__line" aria-hidden="true">${letters(h.firstName || "")}</span>
          <span class="hero__line hero__line--indent" aria-hidden="true">${letters(h.lastName || "")}</span>
        </h1>
        <div class="hero__copy">
          <p class="hero__headline">${twoTone(h.headline)}</p>
          <p class="hero__intro">${esc(h.intro)}</p>
          <div class="hero__ctas">
            <a class="btn btn--accent" href="#contact">${esc(h.primaryCta)}</a>
            <a class="btn btn--ghost" href="#transformations">${esc(h.secondaryCta)}</a>
          </div>
          ${h.badges?.length ? `<ul class="hero__badges">${h.badges.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
        </div>
      </div>
    </section>
    ${C.marquee?.length ? R.marquee() : ""}`;
  };

  R.marquee = () => {
    const items = C.marquee.map((m) => `<span>${esc(m)}</span><i aria-hidden="true"></i>`).join("");
    return `
    <div class="marquee" aria-label="${esc(C.marquee.join(", "))}">
      <div class="marquee__track" aria-hidden="true">${items}${items}${items}${items}</div>
    </div>`;
  };

  R.manifesto = () => {
    if (!C.manifesto) return "";
    const words = esc(C.manifesto).split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
    return `
    <section class="manifesto wrap" id="manifesto" aria-label="Philosophy">
      <p class="manifesto__text">${words}</p>
    </section>`;
  };

  R.about = () => {
    const a = C.about;
    if (!a) return "";
    return `
    <section class="about wrap section" id="about" aria-labelledby="about-title">
      <div class="about__media">
        <img src="${esc(a.photo)}" alt="${esc(C.site?.name)} training" loading="lazy" />
        ${a.quote ? `<blockquote class="glass about__quote"><p>“${esc(a.quote)}”</p></blockquote>` : ""}
      </div>
      <div class="about__body">
        ${heading(a.heading, "about")}
        ${(a.paragraphs || []).map((p) => `<p class="lead">${esc(p)}</p>`).join("")}
        ${a.facts?.length ? `<dl class="facts">${a.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("")}</dl>` : ""}
      </div>
    </section>`;
  };

  R.services = () => {
    const s = C.services;
    if (!s?.items?.length) return "";
    return `
    <section class="services wrap section" id="services" aria-labelledby="services-title">
      ${heading(s.heading, "services")}
      <ul class="services__list">
        ${s.items
          .map(
            (it) => `
          <li class="service">
            <h3 class="service__title">${esc(it.title)}</h3>
            <span class="service__format">${esc(it.format)}</span>
            <p class="service__text">${esc(it.text)}</p>
            <a class="service__link" href="#contact" aria-label="Enquire about ${esc(it.title)}">Enquire</a>
          </li>`
          )
          .join("")}
      </ul>
    </section>`;
  };

  R.transformations = () => {
    const t = C.transformations;
    if (!t) return "";
    return `
    <section class="transformations section" id="transformations" aria-labelledby="transformations-title">
      <div class="wrap">
        <div class="section-head">
          ${heading(t.heading, "transformations")}
          <p class="section-intro">${esc(t.intro)} <span class="count" data-count></span></p>
        </div>
        <div class="gallery" data-gallery></div>
        <div class="gallery__more">
          <button class="btn btn--ghost" type="button" data-more hidden>Show more results</button>
        </div>
      </div>
    </section>`;
  };

  R.process = () => {
    const p = C.process;
    if (!p?.steps?.length) return "";
    return `
    <section class="process wrap section" id="process" aria-labelledby="process-title">
      ${heading(p.heading, "process")}
      <ol class="steps">
        ${p.steps
          .map(
            (s, i) => `
          <li class="step" style="--i:${i}">
            <span class="step__num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
            <h3 class="step__title">${esc(s.title)}</h3>
            <p>${esc(s.text)}</p>
          </li>`
          )
          .join("")}
      </ol>
    </section>`;
  };

  R.certifications = () => {
    const c = C.certifications;
    if (!c) return "";
    return `
    <section class="certs section" id="certifications" aria-labelledby="certifications-title">
      <div class="wrap section-head section-head--row">
        <div>
          ${heading(c.heading, "certifications")}
          <p class="section-intro">${esc(c.intro)}</p>
        </div>
        <div class="certs__controls">
          <button class="round-btn" type="button" data-cert-prev aria-label="Scroll certificates left">${icon.arrowL}</button>
          <button class="round-btn" type="button" data-cert-next aria-label="Scroll certificates right">${icon.arrowR}</button>
        </div>
      </div>
      <ul class="certs__track" data-certs tabindex="0" aria-label="Certificates"></ul>
    </section>`;
  };

  R.faq = () => {
    const f = C.faq;
    if (!f?.items?.length) return "";
    return `
    <section class="faq wrap section" id="faq" aria-labelledby="faq-title">
      ${heading(f.heading, "faq")}
      <div class="faq__list">
        ${f.items
          .map(
            (it) => `
          <details class="faq__item">
            <summary><span>${esc(it.q)}</span><i aria-hidden="true"></i></summary>
            <div class="faq__answer"><p>${esc(it.a)}</p></div>
          </details>`
          )
          .join("")}
      </div>
    </section>`;
  };

  R.contact = () => {
    const s = C.contactSection || {};
    const k = C.contact || {};
    const radios = (name, opts) =>
      opts
        .map(
          (o, i) =>
            `<label class="chip"><input type="radio" name="${name}" value="${esc(o)}" ${i === 0 ? "checked" : ""} /><span>${esc(o)}</span></label>`
        )
        .join("");
    const links = [
      k.whatsapp && `<li><a href="${waLink()}" target="_blank" rel="noopener">${icon.whatsapp}<span>WhatsApp</span></a></li>`,
      k.instagram && `<li><a href="https://instagram.com/${esc(k.instagram)}" target="_blank" rel="noopener">${icon.instagram}<span>@${esc(k.instagram)}</span></a></li>`,
      k.email && `<li><a href="mailto:${esc(k.email)}">${icon.mail}<span>${esc(k.email)}</span></a></li>`,
      k.phone && `<li><a href="tel:${esc(k.phone.replace(/\s/g, ""))}">${icon.phone}<span>${esc(k.phone)}</span></a></li>`,
      k.location && `<li><span class="contact__loc">${icon.pin}<span>${esc(k.location)} · online worldwide</span></span></li>`,
    ]
      .filter(Boolean)
      .join("");
    return `
    <section class="contact section" id="contact" aria-labelledby="contact-title">
      ${s.photo ? `<div class="contact__bg" aria-hidden="true"><img src="${esc(s.photo)}" alt="" loading="lazy" /></div>` : ""}
      <div class="wrap contact__grid">
        <div class="contact__intro">
          ${heading(s.heading, "contact")}
          <p class="lead">${esc(s.text)}</p>
          <ul class="contact__links">${links}</ul>
        </div>
        <form class="contact__form glass" data-wa-form novalidate>
          <div class="field">
            <label for="f-name">Your name</label>
            <input id="f-name" name="name" type="text" autocomplete="given-name" required />
            <p class="field__error" id="f-name-err" hidden>Add your name so Jijo knows who's writing.</p>
          </div>
          <fieldset class="field">
            <legend>Main goal</legend>
            <div class="chips">${radios("goal", s.goals || [])}</div>
          </fieldset>
          <fieldset class="field">
            <legend>Training</legend>
            <div class="chips">${radios("format", s.formats || [])}</div>
          </fieldset>
          <div class="field">
            <label for="f-msg">Anything else? <span class="optional">(optional)</span></label>
            <textarea id="f-msg" name="message" rows="3" placeholder="Age, experience, injuries, timeline…"></textarea>
          </div>
          <button class="btn btn--accent btn--block" type="submit">${icon.whatsapp}<span>${esc(s.submitLabel || "Send")}</span></button>
        </form>
      </div>
    </section>`;
  };

  function renderFooter() {
    const f = $(".site-footer");
    const year = new Date().getFullYear();
    f.innerHTML = `
      <div class="wrap footer__top">
        <p class="footer__note">${esc(C.footer?.note || "")}</p>
        <a class="btn btn--accent" href="#contact">${esc(C.hero?.primaryCta || "Get in touch")}</a>
      </div>
      <p class="footer__giant" aria-hidden="true">${esc(C.site?.name || "")}</p>
      <div class="wrap footer__bottom">
        <span>© ${year} ${esc(C.site?.name)} · ${esc(C.site?.role)}</span>
        <a href="#top">Back to top</a>
      </div>`;
  }

  /* =================================================================
     DYNAMIC CONTENT: gallery + certificates
     ================================================================= */
  const lightboxGroups = {};

  async function buildGallery() {
    const root = $("[data-gallery]");
    if (!root) return;
    const t = C.transformations;
    let list = await getImages("transformations");
    if (t.newestFirst) list = [...list].reverse();
    const captions = t.captions || {};
    lightboxGroups.transformations = list.map((src) => ({
      src,
      caption: captions[numFromPath(src)] || "",
      alt: captions[numFromPath(src)] || "Client transformation",
    }));
    const countEl = $("[data-count]");
    if (countEl) countEl.textContent = list.length ? `${list.length} transformations and counting.` : "";
    if (!list.length) {
      root.innerHTML = `<p class="empty">New client results are on the way. Add photos to the transformations folder and run <code>npm run images</code>.</p>`;
      return;
    }

    let shown = 0;
    const more = $("[data-more]");
    const showNext = (n) => {
      const frag = document.createDocumentFragment();
      list.slice(shown, shown + n).forEach((src, j) => {
        const idx = shown + j;
        const item = lightboxGroups.transformations[idx];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tile";
        btn.style.setProperty("--d", `${(j % 12) * 50}ms`);
        btn.setAttribute("aria-label", `Open transformation ${idx + 1} of ${list.length}`);
        btn.innerHTML = `<img src="${esc(src)}" alt="${esc(item.alt)}" loading="lazy" decoding="async" />${
          item.caption ? `<span class="tile__cap">${esc(item.caption)}</span>` : ""
        }`;
        const img = btn.querySelector("img");
        const loaded = () => btn.classList.add("is-loaded");
        img.complete ? loaded() : img.addEventListener("load", loaded, { once: true });
        img.addEventListener("error", () => btn.remove(), { once: true });
        btn.addEventListener("click", () => openLightbox("transformations", idx));
        frag.appendChild(btn);
      });
      root.appendChild(frag);
      shown = Math.min(list.length, shown + n);
      more.hidden = shown >= list.length;
      more.textContent = `Show more results (${list.length - shown} left)`;
    };
    showNext(t.initialCount || 12);
    more.addEventListener("click", () => showNext(t.loadStep || 12));
  }

  async function buildCerts() {
    const track = $("[data-certs]");
    if (!track) return;
    const files = await getImages("certifications");
    const meta = new Map((C.certifications.items || []).map((m) => [Number(m.image), m]));
    // Configured order first, then any extra photos dropped in the folder.
    const ordered = [
      ...(C.certifications.items || [])
        .map((m) => files.find((f) => numFromPath(f) === Number(m.image)))
        .filter(Boolean),
      ...files.filter((f) => !meta.has(numFromPath(f))),
    ];
    lightboxGroups.certifications = ordered.map((src) => {
      const m = meta.get(numFromPath(src)) || { title: "Certification", issuer: "" };
      return { src, caption: [m.title, m.issuer].filter(Boolean).join(" — "), alt: `${m.title} certificate`, ...m };
    });
    track.innerHTML = lightboxGroups.certifications
      .map(
        (c, i) => `
      <li class="cert">
        <button type="button" class="cert__btn" data-cert="${i}" aria-label="View ${esc(c.title)} certificate">
          <span class="cert__img"><img src="${esc(c.src)}" alt="" loading="lazy" decoding="async" /></span>
          <span class="cert__meta">
            <span class="cert__title">${esc(c.title)}</span>
            <span class="cert__issuer">${esc(c.issuer)}${c.year ? ` <span class="cert__year">${esc(c.year)}</span>` : ""}</span>
          </span>
        </button>
      </li>`
      )
      .join("");
    $$("[data-cert]", track).forEach((b) => b.addEventListener("click", () => openLightbox("certifications", +b.dataset.cert)));

    const step = () => Math.min(track.clientWidth * 0.8, 520);
    $("[data-cert-prev]").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    $("[data-cert-next]").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

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
        `${C.contact?.whatsappGreeting || "Hi Jijo,"}`,
        `Name: ${name}`,
        `Goal: ${fd.get("goal")}`,
        `Training: ${fd.get("format")}`,
        fd.get("message") ? `Notes: ${String(fd.get("message")).trim()}` : "",
      ].filter(Boolean);
      window.open(waLink(lines.join("\n")), "_blank", "noopener");
    });
  }

  /* =================================================================
     BOOT
     ================================================================= */
  renderHeader();
  $("#main").innerHTML = (C.sections || []).map((s) => (R[s] ? R[s]() : "")).join("");
  renderFooter();
  document.title = `${C.site?.name} — ${C.site?.role}`;

  initHeader();
  initReveals();
  initManifesto();
  initParallax();
  initCounters();
  initForm();
  buildGallery();
  buildCerts();

  // Kick off the hero load sequence once the photo is ready.
  const heroImg = $(".hero__photo img");
  const start = () => requestAnimationFrame(() => document.body.classList.add("is-ready"));
  if (!heroImg || heroImg.complete) start();
  else { heroImg.addEventListener("load", start, { once: true }); heroImg.addEventListener("error", start, { once: true }); setTimeout(start, 2500); }
})();
