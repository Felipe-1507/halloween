/* Motion and a seamless carousel, with native touch scrolling and no library. */
(() => {
  "use strict";
  if (document.body.dataset.page !== "home") return;
  const settings = window.HALLOWEEN_CONFIG.motion || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const enabled = settings.enabled !== false;
  const grid = document.querySelector(".gallery-grid");
  if (!grid) return;
  const icons = window.HALLOWEEN_ICONS;
  grid.classList.add("is-carousel");
  grid.setAttribute("role", "region");
  grid.setAttribute("aria-roledescription", "carousel");
  grid.setAttribute("aria-label", "Halloween mask previews");
  grid.tabIndex = 0;

  const controls = document.createElement("div");
  controls.className = "carousel-controls";
  controls.innerHTML = `<p class="carousel-hint">Swipe or use the arrows. Select a mask for a closer look.</p><div class="carousel-buttons"><button class="carousel-control" data-direction="-1" aria-label="Previous masks">${icons.previous}</button><button class="carousel-control carousel-play" aria-label="Pause carousel"><span class="carousel-play-icon" aria-hidden="true"></span><span class="carousel-play-label"></span></button><button class="carousel-control" data-direction="1" aria-label="Next masks">${icons.next}</button></div>`;
  grid.after(controls);
  const playButton = controls.querySelector(".carousel-play");
  const pauseIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5v14M15 5v14"/></svg>';
  const playIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m8 5 11 7-11 7z"/></svg>';
  let playing =
    enabled && settings.carouselAutoplay !== false && !reduced.matches;
  let hovered = false,
    focused = false,
    dragging = false,
    inView = false;
  let manualUntil = 0,
    loopWidth = 0,
    position = 0,
    lastTime = 0,
    frame = 0;
  let wasMoving = false,
    dragStart = 0,
    dragScroll = 0,
    dragged = false;
  const speed = Math.max(
    10,
    Math.min(70, Number(settings.carouselSpeed) || 28),
  );

  function syncButton() {
    const unavailable = !loopWidth || reduced.matches || !enabled;
    playButton.disabled = unavailable;
    playButton.setAttribute(
      "aria-label",
      playing ? "Pause carousel" : "Play carousel",
    );
    playButton.querySelector(".carousel-play-label").textContent = playing
      ? "Pause carousel"
      : "Play carousel";
    playButton.querySelector(".carousel-play-icon").innerHTML = playing
      ? pauseIcon
      : playIcon;
    controls.querySelectorAll("[data-direction]").forEach((button) => {
      button.disabled = !loopWidth;
    });
  }
  function wrap() {
    if (loopWidth && grid.scrollLeft >= loopWidth) {
      grid.scrollLeft %= loopWidth;
      position = grid.scrollLeft;
    }
  }
  function tick(now) {
    frame = 0;
    const moving =
      playing &&
      enabled &&
      !reduced.matches &&
      loopWidth &&
      inView &&
      !document.hidden &&
      !hovered &&
      !focused &&
      !dragging &&
      now >= manualUntil &&
      !document.querySelector("dialog[open]");
    if (moving) {
      if (!wasMoving) position = grid.scrollLeft;
      position =
        (position + (Math.min(now - (lastTime || now), 50) * speed) / 1000) %
        loopWidth;
      grid.scrollLeft = position;
    }
    wasMoving = !!moving;
    lastTime = now;
    // Do no animation-frame work when the page or carousel is off screen.
    if (inView && !document.hidden && playing && !reduced.matches)
      frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!frame && inView && !document.hidden && playing && !reduced.matches) {
      lastTime = 0;
      wasMoving = false;
      frame = requestAnimationFrame(tick);
    }
  }
  function resetCarousel() {
    grid.querySelectorAll(".carousel-copy").forEach((copy) => copy.remove());
    const originals = [...grid.querySelectorAll(".gallery-card")];
    grid.scrollLeft = 0;
    position = 0;
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    const sequence = originals.reduce(
      (sum, card) => sum + card.getBoundingClientRect().width + gap,
      0,
    );
    loopWidth = sequence > grid.clientWidth + gap ? sequence : 0;
    if (loopWidth)
      originals.forEach((original) => {
        const copy = document.createElement("div");
        copy.className = original.className.replace(
          "gallery-card",
          "carousel-copy",
        );
        copy.setAttribute("aria-hidden", "true");
        copy.innerHTML = original.innerHTML;
        copy.querySelectorAll("img").forEach((image) => {
          image.alt = "";
        });
        // Visual loop copies have no keyboard stops; the original buttons are accessible.
        copy.addEventListener("click", () => original.click());
        grid.append(copy);
      });
    syncButton();
    schedule();
  }
  function navigate(direction) {
    if (!loopWidth) return;
    manualUntil = performance.now() + 1800;
    const card = grid.querySelector(".gallery-card");
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    if (direction < 0 && grid.scrollLeft < 1) grid.scrollLeft = loopWidth;
    grid.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: reduced.matches ? "auto" : "smooth",
    });
    if (reduced.matches) wrap();
  }
  controls
    .querySelectorAll("[data-direction]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        navigate(Number(button.dataset.direction)),
      ),
    );
  playButton.addEventListener("click", () => {
    playing = !playing;
    syncButton();
    if (!playing && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    schedule();
  });
  grid.addEventListener("mouseenter", () => {
    hovered = true;
  });
  grid.addEventListener("mouseleave", () => {
    hovered = false;
    schedule();
  });
  grid.addEventListener("focusin", () => {
    focused = true;
  });
  grid.addEventListener("focusout", () => {
    focused = grid.contains(document.activeElement);
    schedule();
  });
  grid.addEventListener(
    "wheel",
    () => {
      manualUntil = performance.now() + 2200;
    },
    { passive: true },
  );
  grid.addEventListener("scrollend", wrap);
  grid.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      navigate(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  grid.addEventListener("pointerdown", (event) => {
    dragging = true;
    dragged = false;
    dragStart = event.clientX;
    dragScroll = grid.scrollLeft;
    manualUntil = performance.now() + 2200;
    // Touch uses native scrolling; mouse/pen can drag the same track.
    if (event.pointerType !== "touch") grid.classList.add("is-dragging");
  });
  grid.addEventListener("pointermove", (event) => {
    if (!dragging || event.pointerType === "touch") return;
    const distance = event.clientX - dragStart;
    if (Math.abs(distance) > 6) {
      dragged = true;
      grid.scrollLeft = dragScroll - distance;
    }
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    grid.classList.remove("is-dragging");
    manualUntil = performance.now() + 2200;
    schedule();
  }
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
  grid.addEventListener(
    "click",
    (event) => {
      if (dragged) {
        event.preventDefault();
        event.stopImmediatePropagation();
        dragged = false;
      }
    },
    true,
  );
  grid.addEventListener("dragstart", (event) => event.preventDefault());
  grid.addEventListener("halloween:gallery-updated", resetCarousel);
  new ResizeObserver(resetCarousel).observe(grid);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    schedule();
  }).observe(grid);
  document.addEventListener("visibilitychange", schedule);
  resetCarousel();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08 },
  );
  function syncMotion() {
    const active = enabled && !reduced.matches;
    document.body.classList.toggle("motion-enabled", active);
    if (!active) {
      playing = false;
      document
        .querySelectorAll(".reveal-on-scroll")
        .forEach((element) => element.classList.add("is-revealed"));
    } else {
      document
        .querySelectorAll(
          ".section-heading,.benefit-card,.step,.audience-card,.bonus-card,.pricing-story,.price-card,.faq-layout>div,.final-panel",
        )
        .forEach((element, index) => {
          element.classList.add("reveal-on-scroll");
          element.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
          revealObserver.observe(element);
        });
    }
    syncButton();
    schedule();
  }
  reduced.addEventListener("change", syncMotion);
  syncMotion();
})();
