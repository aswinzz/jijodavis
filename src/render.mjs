/* =====================================================================
   Turns the content in content/*.json into the page's HTML.
   Runs at build time (scripts/build.mjs), so visitors and search engines
   get finished HTML. js/main.js only adds motion and interactions.
   ===================================================================== */

/* ---------- helpers ---------- */
export const esc = (s = "") =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// "Plain *bright* plain" -> two-tone spans
const twoTone = (s = "") =>
  esc(s)
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("*") ? `<span class="tt-hi">${part.slice(1, -1)}</span>` : `<span class="tt-lo">${part}</span>`
    )
    .join("");

export const plain = (s = "") => String(s ?? "").replace(/\*/g, "");

const icon = {
  whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico ico--fill"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="dot"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
  arrowL: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path d="M15 5l-7 7 7 7"/></svg>`,
  arrowR: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path d="M9 5l7 7-7 7"/></svg>`,
};

const heading = (text, id) =>
  `<h2 class="section-title reveal-lines" id="${id}-title"><span class="rl">${twoTone(text)}</span></h2>`;

/**
 * Render the page.
 * @param {object} C    merged content (see scripts/build.mjs)
 * @param {object} img  image helpers from the build: img.tag(path, opts) and img.full(path)
 */
export function renderPage(C, img) {
  const waLink = (text) =>
    `https://wa.me/${encodeURIComponent(C.contact?.whatsapp || "")}?text=${encodeURIComponent(text || C.contact?.whatsappGreeting || "")}`;
  const sections = C.sections || [];

  /* ---------- header ---------- */
  const navLinks = (C.nav || [])
    .filter((n) => sections.includes(n.target))
    .map((n) => `<li><a href="#${esc(n.target)}">${esc(n.label)}</a></li>`)
    .join("");
  const header = `
      <a class="skip" href="#main">Skip to content</a>
      <div class="site-header__inner">
        <a href="#top" class="wordmark" aria-label="${esc(C.site?.name)}, home">
          <span class="wordmark__mark">JD</span><span class="wordmark__name">${esc(C.site?.name)}</span>
        </a>
        <nav class="nav" aria-label="Main">
          <ul>${navLinks}</ul>
        </nav>
        <a class="btn btn--accent btn--sm header-cta" href="${esc(waLink())}" target="_blank" rel="noopener">${icon.whatsapp}<span>WhatsApp</span></a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">
          <span class="sr-only">Menu</span><span class="menu-toggle__bars" aria-hidden="true"></span>
        </button>
      </div>
      <div class="mobile-menu" id="mobile-menu" hidden>
        <ul>${navLinks}</ul>
        <a class="btn btn--accent" href="${esc(waLink())}" target="_blank" rel="noopener">${icon.whatsapp}<span>Message on WhatsApp</span></a>
      </div>`;

  /* ---------- sections ---------- */
  const R = {};

  R.hero = () => {
    const h = C.hero || {};
    const letters = (word) => [...word].map((ch, i) => `<span class="char" style="--i:${i}">${esc(ch)}</span>`).join("");
    return `
    <section class="hero" id="hero" aria-label="Introduction">
      <div class="hero__photo" aria-hidden="true">
        ${img.tag(h.photo, { alt: "", sizes: "(max-width: 900px) 100vw, 58vw", priority: true })}
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
    ${h.marquee?.length ? marquee(h.marquee) : ""}`;
  };

  const marquee = (list) => {
    const items = list.map((m) => `<span>${esc(m)}</span><i aria-hidden="true"></i>`).join("");
    return `
    <div class="marquee" role="note" aria-label="${esc(list.join(", "))}">
      <div class="marquee__track" aria-hidden="true">${items}${items}${items}${items}</div>
    </div>`;
  };

  R.manifesto = () => {
    const text = C.hero?.manifesto;
    if (!text) return "";
    const words = esc(text).split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
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
        ${img.tag(a.photo, { alt: `${C.site?.name} training`, sizes: "(max-width: 900px) 100vw, 45vw" })}
        ${a.quote ? `<blockquote class="glass about__quote"><p>“${esc(a.quote)}”</p></blockquote>` : ""}
      </div>
      <div class="about__body">
        ${heading(a.heading, "about")}
        ${(a.paragraphs || []).map((p) => `<p class="lead">${esc(p)}</p>`).join("")}
        ${a.facts?.length ? `<dl class="facts">${a.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("")}</dl>` : ""}
        ${
          a.achievements?.length
            ? `<div class="titles">
          <h3 class="titles__heading">${esc(a.achievementsHeading || "On stage")}</h3>
          <ul class="titles__list">${a.achievements
            .map((t) => `<li><span class="titles__name">${esc(t.title)}</span><span class="titles__detail">${esc(t.detail)}</span></li>`)
            .join("")}</ul>
        </div>`
            : ""
        }
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
    const photos = (t.photos || []).filter((p) => p.image);
    const first = Number(t.initialCount) || 12;
    const tiles = photos
      .map((p, i) => {
        const alt = p.caption || "Client transformation";
        return `<button type="button" class="tile" style="--d:${(i % 12) * 50}ms" data-lb="transformations" data-full="${esc(img.full(p.image))}" data-caption="${esc(p.caption || "")}" aria-label="Open transformation ${i + 1} of ${photos.length}"${i >= first ? " hidden" : ""}>${img.tag(p.image, { alt, sizes: "(max-width: 520px) 50vw, (max-width: 1100px) 33vw, 25vw" })}${
          p.caption ? `<span class="tile__cap">${esc(p.caption)}</span>` : ""
        }</button>`;
      })
      .join("");
    const left = Math.max(0, photos.length - first);
    return `
    <section class="transformations section" id="transformations" aria-labelledby="transformations-title">
      <div class="wrap">
        <div class="section-head">
          ${heading(t.heading, "transformations")}
          <p class="section-intro">${esc(t.intro)}${photos.length ? ` <span class="count">${photos.length} transformations and counting.</span>` : ""}</p>
        </div>
        ${photos.length ? `<div class="gallery" data-gallery data-step="${Number(t.loadStep) || 12}">${tiles}</div>` : `<p class="empty">New client results are on the way.</p>`}
        <div class="gallery__more">
          <button class="btn btn--ghost" type="button" data-more${left ? "" : " hidden"}>Show more results (${left} left)</button>
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
    const items = (c?.items || []).filter((m) => m.image);
    if (!items.length) return "";
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
      <ul class="certs__track" data-certs tabindex="0" aria-label="Certificates">
        ${items
          .map((m) => {
            const title = m.title || "Certification";
            const caption = [title, m.issuer].filter(Boolean).join(", ");
            return `
        <li class="cert">
          <button type="button" class="cert__btn" data-lb="certifications" data-full="${esc(img.full(m.image))}" data-caption="${esc(caption)}" data-alt="${esc(title)} certificate" aria-label="View ${esc(title)} certificate">
            <span class="cert__img">${img.tag(m.image, { alt: "", sizes: "300px" })}</span>
            <span class="cert__meta">
              <span class="cert__title">${esc(title)}</span>
              <span class="cert__issuer">${esc(m.issuer)}${m.year ? ` <span class="cert__year">${esc(m.year)}</span>` : ""}</span>
            </span>
          </button>
        </li>`;
          })
          .join("")}
      </ul>
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
      (opts || [])
        .map(
          (o, i) =>
            `<label class="chip"><input type="radio" name="${name}" value="${esc(o)}" ${i === 0 ? "checked" : ""} /><span>${esc(o)}</span></label>`
        )
        .join("");
    const links = [
      k.whatsapp && `<li><a href="${esc(waLink())}" target="_blank" rel="noopener">${icon.whatsapp}<span>WhatsApp</span></a></li>`,
      k.instagram && `<li><a href="https://instagram.com/${esc(k.instagram)}" target="_blank" rel="noopener">${icon.instagram}<span>@${esc(k.instagram)}</span></a></li>`,
      k.email && `<li><a href="mailto:${esc(k.email)}">${icon.mail}<span>${esc(k.email)}</span></a></li>`,
      k.phone && `<li><a href="tel:${esc(String(k.phone).replace(/\s/g, ""))}">${icon.phone}<span>${esc(k.phone)}</span></a></li>`,
      k.location && `<li><span class="contact__loc">${icon.pin}<span>${esc(k.location)} · online worldwide</span></span></li>`,
    ]
      .filter(Boolean)
      .join("");
    return `
    <section class="contact section" id="contact" aria-labelledby="contact-title">
      ${s.photo ? `<div class="contact__bg" aria-hidden="true">${img.tag(s.photo, { alt: "", sizes: "480px", maxWidth: 480 })}</div>` : ""}
      <div class="wrap contact__grid">
        <div class="contact__intro">
          ${heading(s.heading, "contact")}
          <p class="lead">${esc(s.text)}</p>
          <ul class="contact__links">${links}</ul>
        </div>
        <form class="contact__form glass" data-wa-form data-whatsapp="${esc(k.whatsapp || "")}" data-greeting="${esc(k.whatsappGreeting || "")}" novalidate>
          <div class="field">
            <label for="f-name">Your name</label>
            <input id="f-name" name="name" type="text" autocomplete="given-name" required />
            <p class="field__error" id="f-name-err" hidden>Add your name so Jijo knows who's writing.</p>
          </div>
          <fieldset class="field">
            <legend>Main goal</legend>
            <div class="chips">${radios("goal", s.goals)}</div>
          </fieldset>
          <fieldset class="field">
            <legend>Training</legend>
            <div class="chips">${radios("format", s.formats)}</div>
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

  /* ---------- footer ---------- */
  const year = new Date().getFullYear();
  const footer = `
      <div class="wrap footer__top">
        <p class="footer__note">${esc(C.footer?.note || "")}</p>
        <a class="btn btn--accent" href="#contact">${esc(C.hero?.primaryCta || "Get in touch")}</a>
      </div>
      <p class="footer__giant" aria-hidden="true">${esc(C.site?.name || "")}</p>
      <div class="wrap footer__bottom">
        <span>© ${year} ${esc(C.site?.name)} · ${esc(C.site?.role)}</span>
        <a href="#top">Back to top</a>
      </div>`;

  const main = sections.map((s) => (R[s] ? R[s]() : "")).join("");
  return { header, main, footer };
}
