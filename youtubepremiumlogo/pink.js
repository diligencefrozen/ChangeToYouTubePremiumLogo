// ==UserScript==

// @name         ChangeToYouTubePremiumLogo(Pink)

// @version      20240120.5

// @description  Change YouTube logo to Premium version

// @author       diligencefrozen

// @match        https://www.youtube.com/*

// @grant        none

// @namespace    https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo

// @icon         https://www.google.com/s2/favicons?domain=youtube.com

// @updateURL    https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/pink.js

// @downloadURL  https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/pink.js

// ==/UserScript==

function changeYouTubeLogo() {
    var ytIcon = document.getElementById('logo-icon');
    ytIcon.innerHTML = '';

    var newLogo = new Image();
    newLogo.width = 94;

    if (document.documentElement.getAttribute('dark')) {
        newLogo.src = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov5.png?raw=true';
    } else {
        newLogo.src = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov6.png?raw=true';
    }

    ytIcon.appendChild(newLogo);
}

changeYouTubeLogo();
