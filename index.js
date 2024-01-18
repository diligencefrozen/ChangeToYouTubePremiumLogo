// ==UserScript==
// @name         ChangeToYouTubePremiumLogo(Index)
// @namespace    http://tampermonkey.net/
// @version      20240118.4
// @description  Change YouTube logo to Premium version
// @author       diligencefrozen
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 설정 UI 생성 함수
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

        // 이벤트 리스너 설정
        document.getElementById('logoChangeSelect').addEventListener('change', function() {
            const value = this.value;
            changeLogo(value);
        });
    }

    // 로고 변경 함수
    function changeLogo(color) {
        const scriptMap = {
            'Original': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/main.js',
            'Black': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/black.js',
            'Pink': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/pink.js',
            'Yellow': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/yellow.js',
            'Green': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/green.js',
            'Brown': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/brown.js',
            'Grey': 'https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/grey.js',
            // 다른 색상에 대한 스크립트 URL 추가...
        };

        loadScript(scriptMap[color]);
    }

    // 스크립트 로드 함수
    function loadScript(scriptName) {
        let script = document.createElement('script');
        script.src = scriptName;
        document.body.appendChild(script);
    }

    // 설정 UI 초기화
    createSettingsUI();
})();

