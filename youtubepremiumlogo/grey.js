// ==UserScript==
// @name         ChangeToYouTubePremiumLogo(Grey)

// @namespace    http://tampermonkey.net/

// @version      20240118.1

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
        newLogo.src = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov13.png?raw=true';
    } else {
        newLogo.src = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov14.png?raw=true';
    }

    ytIcon.appendChild(newLogo);
}

changeYouTubeLogo();
