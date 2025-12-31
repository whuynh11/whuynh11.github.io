/**
 * Minimal interactions:
 * - Dark mode toggle (persisted)
 * - Mobile nav toggle (ESC/outside click)
 * - Current nav highlighting
 */
(() => {
  const html = document.documentElement;
  html.classList.add('js');

  
  // ----- PAGE TRANSITIONS + INTRO (works.studio-inspired) -----
  // Smooth cross-page fade for same-origin navigations + a one-time intro on the home page.
  (function initPageFX() {
    const html = document.documentElement;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Safety: if the browser restored a page from bfcache or a navigation was interrupted,
    // ensure we never start in a "leaving" state (which can look like a flicker).
    html.classList.remove("is-leaving");

    // Guard against accidental double-initialization (some pages/scripts can trigger this twice)
    if (html.dataset.pageFxInit === "1") return;
    html.dataset.pageFxInit = "1";
  
    // Ensure a fade overlay exists (used during leave transitions)
    if (!document.querySelector(".page-fade")) {
      const fade = document.createElement("div");
      fade.className = "page-fade";
      fade.setAttribute("aria-hidden", "true");
      document.body.appendChild(fade);
    }

    // Keep the navigation/header visually persistent by starting the fade overlay below it.
    const topbar = document.querySelector(".topbar");
    const setFxTop = () => {
      const h = topbar ? Math.ceil(topbar.getBoundingClientRect().height) : 0;
      html.style.setProperty("--fx-top", `${h}px`);
    };
    setFxTop();
    window.addEventListener("resize", setFxTop, { passive: true });
  
    // One-time intro (home page only)
    const INTRO_KEY = "wh_intro_seen_v1";
    const path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const isHome = path === "" || path === "index.html";
    if (!prefersReduced && isHome && !localStorage.getItem(INTRO_KEY)) {
      localStorage.setItem(INTRO_KEY, "1");
      const intro = document.createElement("div");
      intro.className = "intro-overlay";
      intro.setAttribute("aria-hidden", "true");
      intro.innerHTML = `
        <div class="intro-inner">
          <span class="intro-avatar" aria-hidden="true"></span>
          <div class="intro-text">
            <div class="intro-name">William Huynh</div>
            <div class="intro-sub">Product Designer</div>
          </div>
        </div>
      `;
      document.body.appendChild(intro);
  
      // kick animation
      requestAnimationFrame(() => intro.classList.add("is-in"));
  
      // hold, then exit
      window.setTimeout(() => {
        intro.classList.add("is-out");
        window.setTimeout(() => intro.remove(), 720);
      }, 900);
    }
  
    // Reveal after parse (enter animation)
    // Using rAF ensures CSS has applied before we toggle the class.
    requestAnimationFrame(() => html.classList.add("is-loaded"));
  
    // Smooth leave for same-origin internal links
    let navigating = false;
    document.addEventListener("click", (e) => {
      const a = (e.target instanceof Element) ? e.target.closest("a") : null;
      if (!a) return;
  
      // ignore modified clicks / new tabs / downloads
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
  
      const href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
  
      let url;
      try { url = new URL(href, window.location.href); } catch (_) { return; }
      if (url.origin !== window.location.origin) return;
  
      // Avoid reload if it's the same document URL
      const current = new URL(window.location.href);
      if (
        url.pathname === current.pathname &&
        url.search === current.search &&
        url.hash === current.hash
      ) return;
  
      // Close mobile nav if open
      document.body.classList.remove("nav-open");
  
      if (prefersReduced) return; // allow default navigation
  
      e.preventDefault();
      if (navigating) return;
      navigating = true;
  
      html.classList.add("is-leaving");
      window.setTimeout(() => {
        window.location.href = url.href;
      }, 220);
    });
  
    // bfcache restore handling
    // `pageshow` fires on normal navigations too. We only reset state when
    // the page is restored from the back/forward cache.
    window.addEventListener("pageshow", (ev) => {
      if (!ev.persisted) return;
      navigating = false;
      html.classList.remove("is-leaving");
      html.classList.add("is-loaded");
    });
  })();

  // ----- STATIC TAG CHIPS ON CASE STUDY CARDS -----
  // These chips are informational. Prevent them from behaving like buttons/links.
  (() => {
    const chipGroups = document.querySelectorAll('.card .chips');
    if (!chipGroups.length) return;

    chipGroups.forEach((group) => {
      group.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        e.preventDefault();
        e.stopPropagation();
      });
    });
  })();
  
  

  // ----- HASH ROUTES (compat with ...) -----
  const ROUTE_MAP = {
    "case-studies": "index.html",
    "work": "index.html",
    "design-process": "design-process.html",
    "process": "design-process.html",
    "design-ai": "design-ai.html",
    "ai": "design-ai.html",
    "ai-design": "design-ai.html",
    "design-tenets": "design-tenets.html",
    "tenets": "design-tenets.html",
    "about": "about.html",
    "about-me": "about.html",
  };

  function handleHashRoute() {
    const hash = window.location.hash || "";
    const m = hash.match(/^#\/([^?#]+)$/);
    if (!m) return;

    const key = decodeURIComponent(m[1]).toLowerCase();
    const target = ROUTE_MAP[key];
    if (!target) return;

    const current = (window.location.pathname.split("/").pop() || "index.html");
    if (current !== target) {
      window.location.replace("./" + target);
    }
  }

  handleHashRoute();
  window.addEventListener("hashchange", handleHashRoute);

  // ----- THEME -----
(() => {
  const THEME_KEY = "theme";
  const html = document.documentElement;
  // NOTE: Page transitions + intro are initialized once near the top of this file.
  // Keeping theme logic isolated prevents duplicate navigation handlers that can cause flicker.
    const SUN_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"></circle>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
  </svg>`;
  const MOON_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
  </svg>`;
const toggles = Array.from(document.querySelectorAll("[data-theme-toggle], .theme-toggle"));
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const getSystemTheme = () => (mediaQuery.matches ? "dark" : "light");

  const getSavedTheme = () => {
    const t = localStorage.getItem(THEME_KEY);
    return t === "dark" || t === "light" ? t : null;
  };

  const updateToggle = (btn, effectiveTheme) => {
    const isDark = effectiveTheme === "dark";

    // Prefer the dedicated icon span if present
    const iconEl = btn.querySelector("[data-theme-icon]");
    if (iconEl) {
      iconEl.innerHTML = isDark ? SUN_SVG : MOON_SVG; // show target mode
    } else {
      // Fallback: set button text directly
      btn.innerHTML = isDark ? SUN_SVG : MOON_SVG;
    }

    btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    btn.setAttribute("aria-pressed", String(isDark));
  };

  const applyTheme = (theme) => {
    const effective = theme || getSystemTheme();
    html.setAttribute("data-theme", effective);

    toggles.forEach((btn) => updateToggle(btn, effective));
  };

  const setTheme = (theme) => {
    if (!theme) {
      localStorage.removeItem(THEME_KEY);
      applyTheme(null);
      return;
    }
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  };

  // Bind clicks (support multiple toggles if present)
  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") || getSystemTheme();
      const next = current === "dark" ? "light" : "dark";
      setTheme(next);
    });
  });

  // If no explicit preference, react to system changes
  const onSystemThemeChange = () => {
    if (!getSavedTheme()) applyTheme(null);
  };

  // Safari < 14 uses addListener/removeListener
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onSystemThemeChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(onSystemThemeChange);
  }

  // Initialize
  applyTheme(getSavedTheme());
})();


// ----- MOBILE NAV -----
  const mobileBtn = document.querySelector("[data-mobile-toggle]");
  const nav = document.querySelector("[data-pillnav]");
  let lastFocusedNav = null;

  function openNav() {
    lastFocusedNav = document.activeElement;
    document.body.classList.add("nav-open");
    mobileBtn?.setAttribute("aria-expanded", "true");
    nav?.querySelector("a")?.focus();
  }

  function closeNav() {
    document.body.classList.remove("nav-open");
    mobileBtn?.setAttribute("aria-expanded", "false");
    if (lastFocusedNav && typeof lastFocusedNav.focus === "function") lastFocusedNav.focus();
  }

  mobileBtn?.addEventListener("click", () => {
    const isOpen = document.body.classList.contains("nav-open");
    isOpen ? closeNav() : openNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) closeNav();
  });

  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    const clickedInsideNav = nav?.contains(t);
    const clickedToggle = mobileBtn?.contains(t);
    if (!clickedInsideNav && !clickedToggle) closeNav();
    if (t.closest("a") && clickedInsideNav) closeNav();
  });
  // ----- CURRENT NAV -----
  function normalizeHref(href) {
    return (href || "")
      .toLowerCase()
      .replace(/^(\.\/)+/, "")
      .replace(/^\//, "");
  }

  function getCurrentPath() {
    return (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  }

  function getHashRouteTarget() {
    const hash = window.location.hash || "";
    const m = hash.match(/^#\/([^?#]+)$/);
    if (!m) return null;
    const key = decodeURIComponent(m[1]).toLowerCase();
    return ROUTE_MAP[key] || null;
  }

  function setCurrentNav() {
    let target = (getHashRouteTarget() || getCurrentPath()).toLowerCase();

    // If the current page isn't one of the primary nav routes,
    // treat it as a case study and keep "Case Studies" selected.
    const navLinks = Array.from(document.querySelectorAll('[data-pillnav] a'));
    const normalizedTarget = normalizeHref(target);
    const hasMatch = navLinks.some((a) => {
      const href = normalizeHref(a.getAttribute("href"));
      return href === normalizedTarget || href === normalizeHref("./" + target);
    });
    if (!hasMatch) target = "index.html";

    navLinks.forEach((a) => {
      const href = normalizeHref(a.getAttribute("href"));
      const isCurrent = href === normalizeHref(target) || href === normalizeHref("./" + target);
      if (isCurrent) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function initPillIndicator() {
    const pill = document.querySelector("[data-pillnav]");
    if (!pill) return;

    const indicator = pill.querySelector(".pillnav-indicator");
    const links = Array.from(pill.querySelectorAll("a"));
    if (!indicator || !links.length) return;

    // Ensure a hover indicator exists (we insert it once so we don't have to touch every HTML page)
    let hover = pill.querySelector(".pillnav-hover");
    if (!hover) {
      hover = document.createElement("span");
      hover.className = "pillnav-hover";
      hover.setAttribute("aria-hidden", "true");
      // Place behind links; z-index is controlled via CSS.
      pill.insertBefore(hover, indicator.nextSibling);
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function isMobileLayout() {
      return window.matchMedia("(max-width: 760px)").matches;
    }

    function measure(el) {
      const pillRect = pill.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      return { x: rect.left - pillRect.left, w: rect.width };
    }

    function setActive(el, { immediate = false } = {}) {
      if (!el || isMobileLayout()) return;
      const { x, w } = measure(el);

      if (immediate || prefersReduced) {
        pill.style.setProperty("--pill-x", `${x}px`);
        pill.style.setProperty("--pill-w", `${w}px`);
        pill.setAttribute("data-indicator-ready", "true");
        return;
      }

      requestAnimationFrame(() => {
        pill.style.setProperty("--pill-x", `${x}px`);
        pill.style.setProperty("--pill-w", `${w}px`);
        pill.setAttribute("data-indicator-ready", "true");
      });
    }

    function setHover(el, { immediate = false } = {}) {
      if (!el || isMobileLayout()) return;
      const { x, w } = measure(el);

      if (immediate || prefersReduced) {
        pill.style.setProperty("--hover-x", `${x}px`);
        pill.style.setProperty("--hover-w", `${w}px`);
        pill.setAttribute("data-hovering", "true");
        return;
      }

      requestAnimationFrame(() => {
        pill.style.setProperty("--hover-x", `${x}px`);
        pill.style.setProperty("--hover-w", `${w}px`);
        pill.setAttribute("data-hovering", "true");
      });
    }

    function clearHover() {
      pill.removeAttribute("data-hovering");
    }

    function getCurrentLink() {
      return pill.querySelector('a[aria-current="page"]') || links[0];
    }

    // Initial positioning
    // On fresh page loads, some browsers will animate the indicator from the default
    // CSS position (x=0/w=0) to the measured position, which looks like the active
    // color "moves around" after navigation. We freeze transitions for the first
    // paint so the indicator appears already in the correct spot.
    pill.setAttribute("data-pill-freeze", "true");
    setActive(getCurrentLink(), { immediate: true });
    clearHover();
    requestAnimationFrame(() => {
      pill.removeAttribute("data-pill-freeze");
    });

    // Hover / focus shows the gray pill without moving the purple active pill
    links.forEach((a) => {
      a.addEventListener("mouseenter", () => setHover(a));
      a.addEventListener("focus", () => setHover(a));

      // When clicking, move the active pill immediately so it feels responsive before page transition
      a.addEventListener("click", (e) => {
        if (isMobileLayout()) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        links.forEach((l) => l.removeAttribute("aria-current"));
        a.setAttribute("aria-current", "page");
        setActive(a);
        clearHover();
      });
    });

    pill.addEventListener("mouseleave", clearHover);
    pill.addEventListener("focusout", (e) => {
      const next = e.relatedTarget;
      if (!(next instanceof HTMLElement) || !pill.contains(next)) clearHover();
    });

    window.addEventListener("resize", () => {
      setActive(getCurrentLink(), { immediate: true });
      clearHover();
    });

    // If the theme changes, sizes can shift slightly; re-measure
    const observer = new MutationObserver(() => {
      setActive(getCurrentLink(), { immediate: true });
      clearHover();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }



  // ----- DRAWER (right tray modal) -----
  const drawerEl = document.querySelector('[data-drawer]');
  const overlayEl = document.querySelector('[data-drawer-overlay]');
  const drawerTitle = drawerEl?.querySelector('#drawer-title');
  const drawerSubtitle = drawerEl?.querySelector('#drawer-subtitle');
  const drawerBody = drawerEl?.querySelector('#drawer-body');
  const closeBtn = drawerEl?.querySelector('[data-drawer-close]');
  const openers = Array.from(document.querySelectorAll('[data-drawer-open]'));

  // Drawer title → GIF mapping (used on Design Pillars + Design Process tenet drawers)
  const drawerTitleGifMap = {
    'clarity-through-systems': './assets/clarity-through-systems-wired-outline-186-puzzle-hover-detach.gif',
    'pixels-serve-a-purpose': './assets/pxiels-serve-a-purpose-wired-outline-762-paint-brush-hover-pinch.gif',
    'dont-reinvent-the-wheel': './assets/dont-reinvent-the-wheel-wired-outline-852-wheel-hover-pinch.gif',
    'start-with-a-sketch': './assets/start-with-a-sketch-wired-outline-35-edit-hover-circle.gif',
    'fake-content-fake-designs': './assets/fake-content-fake-designs-wired-outline-1140-error-hover-enlarge.gif',
    'anticipate-extremes': './assets/anticipate-extremes-wired-outline-812-wind-hover-pinch.gif',

    'tenet.clarity': './assets/clarity-through-systems-wired-outline-186-puzzle-hover-detach.gif',
    'tenet.pixels': './assets/pxiels-serve-a-purpose-wired-outline-762-paint-brush-hover-pinch.gif',
    'tenet.wheel': './assets/dont-reinvent-the-wheel-wired-outline-852-wheel-hover-pinch.gif',
    'tenet.sketch': './assets/start-with-a-sketch-wired-outline-35-edit-hover-circle.gif',
    'tenet.fake': './assets/fake-content-fake-designs-wired-outline-1140-error-hover-enlarge.gif',
    'tenet.extremes': './assets/anticipate-extremes-wired-outline-812-wind-hover-pinch.gif'
  };

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function setDrawerTitleWithGif(title, key) {
    if (!drawerTitle || !drawerEl) return;

    const gifSrc = key ? drawerTitleGifMap[key] : null;

    // Use a stable container in the drawer header (NOT drawerTitle.parentElement,
    // because the title gets moved into wrappers when a GIF is present).
    const headerContent = drawerEl.querySelector('.drawer-header > div');
    if (!headerContent) return;

    // Reset headline layout + prevent duplicate inserts by fully rebuilding the header content.
    headerContent.classList.remove('drawer-headline');
    drawerEl.classList.remove('drawer--with-gif');

    // Clear existing header content (only the title/subtitle area; not the close button).
    while (headerContent.firstChild) headerContent.removeChild(headerContent.firstChild);

    // Always ensure the title is plain text
    drawerTitle.textContent = title || 'Details';

    if (!gifSrc) {
      // Default layout: title + subtitle stacked
      headerContent.appendChild(drawerTitle);
      if (drawerSubtitle) headerContent.appendChild(drawerSubtitle);
      return;
    }

    // GIF layout: GIF badge above the title/subtitle
    const gifWrap = document.createElement('span');
    gifWrap.className = 'drawer-title-gifwrap';

    const img = document.createElement('img');
    img.className = 'drawer-title-gif';
    img.src = gifSrc;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.loading = 'eager';
    img.decoding = 'async';
    gifWrap.appendChild(img);

    headerContent.appendChild(gifWrap);
    headerContent.appendChild(drawerTitle);
    if (drawerSubtitle) headerContent.appendChild(drawerSubtitle);
    headerContent.classList.add('drawer-headline');
    drawerEl.classList.add('drawer--with-gif');
  }

  let drawerData = null;
  let lastFocusedDrawer = null;

  function getFocusable(root) {
    return Array.from(
      root.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('inert') && !el.getAttribute('aria-hidden'));
  }

  function lockScroll(lock) {
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  function setDrawerContent(key) {
    if (!drawerData || !drawerData[key]) {
      setDrawerTitleWithGif('Details', null);
      if (drawerSubtitle) drawerSubtitle.textContent = '';
      if (drawerBody) drawerBody.innerHTML = '<p>Content not available yet.</p>';
      return;
    }
    const item = drawerData[key];
    setDrawerTitleWithGif(item.title || 'Details', key);
    if (drawerSubtitle) drawerSubtitle.textContent = item.subtitle || '';
    if (drawerBody) drawerBody.innerHTML = item.bodyHtml || '';
  }

  function openDrawer(key) {
    if (!drawerEl || !overlayEl) return;
    lastFocusedDrawer = document.activeElement;
    setDrawerContent(key);

    overlayEl.hidden = false;
    drawerEl.hidden = false;

    // allow CSS transition
    requestAnimationFrame(() => drawerEl.classList.add('is-open'));

    lockScroll(true);

    const focusables = getFocusable(drawerEl);
    const focusTarget = focusables[0] || closeBtn || drawerEl;
    focusTarget?.focus();
  }

  function closeDrawer() {
    if (!drawerEl || !overlayEl) return;
    drawerEl.classList.remove('is-open');
    lockScroll(false);

    // wait for transition then hide
    window.setTimeout(() => {
      overlayEl.hidden = true;
      drawerEl.hidden = true;
      if (lastFocusedDrawer && typeof lastFocusedDrawer.focus === 'function') lastFocusedDrawer.focus();
      lastFocusedDrawer = null;
    }, 230);
  }

  async function loadDrawerData() {
    if (!drawerEl) return;

    // Per-page inline global payload support.
    // Example: <aside data-drawer data-drawer-global="AI_DRAWER_CONTENT">
    const globalVar = drawerEl.getAttribute('data-drawer-global');
    if (globalVar && window[globalVar] && typeof window[globalVar] === 'object') {
      drawerData = window[globalVar];
      return;
    }

    // Back-compat for the Design Process page
    if (window.PROCESS_DRAWER_CONTENT && typeof window.PROCESS_DRAWER_CONTENT === 'object') {
      drawerData = window.PROCESS_DRAWER_CONTENT;
    }

    // Per-page JSON source support (defaults to process content)
    const src = drawerEl.getAttribute('data-drawer-src') || './assets/process-drawer-content.json';

    // If we already have inline data, don't overwrite it by fetching.
    if (drawerData) return;

    try {
      const res = await fetch(src, { cache: 'no-store' });
      if (!res.ok) return;
      drawerData = await res.json();
    } catch (_) {
      // ignore
    }
  }

  if (drawerEl && overlayEl) {
    // Load data opportunistically; also load on-demand before opening.
    loadDrawerData();

    function requestOpen(el) {
      const key = el.getAttribute('data-drawer-open');
      if (!key) return;
      // Ensure the data is ready before opening, especially when running on file://
      // where fetch() can fail and we rely on the inline global.
      Promise.resolve(loadDrawerData()).finally(() => openDrawer(key));
    }

    openers.forEach((el) => {
      el.addEventListener('click', () => requestOpen(el));

      // Support non-button openers (e.g., <article role="button" tabindex="0">)
      const tag = (el.tagName || '').toUpperCase();
      if (tag !== 'BUTTON' && tag !== 'A') {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            requestOpen(el);
          }
        });
      }
    });

    overlayEl.addEventListener('click', closeDrawer);
    closeBtn?.addEventListener('click', closeDrawer);

    // optional: simple refresh affordance inside drawers (updates timestamp / nudges UI)
    drawerEl.addEventListener('click', (e) => {
      // Allow linking between drawers from within drawer content
      const openBtn = e.target.closest('[data-drawer-open]');
      if (openBtn && drawerEl.contains(openBtn)) {
        e.preventDefault();
        const targetKey = openBtn.getAttribute('data-drawer-open');
        if (targetKey) {
          setDrawerContent(targetKey);
          // reset scroll to top for new content
          const body = drawerEl.querySelector('.drawer-body');
          if (body) body.scrollTop = 0;
          // keep focus on the newly interacted element (or close button if removed)
          window.setTimeout(() => {
            if (drawerEl.contains(openBtn)) openBtn.focus();
            else drawerCloseBtn?.focus?.();
          }, 0);
        }
        return;
      }

      const btn = e.target.closest('[data-drawer-refresh]');
      if (!btn) return;
      const stamp = drawerEl.querySelector('[data-drawer-updated]');
      if (stamp) {
        const d = new Date();
        const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        stamp.textContent = `Last updated: ${date}`;
      }
      btn.classList.add('is-spinning');
      window.setTimeout(() => btn.classList.remove('is-spinning'), 650);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlayEl.hidden) closeDrawer();

      // focus trap
      if (e.key === 'Tab' && !overlayEl.hidden && drawerEl) {
        const focusables = getFocusable(drawerEl);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // theme initializes via IIFE above
  setCurrentNav();
  initPillIndicator();

  // ----- DESIGN PROCESS TIMELINE RAIL -----
  // The rail:
  // - Aligns to the stage markers
  // - Tracks scroll position within the timeline
  // - Ends at the bottom of Stage 6 card
  (function initProcessRail(){
    const timeline = document.querySelector('.timeline');
    const rail = timeline?.querySelector('[data-process-rail]');
    if (!timeline || !rail) return;

    const stages = Array.from(timeline.querySelectorAll('.stage'));
    if (!stages.length) return;
    const firstStage = stages[0];
    const lastStage = stages[stages.length - 1];

    const firstDot = firstStage.querySelector('.stage-dot');
    const lastDot = lastStage.querySelector('.stage-dot');
    const lastCard = lastStage.querySelector('.stage-card') || lastStage;

    const track = rail.querySelector('.tline-track');
    const progress = rail.querySelector('.tline-progress');
    const thumb = rail.querySelector('.tline-thumb');

    if (!firstDot || !track || !progress || !thumb) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      progress.style.transition = 'none';
      thumb.style.transition = 'none';
    }

    let startAbs = 0;
    let endAbs = 0;
    let railHeight = 0;
    let lastDotRel = 0;
    let lastStageTopRel = 0;
    let raf = 0;

    function getAbsTop(el){
      const r = el.getBoundingClientRect();
      return r.top + (window.pageYOffset || document.documentElement.scrollTop || 0);
    }

    function measure(){
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const tlRect = timeline.getBoundingClientRect();
      const tlTop = tlRect.top + scrollY;

      const dotRect = firstDot.getBoundingClientRect();
      const dotCenterY = (dotRect.top + dotRect.height / 2) + scrollY;
      const dotCenterX = (dotRect.left + dotRect.width / 2);

      const startY = dotCenterY - tlTop;
      const lastCardRect = lastCard.getBoundingClientRect();
      const lastBottomY = (lastCardRect.bottom + scrollY) - tlTop;

      railHeight = Math.max(0, lastBottomY - startY);
      startAbs = tlTop + startY;
      endAbs = startAbs + railHeight;

      // Where the top of the final stage card sits within the rail.
      const lastCardTopAbs = (lastCard.getBoundingClientRect().top + scrollY);
      lastStageTopRel = clamp(lastCardTopAbs - startAbs, 0, railHeight);

      // Where the final stage marker sits *within* the rail.
      // We use this to stop showing dotted "future" track once the thumb reaches Stage 6.
      if (lastDot) {
        const lastDotRect = lastDot.getBoundingClientRect();
        const lastDotCenterAbs = (lastDotRect.top + lastDotRect.height / 2) + scrollY;
        lastDotRel = clamp(lastDotCenterAbs - startAbs, 0, railHeight);
      } else {
        lastDotRel = railHeight;
      }

      // Align the rail x-position to the center of the stage dots
      const railLeft = (dotCenterX - tlRect.left) - 1; // 2px rail width => center - 1px
      rail.style.left = `${railLeft}px`;
      rail.style.top = `${startY}px`;
      rail.style.height = `${railHeight}px`;
    }

    function clamp(v, min, max){
      return Math.max(min, Math.min(max, v));
    }

    function update(){
      raf = 0;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const topbar = document.querySelector('.topbar');
      const topbarH = topbar ? topbar.getBoundingClientRect().height : 0;

      // - Stage markers (icon circles) stay anchored to each stage
      // - A small progress dot moves down the rail as you scroll (based on a fixed reading anchor)
      const anchorY = Math.round(topbarH + (window.innerHeight - topbarH) * 0.46);
      const needleAbs = scrollY + anchorY;
      const rel = clamp(needleAbs - startAbs, 0, railHeight);

      rail.style.setProperty('--tline-progress', `${rel}px`);

      // Active stage = the last stage marker that the progress dot has reached.
      // This avoids the "highlight another item first" bug and matches the reference.
      let activeIndex = 0;
      for (let i = 0; i < stages.length; i++) {
        const d = stages[i].querySelector('.stage-dot');
        if (!d) continue;
        const r = d.getBoundingClientRect();
        const centerAbs = (r.top + r.height / 2) + scrollY;
        if (centerAbs <= needleAbs + 6) activeIndex = i;
      }

      // Hide dotted "future" track once Stage 6 becomes active.
      const reachedFinal = activeIndex === (stages.length - 1);
      rail.classList.toggle('hide-after-thumb', reachedFinal);

      stages.forEach((s, i) => {
        s.classList.toggle('is-active', i === activeIndex);
        s.classList.toggle('is-past', i < activeIndex);
      });

      // Keep the thumb within the rail bounds
      if (needleAbs < startAbs) rail.classList.remove('is-inrange');
      else if (needleAbs > endAbs) rail.classList.remove('is-inrange');
      else rail.classList.add('is-inrange');
    }

    function requestUpdate(){
      if (raf) return;
      raf = requestAnimationFrame(update);
    }

    // Initial and on resize (fonts/images can shift layout)
    measure();
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', () => { measure(); update(); }, { passive: true });
    window.addEventListener('load', () => { measure(); update(); }, { passive: true });

    // Re-measure on theme changes (fonts + borders can shift by a pixel)
    const mo = new MutationObserver(() => { measure(); update(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  })();

  // ----- CASE STUDY TOC (scroll-spy + smooth scroll) -----
  const toc = document.querySelector('[data-toc]');
  const tocLinks = Array.from(document.querySelectorAll('[data-toc-link]'));
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lock the scroll-spy while we programmatically smooth-scroll to a TOC target.
  // This prevents the active state from "walking" through intermediate sections during the animation.
  let tocSpyLocked = false;
  let tocSpyUnlockRaf = 0;
  let tocSpyLockUntil = 0;
  let tocSpyTargetY = 0;

  function lockTocSpy(hash, targetY) {
    tocSpyLocked = true;
    tocSpyTargetY = Math.max(0, targetY);
    tocSpyLockUntil = Date.now() + 2000;

    setActiveToc(hash);

    if (tocSpyUnlockRaf) cancelAnimationFrame(tocSpyUnlockRaf);
    const check = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (Math.abs(y - tocSpyTargetY) <= 2 || Date.now() > tocSpyLockUntil) {
        tocSpyLocked = false;
        tocSpyUnlockRaf = 0;
        return;
      }
      tocSpyUnlockRaf = requestAnimationFrame(check);
    };
    tocSpyUnlockRaf = requestAnimationFrame(check);
  }


  function setActiveToc(hash) {
    if (!tocLinks.length) return;
    tocLinks.forEach((a) => {
      const href = a.getAttribute('href');
      if (href === hash) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  if (toc && tocLinks.length) {
    // Smooth scroll for TOC links (keep URL hash)
    tocLinks.forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href') || '';
        if (!href.startsWith('#')) return;
        const target = document.querySelector(href);
        if (!(target instanceof HTMLElement)) return;

        e.preventDefault();
        // Update URL without the browser's instant jump
        try { history.pushState(null, '', href); } catch (_) { window.location.hash = href; }

        // Use an explicit scroll offset so sticky headers never cover the section title.
        const topbar = document.querySelector('.topbar');
        const offset = topbar ? topbar.getBoundingClientRect().height + 18 : 92;
        const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        const targetY = Math.max(0, y);

        lockTocSpy(href, targetY);

        window.scrollTo({
          top: targetY,
          behavior: reduceMotion ? 'auto' : 'smooth',
        });

        // A11y: move focus to the section without forcing another scroll jump.
        try {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          window.setTimeout(() => target.removeAttribute('tabindex'), 0);
        } catch (_) {
          // ignore
        }
      });
    });

    // Scroll spy
    const ids = tocLinks
      .map((a) => (a.getAttribute('href') || '').replace('#', ''))
      .filter(Boolean);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el) => el instanceof HTMLElement);

    const observer = new IntersectionObserver(
      (entries) => {
        if (tocSpyLocked) return;
        // Pick the first visible section closest to the top.
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top || 0) - (b.boundingClientRect.top || 0));
        if (!visible.length) return;
        const id = visible[0].target?.id;
        if (id) setActiveToc(`#${id}`);
      },
      {
        root: null,
        // The header is sticky; this bias marks a section active shortly after it clears the topbar.
        rootMargin: '-30% 0px -60% 0px',
        threshold: [0.01, 0.1, 0.2],
      }
    );

    sections.forEach((s) => observer.observe(s));

    // Initial state
    const initialHash = window.location.hash;
    if (initialHash) setActiveToc(initialHash);
    else if (tocLinks[0]) setActiveToc(tocLinks[0].getAttribute('href') || '#');
  }
})();


  // ----- TESTIMONIAL CARD REVEAL (staggered left->right, then next row) -----
  (() => {
    const blocks = Array.from(document.querySelectorAll('[data-stagger]'));
    if (!blocks.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      blocks.forEach((b) => b.classList.add('is-in'));
      return;
    }

    // Assign delays in DOM order (grid auto-flow row => left->right, then next row)
    blocks.forEach((block) => {
      const items = Array.from(block.querySelectorAll('.tbox'));
      items.forEach((el, i) => {
        // Match the reference: quick, smooth cascade.
        el.style.setProperty('--d', `${i * 90}ms`);
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const block = en.target;
          block.classList.add('is-in');
          io.unobserve(block);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    blocks.forEach((b) => io.observe(b));
  })();


  window.onload = function() {

        var pageTitle = document.title;
        var attentionMessage = '♪ Baby, Come Back! ♪';
        var blinkEvent = null;
      
        document.addEventListener('visibilitychange', function(e) {
          var isPageActive = !document.hidden;
      
          if(!isPageActive){
            blink();
          }else {
            document.title = pageTitle;
            clearInterval(blinkEvent);
          }
        });
      
        function blink(){
          blinkEvent = setInterval(function() {
            if(document.title === attentionMessage){
              document.title = pageTitle;
            }else {
              document.title = attentionMessage;
            }
          }, 600);
        }
      };