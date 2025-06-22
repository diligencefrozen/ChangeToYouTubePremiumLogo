// ==UserScript==
// @name         ChangeToYouTubePremiumLogo (Multi-Color)
// @namespace    https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo
// @version      20250623.1
// @description  Replace the YouTube logo with a Premium logo (Safari → always red).
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://youtube.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  /* ───────────── Safari 감지 ───────────── */
  const isSafari = () => {
      const ua = navigator.userAgent;
      return /Safari/i.test(ua) && !/Chrome|CriOS|OPiOS|FxiOS|EdgiOS|EdgA|Brave|Opera/i.test(ua);
  };

  const LOGO_SELECTORS = ['#logo-icon', '#logo'];   // 데스크톱 + 모바일

  // GM 저장소 래퍼 (Promise 방지용)
  const GMget = (k, d) =>
      typeof GM_getValue === "function" ? GM_getValue(k, d)
          : (typeof GM !== "undefined" && GM.getValue ? GM.getValue(k, d) : d);

  const BASE = "https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/logo/";

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

  const DEFAULT_COLOR = "red";
  const isDark   = () => document.documentElement.hasAttribute("dark");

  const currentColor = () =>
      isSafari() ? DEFAULT_COLOR : GMget("logoColor", DEFAULT_COLOR);

  const getLogoURL = () => {
      const cfg  = COLOR_MAP[currentColor()] || COLOR_MAP[DEFAULT_COLOR];
      const file = (isDark() ? cfg.dark : cfg.light) || cfg.dark;
      return BASE + file;
  };

  /* ───────────── 로고 교체 ───────────── */
  function patchLogo(el) {
      if (!el) return;

      if (el.dataset.ytpremium === "1") {
          const img = el.querySelector("img[data-premium-logo]");
          if (img) img.src = getLogoURL();
          return;
      }

      el.innerHTML = "";
      const img = document.createElement("img");
      img.dataset.premiumLogo = "1";
      img.alt  = "YouTube Premium";
      img.src  = getLogoURL();
      img.style.width  = "94px";
      img.style.height = "auto";
      el.appendChild(img);
      el.dataset.ytpremium = "1";
  }

  const patchAll = () =>
      document.querySelectorAll(LOGO_SELECTORS.join(",")).forEach(patchLogo);

  /* ───────────── DOM 변화 감지 ───────────── */
  function observeDOM() {
      new MutationObserver(muts => {
          for (const m of muts) {
              for (const n of m.addedNodes) {
                  if (n.nodeType !== 1) continue;
                  if (LOGO_SELECTORS.some(sel => n.matches?.(sel)) ||
