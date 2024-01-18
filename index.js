// ==UserScript==
// @name         ChangeToYouTubePremiumLogo(Index)
// @namespace    http://tampermonkey.net/
// @version      20240118.5
// @description  Change YouTube logo to Premium version
// @author       diligencefrozen
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function createSettingsUI() {
        const container = document.createElement('div');
        container.id = 'logoChangeContainer';
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.zIndex = '1000';
        container.innerHTML = `
            <select id="logoChangeSelect">
                <option value="original">Original/Red</option>
                <option value="black">Black</option>
                <option value="pink">Pink</option>
                <option value="yellow">Yellow</option>
                <option value="green">Green</option>
                <option value="brown">Brown</option>
                <option value="grey">Grey</option>
            </select>
        `;
        document.body.appendChild(container);

        document.getElementById('logoChangeSelect').addEventListener('change', function() {
            const value = this.value;
            changeLogo(value);
        });
    }

    function changeLogo(color) {
        const scriptMap = {
            'original': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/main.js',
            'black': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/black.js',
            'pink': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/pink.js',
            'yellow': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/yellow.js',
            'green': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/green.js',
            'brown': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/brown.js',
            'grey': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/grey.js',
        };

        loadScript(scriptMap[color]);
    }

    function loadScript(scriptName) {
        // 이전에 로드된 스크립트 제거
        const existingScript = document.getElementById('customLogoScript');
        if (existingScript) {
            existingScript.remove();
        }

        // 새 스크립트 로드
        let script = document.createElement('script');
        script.id = 'customLogoScript';
        script.src = scriptName;
        document.body.appendChild(script);
    }

    createSettingsUI();
})();
