// ==UserScript==
// @name         ChangeToYouTubePremiumLogo
// @namespace    https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo
// @version      20251208.7
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

  // Check if on watch page (where theater mode exists)
  const isWatchPage = () => {
    return location.pathname.startsWith('/watch');
  };

  // Check if on Shorts page
  const isShortsPage = () => {
    return location.pathname.startsWith('/shorts/');
  };

  // Check if theater mode is active (background becomes black in light mode)
  // Only applies to /watch pages (not home, not shorts, not other pages)
  const isTheaterMode = () => {
    if (!isWatchPage()) return false; // Theater mode only exists on /watch pages
    if (isShortsPage()) return false; // Shorts has its own background handling
    const player = document.querySelector('#movie_player, .html5-video-player');
    return player?.classList.contains('ytp-big-mode') ||
           document.querySelector('ytd-watch-flexy[theater]') !== null;
  };

  /* ──────────── Assets ──────────── */
  const BASE = "https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/logo/";
  const DEFAULT_COLOR = "red";
  const COLOR_MAP = {
    red:    { dark: "logov1.png",  light: "logov2.png",  glow: "255, 0, 0"     },
    black:  { dark: "logov3.png",  light: "logov4.png",  glow: "0, 0, 0"       },
    pink:   { dark: "logov5.png",  light: "logov6.png",  glow: "255, 105, 180" },
    yellow: { dark: "logov7.png",  light: "logov8.png",  glow: "255, 215, 0"   },
    green:  { dark: "logov9.png",  light: "logov10.png", glow: "0, 255, 0"     },
    brown:  { dark: "logov11.png", light: "logov12.png", glow: "139, 69, 19"   },
    grey:   { dark: "logov13.png", light: "logov14.png", glow: "128, 128, 128" },
    indigo: { dark: "logov15.png", light: "logov16.png", glow: "75, 0, 130"    },
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

  const state = {
    color: DEFAULT_COLOR,
    yoodleShown: new Set() // Track which yoodle logos have been shown
  };

  const getLogoURL = () => {
    const cfg  = COLOR_MAP[state.color] || COLOR_MAP[DEFAULT_COLOR];
    // Use dark logo if: 1) dark mode is on, OR 2) theater mode is active (even in light mode)
    const useDark = isDark() || isTheaterMode();
    const file = (useDark ? cfg.dark : cfg.light) || cfg.dark;
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
    img.style.cssText = "width:94px;height:auto;display:block;transition:all 0.3s ease;";
    img.classList.add('premium-logo-animated');

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

    // Handle YouTube Yoodle (special event logos like ytd-yoodle-renderer)
    const yoodleImgs = container.querySelectorAll('ytd-yoodle-renderer img, .ytd-yoodle-renderer img');
    yoodleImgs.forEach(yoodleImg => {
      if (yoodleImg.dataset.premiumReplaced === "1") return;

      // Generate unique identifier for this yoodle logo
      const yoodleId = yoodleImg.src || yoodleImg.alt || 'yoodle-' + Date.now();

      // If we haven't shown this yoodle yet, wait 15 seconds before replacing
      if (!state.yoodleShown.has(yoodleId)) {
        state.yoodleShown.add(yoodleId);
        yoodleImg.dataset.premiumReplaced = "1"; // Mark to prevent re-processing

        // Delay of 15 seconds (15000ms)
        const delay = 15000;
        setTimeout(() => {
          // Create replacement img
          const img = document.createElement("img");
          img.dataset.premiumLogo = "1";
          img.alt = "YouTube Premium";
          img.src = getLogoURL();
          img.style.cssText = "width:94px;height:auto;display:block;transition:all 0.3s ease;";
          img.classList.add('premium-logo-animated');

          yoodleImg.replaceWith(img);
          img.closest("a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer")?.setAttribute("data-premium-hasimg", "1");
        }, delay);

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
    // Update animation styles with current color
    injectAnimationStyles();
    
    // Anchor container usually: a#logo inside ytd-topbar-logo-renderer
    const containers = [
      ...document.querySelectorAll('a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer, ytd-yoodle-renderer')
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
            n.matches?.('a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer, ytd-yoodle-renderer, svg[id^="yt-ringo2-svg_"]') ||
            n.querySelector?.('a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer, ytd-yoodle-renderer, svg[id^="yt-ringo2-svg_"]')
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

    // Theater mode toggle (watch for ytd-watch-flexy[theater] attribute or player class changes)
    new MutationObserver(() => {
      document.querySelectorAll('img[data-premium-logo="1"]').forEach(img => (img.src = getLogoURL()));
    }).observe(document.body, {
      attributes: true,
      attributeFilter: ["theater"],
      subtree: true
    });

    // Also observe player class changes for theater mode
    const observePlayer = () => {
      const player = document.querySelector('#movie_player, .html5-video-player');
      if (player) {
        new MutationObserver(() => {
          document.querySelectorAll('img[data-premium-logo="1"]').forEach(img => (img.src = getLogoURL()));
        }).observe(player, {
          attributes: true,
          attributeFilter: ["class"]
        });
      } else {
        // Retry if player not found yet
        setTimeout(observePlayer, 1000);
      }
    };
    observePlayer();
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

  /* ──────────── Hover Animation Styles ──────────── */
  function injectAnimationStyles() {
    const existingStyle = document.getElementById('premium-logo-styles');
    if (existingStyle) existingStyle.remove();
    
    const cfg = COLOR_MAP[state.color] || COLOR_MAP[DEFAULT_COLOR];
    const glowColor = cfg.glow || "255, 0, 0";
    
    const style = document.createElement('style');
    style.id = 'premium-logo-styles';
    style.textContent = `
      /* Logo hover animation - 360° Rotation */
      .premium-logo-animated {
        transform-origin: center;
        filter: drop-shadow(0 0 0 transparent);
        transition: filter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      a#logo:hover .premium-logo-animated,
      #logo:hover .premium-logo-animated,
      ytd-topbar-logo-renderer:hover .premium-logo-animated,
      ytm-pivot-bar-renderer:hover .premium-logo-animated {
        animation: logo-spin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), 
                   logo-glow 2s ease-in-out infinite;
      }
      
      @keyframes logo-spin {
        0% { 
          transform: scale(1) rotate(0deg);
        }
        50% { 
          transform: scale(1.2) rotate(180deg);
        }
        100% { 
          transform: scale(1) rotate(360deg);
        }
      }
      
      @keyframes logo-glow {
        0%, 100% { filter: drop-shadow(0 4px 16px rgba(${glowColor}, 0.7)) drop-shadow(0 0 8px rgba(${glowColor}, 0.5)); }
        50% { filter: drop-shadow(0 4px 20px rgba(${glowColor}, 0.9)) drop-shadow(0 0 12px rgba(${glowColor}, 0.7)); }
      }
      
      a#logo,
      #logo,
      ytd-topbar-logo-renderer a,
      ytm-pivot-bar-renderer a {
        pointer-events: auto !important;
      }
      
      /* Sidebar menu hover animation - Smooth slide & glow */
      ytd-guide-entry-renderer,
      ytd-guide-collapsible-entry-renderer {
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
      }
      
      ytd-guide-entry-renderer:hover,
      ytd-guide-collapsible-entry-renderer:hover {
        transform: translateX(8px);
      }
      
      ytd-guide-entry-renderer:hover tp-yt-paper-item,
      ytd-guide-collapsible-entry-renderer:hover tp-yt-paper-item {
        background: rgba(${glowColor}, 0.08) !important;
        border-radius: 12px;
      }
      
      ytd-guide-entry-renderer:hover .guide-icon,
      ytd-guide-collapsible-entry-renderer:hover .guide-icon {
        filter: drop-shadow(0 0 6px rgba(${glowColor}, 0.6));
        transform: scale(1.15) rotate(5deg);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      ytd-guide-entry-renderer:hover yt-img-shadow img,
      ytd-guide-collapsible-entry-renderer:hover yt-img-shadow img {
        filter: drop-shadow(0 0 6px rgba(${glowColor}, 0.5));
        transform: scale(1.15);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      ytd-guide-entry-renderer:hover .title,
      ytd-guide-collapsible-entry-renderer:hover .title {
        color: rgb(${glowColor}) !important;
        font-weight: 500;
        text-shadow: 0 0 8px rgba(${glowColor}, 0.3);
      }
      
      /* Section headers hover effect */
      ytd-guide-section-renderer h3:hover {
        color: rgb(${glowColor}) !important;
        text-shadow: 0 0 8px rgba(${glowColor}, 0.4);
        transform: translateX(4px);
        transition: all 0.3s ease;
      }
      
      /* Video metadata hover animation - Title & Info */
      #video-title,
      ytd-grid-video-renderer #video-title,
      ytd-video-renderer #video-title,
      ytd-compact-video-renderer #video-title {
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: inline-block;
      }
      
      #video-title:hover,
      ytd-grid-video-renderer:hover #video-title,
      ytd-video-renderer:hover #video-title,
      ytd-compact-video-renderer:hover #video-title {
        color: rgb(${glowColor}) !important;
        text-shadow: 0 0 8px rgba(${glowColor}, 0.4);
        transform: translateX(4px);
      }
      
      #metadata-line,
      #metadata {
        transition: all 0.3s ease;
      }
      
      ytd-grid-video-renderer:hover #metadata-line,
      ytd-video-renderer:hover #metadata-line,
      ytd-compact-video-renderer:hover #metadata-line {
        color: rgba(${glowColor}, 0.8) !important;
        transform: translateX(2px);
      }
      
      ytd-grid-video-renderer:hover #metadata-line span,
      ytd-video-renderer:hover #metadata-line span,
      ytd-compact-video-renderer:hover #metadata-line span {
        color: rgba(${glowColor}, 0.7) !important;
      }
      
      #channel-name {
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      ytd-grid-video-renderer:hover #channel-name,
      ytd-video-renderer:hover #channel-name,
      ytd-compact-video-renderer:hover #channel-name {
        filter: drop-shadow(0 0 4px rgba(${glowColor}, 0.3));
      }
      
      ytd-grid-video-renderer:hover #channel-name #text,
      ytd-video-renderer:hover #channel-name #text,
      ytd-compact-video-renderer:hover #channel-name #text {
        color: rgb(${glowColor}) !important;
      }
      
      /* Video thumbnail hover animation - Modern card lift */
      ytd-thumbnail,
      ytd-video-preview,
      ytd-rich-item-renderer,
      ytd-grid-video-renderer,
      ytd-compact-video-renderer,
      ytd-playlist-thumbnail {
        overflow: visible !important;
        position: relative;
      }
      
      ytd-thumbnail img.ytCoreImageHost,
      ytd-video-preview img.ytCoreImageHost,
      ytd-rich-item-renderer img.ytCoreImageHost,
      img.shortsLockupViewModelHostThumbnail,
      ytd-grid-video-renderer img.ytCoreImageHost,
      ytd-compact-video-renderer img.ytCoreImageHost,
      ytd-playlist-thumbnail img.ytCoreImageHost {
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform-origin: center;
        border-radius: 12px;
        will-change: transform, filter;
      }
      
      ytd-thumbnail:hover img.ytCoreImageHost,
      ytd-video-preview:hover img.ytCoreImageHost,
      ytd-rich-item-renderer:hover img.ytCoreImageHost,
      a:hover img.shortsLockupViewModelHostThumbnail,
      ytd-grid-video-renderer:hover img.ytCoreImageHost,
      ytd-compact-video-renderer:hover img.ytCoreImageHost,
      ytd-playlist-thumbnail:hover img.ytCoreImageHost {
        transform: scale(1.08) translateY(-8px);
        filter: brightness(1.15) 
                contrast(1.1) 
                drop-shadow(0 12px 24px rgba(${glowColor}, 0.4))
                drop-shadow(0 0 16px rgba(${glowColor}, 0.3));
        border-radius: 16px;
        z-index: 10;
      }
      
      /* Add smooth shadow transition */
      ytd-thumbnail::after,
      ytd-video-preview::after,
      ytd-rich-item-renderer::after,
      ytd-grid-video-renderer::after,
      ytd-compact-video-renderer::after,
      ytd-playlist-thumbnail::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 12px;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: none;
        z-index: -1;
      }
      
      ytd-thumbnail:hover::after,
      ytd-video-preview:hover::after,
      ytd-rich-item-renderer:hover::after,
      ytd-grid-video-renderer:hover::after,
      ytd-compact-video-renderer:hover::after,
      ytd-playlist-thumbnail:hover::after {
        box-shadow: 0 20px 40px rgba(${glowColor}, 0.25),
                    0 0 32px rgba(${glowColor}, 0.2);
        transform: scale(1.02);
      }
    `;
    document.head.appendChild(style);
  }

  /* ──────────── Boot ──────────── */
  async function init() {
    // NOTE: No CSS/JS that hides country code. We keep YouTube's <sup> intact.
    injectAnimationStyles();
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
