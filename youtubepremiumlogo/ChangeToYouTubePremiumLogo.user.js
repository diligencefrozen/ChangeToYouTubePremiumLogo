// ==UserScript==
// @name         ChangeToYouTubePremiumLogo
// @namespace    https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo
// @version      20251014.3
// @description  Replace only the inline SVG logo. Safari → red; logo click → refresh/home. Beautiful in-page settings UI.
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

  const state = {
    color: DEFAULT_COLOR,
  };

  const getLogoURL = (color = state.color, dark = isDark()) => {
    const cfg  = COLOR_MAP[color] || COLOR_MAP[DEFAULT_COLOR];
    const file = (dark ? cfg.dark : cfg.light) || cfg.dark;
    return BASE + file;
  };

  /* ──────────── Core: replace only the SVG, keep country code ──────────── */
  function replaceSvgWithImg(svg) {
    if (!svg) return;
    const img = document.createElement("img");
    img.dataset.premiumLogo = "1";
    img.alt = "YouTube Premium";
    img.src = getLogoURL();
    img.style.cssText = "width:94px;height:auto;pointer-events:none;display:block;";
    svg.replaceWith(img);
    img.closest("a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer")?.setAttribute("data-premium-hasimg", "1");
  }

  function patchOnceInContainer(container) {
    if (!container) return;
    const svgs = container.querySelectorAll('svg[id^="yt-ringo2-svg_"], svg#logo-icon, a#logo svg, #logo svg');
    svgs.forEach(svg => {
      if (svg instanceof SVGElement) replaceSvgWithImg(svg);
    });
    container.querySelectorAll('img[data-premium-logo="1"]').forEach(img => {
      img.src = getLogoURL();
    });
  }

  function patchAll() {
    const containers = [...document.querySelectorAll('a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer')];
    if (containers.length === 0) return;
    containers.forEach(patchOnceInContainer);

    const anchors = document.querySelectorAll('a#logo, #logo');
    anchors.forEach(a => {
      if (a.dataset.ytLogoClickBound) return;
      a.addEventListener("click", e => {
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
  const debounce = (fn, wait = 50) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; };
  const onDomAdded = debounce(patchAll, 50);

  function observe() {
    new MutationObserver((muts) => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType !== 1) continue;
          if (
            n.matches?.('a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer, svg[id^="yt-ringo2-svg_"]') ||
            n.querySelector?.('a#logo, #logo, ytd-topbar-logo-renderer, ytm-pivot-bar-renderer, svg[id^="yt-ringo2-svg_"]')
          ) { onDomAdded(); break; }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });

    new MutationObserver(() => {
      document.querySelectorAll('img[data-premium-logo="1"]').forEach(img => (img.src = getLogoURL()));
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["dark"] });
  }

  /* ──────────── Beautiful Settings UI ──────────── */
  function ensureStyles() {
    if (document.getElementById("yt-premium-settings-style")) return;
    const style = document.createElement("style");
    style.id = "yt-premium-settings-style";
    style.textContent = `
      .ytpml-overlay {
        position: fixed; inset: 0; backdrop-filter: blur(8px);
        background: rgba(0,0,0,0.25); z-index: 2147483646;
        display: none;
      }
      .ytpml-panel {
        position: fixed; top: 64px; right: 64px; width: 420px; max-width: calc(100vw - 32px);
        background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.75));
        color: #0f0f0f; border-radius: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.25);
        border: 1px solid rgba(255,255,255,0.6); overflow: hidden; z-index: 2147483647;
        display: none; transform: translateZ(0);
      }
      html[dark] .ytpml-panel {
        background: linear-gradient(180deg, rgba(28,28,28,0.9), rgba(28,28,28,0.85));
        color: #f1f1f1; border-color: rgba(255,255,255,0.1);
      }
      .ytpml-header {
        display:flex; align-items:center; gap:10px; padding:14px 16px; cursor: move;
        border-bottom: 1px solid rgba(0,0,0,0.06);
      }
      html[dark] .ytpml-header { border-color: rgba(255,255,255,0.08); }
      .ytpml-title { font-weight: 700; font-size: 16px; letter-spacing: .2px; flex:1; }
      .ytpml-close {
        border:none; background:transparent; font-size:18px; cursor:pointer; color:inherit; padding:4px 8px;
      }
      .ytpml-body { padding: 14px 16px 8px 16px; }
      .ytpml-section-title { font-weight: 600; margin: 8px 0 10px 0; font-size: 13px; opacity: .9; }
      .ytpml-grid {
        display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:12px;
      }
      .ytpml-swatch {
        border-radius: 14px; padding: 10px; display:flex; align-items:center; gap:10px; cursor:pointer;
        border:1px solid rgba(0,0,0,0.06); background: rgba(255,255,255,0.65);
        transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
      }
      .ytpml-swatch:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,0.18); }
      html[dark] .ytpml-swatch { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); }
      .ytpml-swatch[data-selected="1"] { outline: 2px solid #3ea6ff; box-shadow: 0 0 0 3px rgba(62,166,255,0.25) inset; }
      .ytpml-dot {
        width: 18px; height: 18px; border-radius: 50%; flex: 0 0 auto; border:1px solid rgba(0,0,0,0.08);
      }
      html[dark] .ytpml-dot { border-color: rgba(255,255,255,0.15); }
      .ytpml-label { font-size: 12px; font-weight: 600; text-transform: capitalize; }
      .ytpml-preview {
        margin-top: 14px; padding: 12px; border-radius: 12px;
        border:1px dashed rgba(0,0,0,0.1); display:flex; align-items:center; gap:12px;
        background: rgba(0,0,0,0.02);
      }
      html[dark] .ytpml-preview { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); }
      .ytpml-preview img { height: 24px; display:block; }
      .ytpml-theme-toggle {
        margin-left:auto; display:flex; align-items:center; gap:8px; font-size:12px;
      }
      .ytpml-toggle {
        position:relative; width:44px; height:22px; border-radius:999px; background:#d9d9d9; cursor:pointer;
      }
      .ytpml-toggle::after {
        content:""; position:absolute; width:18px; height:18px; border-radius:50%; top:2px; left:2px; background:#fff; transition:left .15s ease;
        box-shadow:0 1px 3px rgba(0,0,0,0.25);
      }
      .ytpml-toggle[data-on="1"]::after { left:24px; }
      html[dark] .ytpml-toggle { background:#444; }
      .ytpml-footer {
        display:flex; gap:10px; justify-content:flex-end; padding: 10px 16px 16px 16px;
      }
      .ytpml-btn {
        border-radius: 12px; padding: 8px 12px; border:1px solid transparent; cursor:pointer; font-weight:600; font-size:12px;
        background: rgba(0,0,0,0.05);
      }
      .ytpml-btn.primary { background:#3ea6ff; color:#002744; border-color:#2c8edc; }
      .ytpml-btn.ghost { background: transparent; border-color: rgba(0,0,0,0.12); }
      html[dark] .ytpml-btn.ghost { border-color: rgba(255,255,255,0.15); color:#f1f1f1; }
      .ytpml-toast {
        position: fixed; left: 50%; transform: translateX(-50%);
        bottom: 28px; background: rgba(28,28,28,0.92); color:#fff; padding:10px 14px; border-radius:12px;
        font-size:12px; box-shadow: 0 8px 24px rgba(0,0,0,0.35); z-index:2147483647; display:none;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function showToast(msg) {
    let t = document.getElementById("ytpml-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "ytpml-toast";
      t.className = "ytpml-toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(() => { t.style.display = "none"; }, 1600);
  }

  function buildSettingsUI() {
    if (document.getElementById("ytpml-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "ytpml-overlay";
    overlay.className = "ytpml-overlay";
    overlay.setAttribute("aria-hidden","true");

    const panel = document.createElement("section");
    panel.id = "ytpml-panel";
    panel.className = "ytpml-panel";
    panel.setAttribute("role","dialog");
    panel.setAttribute("aria-modal","true");
    panel.setAttribute("aria-labelledby","ytpml-title");

    // Header (draggable)
    const header = document.createElement("div");
    header.className = "ytpml-header";
    header.innerHTML = `
      <div class="ytpml-title" id="ytpml-title">Premium Logo • Settings</div>
      <button class="ytpml-close" title="Close (Esc)" aria-label="Close">✕</button>
    `;

    // Body
    const body = document.createElement("div");
    body.className = "ytpml-body";
    const colorNames = Object.keys(COLOR_MAP);

    const grid = document.createElement("div");
    grid.className = "ytpml-grid";

    // Swatches
    colorNames.forEach(name => {
      const sw = document.createElement("button");
      sw.type = "button";
      sw.className = "ytpml-swatch";
      sw.dataset.value = name;
      if (name === state.color) sw.dataset.selected = "1";

      const dot = document.createElement("span");
      dot.className = "ytpml-dot";
      // Just hint color for dot
      const dotColor = {
        red:"#EA4335", black:"#202124", pink:"#E91E63", yellow:"#F9AB00",
        green:"#34A853", brown:"#8D6E63", grey:"#9E9E9E", indigo:"#3F51B5"
      }[name] || "#9E9E9E";
      dot.style.background = dotColor;

      const label = document.createElement("span");
      label.className = "ytpml-label";
      label.textContent = name;

      sw.appendChild(dot);
      sw.appendChild(label);
      grid.appendChild(sw);
    });

    // Preview + Theme toggle (local preview only)
    const preview = document.createElement("div");
    preview.className = "ytpml-preview";
    preview.innerHTML = `
      <img id="ytpml-preview-img" alt="Preview">
      <div class="ytpml-theme-toggle">
        <span>Light</span>
        <div class="ytpml-toggle" id="ytpml-toggle-theme" role="switch" aria-checked="0" tabindex="0"></div>
        <span>Dark</span>
      </div>
    `;

    const sectionTitle = document.createElement("div");
    sectionTitle.className = "ytpml-section-title";
    sectionTitle.textContent = "Logo Color";

    body.appendChild(sectionTitle);
    body.appendChild(grid);
    body.appendChild(preview);

    // Footer
    const footer = document.createElement("div");
    footer.className = "ytpml-footer";
    footer.innerHTML = `
      <button class="ytpml-btn ghost" id="ytpml-reset">Reset</button>
      <button class="ytpml-btn ghost" id="ytpml-cancel">Cancel</button>
      <button class="ytpml-btn primary" id="ytpml-save">Save</button>
    `;

    panel.append(header, body, footer);
    document.body.append(overlay, panel);

    // Drag logic
    (() => {
      let dragging = false, sx=0, sy=0, px=0, py=0;
      const onDown = (e) => {
        dragging = true;
        const rect = panel.getBoundingClientRect();
        px = rect.left; py = rect.top;
        sx = e.clientX; sy = e.clientY;
        e.preventDefault();
      };
      const onMove = (e) => {
        if (!dragging) return;
        const nx = px + (e.clientX - sx);
        const ny = py + (e.clientY - sy);
        panel.style.left = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, nx)) + "px";
        panel.style.top  = Math.max(8, Math.min(window.innerHeight - panel.offsetHeight - 8, ny)) + "px";
        panel.style.right = "auto";
        panel.style.bottom = "auto";
      };
      const onUp = () => dragging = false;

      header.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    })();

    // Behavior
    const closeBtn = panel.querySelector(".ytpml-close");
    const saveBtn  = panel.querySelector("#ytpml-save");
    const cancelBtn= panel.querySelector("#ytpml-cancel");
    const resetBtn = panel.querySelector("#ytpml-reset");
    const themeTgl = panel.querySelector("#ytpml-toggle-theme");
    const prevImg  = panel.querySelector("#ytpml-preview-img");

    let tempColor = state.color;
    let tempDark  = isDark();

    const refreshPreview = () => {
      prevImg.src = getLogoURL(tempColor, tempDark);
    };

    const selectSwatch = (name) => {
      tempColor = name;
      grid.querySelectorAll(".ytpml-swatch").forEach(el => el.removeAttribute("data-selected"));
      const btn = grid.querySelector(`.ytpml-swatch[data-value="${name}"]`);
      if (btn) btn.dataset.selected = "1";
      refreshPreview();
    };

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".ytpml-swatch");
      if (!btn) return;
      selectSwatch(btn.dataset.value);
    });

    const setThemeToggle = (on) => {
      themeTgl.dataset.on = on ? "1" : "0";
      themeTgl.setAttribute("aria-checked", on ? "1" : "0");
      tempDark = !!on;
      refreshPreview();
    };

    themeTgl.addEventListener("click", () => setThemeToggle(!(themeTgl.dataset.on === "1")));
    themeTgl.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setThemeToggle(!(themeTgl.dataset.on === "1")); }
    });

    function openUI() {
      // Position default
      panel.style.display = "block";
      overlay.style.display = "block";
      panel.style.right = "64px"; panel.style.top = "64px"; panel.style.left = "auto"; panel.style.bottom = "auto";
      overlay.setAttribute("aria-hidden","false");

      // Sync temp from current state
      tempColor = state.color;
      tempDark = isDark();
      selectSwatch(tempColor);
      setThemeToggle(tempDark);
      panel.focus();
    }

    function closeUI() {
      overlay.style.display = "none";
      panel.style.display = "none";
      overlay.setAttribute("aria-hidden","true");
    }

    // Buttons
    closeBtn.addEventListener("click", closeUI);
    cancelBtn.addEventListener("click", closeUI);

    resetBtn.addEventListener("click", async () => {
      tempColor = DEFAULT_COLOR;
      selectSwatch(tempColor);
      showToast("Reset to default (red)");
    });

    saveBtn.addEventListener("click", async () => {
      state.color = tempColor;
      await store.set("logoColor", state.color);
      patchAll();
      showToast(`Saved • color: ${state.color}`);
      closeUI();
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeUI();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeUI();
      if (e.altKey && e.shiftKey && (e.key.toLowerCase?.() === "y")) {
        // Toggle
        const isOpen = panel.style.display === "block";
        isOpen ? closeUI() : openUI();
      }
    });

    // Expose open function
    panel.dataset.ready = "1";
    window.__ytpml_open = openUI;

    // Initial preview
    refreshPreview();
  }

  function openSettingsPanel() {
    ensureStyles();
    buildSettingsUI();
    if (window.__ytpml_open) window.__ytpml_open();
  }

  /* ──────────── Menu / Hotkey ──────────── */
  function registerMenu() {
    if (typeof GM_registerMenuCommand === "function") {
      GM_registerMenuCommand("Open Settings (Alt+Shift+Y)", openSettingsPanel);
    }
  }

  /* ──────────── Boot ──────────── */
  async function init() {
    state.color = isSafari() ? DEFAULT_COLOR : await store.get("logoColor", DEFAULT_COLOR);
    patchAll();
    observe();
    registerMenu();
    // lightweight prewarm of UI styles (no panel yet)
    ensureStyles();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

})();
