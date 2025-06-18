// ==UserScript==
// @name         YouTube Premium Logo (Dark/Light, All Instances)
// @namespace    https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo
// @version      20240618.1
// @description  Replaces every YouTube logo (<yt-icon id="logo-icon">) with the Premium logo and keeps it in sync with Dark/Light theme & SPA navigation. No jQuery.
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";

    const darkLogo  = "https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/logo/logov1.png";
    const lightLogo = "https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/logo/logov2.png";

    /** Returns current logo URL according to theme */
    const getLogoURL = () => (document.documentElement.hasAttribute("dark") ? darkLogo : lightLogo);

    /**
     * Replace the SVG inside a single <yt-icon id="logo-icon"> element.
     * Idempotent: If already patched, only updates <img>.src
     */
    function replaceLogo(container) {
        if (!container) return;

        // Already processed → just switch src if theme changed
        if (container.dataset._premiumLogoApplied === "1") {
            const img = container.querySelector("img[data-premium-logo]");
            if (img) img.src = getLogoURL();
            return;
        }

        container.innerHTML = ""; // Remove default SVG
        const img = document.createElement("img");
        img.src = getLogoURL();
        img.alt = "YouTube Premium";
        img.style.width = "94px";
        img.style.height = "auto";
        img.dataset.premiumLogo = "1";
        container.appendChild(img);
        container.dataset._premiumLogoApplied = "1"; // mark processed
    }

    /** Apply replacement to every current instance on the page */
    const applyToAllLogos = () => {
        document.querySelectorAll("#logo-icon").forEach(replaceLogo);
    };

    /** Observe entire document for any new #logo-icon nodes (SPA navigation creates them) */
    const startLogoObserver = () => {
        const observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                // Fast path: if new nodes include #logo-icon or subtree might
                for (const node of m.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    if (node.id === "logo-icon" || node.querySelector?.("#logo-icon")) {
                        applyToAllLogos();
                        return; // one run is enough per batch
                    }
                }
            }
        });
        observer.observe(document.documentElement, {childList: true, subtree: true});
    };

    /** Observe theme toggles (<html dark> attr changes) */
    const startThemeObserver = () => {
        const observer = new MutationObserver(() => {
            document.querySelectorAll("#logo-icon img[data-premium-logo]").forEach(img => {
                img.src = getLogoURL();
            });
        });
        observer.observe(document.documentElement, {attributes: true, attributeFilter: ["dark"]});
    };

    // Wait until DOM ready (we run at document-start but need actual nodes)
    const ready = () => {
        applyToAllLogos();
        startLogoObserver();
        startThemeObserver();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", ready, {once: true});
    } else {
        ready();
    }
})();
