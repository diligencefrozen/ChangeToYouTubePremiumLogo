// ==UserScript==
// @name         FakeYouTubePremiumlogo(Black)

// @namespace    http://tampermonkey.net/

// @version      20240108.2

// @description  Change YouTube logo to Premium version

// @author       diligencefrozen

// @match        https://www.youtube.com/*

// @grant        none


// ==/UserScript==

function changeYouTubeLogo() {
    var ytIcon = document.getElementById('logo-icon');
    ytIcon.innerHTML = '';

    var newLogo = new Image();
    newLogo.width = 94;

    if (document.documentElement.getAttribute('dark')) {
        newLogo.src = 'https://github.com/diligencefrozen/FakeYTPremiumlogo/blob/main/logo/logov3.png?raw=true';
    } else {
        newLogo.src = 'https://github.com/diligencefrozen/FakeYTPremiumlogo/blob/main/logo/logov4.png?raw=true';
    }

    ytIcon.appendChild(newLogo);
}

changeYouTubeLogo();
