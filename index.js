// ==UserScript==
// @name         ChangeToYouTubePremiumLogo(Index)
// @namespace    http://tampermonkey.net/
// @version      20240118.3
// @description  Change YouTube logo to Premium version
// @author       diligencefrozen
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function createButton(color, script) {
        let button = document.createElement('button');
        button.textContent = color + ' Logo';
        button.onclick = function() { loadScript(script); };
        document.body.appendChild(button);
    }

    function loadScript(scriptName) {
        let script = document.createElement('script');
        script.src = scriptName;
        document.body.appendChild(script);
    }

    createButton('Original/Red', 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/main.js');
    createButton('Black', 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/black.js');
    createButton('Pink', 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/pink.js');
    createButton('Yellow', 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/yellow.js');
    createButton('Green', 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/green.js');
    createButton('Brown', 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/brown.js');
    createButton('Grey', 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/grey.js');  
})();
