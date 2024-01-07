// ==UserScript==
// @name         FakeYTPremiumlogo

// @namespace    http://tampermonkey.net/

// @compatible          firefox Violentmonkey

// @compatible          firefox Tampermonkey

// @compatible          firefox FireMonkey

// @compatible          chrome Violentmonkey

// @compatible          chrome Tampermonkey

// @compatible          opera Violentmonkey

// @compatible          opera Tampermonkey

// @compatible          safari Stay

// @compatible          edge Violentmonkey

// @compatible          edge Tampermonkey

// @compatible          brave Violentmonkey

// @compatible          brave Tampermonkey

// @version      20240108.3

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
        newLogo.src = 'https://github.com/diligencefrozen/FakeYTPremiumlogo/blob/main/logo/logov1.png?raw=true';
    } else {
        newLogo.src = 'https://github.com/diligencefrozen/FakeYTPremiumlogo/blob/main/logo/logov2.png?raw=true';
    }

    ytIcon.appendChild(newLogo);
}

changeYouTubeLogo();

