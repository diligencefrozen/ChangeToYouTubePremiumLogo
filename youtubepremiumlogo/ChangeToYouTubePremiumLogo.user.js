// ==UserScript==
// @name         ChangeToYouTubePremiumLogo 
// @namespace    https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo
// @version      20251014.2
// @description  Replace only the inline SVG logo. Safari → red; logo click → refresh/home.
// @icon         https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/original.png?raw=true
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://youtube.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(() => {
  "use strict";

  /* ──────────── UA / Theme ──────────── */
  const isSafari = () => {
    const ua = navigator.userAgent;
    return /Safari/i.test(ua) &&
           !/Chrome|CriOS|OPiOS|EdgiOS|Edg|FxiOS|Brave|Vivaldi/i.test(ua);
  };
  const isDark = () => document.documentElement.hasAttribute("dark");

  /* ──────────── Assets ──────────── */
  const BASE = "https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/logo/";
  const DEFAULT_COLOR = "red";
  const COLOR_MAP = {
    red:    { dark: "logov1.png",  light: "logov2.png"  },
    black:  { dark: "logov3.png",  light: "logov4.png"  },
    pink:   { dark: "logov5.png",  light: "logov6.png"  },
    yellow: { dark: "logov7.png",  light: "logov8.png"  },
    green:  { dark: "logov9.png",  light: "logov10.png" },
    brown:  { dark: "logov11.png", light: "logov12.png" },
    grey:   { dark: "logov13.png", light: "logov14.png" },
    indigo: { dark: "logov15.png", light: "logov16.png" },
  };

  /* ──────────── Storage (sync/async safe) ──────────── */
  const hasLegacySync = typeof GM_getValue === "function";
  const hasModernAsync = typeof GM !== "undefined" && typeof GM.getValue === "function";
  const store = {
    async get(key, defVal) {
      if (isSafari()) return defVal;
      try {
        if (hasLegacySync) return GM_getValue(key, defVal);
        if (hasModernAsync) return await GM.getValue(key, defVal);
      } catch {}
      return defVal;
    },
    async set(key, val) {
      if (isSafari()) return;
      try {
        if (typeof GM_setValue === "function") return GM_setValue(key, val);
        if (typeof GM !== "undefined" && typeof GM.setValue === "function") return GM.setValue(key, val);
      } catch {}
    }
  };

  const state = { color: DEFAULT_COLOR };

  const getLogoURL = () => {
    const cfg  = COLOR_MAP[state.color] || COLOR_MAP[DEFAULT_COLOR];
    const file = (isDark() ? cfg.dark : cfg.light) || cfg.dark;
    return BASE + file;
  };

  /* ──────────── Core: replace only the SVG, keep country code ──────────── */
  function replaceSvgWithImg(svg) {
    if (!svg || svg.dataset.premiumReplaced === "1") return;

    // Create img
    const img = document.createElement("img");
    img.dataset.premiumLogo = "1";
    img.alt = "YouTube Premium";
    img.src = getLogoURL();
    img.style.cssText = "width:94px;height:auto;pointer-events:none;display:block;";

    // Keep parent structure (anchor + sup country code). Replace only the SVG node.
    svg.replaceWith(img);
    // Mark parent for theme updates
    img.closest("a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer")?.setAttribute("data-premium-hasimg", "1");
  }

  function patchOnceInContainer(container) {
    if (!container) return;
    // Target newest inline SVG id prefix (e.g., yt-ringo2-svg_yt10). Cover both desktop & mweb.
    const svgs = container.querySelectorAll('svg[id^="yt-ringo2-svg_"], svg#logo-icon, a#logo svg, #logo svg');
    let touched = false;
    svgs.forEach(svg => {
      // If already replaced with our img, just refresh src for theme/color changes
      const nextIsImg = svg.tagName.toLowerCase() === "img" || svg.nextElementSibling?.dataset?.premiumLogo === "1";
      if (svg.dataset?.premiumReplaced === "1") return;

      // Only swap real SVG nodes; if container already has our <img>, update below
      if (svg instanceof SVGElement) {
        replaceSvgWithImg(svg);
        touched = true;
      }
    });

    // Also refresh existing imgs (e.g., after theme toggle)
    container.querySelectorAll('img[data-premium-logo="1"]').forEach(img => {
      img.src = getLogoURL();
      touched = true;
    });

    return touched;
  }

  function patchAll() {
    // Anchor container usually: a#logo inside ytd-topbar-logo-renderer
    const containers = [
      ...document.querySelectorAll('a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer')
    ];
    if (containers.length === 0) return;
    containers.forEach(patchOnceInContainer);

    // Ensure clicking the logo behaves as requested (reload/home). We bind on the anchor.
    const anchors = document.querySelectorAll('a#logo, #logo');
    anchors.forEach(a => {
      if (a.dataset.ytLogoClickBound) return;
      a.addEventListener("click", e => {
        // Allow modifier keys to open new tab etc.
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        location.pathname === "/" ? location.reload() : (location.href = "/");
      }, true);
      a.dataset.ytLogoClickBound = "1";
      a.style.cursor = "pointer";
    });
  }

  /* ──────────── Observers ──────────── */
  const debounce = (fn, wait = 50) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };
  const onDomAdded = debounce(patchAll, 50);

  function observe() {
    // New nodes (logo re-render, navigation, mweb topbar rebuild)
    new MutationObserver((muts) => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType !== 1) continue;
          if (
            n.matches?.('a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer, svg[id^="yt-ringo2-svg_"]') ||
            n.querySelector?.('a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer, svg[id^="yt-ringo2-svg_"]')
          ) {
            onDomAdded();
            break;
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });

    // Theme toggle (html[dark])
    new MutationObserver(() => {
      document.querySelectorAll('img[data-premium-logo="1"]').forEach(img => (img.src = getLogoURL()));
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["dark"] });
  }

  /* ──────────── Menu (no country-code hiding anywhere) ──────────── */
  function registerMenu() {
    if (isSafari() || typeof GM_registerMenuCommand !== "function") return;
    const label = () => `Set Logo Color (current: ${state.color})`;
    GM_registerMenuCommand(label(), async () => {
      const options = Object.keys(COLOR_MAP).join(", ");
      const input = prompt(`Enter logo color name.\nAvailable: ${options}`, state.color);
      if (!input) return;
      if (!COLOR_MAP[input]) {
        alert(`Unknown color: ${input}`);
        return;
      }
      await store.set("logoColor", input);
      state.color = input;
      patchAll();
      alert(`Logo color switched to: ${input}`);
      // Re-register for updated label (engines usually rebuild menu on each run)
      registerMenu();
    });
  }

  /* ──────────── Boot ──────────── */
  async function init() {
    // NOTE: No CSS/JS that hides country code. We keep YouTube's <sup> intact.
    state.color = isSafari() ? DEFAULT_COLOR : await store.get("logoColor", DEFAULT_COLOR);
    patchAll();
    observe();
    registerMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
