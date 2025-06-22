// ==UserScript==
// @name         ChangeToYouTubePremiumLogo (Multi-Color)
// @namespace    https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo
// @version      20250623.5
// @description  Replace the YouTube logo with a Premium logo (Safari → always red; logo click → refresh) and hide “KR/US” country code.
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

  /* ───────────── Safari 감지 ───────────── */
  const isSafari = () => {
    const ua = navigator.userAgent;
    return /Safari/i.test(ua) &&
           !/Chrome|CriOS|OPiOS|EdgiOS|Edg|FxiOS|Brave|Vivaldi/i.test(ua);
  };

  const LOGO_SELECTORS = ["#logo-icon", "#logo"]; // 데스크톱 + 모바일

  // GM 저장소 래퍼
  const GMget = (k, d) =>
    typeof GM_getValue === "function"
      ? GM_getValue(k, d)
      : typeof GM !== "undefined" && GM.getValue
      ? GM.getValue(k, d)
      : d;

  const BASE =
    "https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/logo/";

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
  const isDark = () => document.documentElement.hasAttribute("dark");

  const currentColor = () =>
    isSafari() ? DEFAULT_COLOR : GMget("logoColor", DEFAULT_COLOR);

  const getLogoURL = () => {
    const cfg  = COLOR_MAP[currentColor()] || COLOR_MAP[DEFAULT_COLOR];
    const file = (isDark() ? cfg.dark : cfg.light) || cfg.dark;
    return BASE + file;
  };

  /* ───────────── 국가 코드 제거 (CSS + JS) ───────────── */
  const hideCountryCodeCSS = () => {
    const ID = "yt-premium-hide-country";
    if (document.getElementById(ID)) return;

    const style = document.createElement("style");
    style.id = ID;
    style.textContent = `
      /* YouTube가 로고 옆에 붙이는 모든 country code 변형 차단 */
      ytd-topbar-logo-renderer sup,
      a#logo sup,
      #logo-icon sup,
      .ytd-logo-country-code-renderer,
      #country-code,
      yt-formatted-string.country-code,
      yt-formatted-string.ytd-logo-country-code-renderer {
        display: none !important;
      }
    `;
    document.head.append(style);
  };

  const removeCountryCodeOnce = () => {
    document.querySelectorAll(
      `ytd-topbar-logo-renderer sup,
       a#logo sup,
       #logo-icon sup,
       .ytd-logo-country-code-renderer,
       #country-code,
       yt-formatted-string.country-code`
    ).forEach(el => el.remove());
  };

  /* ───────────── 로고 교체 ───────────── */
  function patchLogo(el) {
    if (!el) return;

    // 클릭 핸들러가 이미 붙어있으면 중복 처리 방지
    if (!el.dataset.ytLogoClickBound) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        location.pathname === "/" ? location.reload() : (location.href = "/");
      }, true); // capture 단계
      el.dataset.ytLogoClickBound = "1";
      el.style.cursor = "pointer";
    }

    // 로고 이미지를 새로 넣거나 갱신
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
    img.style.cssText = `
      width: 94px;
      height: auto;
      pointer-events: none;  
    `;
    el.appendChild(img);
    el.dataset.ytpremium = "1";
  }

  const patchAll = () =>
    document.querySelectorAll(LOGO_SELECTORS.join(",")).forEach(patchLogo);

  /* ───────────── DOM 관찰 ───────────── */
  function observeDOM() {
    // 로고가 새로 생길 때마다 교체 + 국가코드 제거
    new MutationObserver((muts) => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType !== 1) continue;
          if (
            LOGO_SELECTORS.some((sel) => n.matches?.(sel)) ||
            n.querySelector?.(LOGO_SELECTORS.join(","))
          ) {
            patchAll();
            removeCountryCodeOnce();
            return;
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });

    // 다크모드 전환 시 로고 스킨 교체
    new MutationObserver(() => {
      document.querySelectorAll("img[data-premium-logo]")
              .forEach(img => (img.src = getLogoURL()));
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dark"],
    });

    // 국가 코드가 뒤늦게 삽입되더라도 즉시 삭제
    new MutationObserver(removeCountryCodeOnce)
      .observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ───────────── 메뉴 (Safari 제외) ───────────── */
  function registerMenu() {
    if (isSafari()) return;

    const label = () => `Set Logo Color (current: ${currentColor()})`;
    GM_registerMenuCommand(label(), () => {
      const options = Object.keys(COLOR_MAP).join(", ");
      const input = prompt(
        `Enter logo color name.\nAvailable: ${options}`,
        currentColor()
      );
      if (!input) return;
      if (!COLOR_MAP[input]) return alert(`Unknown color: ${input}`);

      GM_setValue("logoColor", input);
      patchAll();
      alert(`Logo color switched to: ${input}`);
    });
  }

  /* ───────────── 초기화 ───────────── */
  const init = () => {
    hideCountryCodeCSS();   // CSS로 1차 차단
    patchAll();             // 로고 교체
    observeDOM();           // 변동 감시
    registerMenu();
  };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init, { once: true })
    : init();
})();
