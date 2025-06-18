// ==UserScript==
// @name         ChangeToYouTubePremiumLogo (Multi‑Color)
// @namespace    https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo
// @version      20250618.3
// @description  Replace the YouTube logo with a Premium logo in the color of your choice (Red, Black, Brown, Green, Grey, Indigo, Pink, Yellow …).
// @match        https://www.youtube.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";

    const BASE = "https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/logo/";

    /**
     * COLOR_MAP: 색상 이름(또는 버전) → { dark: 파일, light: 파일 }
     *  - dark: 다크 테마( <html dark> )일 때 사용.
     *  - light: 라이트 테마. 값을 생략하면 dark 파일을 그대로 사용.
     */
    const COLOR_MAP = {
        /* ───────── 기본(Original) ───────── */
        red:    { dark: "logov1.png",  light: "logov2.png"  },

        /* ───────── 개별 색상 ───────── */
        black:  { dark: "logov3.png",  light: "logov4.png"  },
        pink:   { dark: "logov5.png",  light: "logov6.png"  },
        yellow: { dark: "logov7.png",  light: "logov8.png"  },
        green:  { dark: "logov9.png",  light: "logov10.png" },
        brown:  { dark: "logov11.png", light: "logov12.png" },
        grey:   { dark: "logov13.png", light: "logov14.png" },
        indigo: { dark: "logov15.png", light: "logov16.png" },

    };

    const DEFAULT_COLOR = "red"; // 초기값

    const isDark      = () => document.documentElement.hasAttribute("dark");
    const currentColor = () => GM_getValue("logoColor", DEFAULT_COLOR);

    const getLogoURL = () => {
        const cfg  = COLOR_MAP[currentColor()] || COLOR_MAP[DEFAULT_COLOR];
        const file = (isDark() ? cfg.dark : cfg.light) || cfg.dark; // fallback to dark if light 없어도 OK
        return BASE + file;
    };

    /* ----------------------------------------------------------------------
     * 3. 로고 교체 로직
     * ------------------------------------------------------------------ */

    function patchLogo(ytIcon) {
        if (!ytIcon) return;

        // 이미 교체된 경우 src 만 갱신
        if (ytIcon.dataset.ytpremium === "1") {
            const img = ytIcon.querySelector("img[data-premium-logo]");
            if (img) img.src = getLogoURL();
            return;
        }

        ytIcon.innerHTML = ""; // 기존 SVG 제거
        const img = document.createElement("img");
        img.dataset.premiumLogo = "1";
        img.alt  = "YouTube Premium";
        img.src  = getLogoURL();
        img.style.width  = "94px";
        img.style.height = "auto";
        ytIcon.appendChild(img);
        ytIcon.dataset.ytpremium = "1";
    }

    const patchAll = () => {
        document.querySelectorAll("#logo-icon").forEach(patchLogo);
    };

    /* ----------------------------------------------------------------------
     * 4. SPA / 테마 변화 대응
     * ------------------------------------------------------------------ */

    function observeDOM() {
        // (A) 새 로고 노드 삽입 감지
        new MutationObserver(muts => {
            for (const m of muts) {
                for (const n of m.addedNodes) {
                    if (n.nodeType !== 1) continue;
                    if (n.id === "logo-icon" || n.querySelector?.("#logo-icon")) {
                        patchAll();
                        return;
                    }
                }
            }
        }).observe(document.documentElement, { childList: true, subtree: true });

        // (B) 다크모드/라이트모드 감지
        new MutationObserver(() => {
            document.querySelectorAll("#logo-icon img[data-premium-logo]").forEach(img => {
                img.src = getLogoURL();
            });
        }).observe(document.documentElement, { attributes: true, attributeFilter: ["dark"] });
    }

    /* ----------------------------------------------------------------------
     * 5. Tampermonkey 메뉴 (색상 선택)
     * ------------------------------------------------------------------ */

    function registerMenu() {
        const label = () => `Set Logo Color (current: ${currentColor()})`;

        GM_registerMenuCommand(label(), () => {
            const options = Object.keys(COLOR_MAP).join(", ");
            const input   = prompt(`Enter logo color name.\nAvailable: ${options}`, currentColor());
            if (!input) return;
            if (!COLOR_MAP[input]) {
                alert(`Unknown color: ${input}`);
                return;
            }
            GM_setValue("logoColor", input);
            patchAll();
            alert(`Logo color switched to: ${input}`);
        });
    }

    /* ----------------------------------------------------------------------
     * 6. 초기화
     * ------------------------------------------------------------------ */

    const init = () => {
        patchAll();
        observeDOM();
        registerMenu();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
