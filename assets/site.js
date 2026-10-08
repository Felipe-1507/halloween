/* Standalone behavior. All product data comes from config.js and manifest.js. */
(() => {
  "use strict";
  const p = window.HALLOWEEN_CONFIG;
  const a = window.HALLOWEEN_ASSETS;
  const icons = window.HALLOWEEN_ICONS;
  const offer = window.HALLOWEEN_OFFERS;
  if (!p || !a || !offer) return;
  const home = document.body.dataset.page === "home";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const e = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const included = offer.ready(p.offers.complete);

  // Native, keyboard-accessible dialogs: no third-party lightbox required.
  let dialog = null,
    previousFocus = null,
    oldOverflow = "",
    lightboxImages = [],
    lightboxIndex = 0;
  function updateLightbox() {
    const item = lightboxImages[lightboxIndex];
    dialog.setAttribute("aria-label", item.name || "Product preview");
    const image = dialog.querySelector("img");
    image.src = item.fullPage || item.src;
    image.alt = item.alt;
    dialog.querySelector(".lightbox-title").textContent =
      item.name || "Product preview";
    dialog.querySelector("small").textContent =
      `${lightboxIndex + 1} / ${lightboxImages.length}`;
  }
  function closeLightbox() {
    if (!dialog) return;
    dialog.close();
    dialog.remove();
    dialog = null;
    document.body.style.overflow = oldOverflow;
    previousFocus?.focus();
  }
  function stepLightbox(amount) {
    lightboxIndex =
      (lightboxIndex + amount + lightboxImages.length) % lightboxImages.length;
    updateLightbox();
  }
  function openLightbox(images, index = 0) {
    closeLightbox();
    previousFocus = document.activeElement;
    oldOverflow = document.body.style.overflow;
    lightboxImages = images;
    lightboxIndex = index;
    dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.innerHTML = `<div class="lightbox-content"><button class="lightbox-close icon-button" aria-label="Close preview">${icons.close}</button><img class="lightbox-image" width="1000" height="1000" alt=""><div class="lightbox-caption"><button class="icon-button" data-step="-1" aria-label="Previous image">${icons.previous}</button><span><span class="lightbox-title"></span><small></small></span><button class="icon-button" data-step="1" aria-label="Next image">${icons.next}</button></div></div>`;
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeLightbox();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.closest(".lightbox-close"))
        closeLightbox();
      else if (event.target.closest("[data-step]"))
        stepLightbox(Number(event.target.closest("[data-step]").dataset.step));
    });
    document.body.append(dialog);
    updateLightbox();
    document.body.style.overflow = "hidden";
    dialog.showModal();
  }
  document.addEventListener("keydown", (event) => {
    if (!dialog) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepLightbox(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepLightbox(-1);
    }
  });

  // Navigation works at /, /repository/, and file://, without a configured base path.
  const menu = $(".menu-toggle");
  function closeMenu() {
    $("#mobile-nav")?.remove();
    menu?.setAttribute("aria-expanded", "false");
    if (menu) {
      menu.innerHTML = icons.menu;
      menu.setAttribute("aria-label", "Open navigation");
    }
  }
  menu?.addEventListener("click", () => {
    if ($("#mobile-nav")) {
      closeMenu();
      return;
    }
    const nav = document.createElement("nav");
    nav.id = "mobile-nav";
    nav.className = "mobile-nav";
    nav.setAttribute("aria-label", "Mobile navigation");
    $$(".desktop-nav a")
      .slice(0, 3)
      .forEach((link) => nav.append(link.cloneNode(true)));
    const cta = document.createElement("a");
    cta.href = "./index.html#pricing";
    cta.textContent = "Get My Halloween Kit";
    cta.dataset.cta = "mobile-nav";
    nav.append(cta);
    $(".navbar").append(nav);
    menu.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-label", "Close navigation");
    menu.innerHTML = icons.close;
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("#mobile-nav")) {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    if (link.dataset.cta) trackCTA(link.dataset.cta, link.getAttribute("href"));
    const url = new URL(link.href, location.href);
    if (
      home &&
      url.hash &&
      url.origin === location.origin &&
      (url.pathname === location.pathname ||
        url.pathname === new URL("./index.html", location.href).pathname)
    ) {
      const target = document.getElementById(
        decodeURIComponent(url.hash.slice(1)),
      );
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", url.hash);
      target.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    }
  });

  if (home) {
    // Progressive loading keeps the first gallery compact on mobile.
    let category = "All",
      limit = 10,
      visible = [];
    const grid = $(".gallery-grid");
    const filters = $(".filters");
    const more = $(".gallery-more") || document.createElement("div");
    more.className = "gallery-more";
    grid.after(more);
    function renderGallery() {
      const collection = offer.core() ? a.masks : a.props.slice(0, 5);
      const matching = collection.filter(
        (item) => category === "All" || item.category === category,
      );
      visible = matching.slice(0, limit);
      grid.replaceChildren();
      visible.forEach((item, index) => {
        const button = document.createElement("button");
        button.className = `gallery-card gallery-tone-${index % 5}`;
        button.setAttribute("aria-label", `Enlarge ${item.name}`);
        button.innerHTML = `<div class="gallery-image"><img src="${e(item.src)}" alt="${e(item.alt)}" width="320" height="440" loading="lazy" decoding="async"${item.clipPath ? ` style="clip-path:${e(item.clipPath)}"` : ""}></div><span class="gallery-card-label">${e(item.name)}${icons.expand}</span>`;
        button.addEventListener("click", () => openLightbox(visible, index));
        grid.append(button);
      });
      more.replaceChildren();
      if (matching.length > visible.length) {
        const button = document.createElement("button");
        button.className = "button button-secondary";
        button.textContent = `Meet more monsters (${matching.length - visible.length} more)`;
        button.addEventListener("click", () => {
          limit += 20;
          renderGallery();
        });
        more.append(button);
      }
      filters
        ?.querySelectorAll("button")
        .forEach((button) =>
          button.setAttribute(
            "aria-pressed",
            String(button.textContent === category),
          ),
        );
      grid.dispatchEvent(new CustomEvent("halloween:gallery-updated"));
    }
    if (filters) {
      filters.replaceChildren();
      ["All", ...new Set(a.masks.map((mask) => mask.category))].forEach(
        (name) => {
          const button = document.createElement("button");
          button.textContent = name;
          button.addEventListener("click", () => {
            category = name;
            limit = 10;
            renderGallery();
          });
          filters.append(button);
        },
      );
    }
    renderGallery();
    $$(".guide-previews button").forEach((button, index) =>
      button.addEventListener("click", () => openLightbox(a.guides, index)),
    );

    const bonusGrid = $(".bonus-grid");
    const bonusTemplates = new Map(
      $$(".bonus-card").map((card) => [
        Array.from(card.classList)
          .find((c) => c.startsWith("bonus-") && c !== "bonus-card")
          .slice(6),
        card.cloneNode(true),
      ]),
    );
    bonusGrid.replaceChildren();
    offer.bonuses().forEach((bonus, index) => {
      const template =
        bonusTemplates.get(bonus.id) || bonusTemplates.get("headbands");
      if (!template) return;
      const card = template.cloneNode(true);
      card.className = `bonus-card bonus-${bonus.id}`;
      card.querySelector(".bonus-number").textContent =
        `EXTRA ${String(index + 1).padStart(2, "0")}`;
      card.querySelector(".bonus-type").textContent = bonus.title;
      card.querySelector("h3").textContent = bonus.shortTitle;
      card.querySelector(".bonus-copy p").textContent = bonus.description;
      card.querySelector(".included-badge").innerHTML =
        icons.check +
        e(
          included
            ? "Included in the Complete Pack"
            : "Verified resource • Offer opens soon",
        );
      const previews = Array.isArray(a[bonus.preview])
        ? a[bonus.preview]
        : [{ ...a[bonus.preview], name: bonus.title }];
      const button = card.querySelector(".bonus-preview-button");
      button.setAttribute("aria-label", `Preview ${bonus.title}`);
      if (!bonusTemplates.has(bonus.id))
        button.innerHTML = `<img src="${e(previews[0].src)}" alt="${e(previews[0].alt)}" width="500" height="400" loading="lazy">`;
      button.addEventListener("click", () => openLightbox(previews));
      bonusGrid.append(card);
    });
    if (!offer.bonuses().length) $("#bonuses").hidden = true;

    // Prices and destinations are configured once; unverified checkout stays disabled.
    const pricing = $(".pricing-layout");
    const cardTemplate = $(".price-card").cloneNode(true);
    $$(".price-card").forEach((card) => card.remove());
    function renderPrice(data, complete) {
      const ready = offer.ready(data),
        card = cardTemplate.cloneNode(true);
      card.classList.toggle("price-card-complete", complete);
      if (!complete) card.querySelector(".price-card-top")?.remove();
      card.querySelector(".eyebrow").textContent = complete
        ? "MORE WAYS TO MAKE MEMORIES"
        : "THE MASK COLLECTION";
      card.querySelector("h3").textContent = data.name;
      card.querySelector(".price-description").textContent = complete
        ? "Dress-up fun, creative activities, and photo moments—all with one playful Halloween theme."
        : "The core collection for little monster adventures.";
      const price = card.querySelector(".price");
      price.classList.toggle("price-pending", typeof data.price !== "number");
      price.replaceChildren();
      if (
        typeof data.originalPrice === "number" &&
        typeof data.price === "number" &&
        data.originalPrice > data.price
      ) {
        const old = document.createElement("del");
        old.textContent = offer.price(data.originalPrice);
        price.append(old);
      }
      const amount = document.createElement("strong");
      amount.textContent = offer.price(data.price);
      const note = document.createElement("span");
      note.textContent = ready
        ? "Digital printable craft kit"
        : "This offer is being prepared. Checkout is not open.";
      price.append(amount, note);
      card.querySelector(".price-inclusions>strong").textContent = ready
        ? "What’s included"
        : "Verified resources for this pack";
      const inclusions = [
        ...(offer.core()
          ? [
              `${p.maskCount} illustrated printable mask designs`,
              "A4 printable digital files",
            ]
          : []),
        ...(complete ? offer.bonuses().map((b) => b.title) : []),
      ];
      card.querySelector(".price-inclusions ul").innerHTML = inclusions
        .map((text) => `<li>${icons.check}${e(text)}</li>`)
        .join("");
      const button = document.createElement(ready ? "a" : "button");
      button.className = `button ${ready ? "button-primary" : "button-unavailable"} purchase-button`;
      button.innerHTML =
        e(
          ready
            ? `Get My ${complete ? "Complete Halloween Kit" : "Basic Pack"}`
            : "Checkout opens soon",
        ) + icons.arrow;
      if (ready) {
        button.href = data.checkoutUrl;
        button.rel = "noopener noreferrer";
        button.dataset.cta = complete ? "complete-checkout" : "basic-checkout";
      } else button.disabled = true;
      card.querySelector(".purchase-button").replaceWith(button);
      pricing.append(card);
    }
    if (offer.basic()) renderPrice(p.offers.basic, false);
    if (p.offers.complete.enabled) renderPrice(p.offers.complete, true);
    pricing.classList.toggle(
      "two-offers",
      offer.basic() && p.offers.complete.enabled,
    );
    $(".comparison-wrap")?.remove();
    if (offer.basic() && p.offers.complete.enabled) {
      const comparison = document.createElement("div");
      comparison.className = "comparison-wrap";
      comparison.innerHTML = `<table><caption>Compare the Halloween packs</caption><thead><tr><th scope="col">Resource</th><th scope="col">${e(p.offers.basic.name)}</th><th scope="col">${e(p.offers.complete.name)}</th></tr></thead><tbody><tr><th scope="row">Core mask collection</th><td>Included</td><td>Included</td></tr>${offer
        .bonuses()
        .map(
          (b) =>
            `<tr><th scope="row">${e(b.title)}</th><td>Not included</td><td>Included</td></tr>`,
        )
        .join("")}</tbody></table>`;
      pricing.before(comparison);
    }
    if (included) {
      $(".preview-strip")?.remove();
      const micro = $(".hero-micro");
      if (micro)
        micro.innerHTML = micro.innerHTML.replace(
          "Digital kit • Launch preview",
          "Digital delivery after purchase",
        );
    }
    const headline = $("#hero-title");
    headline.replaceChildren();
    p.headline.split("\n").forEach((line, index, lines) => {
      const span = document.createElement("span");
      span.textContent = line;
      if (index === 2) span.className = "orange-text";
      headline.append(span);
      if (index < lines.length - 1)
        headline.append(document.createElement("br"));
    });
    $(".hero-description").textContent = p.subheadline;

    // One open answer at a time, with native hidden and ARIA relationships.
    if (included)
      $("#faq-answer-1 p").textContent =
        "This is a digital product. After your purchase, follow the file-access instructions provided by the verified checkout delivery process.";
    if (p.license.approved && p.license.classroomUse)
      $("#faq-answer-4 p").textContent = p.license.classroomUse;
    if (p.license.approved && p.license.repeatPrinting)
      $("#faq-answer-5 p").textContent = p.license.repeatPrinting;
    if (p.supportEmail)
      $("#faq-answer-7 p").textContent =
        `Email ${p.supportEmail} for help with your kit.`;
    $$(".faq-item button").forEach((button) =>
      button.addEventListener("click", () => {
        const open = button.getAttribute("aria-expanded") !== "true";
        $$(".faq-item button").forEach((other) => {
          const active = other === button && open;
          other.setAttribute("aria-expanded", String(active));
          $("#" + other.getAttribute("aria-controls")).hidden = !active;
          other.closest(".faq-item").classList.toggle("is-open", active);
          other.querySelector("svg").outerHTML = active
            ? icons.minus
            : icons.plus;
        });
      }),
    );

    let heroPast = false,
      pricingVisible = false;
    function updateMobileCTA() {
      let bar = $(".mobile-cta-bar");
      const show = heroPast && !pricingVisible;
      if (!show) {
        bar?.remove();
        return;
      }
      if (bar) return;
      bar = document.createElement("div");
      bar.className = "mobile-cta-bar";
      bar.innerHTML = `<a class="button button-primary" href="./index.html#pricing" data-cta="mobile-sticky">Get My Halloween Kit${icons.arrow}</a>`;
      document.body.append(bar);
    }
    new IntersectionObserver(([entry]) => {
      heroPast = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
      updateMobileCTA();
    }).observe($("#hero"));
    new IntersectionObserver(([entry]) => {
      pricingVisible = entry.isIntersecting;
      updateMobileCTA();
    }).observe($("#pricing"));
  }

  // Approved policy content can be updated without a framework build.
  const policyKey = {
    privacy: "privacy",
    terms: "terms",
    "refund-policy": "refund",
  }[document.body.dataset.page];
  if (policyKey && p.policies.approved && p.policies[policyKey]?.length) {
    const main = $(".policy-page");
    main
      .querySelectorAll("section,.policy-status")
      .forEach((node) => node.remove());
    p.policies[policyKey].forEach((section) => {
      const element = document.createElement("section");
      const heading = document.createElement("h2");
      heading.textContent = section.title;
      const paragraph = document.createElement("p");
      paragraph.textContent = section.body;
      element.append(heading, paragraph);
      main.append(element);
    });
    if (p.businessName) {
      const seller = document.createElement("p");
      seller.textContent = `Seller: ${p.businessName}`;
      main.append(seller);
    }
  }
  if (p.supportEmail) {
    const footer = $(".footer-top nav");
    if (footer && !footer.querySelector('[href^="mailto:"]')) {
      const link = document.createElement("a");
      link.href = `mailto:${p.supportEmail}`;
      link.textContent = "Contact support";
      footer.append(link);
    }
  }
  const copyright = $(".footer-bottom>p");
  if (copyright)
    copyright.textContent = `© ${new Date().getFullYear()} ${p.brand}.`;

  // Optional analytics. No Purchase event exists on this sales page.
  const validGA = /^G-[A-Z0-9]+$/.test(p.tracking.ga4Id),
    validMeta = /^\d+$/.test(p.tracking.metaPixelId);
  let memoryConsent = null;
  function consent() {
    try {
      return (
        localStorage.getItem("halloween-analytics-consent") || memoryConsent
      );
    } catch {
      return memoryConsent;
    }
  }
  function saveConsent(value) {
    memoryConsent = value;
    try {
      localStorage.setItem("halloween-analytics-consent", value);
    } catch {
      /* Continue with a session-only choice. */
    }
  }
  function allowed() {
    return (
      consent() !== "declined" &&
      (!p.tracking.requireConsent || consent() === "accepted")
    );
  }
  function startTracking() {
    if (
      !(validGA || validMeta) ||
      !allowed() ||
      window.halloweenTrackingStarted
    )
      return;
    window.halloweenTrackingStarted = true;
    if (validGA) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args) {
        window.dataLayer.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", p.tracking.ga4Id, { send_page_view: false });
      window.gtag("event", "page_view", { page_location: location.href });
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${p.tracking.ga4Id}`;
      document.head.append(script);
    }
    if (validMeta) {
      const fbq = function (...args) {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      window.fbq = fbq;
      fbq("init", p.tracking.metaPixelId);
      fbq("track", "PageView");
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.append(script);
    }
  }
  function trackCTA(location, destination) {
    if (!(validGA || validMeta) || !allowed()) return;
    window.gtag?.("event", "cta_click", {
      cta_location: location,
      destination,
    });
    window.fbq?.("trackCustom", "CTAClick", { location, destination });
  }
  if (validGA || validMeta) {
    if (p.tracking.requireConsent && consent() === null) {
      const banner = document.createElement("div");
      banner.className = "consent-banner";
      banner.setAttribute("role", "region");
      banner.setAttribute("aria-label", "Optional analytics");
      banner.innerHTML =
        '<p>May we use optional analytics to understand page visits and kit-button clicks? <a href="./privacy.html">Privacy policy</a></p><div><button data-consent="declined">No thanks</button><button data-consent="accepted">Allow analytics</button></div>';
      banner.addEventListener("click", (event) => {
        const choice = event.target.closest("[data-consent]");
        if (!choice) return;
        saveConsent(choice.dataset.consent);
        banner.remove();
        startTracking();
      });
      document.body.append(banner);
    }
    const settings = document.createElement("button");
    settings.className = "privacy-settings";
    settings.textContent = "Disable optional analytics";
    settings.addEventListener("click", () => {
      saveConsent("declined");
      window.fbq?.("consent", "revoke");
      location.reload();
    });
    document.body.append(settings);
    startTracking();
  }
})();
